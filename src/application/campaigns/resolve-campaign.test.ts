import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createFakeClock } from '@/core/clock';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from '@/state/game-store';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameActions } from '@/state/actions';
import { installMemoryStorage, uninstallMemoryStorage } from '@/tests/helpers';
import type { GameSave } from '@/state/types';

const START = 1_700_000_000_000;
let clock: ReturnType<typeof createFakeClock>;

beforeEach(() => {
  installMemoryStorage();
  clock = createFakeClock(START);
});

afterEach(() => {
  uninstallMemoryStorage();
});

function setup(random: () => number, overrides: Partial<GameSave> = {}) {
  const base = createInitialSave(BALANCE, START);
  const save: GameSave = { ...base, ...overrides };
  const store = createGameStore({ initialState: save });
  const repository = createSaveRepository({ now: () => clock.now(), debounceMs: 0 });
  const actions = createGameActions({ store, config: BALANCE, repository, clock, random });
  return { store, actions };
}

function prepare(
  actions: ReturnType<typeof setup>['actions'],
  campaignId: string,
  approachId: string,
  intensityId = 'normal',
  postureId = 'balanced',
): string {
  const accepted = actions.acceptCampaign(campaignId);
  if (!accepted.ok) throw new Error('accept harus berhasil');

  const selected = actions.selectCampaignStrategy({
    sessionId: accepted.value.session.id,
    approachId,
    intensityId,
    postureId,
  });
  if (!selected.ok) throw new Error('strategi harus berhasil');

  return accepted.value.session.id;
}

describe('resolveCampaign action', () => {
  it('sukses menambah saldo dan mencatat pembayaran + bonus', () => {
    const { store, actions } = setup(() => 0);
    const sessionId = prepare(actions, 'cmp_launch_soft', 'informative');

    const result = actions.resolveCampaign(sessionId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const { snapshot } = result.value;
    expect(snapshot.outcome).toBe('success');
    expect(snapshot.reward).toBeGreaterThan(0);
    expect(snapshot.bonus).toBeGreaterThan(0);
    expect(snapshot.fine).toBe(0);

    const save = store.getState();
    expect(save.player.money).toBe(500 + snapshot.reward + snapshot.bonus);
    expect(save.player.sessionsCompleted).toBe(1);
    expect(save.campaignSessions[0]!.status).toBe('resolved');

    const types = save.transactions.map((transaction) => transaction.type);
    expect(types).toContain('campaign_payment');
    expect(types).toContain('campaign_bonus');
  });

  it('gagal memotong saldo sesuai denda dan mencatat campaign_fine', () => {
    const { store, actions } = setup(() => 0.999);
    const sessionId = prepare(actions, 'cmp_viral_push', 'emotional', 'high', 'aggressive');

    const result = actions.resolveCampaign(sessionId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.snapshot.outcome).toBe('failure');
    expect(result.value.snapshot.fine).toBeGreaterThan(0);
    expect(result.value.snapshot.reward).toBe(0);

    const save = store.getState();
    expect(save.player.money).toBe(500 - result.value.snapshot.fine);
    expect(save.transactions.some((transaction) => transaction.type === 'campaign_fine')).toBe(true);
    expect(save.accounts[0]!.reputation).toBeLessThan(0);
  });

  it('resolusi ganda mengembalikan snapshot lama tanpa transaksi baru', () => {
    const { store, actions } = setup(() => 0);
    const sessionId = prepare(actions, 'cmp_launch_soft', 'informative');

    const first = actions.resolveCampaign(sessionId);
    expect(first.ok).toBe(true);

    const moneyAfterFirst = store.getState().player.money;
    const countAfterFirst = store.getState().transactions.length;
    const violationsAfterFirst = store.getState().violations.length;

    const second = actions.resolveCampaign(sessionId);
    expect(second.ok).toBe(true);
    if (!second.ok || !first.ok) return;

    expect(second.value.alreadyResolved).toBe(true);
    expect(second.value.snapshot).toEqual(first.value.snapshot);
    expect(store.getState().player.money).toBe(moneyAfterFirst);
    expect(store.getState().transactions).toHaveLength(countAfterFirst);
    expect(store.getState().violations).toHaveLength(violationsAfterFirst);
  });

  it('mencatat violation saat resolusi memicu tier naik', () => {
    const base = createInitialSave(BALANCE, START);
    const save: GameSave = {
      ...base,
      accounts: base.accounts.map((account) => ({ ...account, suspicion: 30 })),
      risk: { tier: 'watch', lastEvaluatedAt: START },
    };
    const { store, actions } = setup(() => 0.999, save);
    const sessionId = prepare(actions, 'cmp_viral_push', 'emotional', 'high', 'aggressive');

    const result = actions.resolveCampaign(sessionId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const state = store.getState();
    expect(state.risk.tier).toBe('hot');
    expect(result.value.snapshot.tierBefore).toBe('watch');
    expect(result.value.snapshot.tierAfter).toBe('hot');
    expect(state.violations.length).toBeGreaterThan(0);
    expect(state.violations.every((violation) => violation.sourceId === sessionId)).toBe(true);
  });

  it('menolak resolusi sebelum strategi dipilih', () => {
    const { actions } = setup(() => 0);
    const accepted = actions.acceptCampaign('cmp_launch_soft');
    if (!accepted.ok) throw new Error('accept harus berhasil');

    const result = actions.resolveCampaign(accepted.value.session.id);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_transition');
  });

  it('menolak resolusi sebelum mini-game selesai', () => {
    const { actions } = setup(() => 0);
    const sessionId = prepare(actions, 'cmp_caption_drive', 'informative');

    const result = actions.resolveCampaign(sessionId);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_transition');
  });

  it('menolak session yang tidak dikenal', () => {
    const { actions } = setup(() => 0);
    const result = actions.resolveCampaign('sess_tidak_ada');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('campaign_not_found');
  });
});

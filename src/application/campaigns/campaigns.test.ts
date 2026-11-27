import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createFakeClock } from '@/core/clock';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from '@/state/game-store';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameActions } from '@/state/actions';
import { installMemoryStorage, uninstallMemoryStorage } from '@/tests/helpers';

const START = 1_700_000_000_000;
let clock: ReturnType<typeof createFakeClock>;

beforeEach(() => {
  installMemoryStorage();
  clock = createFakeClock(START);
});

afterEach(() => {
  uninstallMemoryStorage();
});

function setup(performance?: number) {
  const base = createInitialSave(BALANCE, START);
  const save =
    performance === undefined
      ? base
      : {
          ...base,
          accounts: base.accounts.map((account) => ({ ...account, performance })),
        };
  const store = createGameStore({ initialState: save });
  const repository = createSaveRepository({ now: () => clock.now(), debounceMs: 0 });
  const actions = createGameActions({ store, config: BALANCE, repository, clock });
  return { store, repository, actions };
}

describe('acceptCampaign', () => {
  it('membuat session baru dan menyimpannya', () => {
    const { store, actions } = setup();
    const result = actions.acceptCampaign('cmp_launch_soft');

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const sessions = store.getState().campaignSessions;
    expect(sessions).toHaveLength(1);
    expect(sessions[0]!.status).toBe('accepted');
    expect(sessions[0]!.campaignDefinitionId).toBe('cmp_launch_soft');
    expect(Number.isInteger(sessions[0]!.miniGameSeed)).toBe(true);
  });

  it('menolak accept ganda untuk kontrak yang sama', () => {
    const { actions } = setup();
    expect(actions.acceptCampaign('cmp_launch_soft').ok).toBe(true);

    const second = actions.acceptCampaign('cmp_launch_soft');
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.code).toBe('campaign_ineligible');
  });

  it('menolak kontrak kedua saat masih ada yang berjalan', () => {
    const { actions } = setup();
    expect(actions.acceptCampaign('cmp_launch_soft').ok).toBe(true);

    const second = actions.acceptCampaign('cmp_caption_drive');
    expect(second.ok).toBe(false);
  });

  it('menolak saat performa akun belum cukup', () => {
    const { store, actions } = setup(10);
    const result = actions.acceptCampaign('cmp_viral_push');

    expect(result.ok).toBe(false);
    expect(store.getState().campaignSessions).toHaveLength(0);
  });

  it('menolak id kontrak yang tidak dikenal', () => {
    const { actions } = setup();
    const result = actions.acceptCampaign('cmp_tidak_ada');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('campaign_not_found');
  });

  it('session pulih dari save setelah aksi berikutnya', () => {
    const { store, actions } = setup();
    expect(actions.acceptCampaign('cmp_launch_soft').ok).toBe(true);

    const reloaded = store.getState();
    expect(reloaded.campaignSessions).toHaveLength(1);
    expect(reloaded.campaignSessions[0]!.status).toBe('accepted');
  });
});

describe('selectCampaignStrategy', () => {
  function accept(actions: ReturnType<typeof setup>['actions']) {
    const result = actions.acceptCampaign('cmp_launch_soft');
    if (!result.ok) throw new Error('accept harus berhasil');
    return result.value.session;
  }

  it('menyimpan strategi dan mengubah status', () => {
    const { store, actions } = setup();
    const session = accept(actions);

    const result = actions.selectCampaignStrategy({
      sessionId: session.id,
      approachId: 'informative',
      intensityId: 'normal',
      postureId: 'balanced',
    });

    expect(result.ok).toBe(true);
    const updated = store.getState().campaignSessions[0]!;
    expect(updated.status).toBe('strategy_selected');
    expect(updated.selectedStrategyId).toBe('informative');
  });

  it('menolak pendekatan yang tidak relevan', () => {
    const { actions } = setup();
    const session = accept(actions);

    const result = actions.selectCampaignStrategy({
      sessionId: session.id,
      approachId: 'humorous',
      intensityId: 'normal',
      postureId: 'balanced',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('strategy_missing');
  });

  it('menolak pemilihan kedua pada session yang sama', () => {
    const { actions } = setup();
    const session = accept(actions);
    const input = {
      sessionId: session.id,
      approachId: 'informative',
      intensityId: 'normal',
      postureId: 'balanced',
    };

    expect(actions.selectCampaignStrategy(input).ok).toBe(true);
    const second = actions.selectCampaignStrategy(input);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.code).toBe('invalid_transition');
  });
});

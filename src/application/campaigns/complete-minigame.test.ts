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

function setup() {
  const save = createInitialSave(BALANCE, START);
  const store = createGameStore({ initialState: save });
  const repository = createSaveRepository({ now: () => clock.now(), debounceMs: 0 });
  const actions = createGameActions({ store, config: BALANCE, repository, clock });
  return { store, actions };
}

function startMiniGame(
  actions: ReturnType<typeof setup>['actions'],
  campaignId = 'cmp_caption_drive',
) {
  const accepted = actions.acceptCampaign(campaignId);
  if (!accepted.ok) throw new Error('accept harus berhasil');

  const session = accepted.value.session;
  const strategy = actions.selectCampaignStrategy({
    sessionId: session.id,
    approachId: 'informative',
    intensityId: 'normal',
    postureId: 'balanced',
  });
  if (!strategy.ok) throw new Error('strategi harus berhasil');

  return session.id;
}

describe('completeMiniGame', () => {
  it('menyimpan skor dan menandai aktivitas selesai', () => {
    const { store, actions } = setup();
    const sessionId = startMiniGame(actions);

    const result = actions.completeMiniGame({ sessionId, score: 73 });
    expect(result.ok).toBe(true);

    const session = store.getState().campaignSessions[0]!;
    expect(session.status).toBe('activity_completed');
    expect(session.miniGameScore).toBe(73);
  });

  it('menolak penyimpanan skor kedua', () => {
    const { store, actions } = setup();
    const sessionId = startMiniGame(actions);
    expect(actions.completeMiniGame({ sessionId, score: 73 }).ok).toBe(true);

    const second = actions.completeMiniGame({ sessionId, score: 100 });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.code).toBe('minigame_already_completed');
    expect(store.getState().campaignSessions[0]!.miniGameScore).toBe(73);
  });

  it('menolak skor sebelum strategi dipilih', () => {
    const { actions } = setup();
    const accepted = actions.acceptCampaign('cmp_caption_drive');
    if (!accepted.ok) throw new Error('accept harus berhasil');

    const result = actions.completeMiniGame({
      sessionId: accepted.value.session.id,
      score: 50,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_transition');
  });

  it('menolak skor di luar 0..100 atau bukan integer', () => {
    const { actions } = setup();
    const sessionId = startMiniGame(actions);

    for (const score of [101, -1, 50.5, Number.NaN]) {
      const result = actions.completeMiniGame({ sessionId, score });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('invalid_amount');
    }
  });

  it('menolak session tanpa mini-game (kontrak auto)', () => {
    const { actions } = setup();
    const accepted = actions.acceptCampaign('cmp_launch_soft');
    if (!accepted.ok) throw new Error('accept harus berhasil');

    const selected = actions.selectCampaignStrategy({
      sessionId: accepted.value.session.id,
      approachId: 'informative',
      intensityId: 'normal',
      postureId: 'balanced',
    });
    if (!selected.ok) throw new Error('strategi harus berhasil');

    const result = actions.completeMiniGame({
      sessionId: accepted.value.session.id,
      score: 80,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('minigame_unknown');
  });

  it('menolak session yang tidak dikenal', () => {
    const { actions } = setup();
    const result = actions.completeMiniGame({ sessionId: 'sess_tidak_ada', score: 50 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('campaign_not_found');
  });
});

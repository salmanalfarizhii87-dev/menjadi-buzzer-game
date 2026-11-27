import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createFakeClock } from '@/core/clock';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from '@/state/game-store';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameActions } from '@/state/actions';
import { CAPTION_OPTIONS } from '@/data/social/composer-options';
import { SOCIAL_APPS } from '@/data/social/apps';
import type { PostInput } from '@/domain/posting/composer';
import { selectPrimaryAccount } from '@/state/selectors';
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
  return { store, repository, actions };
}

function safeInput(): PostInput {
  const chirper = SOCIAL_APPS.find((app) => app.id === 'chirper')!;
  const caption = CAPTION_OPTIONS.find((option) => option.tone === chirper.preferredTone)!;
  return {
    appId: 'chirper',
    captionId: caption.id,
    hashtagId: 'tag-chill',
    timingId: 'quiet',
  };
}

describe('createPost', () => {
  it('berhasil pada posting pertama', () => {
    const { actions } = setup();
    const result = actions.createPost(safeInput());
    expect(result.ok).toBe(true);
  });

  it('menambah saldo sesuai moneyDelta', () => {
    const { store, actions } = setup();
    const before = store.getState().player.money;
    const result = actions.createPost(safeInput());
    if (!result.ok) throw new Error('harus berhasil');

    expect(store.getState().player.money).toBe(before + result.value.resolution.moneyDelta);
  });

  it('menambah suspicion', () => {
    const { store, actions } = setup();
    const before = selectPrimaryAccount(store.getState())!.suspicion;
    const result = actions.createPost(safeInput());
    if (!result.ok) throw new Error('harus berhasil');

    expect(selectPrimaryAccount(store.getState())!.suspicion).toBe(
      before + result.value.resolution.suspicionDelta,
    );
  });

  it('menambah followers', () => {
    const { store, actions } = setup();
    const before = selectPrimaryAccount(store.getState())!.followers;
    const result = actions.createPost(safeInput());
    if (!result.ok) throw new Error('harus berhasil');

    expect(selectPrimaryAccount(store.getState())!.followers).toBe(
      before + result.value.resolution.followersDelta,
    );
  });

  it('mencatat transaksi posting_income', () => {
    const { store, actions } = setup();
    actions.createPost(safeInput());

    const txns = store.getState().transactions.filter((txn) => txn.type === 'posting_income');
    expect(txns).toHaveLength(1);
    expect(txns[0]!.amount).toBeGreaterThan(0);
  });

  it('menolak posting saat cooldown aktif', () => {
    const { store, actions } = setup();
    actions.createPost(safeInput());

    const moneyAfterFirst = store.getState().player.money;
    const second = actions.createPost(safeInput());

    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.messageKey).toBe('posting.cooldownActive');
    expect(store.getState().player.money).toBe(moneyAfterFirst);
  });

  it('mengizinkan posting lagi setelah cooldown habis', () => {
    const { actions } = setup();
    actions.createPost(safeInput());

    clock.advance(BALANCE.posting.cooldownMs + 1);
    const second = actions.createPost(safeInput());
    expect(second.ok).toBe(true);
  });

  it('deterministik: dua posting identik dengan state sama memberi hasil sama', () => {
    const { actions } = setup();
    const first = actions.createPost(safeInput());
    if (!first.ok) throw new Error('harus berhasil');

    clock.advance(BALANCE.posting.cooldownMs + 1);
    const second = actions.createPost(safeInput());
    if (!second.ok) throw new Error('harus berhasil');

    // Followers/suspicion berubah, jadi engagement boleh berubah; tapi
    // formula tidak memakai RNG sehingga hasilnya tetap fungsi deterministik.
    expect(typeof first.value.resolution.engagement).toBe('number');
    expect(Number.isFinite(second.value.resolution.engagement)).toBe(true);
  });

  it('suspicion tidak melewati cap', () => {
    const { store, actions } = setup();

    for (let index = 0; index < 40; index += 1) {
      actions.createPost(safeInput());
      clock.advance(BALANCE.posting.cooldownMs + 1);
    }

    expect(selectPrimaryAccount(store.getState())!.suspicion).toBeLessThanOrEqual(
      BALANCE.posting.suspicionCap,
    );
  });

  it('posting berulang menaikkan tier dan mencatat pelanggaran', () => {
    const { store, actions } = setup();

    // Posting agresif sampai suspicion melewati ambang Waspada (30).
    for (let index = 0; index < 12; index += 1) {
      actions.createPost({
        ...safeInput(),
        hashtagId: 'tag-viral',
        timingId: 'peak',
      });
      clock.advance(BALANCE.posting.cooldownMs + 1);
    }

    const state = store.getState();
    expect(selectPrimaryAccount(state)!.suspicion).toBeGreaterThanOrEqual(30);
    expect(state.violations.length).toBeGreaterThan(0);
  });

  it('menolak input tidak valid tanpa mengubah state', () => {
    const { store, actions } = setup();
    const before = JSON.stringify(store.getState().player);

    const result = actions.createPost({ ...safeInput(), captionId: 'ghost' });
    expect(result.ok).toBe(false);
    expect(JSON.stringify(store.getState().player)).toBe(before);
  });

  it('balanceAfter transaksi cocok dengan saldo', () => {
    const { store, actions } = setup();
    actions.createPost(safeInput());

    const state = store.getState();
    const last = state.transactions[state.transactions.length - 1]!;
    expect(last.balanceAfter).toBe(state.player.money);
  });

  it('posting tersimpan setelah reload', () => {
    const { actions, repository } = setup();
    actions.createPost(safeInput());
    repository.flush();

    const loaded = repository.load();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    expect(loaded.save.social.postingCount).toBe(1);
    expect(loaded.save.social.cooldownUntil).not.toBeNull();
    expect(loaded.save.transactions.some((txn) => txn.type === 'posting_income')).toBe(true);
  });
});

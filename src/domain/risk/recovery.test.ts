import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createFakeClock } from '@/core/clock';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from '@/state/game-store';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameActions } from '@/state/actions';
import { createId } from '@/core/ids';
import type { RiskTier } from '@/state/types';
import { evaluateRecovery } from './recovery';
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

function setup(money = 500, suspicion = 50) {
  const base = createInitialSave(BALANCE, START);
  // Tier awal harus konsisten dengan suspicion agar evaluasi tidak dianggap
  // sebagai kenaikan tier (dan menagih denda otomatis).
  const tier: RiskTier =
    suspicion >= 85 ? 'critical' : suspicion >= 60 ? 'hot' : suspicion >= 30 ? 'watch' : 'safe';
  const save = {
    ...base,
    player: { ...base.player, money },
    accounts: [{ ...base.accounts[0]!, suspicion }],
    risk: { tier, lastEvaluatedAt: START },
  };
  const store = createGameStore({ initialState: save });
  const repository = createSaveRepository({ now: () => clock.now(), debounceMs: 0 });
  const actions = createGameActions({ store, config: BALANCE, repository, clock });
  return { store, repository, actions };
}

describe('evaluateRecovery', () => {
  it('menghitung biaya dan pengurangan suspicion', () => {
    const { store } = setup(500, 60);
    const result = evaluateRecovery(store.getState(), BALANCE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.cost).toBe(BALANCE.recovery.cost);
    expect(result.value.suspicionAfter).toBe(60 - BALANCE.recovery.suspicionReduction);
    expect(result.value.reduction).toBe(BALANCE.recovery.suspicionReduction);
    expect(result.value.needed).toBe(true);
    expect(result.value.canAfford).toBe(true);
  });

  it('tidak butuh pemulihan saat suspicion 0', () => {
    const { store } = setup(500, 0);
    const result = evaluateRecovery(store.getState(), BALANCE);
    if (!result.ok) throw new Error('harus ok');
    expect(result.value.needed).toBe(false);
  });

  it('menandai tidak mampu bila saldo kurang', () => {
    const { store } = setup(10, 50);
    const result = evaluateRecovery(store.getState(), BALANCE);
    if (!result.ok) throw new Error('harus ok');
    expect(result.value.canAfford).toBe(false);
  });

  it('suspicion tidak pernah negatif', () => {
    const { store } = setup(500, 5);
    const result = evaluateRecovery(store.getState(), BALANCE);
    if (!result.ok) throw new Error('harus ok');
    expect(result.value.suspicionAfter).toBe(0);
  });
});

describe('recoverAccount action', () => {
  it('memotong saldo dan menurunkan suspicion', () => {
    const { store, actions } = setup(500, 60);
    const before = store.getState().player.money;

    const result = actions.recoverAccount();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(store.getState().player.money).toBe(before - BALANCE.recovery.cost);
    expect(selectPrimaryAccount(store.getState())!.suspicion).toBe(
      60 - BALANCE.recovery.suspicionReduction,
    );
  });

  it('mencatat transaksi recovery_cost', () => {
    const { store, actions } = setup(500, 60);
    actions.recoverAccount();

    const txns = store.getState().transactions.filter((txn) => txn.type === 'recovery_cost');
    expect(txns).toHaveLength(1);
    expect(txns[0]!.amount).toBe(-BALANCE.recovery.cost);
    expect(txns[0]!.balanceAfter).toBe(store.getState().player.money);
  });

  it('menolak bila saldo kurang tanpa mengubah state', () => {
    const { store, actions } = setup(10, 60);
    const before = JSON.stringify(store.getState().player);

    const result = actions.recoverAccount();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe('insufficient_funds');
    expect(JSON.stringify(store.getState().player)).toBe(before);
  });

  it('menolak bila suspicion sudah 0', () => {
    const { actions } = setup(500, 0);
    const result = actions.recoverAccount();
    expect(result.ok).toBe(false);
  });

  it('menurunkan tier ketika suspicion turun melewati ambang', () => {
    const { store, actions } = setup(500, 68);
    store.setState({ ...store.getState(), risk: { tier: 'hot', lastEvaluatedAt: START } });

    const result = actions.recoverAccount();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // 68 - 25 = 43 → watch
    expect(result.value.tierChange.direction).toBe('down');
    expect(result.value.tierChange.to).toBe('watch');
    expect(store.getState().risk.tier).toBe('watch');
  });

  it('pemulihan berulang menggerus saldo sesuai biaya', () => {
    const { actions, store } = setup(1000, 100);
    actions.recoverAccount();
    clock.advance(1000);
    actions.recoverAccount();

    const spent = store.getState().transactions
      .filter((txn) => txn.type === 'recovery_cost')
      .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

    expect(spent).toBe(BALANCE.recovery.cost * 2);
    expect(store.getState().player.money).toBe(1000 - spent);
  });

  it('tersimpan setelah reload', () => {
    const { actions, repository } = setup(500, 60);
    actions.recoverAccount();
    repository.flush();

    const loaded = repository.load();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.save.accounts[0]!.suspicion).toBe(60 - BALANCE.recovery.suspicionReduction);
    expect(loaded.save.transactions.some((txn) => txn.type === 'recovery_cost')).toBe(true);
  });
});

describe('id pelanggaran', () => {
  it('memakai prefix vio', () => {
    expect(createId('violation', START).startsWith('vio_')).toBe(true);
  });
});

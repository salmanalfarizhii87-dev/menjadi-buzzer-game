import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createFakeClock } from '@/core/clock';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from '@/state/game-store';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameActions } from '@/state/actions';
import { selectDisplayBalance } from '@/state/selectors';
import { accrueIncome, flushPendingIncome } from './accrue-income';
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
  const deps = { store, config: BALANCE, repository, clock };
  return { store, repository, actions, deps };
}

describe('accrueIncome use case', () => {
  it('mengembalikan hasil sukses dengan rate saat ini', () => {
    const { deps } = setup();
    clock.advance(5000);
    const result = accrueIncome(deps);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ratePerSecond).toBeGreaterThan(0);
  });

  it('tidak melakukan apa pun pada elapsed 0', () => {
    const { deps, store } = setup();
    const before = store.getState();
    const result = accrueIncome(deps);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.accrued).toBe(0);
    expect(store.getState()).toBe(before);
  });

  it('menulis state baru setiap ada income', () => {
    const { deps, store } = setup();
    const before = store.getState();
    clock.advance(10_000);
    accrueIncome(deps);
    expect(store.getState()).not.toBe(before);
  });

  it('income masuk ke pending, bukan langsung ke saldo', () => {
    const { deps, store } = setup();
    clock.advance(10_000);
    accrueIncome(deps);

    expect(store.getState().player.money).toBe(500);
    expect(store.getState().activeTime.pendingIncome).toBeGreaterThan(0);
    expect(selectDisplayBalance(store.getState())).toBeGreaterThan(500);
  });
});

describe('flushPendingIncome', () => {
  it('tidak melakukan apa pun bila tidak ada pending', () => {
    const { deps, store } = setup();
    const before = store.getState();
    const result = flushPendingIncome(deps);
    expect(result.ok).toBe(true);
    expect(store.getState()).toBe(before);
  });

  it('mengubah pending income menjadi saldo + transaksi', () => {
    const { deps, store } = setup();

    for (let index = 0; index < 10; index += 1) {
      clock.advance(1000);
      accrueIncome(deps);
    }

    const pending = store.getState().activeTime.pendingIncome;
    expect(pending).toBeGreaterThan(0);
    expect(store.getState().transactions).toHaveLength(0);

    flushPendingIncome(deps);

    const state = store.getState();
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0]!.amount).toBe(pending);
    expect(state.player.money).toBe(500 + pending);
    expect(state.activeTime.pendingIncome).toBe(0);
    expect(state.activeTime.pendingIncomeSince).toBeNull();
  });

  it('saldo tampilan tidak berubah saat flush', () => {
    const { deps, store } = setup();
    for (let index = 0; index < 10; index += 1) {
      clock.advance(1000);
      accrueIncome(deps);
    }

    const displayBefore = selectDisplayBalance(store.getState());
    flushPendingIncome(deps);
    expect(selectDisplayBalance(store.getState())).toBe(displayBefore);
  });
});

describe('accrual idempotency across navigation', () => {
  it('total income tidak berubah karena perpindahan layar', () => {
    const { deps, store } = setup();

    for (let index = 0; index < 5; index += 1) {
      clock.advance(1000);
      accrueIncome(deps);
    }
    const afterHome = selectDisplayBalance(store.getState());

    // Navigasi tidak memanggil accrual.
    expect(selectDisplayBalance(store.getState())).toBe(afterHome);

    for (let index = 0; index < 5; index += 1) {
      clock.advance(1000);
      accrueIncome(deps);
    }

    const rate = BALANCE.income.baseRate;
    expect(selectDisplayBalance(store.getState())).toBe(500 + Math.floor(rate * 10));
  });

  it('tidak ada offline income setelah save dimuat ulang', () => {
    const { deps, store, repository } = setup();
    clock.advance(10_000);
    accrueIncome(deps);

    repository.saveNow(store.getState());

    // Simulasi tutup game 1 jam.
    clock.advance(60 * 60 * 1000);

    const loaded = repository.load();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    const reopened = {
      ...loaded.save,
      activeTime: { ...loaded.save.activeTime, lastAccrualAt: clock.now() },
    };
    const newStore = createGameStore({ initialState: reopened });
    const newRepo = createSaveRepository({ now: () => clock.now(), debounceMs: 0 });
    const newDeps = { store: newStore, config: BALANCE, repository: newRepo, clock };

    const balanceAtReopen = selectDisplayBalance(newStore.getState());
    accrueIncome(newDeps);
    expect(selectDisplayBalance(newStore.getState())).toBe(balanceAtReopen);
  });
});

describe('ledger integrity', () => {
  it('balanceAfter setiap transaksi cocok dengan saldo berjalan', () => {
    const { deps, store } = setup();

    for (let index = 0; index < 70; index += 1) {
      clock.advance(1000);
      accrueIncome(deps);
    }
    flushPendingIncome(deps);

    const state = store.getState();
    let running = 500;
    for (const txn of state.transactions) {
      running += txn.amount;
      expect(txn.balanceAfter).toBe(running);
    }
    expect(state.player.money).toBe(running);
  });
});

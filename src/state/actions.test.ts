import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createFakeClock } from '@/core/clock';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from '@/state/game-store';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameActions } from '@/state/actions';
import { selectDisplayBalance, selectIncomeRate } from '@/state/selectors';
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

describe('accrueIncome', () => {
  it('menambah income pending berdasarkan elapsed time', () => {
    const { store, actions } = setup();
    const rate = selectIncomeRate(store.getState(), BALANCE);

    clock.advance(10_000);
    const result = actions.accrueIncome();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const expected = Math.floor(rate * 10);
    expect(store.getState().activeTime.pendingIncome).toBe(expected);
    // Saldo terkredit belum berubah; saldo tampilan sudah.
    expect(store.getState().player.money).toBe(500);
    expect(selectDisplayBalance(store.getState())).toBe(500 + expected);
  });

  it('tidak menambah apa pun bila tidak ada waktu berlalu', () => {
    const { store, actions } = setup();
    const before = store.getState();
    actions.accrueIncome();
    expect(store.getState()).toBe(before);
  });

  it('idempoten: memanggil ulang pada timestamp sama tidak menambah pending', () => {
    const { store, actions } = setup();
    clock.advance(10_000);
    actions.accrueIncome();
    const afterFirst = store.getState().activeTime.pendingIncome;

    actions.accrueIncome();
    actions.accrueIncome();

    expect(store.getState().activeTime.pendingIncome).toBe(afterFirst);
  });

  it('total income konsisten walau dipecah banyak tick', () => {
    const { store, actions } = setup();
    const rate = selectIncomeRate(store.getState(), BALANCE);

    for (let index = 0; index < 30; index += 1) {
      clock.advance(1000);
      actions.accrueIncome();
    }

    const pending = store.getState().activeTime.pendingIncome;
    expect(Math.abs(pending - rate * 30)).toBeLessThanOrEqual(1);
  });

  it('tidak menambah income untuk waktu ketika game tertutup', () => {
    const { store, actions, repository } = setup();

    // Bootstrap men-set lastAccrualAt = now, bukan savedAt.
    const save = store.getState();
    store.setState({ ...save, activeTime: { ...save.activeTime, lastAccrualAt: clock.now() } });

    clock.advance(60 * 60 * 1000);
    actions.accrueIncome();

    const envelope = repository.buildEnvelope(store.getState());
    const payload = envelope.payload as { activeTime: { lastAccrualAt: number } };
    expect(payload.activeTime.lastAccrualAt).toBe(clock.now());
  });

  it('menyimpan pecahan income agar tidak hilang', () => {
    const { store, actions } = setup();

    for (let index = 0; index < 50; index += 1) {
      clock.advance(100);
      actions.accrueIncome();
    }

    const rate = selectIncomeRate(store.getState(), BALANCE);
    const expected = Math.floor(rate * 5);
    expect(store.getState().activeTime.pendingIncome).toBe(expected);
    expect(store.getState().activeTime.fractionalIncome).toBeGreaterThanOrEqual(0);
    expect(store.getState().activeTime.fractionalIncome).toBeLessThan(1);
  });

  it('memotong delta yang terlalu besar (clamp)', () => {
    const { store, actions } = setup();
    const rate = selectIncomeRate(store.getState(), BALANCE);

    clock.advance(BALANCE.income.maxAccrualDeltaMs * 10);
    const result = actions.accrueIncome();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.clamped).toBe(true);

    const expected = Math.floor(rate * (BALANCE.income.maxAccrualDeltaMs / 1000));
    expect(store.getState().activeTime.pendingIncome).toBe(expected);
  });

  it('mengagregasi transaksi passive income per window, bukan per tick', () => {
    const { store, actions } = setup();

    for (let index = 0; index < 10; index += 1) {
      clock.advance(1000);
      actions.accrueIncome();
    }

    expect(store.getState().transactions).toHaveLength(0);
    expect(store.getState().activeTime.pendingIncome).toBeGreaterThan(0);

    for (let index = 0; index < 21; index += 1) {
      clock.advance(1000);
      actions.accrueIncome();
    }

    expect(store.getState().transactions).toHaveLength(1);
    expect(store.getState().transactions[0]!.type).toBe('passive_income');
    expect(store.getState().activeTime.pendingIncome).toBe(0);
    expect(store.getState().activeTime.pendingIncomeSince).toBeNull();
  });

  it('ledger konsisten: total transaksi == perubahan saldo', () => {
    const { store, actions } = setup();
    const startMoney = store.getState().player.money;

    // 40 detik: satu window terlewat, jadi satu transaksi ditulis.
    for (let index = 0; index < 40; index += 1) {
      clock.advance(1000);
      actions.accrueIncome();
    }

    const state = store.getState();
    const totalIncome = state.transactions
      .filter((txn) => txn.type === 'passive_income')
      .reduce((sum, txn) => sum + txn.amount, 0);

    // Saldo terkredit = awal + transaksi (pending belum masuk saldo).
    expect(state.player.money).toBe(startMoney + totalIncome);

    // balanceAfter setiap transaksi cocok dengan saldo berjalan.
    let running = startMoney;
    for (const txn of state.transactions) {
      running += txn.amount;
      expect(txn.balanceAfter).toBe(running);
    }
  });

  it('status suspended menghentikan income', () => {
    const { store, actions } = setup();
    const account = store.getState().accounts[0]!;
    store.setState({
      ...store.getState(),
      accounts: [{ ...account, status: 'suspended' }],
    });

    const before = store.getState().activeTime.pendingIncome;
    clock.advance(60_000);
    actions.accrueIncome();

    expect(store.getState().activeTime.pendingIncome).toBe(before);
  });
});

describe('flushPendingIncome', () => {
  it('memindahkan pending ke saldo dan menulis transaksi', () => {
    const { store, actions } = setup();

    for (let index = 0; index < 10; index += 1) {
      clock.advance(1000);
      actions.accrueIncome();
    }

    const pending = store.getState().activeTime.pendingIncome;
    expect(pending).toBeGreaterThan(0);

    actions.flushPendingIncome();

    const state = store.getState();
    expect(state.player.money).toBe(500 + pending);
    expect(state.activeTime.pendingIncome).toBe(0);
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0]!.amount).toBe(pending);
    expect(state.transactions[0]!.balanceAfter).toBe(500 + pending);
  });

  it('saldo tampilan tidak berubah saat flush (hanya pindah bucket)', () => {
    const { store, actions } = setup();
    for (let index = 0; index < 10; index += 1) {
      clock.advance(1000);
      actions.accrueIncome();
    }

    const displayBefore = selectDisplayBalance(store.getState());
    actions.flushPendingIncome();
    expect(selectDisplayBalance(store.getState())).toBe(displayBefore);
  });
});

describe('resetSave', () => {
  it('mengembalikan state ke kondisi awal', () => {
    const { store, actions } = setup();
    clock.advance(30_000);
    actions.accrueIncome();

    expect(selectDisplayBalance(store.getState())).toBeGreaterThan(500);

    const result = actions.resetSave();
    expect(result.ok).toBe(true);
    expect(store.getState().player.money).toBe(500);
    expect(store.getState().activeTime.pendingIncome).toBe(0);
    expect(store.getState().transactions).toHaveLength(0);
    expect(store.getState().accounts).toHaveLength(1);
  });
});

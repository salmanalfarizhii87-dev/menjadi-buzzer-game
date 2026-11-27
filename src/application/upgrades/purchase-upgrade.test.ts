import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createFakeClock } from '@/core/clock';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from '@/state/game-store';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameActions } from '@/state/actions';
import { createUpgradePurchaser } from './purchase-upgrade';
import { getAutomationDefinition } from '@/data/upgrades/automation';
import { selectIncomeRate, selectPrimaryAccount } from '@/state/selectors';
import { installMemoryStorage, uninstallMemoryStorage } from '@/tests/helpers';

const START = 1_700_000_000_000;
const def = getAutomationDefinition(BALANCE)!;

let clock: ReturnType<typeof createFakeClock>;

beforeEach(() => {
  installMemoryStorage();
  clock = createFakeClock(START);
});

afterEach(() => {
  uninstallMemoryStorage();
});

function setup(startingMoney?: number) {
  const base = createInitialSave(BALANCE, START);
  const save =
    startingMoney === undefined
      ? base
      : { ...base, player: { ...base.player, money: startingMoney } };

  const store = createGameStore({ initialState: save });
  const repository = createSaveRepository({ now: () => clock.now(), debounceMs: 0 });
  const actions = createGameActions({ store, config: BALANCE, repository, clock });
  return { store, repository, actions };
}

describe('purchaseAutomationUpgrade', () => {
  it('berhasil membeli pada state awal', () => {
    const { actions } = setup();
    const result = actions.purchaseAutomationUpgrade();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.newLevel).toBe(1);
    expect(result.value.newBalance).toBe(500 - def.baseCost);
  });

  it('memotong saldo tepat satu kali', () => {
    const { store, actions } = setup();
    actions.purchaseAutomationUpgrade();
    expect(store.getState().player.money).toBe(500 - def.baseCost);
  });

  it('menaikkan automation level akun', () => {
    const { store, actions } = setup();
    actions.purchaseAutomationUpgrade();
    expect(selectPrimaryAccount(store.getState())?.automationLevel).toBe(1);
  });

  it('menaikkan income rate', () => {
    const { store, actions } = setup();
    const before = selectIncomeRate(store.getState(), BALANCE);
    actions.purchaseAutomationUpgrade();
    const after = selectIncomeRate(store.getState(), BALANCE);
    expect(after).toBeGreaterThan(before);
  });

  it('menulis satu transaksi upgrade_purchase', () => {
    const { store, actions } = setup();
    actions.purchaseAutomationUpgrade();

    const txns = store.getState().transactions.filter((txn) => txn.type === 'upgrade_purchase');
    expect(txns).toHaveLength(1);
    expect(txns[0]!.amount).toBe(-def.baseCost);
    expect(txns[0]!.balanceAfter).toBe(500 - def.baseCost);
    expect(txns[0]!.sourceId).toBe(def.id);
  });

  it('menolak pembelian bila saldo kurang', () => {
    const { store, actions } = setup(10);
    const before = store.getState().player.money;

    const result = actions.purchaseAutomationUpgrade();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe('insufficient_funds');

    expect(store.getState().player.money).toBe(before);
    expect(selectPrimaryAccount(store.getState())?.automationLevel).toBe(0);
    expect(store.getState().transactions).toHaveLength(0);
  });

  it('menolak pembelian saat saldo negatif (utang)', () => {
    const { store, actions } = setup(-200);
    const result = actions.purchaseAutomationUpgrade();
    expect(result.ok).toBe(false);
    expect(store.getState().player.money).toBe(-200);
  });

  it('menolak pembelian melewati max level', () => {
    const { store, actions } = setup(1_000_000);

    for (let index = 0; index < def.maxLevel; index += 1) {
      expect(actions.purchaseAutomationUpgrade().ok).toBe(true);
    }

    expect(selectPrimaryAccount(store.getState())?.automationLevel).toBe(def.maxLevel);

    const result = actions.purchaseAutomationUpgrade();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe('max_level');

    expect(selectPrimaryAccount(store.getState())?.automationLevel).toBe(def.maxLevel);
  });

  it('klik cepat berulang hanya memproses satu pembelian', () => {
    const { store } = setup();
    const repository = createSaveRepository({ now: () => clock.now(), debounceMs: 0 });
    const inFlight = new Set<string>();
    const purchase = createUpgradePurchaser({
      store,
      config: BALANCE,
      repository,
      clock,
      inFlight,
    });

    // Simulasi double-click: guard in-flight dipegang selama pemrosesan.
    inFlight.add(def.id);
    const blocked = purchase();
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.code).toBe('invalid_transition');
    inFlight.delete(def.id);

    // Setelah guard lepas, pembelian normal berhasil.
    expect(purchase().ok).toBe(true);
    expect(store.getState().transactions.filter((t) => t.type === 'upgrade_purchase')).toHaveLength(1);
  });

  it('pembelian berurutan memakai harga level yang benar', () => {
    const { actions } = setup(1_000_000);

    const first = actions.purchaseAutomationUpgrade();
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = actions.purchaseAutomationUpgrade();
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    expect(second.value.evaluation.cost).toBeGreaterThan(first.value.evaluation.cost);
  });

  it('upgrade tetap ada setelah save dimuat ulang', () => {
    const { actions, repository } = setup();
    actions.purchaseAutomationUpgrade();
    repository.flush();

    const loaded = repository.load();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    expect(loaded.save.accounts[0]!.automationLevel).toBe(1);
    expect(loaded.save.player.money).toBe(500 - def.baseCost);
    expect(loaded.save.transactions).toHaveLength(1);
  });

  it('saldo dan level konsisten dengan transaksi', () => {
    const { store, actions } = setup(1_000_000);
    actions.purchaseAutomationUpgrade();
    actions.purchaseAutomationUpgrade();

    const state = store.getState();
    const totalSpent = state.transactions
      .filter((txn) => txn.type === 'upgrade_purchase')
      .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

    expect(state.player.money).toBe(1_000_000 - totalSpent);
    expect(state.transactions[state.transactions.length - 1]!.balanceAfter).toBe(state.player.money);
  });
});

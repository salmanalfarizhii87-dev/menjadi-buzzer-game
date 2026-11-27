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

function setup(money = 500) {
  const base = createInitialSave(BALANCE, START);
  const store = createGameStore({ initialState: { ...base, player: { ...base.player, money } } });
  const repository = createSaveRepository({ now: () => clock.now(), debounceMs: 0 });
  const actions = createGameActions({ store, config: BALANCE, repository, clock });
  return { store, actions };
}

describe('tickMarket', () => {
  it('tidak bergerak sebelum interval tercapai', () => {
    const { store, actions } = setup();
    const before = store.getState().stocks;

    const result = actions.tickMarket();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.changed).toBe(false);
    expect(store.getState().stocks.history['KOPI']).toHaveLength(before.history['KOPI']!.length);
  });

  it('bergerak satu tick setelah interval dan menambah history', () => {
    const { store, actions } = setup();
    clock.advance(BALANCE.stocks.tickMs);

    const result = actions.tickMarket();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const stocks = store.getState().stocks;
    expect(result.value.changed).toBe(true);
    expect(stocks.lastTickAt).toBe(START + BALANCE.stocks.tickMs);
    expect(stocks.history['KOPI']).toHaveLength(2);
    expect(stocks.prices['KOPI']).toBeGreaterThanOrEqual(BALANCE.stocks.minPrice);
    expect(stocks.prices['KOPI']).toBeLessThanOrEqual(BALANCE.stocks.maxPrice);
  });

  it('tidak ada pergerakan offline saat save dimuat ulang', () => {
    const { store, actions } = setup();
    clock.advance(BALANCE.stocks.tickMs);
    expect(actions.tickMarket().ok).toBe(true);

    const persisted = store.getState();
    const reloadedStore = createGameStore({
      initialState: { ...persisted, stocks: { ...persisted.stocks, lastTickAt: clock.now() } },
    });
    const reloadedActions = createGameActions({
      store: reloadedStore,
      config: BALANCE,
      repository: createSaveRepository({ now: () => clock.now(), debounceMs: 0 }),
      clock,
    });

    const result = reloadedActions.tickMarket();
    if (!result.ok) return;
    expect(result.value.changed).toBe(false);
    expect(reloadedStore.getState().stocks.history['KOPI']).toHaveLength(2);
  });
});

describe('tradeStock', () => {
  it('beli memotong saldo dan menambah holding', () => {
    const { store, actions } = setup();
    const result = actions.tradeStock({ ticker: 'KOPI', shares: 2, side: 'buy' });

    expect(result.ok).toBe(true);
    const save = store.getState();
    expect(save.player.money).toBe(260);
    expect(save.stocks.holdings).toEqual([{ ticker: 'KOPI', shares: 2, avgCost: 120 }]);
    expect(save.transactions.some((transaction) => transaction.type === 'stock_buy')).toBe(true);
  });

  it('jual menambah saldo dan mengurangi holding', () => {
    const { store, actions } = setup();
    expect(actions.tradeStock({ ticker: 'KOPI', shares: 2, side: 'buy' }).ok).toBe(true);

    const result = actions.tradeStock({ ticker: 'KOPI', shares: 1, side: 'sell' });
    expect(result.ok).toBe(true);

    const save = store.getState();
    expect(save.player.money).toBe(380);
    expect(save.stocks.holdings[0]!.shares).toBe(1);
    expect(save.transactions.some((transaction) => transaction.type === 'stock_sell')).toBe(true);
  });

  it('menolak jual melebihi kepemilikan', () => {
    const { store, actions } = setup();
    expect(actions.tradeStock({ ticker: 'KOPI', shares: 1, side: 'buy' }).ok).toBe(true);

    const money = store.getState().player.money;
    const count = store.getState().transactions.length;
    const result = actions.tradeStock({ ticker: 'KOPI', shares: 5, side: 'sell' });

    expect(result.ok).toBe(false);
    expect(store.getState().player.money).toBe(money);
    expect(store.getState().transactions).toHaveLength(count);
  });

  it('menolak beli saat saldo kurang', () => {
    const { actions } = setup();
    const result = actions.tradeStock({ ticker: 'PIXL', shares: 10, side: 'buy' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('insufficient_funds');
  });

  it('menolak jumlah lembar tidak valid', () => {
    const { actions } = setup();
    const result = actions.tradeStock({ ticker: 'KOPI', shares: 0, side: 'buy' });
    expect(result.ok).toBe(false);
  });
});

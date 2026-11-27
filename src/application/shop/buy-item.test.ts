import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createFakeClock } from '@/core/clock';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from '@/state/game-store';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameActions } from '@/state/actions';
import { selectIncomeRate } from '@/state/selectors';
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

describe('buyShopItem', () => {
  it('membeli outfit, memotong saldo, dan mencatat transaksi', () => {
    const { store, actions } = setup();
    const result = actions.buyShopItem('outfit-casual');

    expect(result.ok).toBe(true);
    const save = store.getState();
    expect(save.player.money).toBe(200);
    expect(save.inventory.ownedItemIds).toContain('outfit-casual');
    expect(save.transactions.at(-1)?.type).toBe('shop_purchase');
    expect(save.transactions.at(-1)?.amount).toBe(-300);
  });

  it('menolak pembelian ganda tanpa transaksi baru', () => {
    const { store, actions } = setup();
    expect(actions.buyShopItem('outfit-casual').ok).toBe(true);

    const money = store.getState().player.money;
    const count = store.getState().transactions.length;
    const second = actions.buyShopItem('outfit-casual');

    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.code).toBe('locked');
    expect(store.getState().player.money).toBe(money);
    expect(store.getState().transactions).toHaveLength(count);
  });

  it('menolak saat saldo kurang', () => {
    const { store, actions } = setup(100);
    const result = actions.buyShopItem('outfit-luxury');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('insufficient_funds');
    expect(store.getState().player.money).toBe(100);
  });

  it('properti masuk bucket aset dan menaikkan income rate', () => {
    const { store, actions } = setup(2000);
    const before = selectIncomeRate(store.getState(), BALANCE);

    expect(actions.buyShopItem('prop-kos').ok).toBe(true);

    const after = selectIncomeRate(store.getState(), BALANCE);
    expect(store.getState().assets.propertyIds).toContain('prop-kos');
    expect(after).toBeGreaterThan(before);
  });

  it('tiket membuka negara di state', () => {
    const { store, actions } = setup(2000);
    expect(actions.buyShopItem('ticket-belanda').ok).toBe(true);
    expect(store.getState().tickets.ownedCountryIds).toContain('belanda');
  });

  it('menolak item yang tidak dikenal', () => {
    const { actions } = setup();
    const result = actions.buyShopItem('item-tidak-ada');
    expect(result.ok).toBe(false);
  });
});

describe('equipOutfit action', () => {
  it('memasang outfit yang dimiliki dan menyimpannya', () => {
    const { store, actions } = setup();
    expect(actions.buyShopItem('outfit-casual').ok).toBe(true);

    const result = actions.equipOutfit('outfit-casual');
    expect(result.ok).toBe(true);
    expect(store.getState().inventory.equippedOutfitId).toBe('outfit-casual');
    expect(store.getState().character.outfitId).toBe('outfit-casual');
  });

  it('menolak outfit yang belum dimiliki', () => {
    const { actions } = setup();
    const result = actions.equipOutfit('outfit-formal');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('locked');
  });
});

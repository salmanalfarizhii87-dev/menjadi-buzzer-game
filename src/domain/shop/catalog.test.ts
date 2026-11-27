import { describe, expect, it } from 'vitest';
import { SHOP_ITEMS } from '@/data/shop/items';
import { makeSave } from '@/tests/helpers';
import { canBuy, getItemsByCategory, isOwned } from './catalog';

describe('getItemsByCategory', () => {
  it('mengembalikan jumlah item per kategori', () => {
    expect(getItemsByCategory(SHOP_ITEMS, 'outfit')).toHaveLength(4);
    expect(getItemsByCategory(SHOP_ITEMS, 'property')).toHaveLength(3);
    expect(getItemsByCategory(SHOP_ITEMS, 'vehicle')).toHaveLength(3);
    expect(getItemsByCategory(SHOP_ITEMS, 'ticket')).toHaveLength(5);
  });
});

describe('isOwned', () => {
  const save = makeSave();

  it('outfit awal dimiliki, outfit lain belum', () => {
    const basic = SHOP_ITEMS.find((item) => item.id === 'outfit-basic')!;
    const casual = SHOP_ITEMS.find((item) => item.id === 'outfit-casual')!;
    expect(isOwned(save, basic)).toBe(true);
    expect(isOwned(save, casual)).toBe(false);
  });

  it('tiket negara awal dimiliki', () => {
    const ticket = SHOP_ITEMS.find((item) => item.id === 'ticket-nusantara')!;
    expect(isOwned(save, ticket)).toBe(true);
  });

  it('properti dan kendaraan mengikuti bucket aset', () => {
    const property = SHOP_ITEMS.find((item) => item.id === 'prop-kos')!;
    const vehicle = SHOP_ITEMS.find((item) => item.id === 'veh-motor')!;
    const owned = {
      ...save,
      assets: { propertyIds: ['prop-kos'], vehicleIds: ['veh-motor'] },
    };
    expect(isOwned(owned, property)).toBe(true);
    expect(isOwned(owned, vehicle)).toBe(true);
  });
});

describe('canBuy', () => {
  it('butuh saldo cukup dan belum dimiliki', () => {
    const item = SHOP_ITEMS.find((entry) => entry.id === 'outfit-casual')!;
    expect(canBuy(300, false, item)).toBe(true);
    expect(canBuy(299, false, item)).toBe(false);
    expect(canBuy(1000, true, item)).toBe(false);
  });
});

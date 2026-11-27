import { describe, expect, it } from 'vitest';
import { SHOP_ITEMS } from '@/data/shop/items';
import { makeSave } from '@/tests/helpers';
import { evaluatePurchase } from './purchase';

const casual = SHOP_ITEMS.find((item) => item.id === 'outfit-casual')!;
const luxury = SHOP_ITEMS.find((item) => item.id === 'outfit-luxury')!;
const save = makeSave();

describe('evaluatePurchase', () => {
  it('boleh dibeli bila saldo cukup', () => {
    const result = evaluatePurchase(save, casual, 500);
    expect(result.canBuy).toBe(true);
    expect(result.balanceAfter).toBe(200);
    expect(result.reason).toBeUndefined();
  });

  it('menolak item yang sudah dimiliki', () => {
    const basic = SHOP_ITEMS.find((item) => item.id === 'outfit-basic')!;
    const result = evaluatePurchase(save, basic, 5000);
    expect(result.canBuy).toBe(false);
    expect(result.reason).toBe('owned');
  });

  it('menolak saat saldo kurang', () => {
    const result = evaluatePurchase(save, luxury, 1000);
    expect(result.canBuy).toBe(false);
    expect(result.reason).toBe('insufficient_funds');
    expect(result.balanceAfter).toBe(1000);
  });
});

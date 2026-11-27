import { describe, expect, it } from 'vitest';
import { buyStock, sellStock } from './trade';

const empty: never[] = [];

describe('buyStock', () => {
  it('menambah holding baru', () => {
    const result = buyStock(empty, 'KOPI', 10, 120, 5000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.cost).toBe(1200);
    expect(result.value.holdings).toEqual([{ ticker: 'KOPI', shares: 10, avgCost: 120 }]);
  });

  it('menghitung harga rata-rata tertimbang', () => {
    const first = buyStock(empty, 'KOPI', 10, 100, 5000);
    if (!first.ok) throw new Error('harus berhasil');
    const second = buyStock(first.value.holdings, 'KOPI', 10, 200, 5000);
    if (!second.ok) throw new Error('harus berhasil');

    expect(second.value.holdings[0]!.shares).toBe(20);
    expect(second.value.holdings[0]!.avgCost).toBe(150);
  });

  it('menolak saldo kurang', () => {
    const result = buyStock(empty, 'KOPI', 10, 120, 100);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('insufficient_funds');
  });

  it('menolak lembar tidak valid', () => {
    expect(buyStock(empty, 'KOPI', 0, 120, 5000).ok).toBe(false);
    expect(buyStock(empty, 'KOPI', 1.5, 120, 5000).ok).toBe(false);
  });
});

describe('sellStock', () => {
  const holdings = [{ ticker: 'KOPI', shares: 10, avgCost: 120 }];

  it('menjual sebagian dan mempertahankan avgCost', () => {
    const result = sellStock(holdings, 'KOPI', 4, 150);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.proceeds).toBe(600);
    expect(result.value.holdings).toEqual([{ ticker: 'KOPI', shares: 6, avgCost: 120 }]);
  });

  it('menghapus holding saat semua lembar dijual', () => {
    const result = sellStock(holdings, 'KOPI', 10, 150);
    if (!result.ok) throw new Error('harus berhasil');
    expect(result.value.holdings).toHaveLength(0);
  });

  it('menolak jual melebihi kepemilikan', () => {
    const result = sellStock(holdings, 'KOPI', 11, 150);
    expect(result.ok).toBe(false);
  });

  it('menolak emiten yang tidak dimiliki', () => {
    expect(sellStock(holdings, 'PIXL', 1, 300).ok).toBe(false);
  });
});

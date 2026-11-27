import { describe, expect, it } from 'vitest';
import type { Transaction } from '@/state/types';
import { filterTransactions, paginateTransactions } from './history';

const transactions: Transaction[] = [
  { id: 't1', type: 'passive_income', amount: 1, balanceAfter: 1, sourceId: null, createdAt: 1, descriptionKey: 'txn.passiveIncome' },
  { id: 't2', type: 'shop_purchase', amount: -300, balanceAfter: -299, sourceId: 'outfit-casual', createdAt: 2, descriptionKey: 'txn.shopPurchase' },
  { id: 't3', type: 'passive_income', amount: 2, balanceAfter: -297, sourceId: null, createdAt: 3, descriptionKey: 'txn.passiveIncome' },
];

describe('filterTransactions', () => {
  it('semua transaksi disalin tanpa filter', () => {
    const result = filterTransactions(transactions, 'all');
    expect(result).toHaveLength(3);
    expect(result).not.toBe(transactions);
  });

  it('memfilter berdasarkan tipe', () => {
    expect(filterTransactions(transactions, 'passive_income')).toHaveLength(2);
    expect(filterTransactions(transactions, 'shop_purchase')).toHaveLength(1);
    expect(filterTransactions(transactions, 'stock_buy')).toHaveLength(0);
  });
});

describe('paginateTransactions', () => {
  it('membatasi jumlah yang tampil', () => {
    expect(paginateTransactions(transactions, 2)).toHaveLength(2);
    expect(paginateTransactions(transactions, 10)).toHaveLength(3);
  });

  it('menangani limit negatif', () => {
    expect(paginateTransactions(transactions, -5)).toHaveLength(0);
  });
});

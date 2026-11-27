/**
 * Filter dan pagination riwayat transaksi. Pure agar mudah diuji.
 */

import type { Transaction, TransactionType } from '@/state/types';

export type TransactionFilter = 'all' | TransactionType;

export function filterTransactions(
  transactions: readonly Transaction[],
  filter: TransactionFilter,
): Transaction[] {
  return filter === 'all'
    ? [...transactions]
    : transactions.filter((transaction) => transaction.type === filter);
}

export function paginateTransactions(
  transactions: readonly Transaction[],
  visibleCount: number,
): Transaction[] {
  const safeCount = Math.max(0, Math.trunc(visibleCount));
  return transactions.slice(0, safeCount);
}

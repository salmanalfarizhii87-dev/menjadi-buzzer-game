/**
 * Ledger transaksi. Append-only: transaksi lama tidak pernah diedit.
 * Setiap entri menyimpan `balanceAfter` untuk audit.
 */

import { createId } from '@/core/ids';
import { assertFiniteAmount, toWholeAmount } from '@/core/money';
import type { GameSave, Transaction, TransactionType } from '@/state/types';

export interface AppendTransactionInput {
  type: TransactionType;
  /** Positif = uang masuk, negatif = uang keluar. */
  amount: number;
  sourceId: string | null;
  descriptionKey: string;
  createdAt: number;
}

const DESCRIPTION_KEYS: Record<TransactionType, string> = {
  passive_income: 'txn.passiveIncome',
  posting_income: 'txn.postingIncome',
  campaign_payment: 'txn.campaignPayment',
  campaign_bonus: 'txn.campaignBonus',
  upgrade_purchase: 'txn.upgradePurchase',
  campaign_fine: 'txn.campaignFine',
  recovery_cost: 'txn.recoveryCost',
  shop_purchase: 'txn.shopPurchase',
  stock_buy: 'txn.stockBuy',
  stock_sell: 'txn.stockSell',
  travel_cost: 'txn.travelCost',
};

export function descriptionKeyFor(type: TransactionType): string {
  return DESCRIPTION_KEYS[type];
}

/** Buat entri transaksi tanpa memutasi save. `balanceAfter` = balanceBefore + amount. */
export function createTransaction(
  balanceBefore: number,
  input: AppendTransactionInput,
): Transaction {
  const amount = toWholeAmount(assertFiniteAmount(input.amount, 'amount'));
  return {
    id: createId('transaction', input.createdAt),
    type: input.type,
    amount,
    balanceAfter: toWholeAmount(balanceBefore + amount),
    sourceId: input.sourceId,
    createdAt: input.createdAt,
    descriptionKey: input.descriptionKey,
  };
}

/**
 * Tambahkan transaksi ke ledger.
 *
 * PENTING: `save` harus SUDAH mencerminkan mutasi saldo (delta sudah diterapkan
 * oleh `applyDelta`). `balanceAfter` diambil dari saldo saat ini, bukan dihitung
 * ulang dari amount — mencegah pencatatan ganda.
 */
export function appendTransaction(save: GameSave, input: AppendTransactionInput): GameSave {
  const amount = toWholeAmount(assertFiniteAmount(input.amount, 'amount'));
  const transaction: Transaction = {
    id: createId('transaction', input.createdAt),
    type: input.type,
    amount,
    balanceAfter: toWholeAmount(save.player.money),
    sourceId: input.sourceId,
    createdAt: input.createdAt,
    descriptionKey: input.descriptionKey,
  };

  return {
    ...save,
    transactions: [...save.transactions, transaction],
  };
}

/** Total masuk dan keluar — untuk ringkasan finance. */
export function summarizeTransactions(transactions: readonly Transaction[]): {
  totalIn: number;
  totalOut: number;
  count: number;
} {
  let totalIn = 0;
  let totalOut = 0;
  for (const transaction of transactions) {
    if (transaction.amount >= 0) totalIn += transaction.amount;
    else totalOut += -transaction.amount;
  }
  return { totalIn, totalOut, count: transactions.length };
}

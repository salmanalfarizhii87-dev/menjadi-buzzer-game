import { describe, expect, it } from 'vitest';
import type { Transaction, TransactionType } from '@/state/types';
import { targetForTransaction } from './targets';

function txn(type: TransactionType, sourceId: string | null): Transaction {
  return {
    id: 'txn_test',
    type,
    amount: 1,
    balanceAfter: 1,
    sourceId,
    createdAt: 1,
    descriptionKey: 'txn.test',
  };
}

describe('targetForTransaction', () => {
  it('membuka hasil kampanye untuk transaksi campaign dengan session', () => {
    expect(targetForTransaction(txn('campaign_payment', 'sess_abc'))).toEqual({
      screen: 'campaign-result',
      params: { sessionId: 'sess_abc' },
    });
  });

  it('tidak menautkan campaign tanpa source session', () => {
    expect(targetForTransaction(txn('campaign_fine', null))).toBeNull();
  });

  it('menautkan pembelian shop ke detail item', () => {
    expect(targetForTransaction(txn('shop_purchase', 'outfit-casual'))).toEqual({
      screen: 'shop-detail',
      params: { id: 'outfit-casual' },
    });
  });

  it('menautkan transaksi saham ke emiten', () => {
    expect(targetForTransaction(txn('stock_buy', 'KOPI'))).toEqual({
      screen: 'stock-detail',
      params: { ticker: 'KOPI' },
    });
  });

  it('menautkan upgrade, posting, travel, dan pemulihan', () => {
    expect(targetForTransaction(txn('upgrade_purchase', null))?.screen).toBe('automation');
    expect(targetForTransaction(txn('posting_income', 'chirper'))?.screen).toBe('handphone');
    expect(targetForTransaction(txn('travel_cost', 'belanda'))?.screen).toBe('travel');
    expect(targetForTransaction(txn('recovery_cost', null))?.screen).toBe('task');
  });

  it('passive income tidak punya tautan', () => {
    expect(targetForTransaction(txn('passive_income', null))).toBeNull();
  });
});

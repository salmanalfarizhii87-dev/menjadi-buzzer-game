/**
 * Tautan transaksi ke sumbernya. Dipakai layar Keuangan agar baris bisa
 * membuka campaign result, item Shop, emiten, atau layar terkait.
 */

import { ID_PREFIX } from '@/core/ids';
import type { ScreenId } from '@/app/lifecycle';
import type { Transaction } from '@/state/types';

export interface TransactionTarget {
  screen: ScreenId;
  params?: Record<string, string>;
}

export function targetForTransaction(transaction: Transaction): TransactionTarget | null {
  const sourceId = transaction.sourceId;

  switch (transaction.type) {
    case 'campaign_payment':
    case 'campaign_bonus':
    case 'campaign_fine':
      return sourceId && sourceId.startsWith(`${ID_PREFIX.session}_`)
        ? { screen: 'campaign-result', params: { sessionId: sourceId } }
        : null;
    case 'shop_purchase':
      return sourceId ? { screen: 'shop-detail', params: { id: sourceId } } : null;
    case 'stock_buy':
    case 'stock_sell':
      return sourceId ? { screen: 'stock-detail', params: { ticker: sourceId } } : null;
    case 'upgrade_purchase':
      return { screen: 'automation' };
    case 'posting_income':
      return { screen: 'handphone' };
    case 'travel_cost':
      return { screen: 'travel' };
    case 'recovery_cost':
      return { screen: 'task', params: { tab: 'pelanggaran' } };
    case 'passive_income':
      return null;
  }
}

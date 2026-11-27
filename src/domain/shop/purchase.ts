/**
 * Evaluasi pembelian (pure). Application layer yang memotong saldo.
 */

import type { ShopItem } from '@/data/shop/items';
import type { GameSave } from '@/state/types';
import { canBuy, isOwned } from './catalog';

export type PurchaseBlockReason = 'owned' | 'insufficient_funds';

export interface PurchaseEvaluation {
  item: ShopItem;
  owned: boolean;
  canBuy: boolean;
  balanceAfter: number;
  reason?: PurchaseBlockReason;
}

export function evaluatePurchase(
  save: GameSave,
  item: ShopItem,
  balance: number,
): PurchaseEvaluation {
  const owned = isOwned(save, item);

  if (owned) {
    return {
      item,
      owned,
      canBuy: false,
      balanceAfter: balance,
      reason: 'owned',
    };
  }

  if (!canBuy(balance, owned, item)) {
    return {
      item,
      owned,
      canBuy: false,
      balanceAfter: balance,
      reason: 'insufficient_funds',
    };
  }

  return {
    item,
    owned,
    canBuy: true,
    balanceAfter: balance - item.price,
  };
}

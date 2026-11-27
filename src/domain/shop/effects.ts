/**
 * Efek aset: properti dan kendaraan menambah multiplier income, dengan cap
 * dari config. Satu sumber untuk UI dan kalkulasi income.
 */

import type { BalanceConfig } from '@/data/config/balance';
import { SHOP_ITEMS } from '@/data/shop/items';
import type { GameSave } from '@/state/types';
import { isOwned } from './catalog';

export interface AssetIncomeEffect {
  /** Total bonus mentah sebelum cap. */
  bonus: number;
  /** Multiplier final (1 = tanpa aset). */
  multiplier: number;
  ownedItemCount: number;
}

export function assetIncomeEffect(
  save: GameSave,
  config: BalanceConfig,
  items = SHOP_ITEMS,
): AssetIncomeEffect {
  const owned = items.filter(
    (item) =>
      (item.category === 'property' || item.category === 'vehicle') && isOwned(save, item),
  );

  const bonus = owned.reduce((sum, item) => sum + (item.incomeMultiplier ?? 0), 0);
  const capped = Math.min(bonus, config.income.assetBonusCap);

  return {
    bonus,
    multiplier: 1 + Math.max(0, capped),
    ownedItemCount: owned.length,
  };
}

export function assetIncomeMultiplier(
  save: GameSave,
  config: BalanceConfig,
  items = SHOP_ITEMS,
): number {
  return assetIncomeEffect(save, config, items).multiplier;
}

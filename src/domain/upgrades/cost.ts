/**
 * Biaya upgrade per level. Level 1 = `baseCost`, lalu tumbuh `costGrowth`
 * secara geometris. Hasil selalu integer rupiah.
 */

import { assertFiniteAmount, toWholeAmount } from '@/core/money';
import type { UpgradeDefinition } from '@/data/upgrades/automation';

/**
 * Biaya untuk naik DARI `currentLevel` KE `currentLevel + 1`.
 * `currentLevel = 0` berarti pembelian pertama.
 */
export function costForNextLevel(def: UpgradeDefinition, currentLevel: number): number {
  assertFiniteAmount(currentLevel, 'currentLevel');

  if (currentLevel < 0) return def.baseCost;
  if (currentLevel >= def.maxLevel) return 0;

  const cost = def.baseCost * Math.pow(def.costGrowth, currentLevel);
  return toWholeAmount(cost);
}

/** Total biaya untuk mencapai `targetLevel` dari level 0 (untuk ringkasan). */
export function totalCostToLevel(def: UpgradeDefinition, targetLevel: number): number {
  const capped = Math.min(Math.max(0, Math.floor(targetLevel)), def.maxLevel);
  let total = 0;
  for (let level = 0; level < capped; level += 1) {
    total += costForNextLevel(def, level);
  }
  return total;
}

export function isMaxLevel(def: UpgradeDefinition, currentLevel: number): boolean {
  return currentLevel >= def.maxLevel;
}

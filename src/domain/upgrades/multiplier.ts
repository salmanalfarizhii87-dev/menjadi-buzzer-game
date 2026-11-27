/**
 * Multiplier automation per level. Level 0 = 1 (tanpa bonus).
 */

import { assertFiniteAmount } from '@/core/money';
import type { UpgradeDefinition } from '@/data/upgrades/automation';

export function automationMultiplierForLevel(def: UpgradeDefinition, level: number): number {
  assertFiniteAmount(level, 'level');
  const safeLevel = Math.max(0, Math.floor(level));
  return 1 + safeLevel * def.incomeMultiplierPerLevel;
}

/** Persentase kenaikan rate dari level sekarang ke level berikutnya. */
export function multiplierGainPercent(def: UpgradeDefinition, currentLevel: number): number {
  const now = automationMultiplierForLevel(def, currentLevel);
  const next = automationMultiplierForLevel(def, currentLevel + 1);
  if (now <= 0) return 0;
  return ((next - now) / now) * 100;
}

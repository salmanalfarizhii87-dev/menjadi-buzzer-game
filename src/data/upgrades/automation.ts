/**
 * Definisi upgrade automation. Data berasal dari `BalanceConfig.upgrades` agar
 * balancing tetap satu tempat; modul ini hanya memberi akses bertipe + validasi.
 *
 * Sumber kebenaran level saat ini adalah `account.automationLevel`, bukan array
 * `save.upgrades`. Array itu disediakan untuk fase multi-upgrade dan tidak
 * dipakai pada MVP — menghindari dua sumber kebenaran.
 */

import type { BalanceConfig, UpgradeConfigEntry } from '@/data/config/balance';

export const AUTOMATION_UPGRADE_ID = 'automation-basic';

export type UpgradeDefinition = UpgradeConfigEntry;

export function getUpgradeDefinition(
  config: BalanceConfig,
  upgradeId: string,
): UpgradeDefinition | undefined {
  return config.upgrades.find((entry) => entry.id === upgradeId);
}

export function getAutomationDefinition(config: BalanceConfig): UpgradeDefinition | undefined {
  return getUpgradeDefinition(config, AUTOMATION_UPGRADE_ID);
}

/** Validasi kelengkapan definisi (EC-11: config tidak lengkap → tidak dimainkan). */
export function validateUpgradeDefinition(def: UpgradeDefinition): string[] {
  const issues: string[] = [];

  if (!def.id) issues.push('id kosong');
  if (!Number.isFinite(def.maxLevel) || def.maxLevel < 1) issues.push('maxLevel tidak valid');
  if (!Number.isFinite(def.baseCost) || def.baseCost <= 0) issues.push('baseCost tidak valid');
  if (!Number.isFinite(def.costGrowth) || def.costGrowth < 1) issues.push('costGrowth tidak valid');
  if (!Number.isFinite(def.incomeMultiplierPerLevel) || def.incomeMultiplierPerLevel <= 0) {
    issues.push('incomeMultiplierPerLevel tidak valid');
  }
  if (!def.titleKey) issues.push('titleKey kosong');
  if (!def.descriptionKey) issues.push('descriptionKey kosong');

  return issues;
}

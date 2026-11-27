/**
 * Aturan risk tier. Satu tempat untuk memetakan suspicion → tier dan mengambil
 * konfigurasinya. Selector dan application layer memakai modul ini.
 */

import { RISK_TIER_ORDER, type RiskTier } from '@/state/types';
import type { BalanceConfig, RiskTierConfig } from '@/data/config/balance';

/** Tier dari nilai suspicion. Unknown/NaN dianggap aman. */
export function tierForSuspicion(suspicion: number, config: BalanceConfig): RiskTier {
  const value = Number.isFinite(suspicion) ? suspicion : 0;

  // Urutkan dari tier terburuk agar threshold atas diprioritaskan.
  const sorted = [...config.riskTiers].sort(
    (a, b) => RISK_TIER_ORDER[b.id] - RISK_TIER_ORDER[a.id],
  );

  for (const tier of sorted) {
    if (value >= tier.minSuspicion) return tier.id;
  }
  return 'safe';
}

export function getTierConfig(config: BalanceConfig, tier: RiskTier): RiskTierConfig {
  const found = config.riskTiers.find((entry) => entry.id === tier);
  return found ?? config.riskTiers[0]!;
}

export function isTierUp(from: RiskTier, to: RiskTier): boolean {
  return RISK_TIER_ORDER[to] > RISK_TIER_ORDER[from];
}

export function isTierDown(from: RiskTier, to: RiskTier): boolean {
  return RISK_TIER_ORDER[to] < RISK_TIER_ORDER[from];
}

/** Tier berikutnya yang lebih buruk, atau null bila sudah kritis. */
export function nextWorseTier(tier: RiskTier, config: BalanceConfig): RiskTier | null {
  const sorted = [...config.riskTiers].sort(
    (a, b) => RISK_TIER_ORDER[a.id] - RISK_TIER_ORDER[b.id],
  );
  const index = sorted.findIndex((entry) => entry.id === tier);
  if (index < 0 || index + 1 >= sorted.length) return null;
  return sorted[index + 1]!.id;
}

/** Jarak suspicion menuju tier berikutnya; null bila sudah kritis. */
export function suspicionToNextTier(
  suspicion: number,
  config: BalanceConfig,
): { tier: RiskTier; remaining: number } | null {
  const current = tierForSuspicion(suspicion, config);
  const next = nextWorseTier(current, config);
  if (!next) return null;

  const nextConfig = getTierConfig(config, next);
  return { tier: next, remaining: Math.max(0, Math.ceil(nextConfig.minSuspicion - suspicion)) };
}

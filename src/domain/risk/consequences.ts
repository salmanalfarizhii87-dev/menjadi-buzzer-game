/**
 * Konsekuensi per tier. UI memakai ini untuk tabel aturan di tab Pelanggaran,
 * application layer memakainya saat transisi tier.
 */

import type { RiskTier } from '@/state/types';
import type { BalanceConfig, RiskTierConfig } from '@/data/config/balance';
import { getTierConfig } from './tier';

export interface TierConsequences {
  tier: RiskTier;
  labelKey: string;
  minSuspicion: number;
  maxSuspicion: number;
  incomeMultiplier: number;
  postingFollowersMultiplier: number;
  autoFineOnEnter: number;
  canSeizeAsset: boolean;
  shadowbanMs: number;
  /** Ringkasan yang siap ditampilkan, tanpa angka presisi berlebihan. */
  summaryKeys: string[];
}

function summarize(config: RiskTierConfig): string[] {
  const keys: string[] = [];

  if (config.incomeMultiplier < 1) keys.push('risk.effect.incomeDown');
  if (config.postingFollowersMultiplier === 0) keys.push('risk.effect.shadowban');
  else if (config.postingFollowersMultiplier < 1) keys.push('risk.effect.reachDown');
  if (config.autoFineOnEnter > 0) keys.push('risk.effect.fine');
  if (config.canSeizeAsset) keys.push('risk.effect.seizure');

  return keys;
}

export function consequencesForTier(
  config: BalanceConfig,
  tier: RiskTier,
): TierConsequences {
  const entry = getTierConfig(config, tier);
  return {
    tier: entry.id,
    labelKey: entry.labelKey,
    minSuspicion: entry.minSuspicion,
    maxSuspicion: entry.maxSuspicion,
    incomeMultiplier: entry.incomeMultiplier,
    postingFollowersMultiplier: entry.postingFollowersMultiplier,
    autoFineOnEnter: entry.autoFineOnEnter,
    canSeizeAsset: entry.canSeizeAsset,
    shadowbanMs: entry.shadowbanMs,
    summaryKeys: summarize(entry),
  };
}

export function allTierConsequences(config: BalanceConfig): TierConsequences[] {
  return [...config.riskTiers]
    .sort((a, b) => a.minSuspicion - b.minSuspicion)
    .map((entry) => consequencesForTier(config, entry.id));
}

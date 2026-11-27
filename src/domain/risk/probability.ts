/**
 * Peluang sukses kampanye. Satu tempat untuk clamp dan bobot; UI tidak
 * menghitung persentase sendiri.
 *
 * Formula: base + performa terhadap target + reputasi − suspicion − status
 * + modifier strategi, lalu di-clamp ke batas konfigurasi.
 */

import type { ProbabilityConfig } from '@/data/config/balance';
import type { AccountStatus } from '@/state/types';

export interface ProbabilityInput {
  baseChance: number;
  performanceScore: number;
  targetPerformance: number;
  reputation: number;
  suspicion: number;
  status: AccountStatus;
  /** Jumlah modifier peluang dari pendekatan/intensitas/postur. */
  strategyModifier: number;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function computeSuccessProbability(
  input: ProbabilityInput,
  config: ProbabilityConfig,
): number {
  const performanceGap = (input.performanceScore - input.targetPerformance) / 100;
  const reputationFactor = clamp(input.reputation / 100, -1, 1);
  const suspicionFactor = clamp(input.suspicion / 100, 0, 1);
  const statusPenalty = config.statusPenalty[input.status] ?? 0;

  const probability =
    input.baseChance +
    config.performanceWeight * performanceGap +
    config.reputationWeight * reputationFactor -
    config.suspicionWeight * suspicionFactor -
    statusPenalty +
    input.strategyModifier;

  return clamp(probability, config.min, config.max);
}

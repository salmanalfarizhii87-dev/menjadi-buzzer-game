/**
 * Terapkan profil penalti pada kegagalan kampanye. Mengembalikan delta;
 * pemanggil yang menulis ke save.
 */

import type { BalanceConfig, PenaltyProfile } from '@/data/config/balance';
import type { AccountStatus } from '@/state/types';
import { fineFor } from './profiles';

export interface PenaltyApplication {
  fine: number;
  reputationDelta: number;
  suspicionDelta: number;
  status: AccountStatus | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function applyPenalty(
  profile: PenaltyProfile,
  basePayment: number,
  config: BalanceConfig,
): PenaltyApplication {
  return {
    fine: fineFor(basePayment, profile),
    reputationDelta: clamp(
      profile.reputationDelta,
      config.penalty.reputationMin,
      config.penalty.reputationMax,
    ),
    suspicionDelta: Math.max(0, Math.round(profile.suspicionDelta)),
    status: profile.forceStatus,
  };
}

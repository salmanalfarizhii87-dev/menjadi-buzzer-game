/**
 * Profil penalti kampanye. Nama profil berasal dari definisi kontrak
 * (`lenient` / `standard` / `severe`), angkanya dari config.
 */

import type { BalanceConfig, PenaltyProfile } from '@/data/config/balance';

export function penaltyProfileFor(config: BalanceConfig, profileId: string): PenaltyProfile {
  return config.penalty.profiles[profileId] ?? config.penalty.profiles['standard']!;
}

/** Denda = persentase pembayaran dasar, dengan batas bawah. */
export function fineFor(basePayment: number, profile: PenaltyProfile): number {
  const proportional = Math.round(basePayment * profile.fineRatio);
  return Math.max(profile.fineFloor, proportional);
}

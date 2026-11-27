/**
 * Shadowban: posting tetap bisa dilakukan tetapi tidak menambah followers dan
 * pendapatannya dipotong. Berbasis timestamp, bukan timer.
 */

import type { BalanceConfig } from '@/data/config/balance';
import type { SocialState } from '@/state/types';

export function isShadowbanned(social: SocialState, now: number): boolean {
  return social.shadowbannedUntil !== null && now < social.shadowbannedUntil;
}

export function shadowbanRemainingMs(social: SocialState, now: number): number {
  if (social.shadowbannedUntil === null) return 0;
  return Math.max(0, social.shadowbannedUntil - now);
}

/** Terapkan shadowban; tidak pernah memperpendek durasi yang sedang berjalan. */
export function applyShadowban(social: SocialState, now: number, durationMs: number): SocialState {
  if (durationMs <= 0) return social;
  const until = now + durationMs;
  const current = social.shadowbannedUntil ?? 0;
  return {
    ...social,
    shadowbannedUntil: Math.max(current, until),
  };
}

/** Bersihkan penanda shadowban yang sudah kedaluwarsa. */
export function clearExpiredShadowban(social: SocialState, now: number): SocialState {
  if (social.shadowbannedUntil === null) return social;
  if (now < social.shadowbannedUntil) return social;
  return { ...social, shadowbannedUntil: null };
}

/** Efek shadowban pada hasil posting. */
export function shadowbanEffects(config: BalanceConfig): {
  followersMultiplier: number;
  moneyMultiplier: number;
} {
  return {
    followersMultiplier: 0,
    moneyMultiplier: config.posting.shadowbanRewardMultiplier,
  };
}

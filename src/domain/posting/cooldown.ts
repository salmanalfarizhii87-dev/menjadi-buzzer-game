/**
 * Cooldown posting. Berbasis timestamp, bukan timer.
 * Sisa cooldown dipulihkan dari save sehingga refresh tidak memberi attempt gratis.
 */

import type { BalanceConfig } from '@/data/config/balance';
import type { SocialState } from '@/state/types';

export interface CooldownState {
  active: boolean;
  remainingMs: number;
  /** 0–1, untuk progress bar. */
  progress: number;
}

export function isOnCooldown(social: SocialState, now: number): boolean {
  if (social.cooldownUntil === null) return false;
  return now < social.cooldownUntil;
}

export function cooldownRemainingMs(social: SocialState, now: number): number {
  if (social.cooldownUntil === null) return 0;
  return Math.max(0, social.cooldownUntil - now);
}

export function getCooldownState(
  social: SocialState,
  config: BalanceConfig,
  now: number,
): CooldownState {
  const remainingMs = cooldownRemainingMs(social, now);
  const total = config.posting.cooldownMs;
  return {
    active: remainingMs > 0,
    remainingMs,
    progress: total > 0 ? Math.min(1, Math.max(0, 1 - remainingMs / total)) : 1,
  };
}

export function formatCooldown(remainingMs: number): string {
  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  return `${seconds}s`;
}

/**
 * Resolusi posting manual. DETERMINISTIK — tanpa RNG.
 *
 * Alasan: PRD v2.0 menetapkan posting sebagai aktivitas "keputusan terasa".
 * Pemain harus bisa menilai trade-off caption/hashtag/jam, bukan mengundi.
 * Ketidakpastian tetap ada di campaign (satu random roll).
 *
 * Formulasi (semua koefisien dari config):
 *   captionMatch   = caption.tone === app.preferredTone ? 1 : 0.65
 *   engagement     = app.followerMultiplier
 *                  × rewardMultiplier
 *                  × caption.baseEngagement
 *                  × hashtag.reachModifier
 *                  × timing.engagementModifier
 *                  × (performance / 50)
 *                  × captionMatch
 *   moneyDelta     = floor(engagement × moneyPerEngagement)
 *   followersDelta = floor(engagement × followersPerEngagement × tierFollowersMultiplier)
 *   suspicionDelta = ceil(baseSuspicion × app.suspicion × hashtag.suspicion × timing.suspicion)
 */

import type { BalanceConfig } from '@/data/config/balance';
import type { AccountState } from '@/state/types';
import { assertFiniteAmount } from '@/core/money';
import type { ResolvedPostInput } from './composer';

export interface PostResolution {
  engagement: number;
  moneyDelta: number;
  followersDelta: number;
  suspicionDelta: number;
  /** 0–1, seberapa cocok caption dengan aplikasi. */
  captionMatch: number;
  shadowbanned: boolean;
}

export interface PostResolutionContext {
  account: AccountState;
  performanceReference: number;
  tierFollowersMultiplier: number;
  shadowbanned: boolean;
}

const MISMATCH_FACTOR = 0.65;

export function resolvePost(
  input: ResolvedPostInput,
  context: PostResolutionContext,
  config: BalanceConfig,
): PostResolution {
  const { app, caption, hashtag, timing } = input;
  const { account, performanceReference, tierFollowersMultiplier, shadowbanned } = context;

  const captionMatch = caption.tone === app.preferredTone ? 1 : MISMATCH_FACTOR;

  const performanceRatio =
    performanceReference > 0
      ? Math.max(0, assertFiniteAmount(account.performance, 'performance') / performanceReference)
      : 1;

  const engagement = Math.max(
    0,
    app.followerMultiplier *
      app.rewardMultiplier *
      caption.baseEngagement *
      hashtag.reachModifier *
      timing.engagementModifier *
      performanceRatio *
      captionMatch,
  );

  const rawMoney = engagement * config.posting.moneyPerEngagement;
  const moneyMultiplier = shadowbanned ? config.posting.shadowbanRewardMultiplier : 1;

  const moneyDelta = Math.max(0, Math.floor(rawMoney * moneyMultiplier));

  const followersBase =
    engagement * config.posting.followersPerEngagement * Math.max(0, tierFollowersMultiplier);
  const followersDelta = shadowbanned ? 0 : Math.max(0, Math.floor(followersBase));

  const suspicionDelta = Math.max(
    0,
    Math.ceil(
      config.posting.baseSuspicion *
        app.suspicionMultiplier *
        hashtag.suspicionModifier *
        timing.suspicionModifier,
    ),
  );

  return {
    engagement: Math.round(engagement),
    moneyDelta,
    followersDelta,
    suspicionDelta,
    captionMatch,
    shadowbanned,
  };
}

/** Label kualitatif agar UI tidak menampilkan angka presisi (PRD §7.5). */
export function reachLabel(engagement: number): 'low' | 'medium' | 'high' {
  if (engagement >= 90) return 'high';
  if (engagement >= 45) return 'medium';
  return 'low';
}

export function riskLabel(suspicionDelta: number): 'low' | 'medium' | 'high' {
  if (suspicionDelta >= 6) return 'high';
  if (suspicionDelta >= 4) return 'medium';
  return 'low';
}

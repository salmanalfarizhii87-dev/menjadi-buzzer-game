import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { CAPTION_OPTIONS, HASHTAG_OPTIONS, TIMING_OPTIONS } from '@/data/social/composer-options';
import { SOCIAL_APPS } from '@/data/social/apps';
import { validatePostInput, type PostInput } from './composer';
import { reachLabel, resolvePost, riskLabel } from './resolve-post';

const NOW = 1_700_000_000_000;

function context(overrides: Partial<{
  performance: number;
  tierFollowersMultiplier: number;
  shadowbanned: boolean;
}> = {}) {
  const save = createInitialSave(BALANCE, NOW);
  const account = save.accounts[0]!;
  return {
    account: { ...account, performance: overrides.performance ?? account.performance },
    performanceReference: BALANCE.income.performanceReference,
    tierFollowersMultiplier: overrides.tierFollowersMultiplier ?? 1,
    shadowbanned: overrides.shadowbanned ?? false,
  };
}

function baseInput(): PostInput {
  const chirper = SOCIAL_APPS.find((app) => app.id === 'chirper')!;
  const caption = CAPTION_OPTIONS.find((option) => option.tone === chirper.preferredTone)!;
  return {
    appId: 'chirper',
    captionId: caption.id,
    hashtagId: 'tag-info',
    timingId: 'normal',
  };
}

function resolved(input: PostInput) {
  const result = validatePostInput(input);
  if (!result.ok) throw new Error('input tidak valid');
  return result.value;
}

describe('resolvePost', () => {
  it('deterministik: input sama menghasilkan output sama', () => {
    const first = resolvePost(resolved(baseInput()), context(), BALANCE);
    const second = resolvePost(resolved(baseInput()), context(), BALANCE);
    expect(second).toEqual(first);
  });

  it('menghasilkan engagement, uang, followers, suspicion positif', () => {
    const result = resolvePost(resolved(baseInput()), context(), BALANCE);
    expect(result.engagement).toBeGreaterThan(0);
    expect(result.moneyDelta).toBeGreaterThan(0);
    expect(result.followersDelta).toBeGreaterThan(0);
    expect(result.suspicionDelta).toBeGreaterThan(0);
  });

  it('caption yang cocok memberi engagement lebih tinggi', () => {
    const app = SOCIAL_APPS.find((entry) => entry.id === 'chirper')!;
    const matching = CAPTION_OPTIONS.find((option) => option.tone === app.preferredTone)!;
    const mismatching = CAPTION_OPTIONS.find((option) => option.tone !== app.preferredTone)!;

    const good = resolvePost(
      resolved({ ...baseInput(), captionId: matching.id }),
      context(),
      BALANCE,
    );
    const bad = resolvePost(
      resolved({ ...baseInput(), captionId: mismatching.id }),
      context(),
      BALANCE,
    );

    expect(good.engagement).toBeGreaterThan(bad.engagement);
    expect(good.moneyDelta).toBeGreaterThanOrEqual(bad.moneyDelta);
  });

  it('hashtag viral menaikkan jangkauan dan suspicion', () => {
    const safe = resolvePost(resolved({ ...baseInput(), hashtagId: 'tag-chill' }), context(), BALANCE);
    const viral = resolvePost(resolved({ ...baseInput(), hashtagId: 'tag-viral' }), context(), BALANCE);

    expect(viral.engagement).toBeGreaterThan(safe.engagement);
    expect(viral.suspicionDelta).toBeGreaterThan(safe.suspicionDelta);
  });

  it('jam ramai menaikkan engagement dan suspicion', () => {
    const quiet = resolvePost(resolved({ ...baseInput(), timingId: 'quiet' }), context(), BALANCE);
    const peak = resolvePost(resolved({ ...baseInput(), timingId: 'peak' }), context(), BALANCE);

    expect(peak.engagement).toBeGreaterThan(quiet.engagement);
    expect(peak.suspicionDelta).toBeGreaterThan(quiet.suspicionDelta);
  });

  it('performance akun memengaruhi engagement', () => {
    const low = resolvePost(resolved(baseInput()), context({ performance: 25 }), BALANCE);
    const high = resolvePost(resolved(baseInput()), context({ performance: 100 }), BALANCE);
    expect(high.engagement).toBeGreaterThan(low.engagement);
  });

  it('shadowban meniadakan followers dan memotong uang', () => {
    const normal = resolvePost(resolved(baseInput()), context(), BALANCE);
    const banned = resolvePost(resolved(baseInput()), context({ shadowbanned: true }), BALANCE);

    expect(banned.followersDelta).toBe(0);
    expect(banned.shadowbanned).toBe(true);
    expect(banned.moneyDelta).toBeLessThan(normal.moneyDelta);
  });

  it('tier multiplier 0 (Panas/Kritis) meniadakan followers', () => {
    const result = resolvePost(resolved(baseInput()), context({ tierFollowersMultiplier: 0 }), BALANCE);
    expect(result.followersDelta).toBe(0);
  });

  it('suspicion selalu minimal 1 (tidak pernah 0)', () => {
    for (const hashtag of HASHTAG_OPTIONS) {
      for (const timing of TIMING_OPTIONS) {
        const result = resolvePost(
          resolved({ ...baseInput(), hashtagId: hashtag.id, timingId: timing.id }),
          context(),
          BALANCE,
        );
        expect(result.suspicionDelta).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('semua nilai berhingga', () => {
    const result = resolvePost(resolved(baseInput()), context(), BALANCE);
    for (const value of [
      result.engagement,
      result.moneyDelta,
      result.followersDelta,
      result.suspicionDelta,
      result.captionMatch,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });
});

describe('label kualitatif', () => {
  it('reachLabel memetakan ke tiga band', () => {
    expect(reachLabel(10)).toBe('low');
    expect(reachLabel(60)).toBe('medium');
    expect(reachLabel(200)).toBe('high');
  });

  it('riskLabel memetakan ke tiga band', () => {
    expect(riskLabel(1)).toBe('low');
    expect(riskLabel(4)).toBe('medium');
    expect(riskLabel(9)).toBe('high');
  });
});

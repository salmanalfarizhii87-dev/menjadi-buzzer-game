import { describe, expect, it } from 'vitest';
import {
  DEFAULT_POST_INPUT,
  validatePostInput,
  type PostInput,
} from './composer';
import { CAPTION_OPTIONS, HASHTAG_OPTIONS, TIMING_OPTIONS } from '@/data/social/composer-options';
import { SOCIAL_APPS } from '@/data/social/apps';

describe('validatePostInput', () => {
  it('menerima input default', () => {
    const result = validatePostInput(DEFAULT_POST_INPUT);
    expect(result.ok).toBe(true);
  });

  it('mengembalikan objek lengkap saat valid', () => {
    const result = validatePostInput(DEFAULT_POST_INPUT);
    if (!result.ok) throw new Error('harus valid');

    expect(result.value.app.id).toBe('chirper');
    expect(result.value.caption.id).toBe(DEFAULT_POST_INPUT.captionId);
    expect(result.value.hashtag.id).toBe(DEFAULT_POST_INPUT.hashtagId);
    expect(result.value.timing.id).toBe(DEFAULT_POST_INPUT.timingId);
  });

  it('menolak app tidak dikenal', () => {
    const input: PostInput = { ...DEFAULT_POST_INPUT, appId: 'myspace' };
    expect(validatePostInput(input).ok).toBe(false);
  });

  it('menolak caption tidak dikenal', () => {
    const input: PostInput = { ...DEFAULT_POST_INPUT, captionId: 'caption-ghost' };
    expect(validatePostInput(input).ok).toBe(false);
  });

  it('menolak hashtag tidak dikenal', () => {
    const input: PostInput = { ...DEFAULT_POST_INPUT, hashtagId: 'tag-ghost' };
    expect(validatePostInput(input).ok).toBe(false);
  });

  it('menolak timing tidak dikenal', () => {
    const input: PostInput = { ...DEFAULT_POST_INPUT, timingId: 'midnight' as never };
    expect(validatePostInput(input).ok).toBe(false);
  });
});

describe('data composer', () => {
  it('menyediakan minimal 3 app', () => {
    expect(SOCIAL_APPS.length).toBeGreaterThanOrEqual(3);
  });

  it('menyediakan minimal 3 opsi caption, hashtag, dan timing', () => {
    expect(CAPTION_OPTIONS.length).toBeGreaterThanOrEqual(3);
    expect(HASHTAG_OPTIONS.length).toBeGreaterThanOrEqual(3);
    expect(TIMING_OPTIONS.length).toBe(3);
  });

  it('ID opsi unik', () => {
    const captionIds = CAPTION_OPTIONS.map((option) => option.id);
    const hashtagIds = HASHTAG_OPTIONS.map((option) => option.id);
    expect(new Set(captionIds).size).toBe(captionIds.length);
    expect(new Set(hashtagIds).size).toBe(hashtagIds.length);
  });

  it('default memakai opsi paling aman, bukan paling berisiko', () => {
    const defaultCaption = CAPTION_OPTIONS.find(
      (option) => option.id === DEFAULT_POST_INPUT.captionId,
    )!;
    const defaultHashtag = HASHTAG_OPTIONS.find(
      (option) => option.id === DEFAULT_POST_INPUT.hashtagId,
    )!;
    const defaultTiming = TIMING_OPTIONS.find(
      (option) => option.id === DEFAULT_POST_INPUT.timingId,
    )!;

    // Bukan caption dengan engagement tertinggi.
    const maxEngagement = Math.max(...CAPTION_OPTIONS.map((option) => option.baseEngagement));
    expect(defaultCaption.baseEngagement).toBeLessThan(maxEngagement);

    // Bukan hashtag dengan suspicion tertinggi.
    const maxSuspicion = Math.max(...HASHTAG_OPTIONS.map((option) => option.suspicionModifier));
    expect(defaultHashtag.suspicionModifier).toBeLessThan(maxSuspicion);

    // Bukan jam paling ramai.
    expect(defaultTiming.id).not.toBe('peak');
  });
});

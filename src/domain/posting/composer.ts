/**
 * Validasi input composer. Pure.
 *
 * Default composer sengaja memilih opsi paling aman (caption informatif,
 * hashtag netral, jam normal) — tidak diam-diam mengarah ke opsi paling berisiko
 * (PRD §7.6).
 */

import { err, ok, type ActionResult } from '@/core/result';
import {
  findCaption,
  findHashtag,
  findTiming,
  type CaptionOption,
  type HashtagOption,
  type TimingOption,
} from '@/data/social/composer-options';
import { findApp, type SocialApp } from '@/data/social/apps';

export interface PostInput {
  appId: string;
  captionId: string;
  hashtagId: string;
  timingId: string;
}

export interface ResolvedPostInput {
  app: SocialApp;
  caption: CaptionOption;
  hashtag: HashtagOption;
  timing: TimingOption;
}

/** Pilihan default yang aman untuk composer. */
export const DEFAULT_POST_INPUT: PostInput = {
  appId: 'chirper',
  captionId: 'caption-fact',
  hashtagId: 'tag-info',
  timingId: 'normal',
};

export function validatePostInput(input: PostInput): ActionResult<ResolvedPostInput> {
  const app = findApp(input.appId);
  if (!app) {
    return err('invalid_transition', 'error.unknown', `app tidak dikenal: ${input.appId}`);
  }

  const caption = findCaption(input.captionId);
  if (!caption) {
    return err('invalid_transition', 'error.unknown', `caption tidak dikenal: ${input.captionId}`);
  }

  const hashtag = findHashtag(input.hashtagId);
  if (!hashtag) {
    return err('invalid_transition', 'error.unknown', `hashtag tidak dikenal: ${input.hashtagId}`);
  }

  const timing = findTiming(input.timingId);
  if (!timing) {
    return err('invalid_transition', 'error.unknown', `timing tidak dikenal: ${input.timingId}`);
  }

  return ok({ app, caption, hashtag, timing });
}

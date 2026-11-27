/**
 * Aplikasi media sosial fiktif (PRD OD-13).
 * Semua nama parodi, bukan merek asli.
 *
 * PLACEHOLDER — angka belum balancing final.
 */

export type CaptionTone = 'informative' | 'emotional' | 'humorous' | 'provocative';

export interface SocialApp {
  id: string;
  name: string;
  taglineKey: string;
  /** Tone yang paling cocok; caption dengan tone ini memberi engagement penuh. */
  preferredTone: CaptionTone;
  followerMultiplier: number;
  suspicionMultiplier: number;
  rewardMultiplier: number;
}

export const SOCIAL_APPS: SocialApp[] = [
  {
    id: 'chirper',
    name: 'Chirper',
    taglineKey: 'social.app.chirper.tagline',
    preferredTone: 'informative',
    followerMultiplier: 1,
    suspicionMultiplier: 1,
    rewardMultiplier: 1,
  },
  {
    id: 'pulse',
    name: 'Pulse',
    taglineKey: 'social.app.pulse.tagline',
    preferredTone: 'humorous',
    followerMultiplier: 1.25,
    suspicionMultiplier: 1.15,
    rewardMultiplier: 1.2,
  },
  {
    id: 'loop',
    name: 'Loop',
    taglineKey: 'social.app.loop.tagline',
    preferredTone: 'emotional',
    followerMultiplier: 1.1,
    suspicionMultiplier: 0.95,
    rewardMultiplier: 1.05,
  },
];

export function findApp(appId: string): SocialApp | undefined {
  return SOCIAL_APPS.find((app) => app.id === appId);
}

export function getDefaultApp(): SocialApp {
  return SOCIAL_APPS[0]!;
}

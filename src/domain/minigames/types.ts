/**
 * Tipe mini-game. Skor selalu integer 0..100 agar semua modul bisa
 * dinormalisasi ke skala yang sama (lihat `domain/strategy/performance.ts`).
 */

export type MiniGameId = 'caption-challenge' | 'engagement-challenge';

export const MINI_GAME_IDS: readonly MiniGameId[] = [
  'caption-challenge',
  'engagement-challenge',
];

export function isMiniGameId(value: string): value is MiniGameId {
  return (MINI_GAME_IDS as readonly string[]).includes(value);
}

export interface CaptionOptionDefinition {
  id: string;
  text: string;
  /** 0..100, dijumlahkan lalu dirata-rata. */
  score: number;
  note: string;
}

export interface CaptionRoundDefinition {
  id: string;
  prompt: string;
  options: readonly CaptionOptionDefinition[];
}

export interface CaptionChallengeResult {
  score: number;
  roundScores: number[];
}

export interface EngagementChallengeSetup {
  targetCenter: number;
  targetWidth: number;
  attempts: number;
}

export interface EngagementChallengeResult {
  score: number;
  attemptScores: number[];
}

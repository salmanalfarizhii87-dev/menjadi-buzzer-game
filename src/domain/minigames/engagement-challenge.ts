/**
 * Engagement Challenge: pemain menghentikan penanda di zona target.
 *
 * Target diturunkan dari seed session, jadi tetap sama setelah refresh.
 * Skor per percobaan: 100 di pusat zona, 75 di tepi zona, lalu turun linear
 * sampai 0 di ujung trek. Rata-rata dibulatkan ke 0..100.
 */

import type {
  EngagementChallengeResult,
  EngagementChallengeSetup,
} from './types';

const EDGE_SCORE = 75;

function unitFromSeed(seed: number): number {
  let value = seed >>> 0;
  value = (value + 0x9e3779b9) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad) >>> 0;
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97) >>> 0;
  value = (value ^ (value >>> 15)) >>> 0;
  return value / 0x1_0000_0000;
}

export function createEngagementChallenge(
  seed: number,
  targetWidth: number,
  attempts: number,
): EngagementChallengeSetup {
  const width = Math.min(0.5, Math.max(0.05, targetWidth));
  const unit = unitFromSeed(seed);
  const center = 0.2 + unit * 0.6;
  const half = width / 2;
  const targetCenter = Math.min(1 - half, Math.max(half, center));

  return { targetCenter, targetWidth: width, attempts: Math.max(1, Math.round(attempts)) };
}

export function scoreEngagementAttempt(
  setup: EngagementChallengeSetup,
  position: number,
): number {
  const clamped = Math.min(1, Math.max(0, position));
  const half = setup.targetWidth / 2;
  const distance = Math.abs(clamped - setup.targetCenter);

  if (distance <= half) {
    const ratio = distance / half;
    return Math.round(100 - (100 - EDGE_SCORE) * ratio);
  }

  const outsideSpan = 0.5 - half;
  const falloff = Math.min(1, (distance - half) / outsideSpan);
  return Math.round(EDGE_SCORE * (1 - falloff));
}

export function scoreEngagementChallenge(
  setup: EngagementChallengeSetup,
  positions: readonly number[],
): EngagementChallengeResult {
  if (positions.length !== setup.attempts) {
    throw new Error(`Jumlah percobaan ${positions.length} tidak cocok dengan ${setup.attempts}`);
  }
  if (positions.some((position) => !Number.isFinite(position) || position < 0 || position > 1)) {
    throw new Error('Posisi percobaan harus berada di 0..1');
  }

  const attemptScores = positions.map((position) => scoreEngagementAttempt(setup, position));
  const total = attemptScores.reduce((sum, value) => sum + value, 0);
  return {
    attemptScores,
    score: Math.round(total / attemptScores.length),
  };
}

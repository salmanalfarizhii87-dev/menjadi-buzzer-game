/**
 * Normalisasi skor mini-game ke skala performa 0..100.
 *
 * Setiap mini-game sudah berskor 0..100, jadi normalisasi di sini adalah
 * clamp + rata-rata. Dengan begitu skor 80 dari mini-game mana pun bernilai
 * sama saat masuk ke resolusi kampanye.
 */

export interface CampaignPerformanceInput {
  accountPerformance: number;
  approachModifier: number;
  intensityModifier: number;
  postureModifier: number;
  miniGameScore?: number | null;
  /** Poin performa per 1 skor mini-game di atas/bawah 50. */
  miniGameWeight: number;
}

/**
 * Performa kampanye = performa akun + modifier strategi + kontribusi
 * mini-game. Mini-game 100 menambah `50 × weight`, skor 0 mengurangi.
 */
export function computeCampaignPerformance(input: CampaignPerformanceInput): number {
  const miniGameDelta =
    input.miniGameScore === null || input.miniGameScore === undefined
      ? 0
      : (clampScore(input.miniGameScore) - 50) * input.miniGameWeight;

  return clampScore(
    input.accountPerformance +
      input.approachModifier +
      input.intensityModifier +
      input.postureModifier +
      miniGameDelta,
  );
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeMiniGameScore(score: number): number {
  return clampScore(score);
}

/** Rata-rata skor yang tersedia; tanpa skor mengembalikan 0. */
export function performanceFromMiniGames(scores: readonly number[]): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, score) => sum + clampScore(score), 0);
  return clampScore(total / scores.length);
}

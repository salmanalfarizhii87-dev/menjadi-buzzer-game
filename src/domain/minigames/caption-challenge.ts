/**
 * Caption Challenge: 3 ronde pilihan ganda. Skor tiap opsi berasal dari data;
 * fungsi ini hanya menjumlahkan dan memvalidasi input.
 */

import type {
  CaptionChallengeResult,
  CaptionRoundDefinition,
} from './types';

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function scoreCaptionChallenge(
  rounds: readonly CaptionRoundDefinition[],
  answers: readonly number[],
): CaptionChallengeResult {
  if (rounds.length === 0) throw new Error('Caption Challenge butuh minimal satu ronde');
  if (answers.length !== rounds.length) {
    throw new Error(`Jumlah jawaban ${answers.length} tidak cocok dengan ${rounds.length} ronde`);
  }

  const roundScores = rounds.map((round, index) => {
    const answer = answers[index];
    if (answer === undefined || !Number.isInteger(answer)) {
      throw new Error(`Jawaban ronde ${index + 1} tidak valid`);
    }
    const option = round.options[answer];
    if (!option) throw new Error(`Opsi ${answer} tidak ada pada ronde ${index + 1}`);
    return clampScore(option.score);
  });

  const total = roundScores.reduce((sum, value) => sum + value, 0);
  return { score: clampScore(total / roundScores.length), roundScores };
}

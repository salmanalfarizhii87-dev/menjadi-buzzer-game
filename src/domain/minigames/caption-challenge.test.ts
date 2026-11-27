import { describe, expect, it } from 'vitest';
import { CAPTION_ROUNDS } from '@/data/minigames/caption-challenge';
import { scoreCaptionChallenge } from './caption-challenge';

describe('CAPTION_ROUNDS', () => {
  it('berisi tiga ronde dengan empat opsi', () => {
    expect(CAPTION_ROUNDS).toHaveLength(3);
    for (const round of CAPTION_ROUNDS) {
      expect(round.options).toHaveLength(4);
    }
  });
});

describe('scoreCaptionChallenge', () => {
  it('memberi 100 untuk semua opsi terbaik', () => {
    const result = scoreCaptionChallenge(CAPTION_ROUNDS, [0, 0, 0]);
    expect(result.score).toBe(100);
    expect(result.roundScores).toEqual([100, 100, 100]);
  });

  it('memberi 0 untuk semua opsi terburuk', () => {
    const result = scoreCaptionChallenge(CAPTION_ROUNDS, [3, 3, 3]);
    expect(result.score).toBe(0);
  });

  it('merata-ratakan skor ronde', () => {
    const result = scoreCaptionChallenge(CAPTION_ROUNDS, [0, 1, 2]);
    expect(result.roundScores).toEqual([100, 25, 50]);
    expect(result.score).toBe(58);
  });

  it('menolak jumlah jawaban yang tidak cocok', () => {
    expect(() => scoreCaptionChallenge(CAPTION_ROUNDS, [0, 0])).toThrow();
  });

  it('menolak indeks opsi di luar rentang', () => {
    expect(() => scoreCaptionChallenge(CAPTION_ROUNDS, [0, 0, 9])).toThrow();
  });
});

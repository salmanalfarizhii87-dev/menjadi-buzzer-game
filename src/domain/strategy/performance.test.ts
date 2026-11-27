import { describe, expect, it } from 'vitest';
import { normalizeMiniGameScore, performanceFromMiniGames } from './performance';

describe('normalizeMiniGameScore', () => {
  it('membulatkan dan membatasi ke 0..100', () => {
    expect(normalizeMiniGameScore(79.6)).toBe(80);
    expect(normalizeMiniGameScore(120)).toBe(100);
    expect(normalizeMiniGameScore(-5)).toBe(0);
    expect(normalizeMiniGameScore(Number.NaN)).toBe(0);
  });
});

describe('performanceFromMiniGames', () => {
  it('skor 80 dari kedua mini-game memberi dampak setara', () => {
    expect(performanceFromMiniGames([80, 80])).toBe(80);
  });

  it('merata-ratakan skor yang tersedia', () => {
    expect(performanceFromMiniGames([100, 60])).toBe(80);
  });

  it('mengembalikan 0 tanpa skor', () => {
    expect(performanceFromMiniGames([])).toBe(0);
  });

  it('menormalkan nilai ekstrem sebelum dirata-ratakan', () => {
    expect(performanceFromMiniGames([120, -20])).toBe(50);
  });
});

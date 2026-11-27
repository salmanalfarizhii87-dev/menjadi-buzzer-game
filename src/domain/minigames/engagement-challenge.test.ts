import { describe, expect, it } from 'vitest';
import {
  createEngagementChallenge,
  scoreEngagementAttempt,
  scoreEngagementChallenge,
} from './engagement-challenge';

const WIDTH = 0.18;
const ATTEMPTS = 5;

describe('createEngagementChallenge', () => {
  it('deterministik untuk seed yang sama', () => {
    const a = createEngagementChallenge(12345, WIDTH, ATTEMPTS);
    const b = createEngagementChallenge(12345, WIDTH, ATTEMPTS);
    expect(a).toEqual(b);
  });

  it('berbeda untuk seed yang berbeda', () => {
    const a = createEngagementChallenge(1, WIDTH, ATTEMPTS);
    const b = createEngagementChallenge(2, WIDTH, ATTEMPTS);
    expect(a.targetCenter).not.toBe(b.targetCenter);
  });

  it('menjaga zona target di dalam trek', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const setup = createEngagementChallenge(seed, WIDTH, ATTEMPTS);
      expect(setup.targetCenter - setup.targetWidth / 2).toBeGreaterThanOrEqual(0);
      expect(setup.targetCenter + setup.targetWidth / 2).toBeLessThanOrEqual(1);
      expect(setup.attempts).toBe(ATTEMPTS);
    }
  });

  it('membatasi lebar target ke rentang aman', () => {
    expect(createEngagementChallenge(1, 2, 5).targetWidth).toBe(0.5);
    expect(createEngagementChallenge(1, 0, 5).targetWidth).toBe(0.05);
  });
});

describe('scoreEngagementAttempt', () => {
  const setup = createEngagementChallenge(999, WIDTH, ATTEMPTS);

  it('memberi 100 di pusat zona', () => {
    expect(scoreEngagementAttempt(setup, setup.targetCenter)).toBe(100);
  });

  it('memberi 75 di tepi zona', () => {
    const edge = setup.targetCenter + setup.targetWidth / 2;
    expect(scoreEngagementAttempt(setup, edge)).toBe(75);
  });

  it('memberi 0 di ujung trek yang jauh', () => {
    const far = setup.targetCenter < 0.5 ? 1 : 0;
    expect(scoreEngagementAttempt(setup, far)).toBe(0);
  });

  it('monoton menurun saat menjauh dari pusat', () => {
    const near = scoreEngagementAttempt(setup, setup.targetCenter + 0.05);
    const far = scoreEngagementAttempt(setup, setup.targetCenter + 0.2);
    expect(near).toBeGreaterThan(far);
  });
});

describe('scoreEngagementChallenge', () => {
  const setup = createEngagementChallenge(4242, WIDTH, ATTEMPTS);

  it('memberi 100 bila semua percobaan tepat di pusat', () => {
    const result = scoreEngagementChallenge(setup, Array(ATTEMPTS).fill(setup.targetCenter));
    expect(result.score).toBe(100);
    expect(result.attemptScores).toHaveLength(ATTEMPTS);
  });

  it('menolak jumlah percobaan yang salah', () => {
    expect(() => scoreEngagementChallenge(setup, [0.5])).toThrow();
  });

  it('menolak posisi di luar 0..1', () => {
    expect(() => scoreEngagementChallenge(setup, [0.1, 0.2, 0.3, 0.4, 1.4])).toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { computeSuccessProbability, type ProbabilityInput } from './probability';

const base: ProbabilityInput = {
  baseChance: 0.6,
  performanceScore: 50,
  targetPerformance: 50,
  reputation: 0,
  suspicion: 0,
  status: 'normal',
  strategyModifier: 0,
};

describe('computeSuccessProbability', () => {
  it('mengembalikan base saat semua faktor netral', () => {
    expect(computeSuccessProbability(base, BALANCE.probability)).toBeCloseTo(0.6, 5);
  });

  it('performa di atas target menaikkan peluang', () => {
    const high = computeSuccessProbability({ ...base, performanceScore: 80 }, BALANCE.probability);
    expect(high).toBeGreaterThan(0.6);
  });

  it('suspicion tinggi menurunkan peluang', () => {
    const risky = computeSuccessProbability({ ...base, suspicion: 80 }, BALANCE.probability);
    expect(risky).toBeLessThan(0.6);
  });

  it('status akun memberi penalti', () => {
    const restricted = computeSuccessProbability(
      { ...base, status: 'restricted' },
      BALANCE.probability,
    );
    expect(restricted).toBeLessThan(0.6);
  });

  it('modifier strategi ikut dijumlahkan', () => {
    const boosted = computeSuccessProbability(
      { ...base, strategyModifier: 0.1 },
      BALANCE.probability,
    );
    expect(boosted).toBeCloseTo(0.7, 5);
  });

  it('di-clamp ke batas konfigurasi', () => {
    const tooHigh = computeSuccessProbability({ ...base, baseChance: 2 }, BALANCE.probability);
    const tooLow = computeSuccessProbability({ ...base, baseChance: -2 }, BALANCE.probability);
    expect(tooHigh).toBe(BALANCE.probability.max);
    expect(tooLow).toBe(BALANCE.probability.min);
  });

  it('input tidak berhingga tidak menghasilkan NaN', () => {
    const value = computeSuccessProbability(
      { ...base, performanceScore: Number.NaN },
      BALANCE.probability,
    );
    expect(Number.isFinite(value)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { calculateAccruedIncome } from './accrual';

const MAX_DELTA = 5 * 60 * 1000;

describe('calculateAccruedIncome', () => {
  it('menghitung income dari elapsed time, bukan tick', () => {
    // 1 rupiah/detik selama 10 detik = 10 rupiah
    const result = calculateAccruedIncome(1, 10_000, 0, MAX_DELTA);
    expect(result.wholeAmount).toBe(10);
    expect(result.fractionalRemainder).toBeCloseTo(0, 6);
    expect(result.elapsedMsApplied).toBe(10_000);
    expect(result.clamped).toBe(false);
  });

  it('hasil sama untuk total elapsed yang sama meski dibagi banyak tick', () => {
    const rate = 0.37;
    const totalMs = 60_000;

    const oneShot = calculateAccruedIncome(rate, totalMs, 0, MAX_DELTA);

    let whole = 0;
    let remainder = 0;
    for (let index = 0; index < 60; index += 1) {
      const step = calculateAccruedIncome(rate, 1000, remainder, MAX_DELTA);
      whole += step.wholeAmount;
      remainder = step.fractionalRemainder;
    }

    expect(whole).toBe(oneShot.wholeAmount);
    expect(remainder).toBeCloseTo(oneShot.fractionalRemainder, 6);
  });

  it('menyimpan pecahan agar income kecil tidak hilang', () => {
    const rate = 0.1; // 0.1 rupiah/detik
    const first = calculateAccruedIncome(rate, 5000, 0, MAX_DELTA); // 0.5
    expect(first.wholeAmount).toBe(0);
    expect(first.fractionalRemainder).toBeCloseTo(0.5, 6);

    const second = calculateAccruedIncome(rate, 5000, first.fractionalRemainder, MAX_DELTA);
    expect(second.wholeAmount).toBe(1);
  });

  it('mengembalikan 0 untuk elapsed negatif atau nol', () => {
    expect(calculateAccruedIncome(1, 0, 0, MAX_DELTA).wholeAmount).toBe(0);
    expect(calculateAccruedIncome(1, -5000, 0, MAX_DELTA).wholeAmount).toBe(0);
  });

  it('mengembalikan 0 untuk rate nol atau negatif', () => {
    const result = calculateAccruedIncome(0, 10_000, 0.4, MAX_DELTA);
    expect(result.wholeAmount).toBe(0);
    expect(result.fractionalRemainder).toBeCloseTo(0.4, 6);
  });

  it('memotong delta yang melebihi batas (tab throttled ekstrem)', () => {
    const huge = MAX_DELTA * 10;
    const result = calculateAccruedIncome(1, huge, 0, MAX_DELTA);
    expect(result.clamped).toBe(true);
    expect(result.elapsedMsApplied).toBe(MAX_DELTA);
    expect(result.wholeAmount).toBe(MAX_DELTA / 1000);
  });

  it('menolak nilai non-finite', () => {
    expect(() => calculateAccruedIncome(Number.NaN, 1000, 0, MAX_DELTA)).toThrow();
    expect(() => calculateAccruedIncome(1, Number.POSITIVE_INFINITY, 0, MAX_DELTA)).toThrow();
  });

  it('tidak pernah menghasilkan NaN', () => {
    const result = calculateAccruedIncome(0.0001, 1, 0, MAX_DELTA);
    expect(Number.isFinite(result.wholeAmount)).toBe(true);
    expect(Number.isFinite(result.fractionalRemainder)).toBe(true);
  });
});

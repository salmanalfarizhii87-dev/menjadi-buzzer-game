import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import {
  automationMultiplier,
  calculateIncomeBreakdown,
  calculateIncomeRate,
  followersFactor,
  performanceFactor,
} from './income';

const incomeConfig = {
  income: BALANCE.income,
  statusModifiers: BALANCE.statusModifiers,
  automationMultiplierPerLevel: BALANCE.upgrades[0]!.incomeMultiplierPerLevel,
};

describe('followersFactor', () => {
  it('bernilai 1 pada titik referensi', () => {
    expect(followersFactor(BALANCE.income.followerReference, BALANCE.income)).toBeCloseTo(1, 5);
  });

  it('naik saat followers bertambah', () => {
    const low = followersFactor(1000, BALANCE.income);
    const high = followersFactor(10_000, BALANCE.income);
    expect(high).toBeGreaterThan(low);
  });

  it('dibatasi oleh cap', () => {
    const huge = followersFactor(1e12, BALANCE.income);
    expect(huge).toBeLessThanOrEqual(BALANCE.income.followerFactorCap);
  });

  it('nol untuk followers nol atau negatif', () => {
    expect(followersFactor(0, BALANCE.income)).toBe(0);
    expect(followersFactor(-500, BALANCE.income)).toBe(0);
  });

  it('tidak menghasilkan NaN untuk input tidak valid', () => {
    expect(followersFactor(Number.NaN, BALANCE.income)).toBe(0);
  });
});

describe('performanceFactor', () => {
  it('bernilai 1 pada titik referensi', () => {
    expect(performanceFactor(BALANCE.income.performanceReference, BALANCE.income)).toBeCloseTo(1, 5);
  });

  it('tidak turun di bawah floor', () => {
    expect(performanceFactor(0, BALANCE.income)).toBe(BALANCE.income.performanceFactorFloor);
    expect(performanceFactor(-50, BALANCE.income)).toBe(BALANCE.income.performanceFactorFloor);
  });

  it('tidak melewati cap', () => {
    expect(performanceFactor(10_000, BALANCE.income)).toBeLessThanOrEqual(
      BALANCE.income.performanceFactorCap,
    );
  });
});

describe('automationMultiplier', () => {
  it('bernilai 1 pada level 0', () => {
    expect(automationMultiplier(0, 0.25)).toBe(1);
  });

  it('naik linear per level', () => {
    expect(automationMultiplier(1, 0.25)).toBeCloseTo(1.25);
    expect(automationMultiplier(4, 0.25)).toBeCloseTo(2);
  });

  it('aman untuk nilai negatif', () => {
    expect(automationMultiplier(-3, 0.25)).toBe(1);
  });
});

describe('calculateIncomeRate', () => {
  const baseContext = {
    followers: 1000,
    performance: 50,
    automationLevel: 0,
    status: 'normal' as const,
  };

  it('menghasilkan rate positif pada state awal', () => {
    const rate = calculateIncomeRate(baseContext, incomeConfig);
    expect(rate).toBeGreaterThan(0);
    expect(Number.isFinite(rate)).toBe(true);
  });

  it('followers lebih tinggi menghasilkan rate lebih tinggi', () => {
    const low = calculateIncomeRate(baseContext, incomeConfig);
    const high = calculateIncomeRate({ ...baseContext, followers: 50_000 }, incomeConfig);
    expect(high).toBeGreaterThan(low);
  });

  it('performance lebih tinggi menghasilkan rate lebih tinggi', () => {
    const low = calculateIncomeRate({ ...baseContext, performance: 30 }, incomeConfig);
    const high = calculateIncomeRate({ ...baseContext, performance: 90 }, incomeConfig);
    expect(high).toBeGreaterThan(low);
  });

  it('automation level menaikkan rate', () => {
    const without = calculateIncomeRate(baseContext, incomeConfig);
    const withUpgrade = calculateIncomeRate({ ...baseContext, automationLevel: 3 }, incomeConfig);
    expect(withUpgrade).toBeGreaterThan(without);
  });

  it('status suspended menghasilkan rate 0', () => {
    const rate = calculateIncomeRate({ ...baseContext, status: 'suspended' }, incomeConfig);
    expect(rate).toBe(0);
  });

  it('status warning dan restricted menurunkan rate', () => {
    const normal = calculateIncomeRate(baseContext, incomeConfig);
    const warning = calculateIncomeRate({ ...baseContext, status: 'warning' }, incomeConfig);
    const restricted = calculateIncomeRate({ ...baseContext, status: 'restricted' }, incomeConfig);

    expect(warning).toBeLessThan(normal);
    expect(restricted).toBeLessThan(warning);
  });

  it('asset multiplier mengalikan rate', () => {
    const base = calculateIncomeRate(baseContext, incomeConfig);
    const boosted = calculateIncomeRate({ ...baseContext, assetMultiplier: 1.5 }, incomeConfig);
    expect(boosted).toBeCloseTo(base * 1.5, 8);
  });
  it('breakdown mengembalikan komponen yang konsisten', () => {
    const breakdown = calculateIncomeBreakdown(baseContext, incomeConfig);
    const product =
      breakdown.baseRate *
      breakdown.followersFactor *
      breakdown.performanceFactor *
      breakdown.automationMultiplier *
      breakdown.statusModifier;

    expect(breakdown.ratePerSecond).toBeCloseTo(product, 8);
  });
});

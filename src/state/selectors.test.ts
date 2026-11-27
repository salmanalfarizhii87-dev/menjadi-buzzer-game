import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { selectRiskMeter, selectTierForSuspicion } from './selectors';

const NOW = 1_700_000_000_000;

function saveWithSuspicion(suspicion: number) {
  const save = createInitialSave(BALANCE, NOW);
  return {
    ...save,
    accounts: [{ ...save.accounts[0]!, suspicion }],
  };
}

describe('selectTierForSuspicion', () => {
  it('memetakan suspicion ke tier sesuai threshold', () => {
    expect(selectTierForSuspicion(0, BALANCE)).toBe('safe');
    expect(selectTierForSuspicion(29, BALANCE)).toBe('safe');
    expect(selectTierForSuspicion(30, BALANCE)).toBe('watch');
    expect(selectTierForSuspicion(59, BALANCE)).toBe('watch');
    expect(selectTierForSuspicion(60, BALANCE)).toBe('hot');
    expect(selectTierForSuspicion(84, BALANCE)).toBe('hot');
    expect(selectTierForSuspicion(85, BALANCE)).toBe('critical');
    expect(selectTierForSuspicion(100, BALANCE)).toBe('critical');
  });

  it('menangani nilai di luar rentang', () => {
    expect(selectTierForSuspicion(-10, BALANCE)).toBe('safe');
    expect(selectTierForSuspicion(150, BALANCE)).toBe('critical');
  });

  it('aman untuk nilai non-finite', () => {
    expect(selectTierForSuspicion(Number.NaN, BALANCE)).toBe('safe');
  });
});

describe('selectRiskMeter', () => {
  it('mengembalikan tier, suspicion, dan config tier', () => {
    const meter = selectRiskMeter(saveWithSuspicion(65), BALANCE);

    expect(meter.tier).toBe('hot');
    expect(meter.suspicion).toBe(65);
    expect(meter.tierConfig.id).toBe('hot');
    expect(meter.tierConfig.incomeMultiplier).toBeLessThan(1);
  });

  it('tier aman memberi multiplier 1', () => {
    const meter = selectRiskMeter(saveWithSuspicion(5), BALANCE);
    expect(meter.tierConfig.incomeMultiplier).toBe(1);
  });

  it('tier kritis memberi multiplier paling rendah', () => {
    const safe = selectRiskMeter(saveWithSuspicion(5), BALANCE);
    const critical = selectRiskMeter(saveWithSuspicion(95), BALANCE);

    expect(critical.tierConfig.incomeMultiplier).toBeLessThan(safe.tierConfig.incomeMultiplier);
  });

  it('setiap tier punya rentang yang tidak tumpang tindih', () => {
    const tiers = [...BALANCE.riskTiers].sort((a, b) => a.minSuspicion - b.minSuspicion);

    for (let index = 1; index < tiers.length; index += 1) {
      expect(tiers[index]!.minSuspicion).toBeGreaterThan(tiers[index - 1]!.maxSuspicion);
    }
  });
});

describe('selectIncomeRate dengan risk tier', () => {
  it('tier aman tidak mengubah rate', async () => {
    const { selectIncomeRate } = await import('./selectors');
    const save = saveWithSuspicion(5);
    const rate = selectIncomeRate(save, BALANCE);
    expect(rate).toBeGreaterThan(0);
  });

  it('tier Panas menurunkan rate secara proporsional', async () => {
    const { selectIncomeRate } = await import('./selectors');
    const safeRate = selectIncomeRate(saveWithSuspicion(5), BALANCE);
    const hotRate = selectIncomeRate(saveWithSuspicion(65), BALANCE);

    const hotTier = BALANCE.riskTiers.find((tier) => tier.id === 'hot')!;
    expect(hotRate).toBeCloseTo(safeRate * hotTier.incomeMultiplier, 6);
    expect(hotRate).toBeLessThan(safeRate);
  });

  it('tier Kritis memberi rate paling rendah', async () => {
    const { selectIncomeRate } = await import('./selectors');
    const watchRate = selectIncomeRate(saveWithSuspicion(40), BALANCE);
    const criticalRate = selectIncomeRate(saveWithSuspicion(95), BALANCE);
    expect(criticalRate).toBeLessThan(watchRate);
  });

  it('breakdown menyertakan riskMultiplier', async () => {
    const { selectIncomeBreakdown } = await import('./selectors');
    const breakdown = selectIncomeBreakdown(saveWithSuspicion(65), BALANCE);
    expect(breakdown.riskMultiplier).toBeLessThan(1);
  });
});

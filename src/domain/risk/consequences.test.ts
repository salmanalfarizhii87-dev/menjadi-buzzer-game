import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { allTierConsequences, consequencesForTier } from './consequences';

const NOW = 1_700_000_000_000;

describe('consequencesForTier', () => {
  it('tier aman tidak punya efek', () => {
    const tier = consequencesForTier(BALANCE, 'safe');
    expect(tier.incomeMultiplier).toBe(1);
    expect(tier.autoFineOnEnter).toBe(0);
    expect(tier.canSeizeAsset).toBe(false);
    expect(tier.summaryKeys).toHaveLength(0);
  });

  it('tier panas menandai income turun, shadowban, dan denda', () => {
    const keys = consequencesForTier(BALANCE, 'hot').summaryKeys;
    expect(keys).toContain('risk.effect.incomeDown');
    expect(keys).toContain('risk.effect.shadowban');
    expect(keys).toContain('risk.effect.fine');
  });

  it('tier kritis menandai penyitaan aset', () => {
    const tier = consequencesForTier(BALANCE, 'critical');
    expect(tier.canSeizeAsset).toBe(true);
    expect(tier.summaryKeys).toContain('risk.effect.seizure');
  });

  it('income multiplier menurun seiring tier', () => {
    const safe = consequencesForTier(BALANCE, 'safe').incomeMultiplier;
    const watch = consequencesForTier(BALANCE, 'watch').incomeMultiplier;
    const hot = consequencesForTier(BALANCE, 'hot').incomeMultiplier;
    const critical = consequencesForTier(BALANCE, 'critical').incomeMultiplier;

    expect(watch).toBeLessThan(safe);
    expect(hot).toBeLessThan(watch);
    expect(critical).toBeLessThan(hot);
  });
});

describe('allTierConsequences', () => {
  it('mengembalikan semua tier terurut berdasarkan suspicion', () => {
    const tiers = allTierConsequences(BALANCE);
    expect(tiers).toHaveLength(BALANCE.riskTiers.length);

    const mins = tiers.map((tier) => tier.minSuspicion);
    expect(mins).toEqual([...mins].sort((a, b) => a - b));
  });

  it('tidak memutasi config', () => {
    const before = JSON.stringify(BALANCE.riskTiers);
    allTierConsequences(BALANCE);
    expect(JSON.stringify(BALANCE.riskTiers)).toBe(before);
  });

  it('setiap tier punya labelKey yang bisa diterjemahkan', () => {
    const tiers = allTierConsequences(BALANCE);
    for (const tier of tiers) {
      expect(tier.labelKey.startsWith('risk.tier.')).toBe(true);
    }
  });
});

describe('konsistensi dengan save', () => {
  it('save awal berada di tier aman', () => {
    const save = createInitialSave(BALANCE, NOW);
    expect(save.risk.tier).toBe('safe');
    expect(consequencesForTier(BALANCE, save.risk.tier).autoFineOnEnter).toBe(0);
  });
});

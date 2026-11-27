import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { getAutomationDefinition } from '@/data/upgrades/automation';
import { automationMultiplierForLevel, multiplierGainPercent } from './multiplier';

const def = getAutomationDefinition(BALANCE)!;

describe('automationMultiplierForLevel', () => {
  it('level 0 menghasilkan multiplier 1', () => {
    expect(automationMultiplierForLevel(def, 0)).toBe(1);
  });

  it('naik linear per level', () => {
    const perLevel = def.incomeMultiplierPerLevel;
    expect(automationMultiplierForLevel(def, 1)).toBeCloseTo(1 + perLevel);
    expect(automationMultiplierForLevel(def, 2)).toBeCloseTo(1 + perLevel * 2);
    expect(automationMultiplierForLevel(def, 4)).toBeCloseTo(1 + perLevel * 4);
  });

  it('level maksimum memberi multiplier tertinggi', () => {
    const max = automationMultiplierForLevel(def, def.maxLevel);
    const beforeMax = automationMultiplierForLevel(def, def.maxLevel - 1);
    expect(max).toBeGreaterThan(beforeMax);
  });

  it('aman untuk level negatif atau pecahan', () => {
    expect(automationMultiplierForLevel(def, -3)).toBe(1);
    expect(automationMultiplierForLevel(def, 1.7)).toBeCloseTo(
      1 + def.incomeMultiplierPerLevel,
    );
  });

  it('menolak level non-finite', () => {
    expect(() => automationMultiplierForLevel(def, Number.NaN)).toThrow();
  });
});

describe('multiplierGainPercent', () => {
  it('menghitung persentase kenaikan yang menurun tiap level', () => {
    const gain0 = multiplierGainPercent(def, 0);
    const gain4 = multiplierGainPercent(def, 4);
    expect(gain0).toBeGreaterThan(gain4);
  });

  it('gain level 0 sesuai perhitungan manual', () => {
    const now = 1;
    const next = 1 + def.incomeMultiplierPerLevel;
    expect(multiplierGainPercent(def, 0)).toBeCloseTo(((next - now) / now) * 100);
  });
});

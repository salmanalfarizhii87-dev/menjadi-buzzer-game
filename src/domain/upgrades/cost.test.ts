import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { getAutomationDefinition, validateUpgradeDefinition } from '@/data/upgrades/automation';
import { costForNextLevel, isMaxLevel, totalCostToLevel } from './cost';

const def = getAutomationDefinition(BALANCE)!;

describe('costForNextLevel', () => {
  it('level 0 memakai baseCost', () => {
    expect(costForNextLevel(def, 0)).toBe(def.baseCost);
  });

  it('biaya naik geometris', () => {
    const level0 = costForNextLevel(def, 0);
    const level1 = costForNextLevel(def, 1);
    const level2 = costForNextLevel(def, 2);

    expect(level1).toBeGreaterThan(level0);
    expect(level2).toBeGreaterThan(level1);
    expect(level1 / level0).toBeCloseTo(def.costGrowth, 0);
  });

  it('hasil selalu integer', () => {
    for (let level = 0; level < def.maxLevel; level += 1) {
      expect(Number.isInteger(costForNextLevel(def, level))).toBe(true);
    }
  });

  it('mengembalikan 0 saat sudah max level', () => {
    expect(costForNextLevel(def, def.maxLevel)).toBe(0);
    expect(costForNextLevel(def, def.maxLevel + 5)).toBe(0);
  });

  it('menolak level non-finite', () => {
    expect(() => costForNextLevel(def, Number.NaN)).toThrow();
  });
});

describe('isMaxLevel', () => {
  it('true saat level mencapai max', () => {
    expect(isMaxLevel(def, 0)).toBe(false);
    expect(isMaxLevel(def, def.maxLevel - 1)).toBe(false);
    expect(isMaxLevel(def, def.maxLevel)).toBe(true);
    expect(isMaxLevel(def, def.maxLevel + 1)).toBe(true);
  });
});

describe('totalCostToLevel', () => {
  it('menjumlahkan biaya semua level', () => {
    let manual = 0;
    for (let level = 0; level < 3; level += 1) {
      manual += costForNextLevel(def, level);
    }
    expect(totalCostToLevel(def, 3)).toBe(manual);
  });

  it('level 0 bernilai 0', () => {
    expect(totalCostToLevel(def, 0)).toBe(0);
  });

  it('dibatasi max level', () => {
    const all = totalCostToLevel(def, def.maxLevel);
    const beyond = totalCostToLevel(def, def.maxLevel + 10);
    expect(beyond).toBe(all);
  });
});

describe('validateUpgradeDefinition', () => {
  it('definisi valid tidak menghasilkan issue', () => {
    expect(validateUpgradeDefinition(def)).toEqual([]);
  });

  it('mendeteksi field yang tidak valid', () => {
    const broken = {
      ...def,
      baseCost: 0,
      costGrowth: 0.5,
      maxLevel: 0,
      incomeMultiplierPerLevel: -1,
    };
    const issues = validateUpgradeDefinition(broken);
    expect(issues.length).toBeGreaterThanOrEqual(4);
  });
});

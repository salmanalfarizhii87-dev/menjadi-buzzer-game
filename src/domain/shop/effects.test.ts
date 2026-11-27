import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { makeSave } from '@/tests/helpers';
import { assetIncomeEffect, assetIncomeMultiplier } from './effects';

describe('assetIncomeEffect', () => {
  it('tanpa aset multiplier 1', () => {
    const effect = assetIncomeEffect(makeSave(), BALANCE);
    expect(effect.multiplier).toBe(1);
    expect(effect.ownedItemCount).toBe(0);
  });

  it('properti dan kendaraan menambah bonus', () => {
    const save = makeSave();
    const owned = {
      ...save,
      assets: { propertyIds: ['prop-kos'], vehicleIds: ['veh-motor'] },
    };
    const effect = assetIncomeEffect(owned, BALANCE);
    expect(effect.bonus).toBeCloseTo(0.12, 5);
    expect(effect.multiplier).toBeCloseTo(1.12, 5);
    expect(effect.ownedItemCount).toBe(2);
  });

  it('bonus dibatasi assetBonusCap', () => {
    const save = makeSave();
    const owned = {
      ...save,
      assets: { propertyIds: ['prop-kos'], vehicleIds: ['veh-motor'] },
    };
    const cappedConfig = {
      ...BALANCE,
      income: { ...BALANCE.income, assetBonusCap: 0.1 },
    };
    expect(assetIncomeMultiplier(owned, cappedConfig)).toBeCloseTo(1.1, 5);
  });
});

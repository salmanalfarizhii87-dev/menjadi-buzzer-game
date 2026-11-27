import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { getAutomationDefinition } from '@/data/upgrades/automation';
import { evaluatePurchase, rateAtLevel } from './purchase';

const NOW = 1_700_000_000_000;
const def = getAutomationDefinition(BALANCE)!;

function save() {
  return createInitialSave(BALANCE, NOW);
}

describe('rateAtLevel', () => {
  it('rate naik seiring level automation', () => {
    const state = save();
    const account = state.accounts[0]!;

    const level0 = rateAtLevel(account, def, BALANCE, 0);
    const level1 = rateAtLevel(account, def, BALANCE, 1);
    const level4 = rateAtLevel(account, def, BALANCE, 4);

    expect(level1).toBeGreaterThan(level0);
    expect(level4).toBeGreaterThan(level1);
  });
});

describe('evaluatePurchase', () => {
  it('menghasilkan evaluasi lengkap pada state awal', () => {
    const result = evaluatePurchase(save(), def, BALANCE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const value = result.value;
    expect(value.currentLevel).toBe(0);
    expect(value.nextLevel).toBe(1);
    expect(value.cost).toBe(def.baseCost);
    expect(value.canAfford).toBe(true);
    expect(value.isMax).toBe(false);
    expect(value.rateAfter).toBeGreaterThan(value.rateBefore);
    expect(value.rateGain).toBeCloseTo(value.rateAfter - value.rateBefore);
  });

  it('menandai tidak mampu beli bila saldo kurang', () => {
    const state = save();
    const poor = { ...state, player: { ...state.player, money: 10 } };
    const result = evaluatePurchase(poor, def, BALANCE);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.canAfford).toBe(false);
  });

  it('menandai tidak mampu beli saat saldo negatif (utang)', () => {
    const state = save();
    const debt = { ...state, player: { ...state.player, money: -500 } };
    const result = evaluatePurchase(debt, def, BALANCE);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.canAfford).toBe(false);
  });

  it('mengembalikan max_level saat sudah level maksimum', () => {
    const state = save();
    const maxed = {
      ...state,
      accounts: [{ ...state.accounts[0]!, automationLevel: def.maxLevel }],
    };
    const result = evaluatePurchase(maxed, def, BALANCE);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe('max_level');
  });

  it('biaya level berikutnya naik setelah level bertambah', () => {
    const state = save();
    const first = evaluatePurchase(state, def, BALANCE);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const upgraded = {
      ...state,
      accounts: [{ ...state.accounts[0]!, automationLevel: 1 }],
    };
    const second = evaluatePurchase(upgraded, def, BALANCE);
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    expect(second.value.cost).toBeGreaterThan(first.value.cost);
  });

  it('tidak memutasi save', () => {
    const state = save();
    const before = JSON.stringify(state);
    evaluatePurchase(state, def, BALANCE);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('gagal bila akun tidak ada', () => {
    const state = save();
    const result = evaluatePurchase({ ...state, accounts: [] }, def, BALANCE);
    expect(result.ok).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { applyDelta, canAfford } from './balance';

const NOW = 1_700_000_000_000;

function baseSave() {
  return createInitialSave(BALANCE, NOW);
}

describe('applyDelta', () => {
  it('menambah saldo', () => {
    const result = applyDelta(baseSave(), 250);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.save.player.money).toBe(750);
    expect(result.value.change.isDebt).toBe(false);
  });

  it('mengurangi saldo', () => {
    const result = applyDelta(baseSave(), -200);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.save.player.money).toBe(300);
  });

  it('mengizinkan saldo negatif (utang) sesuai keputusan D-05', () => {
    const result = applyDelta(baseSave(), -800);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.save.player.money).toBe(-300);
    expect(result.value.change.isDebt).toBe(true);
  });

  it('menolak saldo negatif bila allowNegative false', () => {
    const result = applyDelta(baseSave(), -800, { allowNegative: false });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe('insufficient_funds');
  });

  it('menolak delta non-finite tanpa merusak state', () => {
    const result = applyDelta(baseSave(), Number.NaN);
    expect(result.ok).toBe(false);
  });

  it('tidak memutasi save asli', () => {
    const save = baseSave();
    applyDelta(save, 500);
    expect(save.player.money).toBe(500);
  });

  it('membulatkan delta pecahan', () => {
    const result = applyDelta(baseSave(), 10.6);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.save.player.money).toBe(511);
  });

  it('saldo selalu integer', () => {
    const result = applyDelta(baseSave(), 0.4);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Number.isInteger(result.value.save.player.money)).toBe(true);
  });
});

describe('canAfford', () => {
  it('true bila saldo cukup', () => {
    expect(canAfford(baseSave(), 100)).toBe(true);
    expect(canAfford(baseSave(), 500)).toBe(true);
  });

  it('false bila saldo kurang', () => {
    expect(canAfford(baseSave(), 501)).toBe(false);
  });

  it('false saat saldo negatif (utang)', () => {
    const result = applyDelta(baseSave(), -700);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(canAfford(result.value.save, 10)).toBe(false);
  });

  it('false untuk biaya negatif atau non-finite', () => {
    expect(canAfford(baseSave(), -10)).toBe(false);
    expect(canAfford(baseSave(), Number.NaN)).toBe(false);
  });
});

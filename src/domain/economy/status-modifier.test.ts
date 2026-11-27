import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { isIncomeBlocked, isRestricted, statusModifier } from './status-modifier';

const modifiers = BALANCE.statusModifiers;

describe('statusModifier', () => {
  it('normal bernilai 1', () => {
    expect(statusModifier('normal', modifiers)).toBe(1);
  });

  it('menurun berurutan untuk status yang lebih buruk', () => {
    const normal = statusModifier('normal', modifiers);
    const warning = statusModifier('warning', modifiers);
    const restricted = statusModifier('restricted', modifiers);
    const suspended = statusModifier('suspended', modifiers);

    expect(warning).toBeLessThan(normal);
    expect(restricted).toBeLessThan(warning);
    expect(suspended).toBeLessThan(restricted);
  });

  it('suspended bernilai 0', () => {
    expect(statusModifier('suspended', modifiers)).toBe(0);
  });

  it('mengembalikan 0 untuk nilai tidak valid', () => {
    expect(statusModifier('normal', { normal: Number.NaN } as never)).toBe(0);
    expect(statusModifier('normal', { normal: -1 } as never)).toBe(0);
  });
});

describe('isIncomeBlocked', () => {
  it('true hanya untuk status dengan modifier 0', () => {
    expect(isIncomeBlocked('normal', modifiers)).toBe(false);
    expect(isIncomeBlocked('warning', modifiers)).toBe(false);
    expect(isIncomeBlocked('restricted', modifiers)).toBe(false);
    expect(isIncomeBlocked('suspended', modifiers)).toBe(true);
  });
});

describe('isRestricted', () => {
  it('true untuk restricted dan suspended', () => {
    expect(isRestricted('normal')).toBe(false);
    expect(isRestricted('warning')).toBe(false);
    expect(isRestricted('restricted')).toBe(true);
    expect(isRestricted('suspended')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { createId, isIdOf, resetIdCounter } from './ids';
import { createFakeClock } from './clock';
import {
  assertFiniteAmount,
  clampDisplay,
  formatMoney,
  formatMoneyCompact,
  formatRate,
  isDebt,
  toWholeAmount,
} from './money';
import { err, isErr, isOk, ok, okVoid, unwrap } from './result';

describe('ids', () => {
  it('memakai prefix sesuai jenis entity', () => {
    resetIdCounter();
    expect(isIdOf(createId('transaction', 1000), 'transaction')).toBe(true);
    expect(isIdOf(createId('account', 1000), 'account')).toBe(true);
  });

  it('menghasilkan id berbeda untuk pemanggilan berurutan pada waktu sama', () => {
    resetIdCounter();
    const first = createId('session', 5000);
    const second = createId('session', 5000);
    expect(first).not.toBe(second);
  });
});

describe('clock', () => {
  it('fake clock bisa dimajukan manual', () => {
    const clock = createFakeClock(1000);
    expect(clock.now()).toBe(1000);
    clock.advance(500);
    expect(clock.now()).toBe(1500);
    clock.set(0);
    expect(clock.now()).toBe(0);
  });
});

describe('money', () => {
  it('menolak nilai non-finite', () => {
    expect(() => assertFiniteAmount(Number.NaN)).toThrow();
    expect(() => assertFiniteAmount(Number.POSITIVE_INFINITY)).toThrow();
    expect(assertFiniteAmount(1234.5)).toBe(1234.5);
  });

  it('membulatkan ke integer', () => {
    expect(toWholeAmount(10.4)).toBe(10);
    expect(toWholeAmount(10.6)).toBe(11);
  });

  it('memformat rupiah dengan pemisah ribuan', () => {
    expect(formatMoney(1500)).toMatch(/Rp\s?1\.500/);
    expect(formatMoney(0)).toMatch(/Rp\s?0/);
  });

  it('mempertahankan tanda minus pada saldo negatif (utang)', () => {
    expect(formatMoney(-2500)).toContain('-');
    expect(formatMoney(-2500)).toMatch(/2\.500/);
    expect(isDebt(-1)).toBe(true);
    expect(isDebt(0)).toBe(false);
  });

  it('format compact untuk angka besar', () => {
    expect(formatMoneyCompact(1_200_000)).toMatch(/1,2/);
  });

  it('format rate per detik dengan tanda arah', () => {
    expect(formatRate(0)).toBe('Rp 0/detik');
    expect(formatRate(2.5)).toContain('+');
    expect(formatRate(2.5)).toContain('/detik');
    // Locale id-ID memakai koma sebagai pemisah desimal.
    expect(formatRate(0.42)).toContain('0,42');
  });

  it('clampDisplay tidak pernah menghasilkan NaN', () => {
    expect(clampDisplay(Number.NaN, 0, 100)).toBe(0);
    expect(clampDisplay(150, 0, 100)).toBe(100);
    expect(clampDisplay(-20, 0, 100)).toBe(0);
  });
});

describe('result', () => {
  it('membungkus nilai sukses', () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    expect(unwrap(result)).toBe(42);
  });

  it('membungkus void sukses', () => {
    const result = okVoid();
    expect(isOk(result)).toBe(true);
    expect(result.value).toBeUndefined();
  });

  it('membawa kode dan messageKey pada error', () => {
    const result = err('insufficient_funds', 'error.insufficient_funds');
    expect(isErr(result)).toBe(true);
    if (!result.ok) {
      expect(result.code).toBe('insufficient_funds');
      expect(result.messageKey).toBe('error.insufficient_funds');
    }
  });

  it('unwrap melempar pada error', () => {
    expect(() => unwrap(err('unknown', 'error.unknown'))).toThrow();
  });
});

describe('formatDecimal', () => {
  it('memakai koma sebagai pemisah desimal (locale id-ID)', async () => {
    const { formatDecimal } = await import('./money');
    expect(formatDecimal(0.75)).toBe('0,75');
    expect(formatDecimal(1.5, 1)).toBe('1,5');
  });

  it('aman untuk nilai non-finite', async () => {
    const { formatDecimal } = await import('./money');
    expect(formatDecimal(Number.NaN)).toBe('0,00');
  });
});

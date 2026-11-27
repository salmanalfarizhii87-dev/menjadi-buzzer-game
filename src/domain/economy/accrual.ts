/**
 * Accrual income berbasis elapsed time. Bukan frame count, bukan tick count.
 *
 * `fractionalIncome` menyimpan sisa pecahan agar income sangat kecil tidak
 * hilang saat refresh (PRD EC-13).
 */

import { assertFiniteAmount } from '@/core/money';

export interface AccrualResult {
  /** Rupiah bulat yang bisa langsung dikreditkan. */
  wholeAmount: number;
  /** Sisa pecahan yang dibawa ke accrual berikutnya. */
  fractionalRemainder: number;
  /** Delta waktu yang benar-benar dipakai (setelah clamp). */
  elapsedMsApplied: number;
  /** True jika delta dipotong karena melebihi batas. */
  clamped: boolean;
}

export function calculateAccruedIncome(
  ratePerSecond: number,
  elapsedMs: number,
  fractionalRemainder: number,
  maxDeltaMs: number,
): AccrualResult {
  assertFiniteAmount(ratePerSecond, 'ratePerSecond');
  assertFiniteAmount(elapsedMs, 'elapsedMs');
  assertFiniteAmount(fractionalRemainder, 'fractionalRemainder');

  if (ratePerSecond <= 0) {
    return {
      wholeAmount: 0,
      fractionalRemainder: Number.isFinite(fractionalRemainder) ? fractionalRemainder : 0,
      elapsedMsApplied: 0,
      clamped: false,
    };
  }

  if (elapsedMs <= 0) {
    return { wholeAmount: 0, fractionalRemainder, elapsedMsApplied: 0, clamped: false };
  }

  const clamped = elapsedMs > maxDeltaMs;
  const appliedMs = clamped ? maxDeltaMs : elapsedMs;

  const earned = ratePerSecond * (appliedMs / 1000) + fractionalRemainder;
  const wholeAmount = Math.floor(earned);
  const fractional = earned - wholeAmount;

  return {
    wholeAmount: Number.isFinite(wholeAmount) ? wholeAmount : 0,
    fractionalRemainder: Number.isFinite(fractional) ? fractional : 0,
    elapsedMsApplied: appliedMs,
    clamped,
  };
}

/**
 * Utilitas uang. Saldo disimpan sebagai integer (satuan terkecil = 1 rupiah).
 *
 * PENTING: saldo boleh negatif (keputusan D-05, utang in-game). Tidak ada clamp
 * saldo ke 0. Clamp hanya dipakai untuk nilai tampilan seperti progress bar.
 */

const idFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
});

const idFormatterDecimal = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const idFormatterCompact = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Pastikan nilai adalah angka berhingga. Melempar error untuk NaN/Infinity. */
export function assertFiniteAmount(value: number, label = 'amount'): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Nilai ${label} tidak valid: ${value}`);
  }
  return value;
}

/** Bulatkan ke integer terdekat dengan guard finite. */
export function toWholeAmount(value: number): number {
  return Math.round(assertFiniteAmount(value));
}

/** Format saldo untuk tampilan. Nilai negatif diberi tanda minus eksplisit. */
export function formatMoney(value: number): string {
  const safe = assertFiniteAmount(value);
  const rounded = Math.round(safe);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}Rp ${idFormatter.format(Math.abs(rounded))}`;
}

/** Format ringkas untuk angka besar (1,2 jt). */
export function formatMoneyCompact(value: number): string {
  const safe = assertFiniteAmount(value);
  const sign = safe < 0 ? '-' : '';
  return `${sign}Rp ${idFormatterCompact.format(Math.abs(safe))}`;
}

/** Format angka desimal sederhana sesuai locale Indonesia (koma). */
export function formatDecimal(value: number, digits = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(safe);
}

/** Format rate per detik. */
export function formatRate(perSecond: number): string {
  const safe = assertFiniteAmount(perSecond);
  if (safe === 0) return 'Rp 0/detik';
  const sign = safe < 0 ? '-' : '+';
  const abs = Math.abs(safe);
  const display =
    abs < 1 ? idFormatterDecimal.format(abs) : idFormatter.format(abs);
  return `${sign}Rp ${display}/detik`;
}

export function isDebt(balance: number): boolean {
  return assertFiniteAmount(balance) < 0;
}

/** Clamp untuk nilai tampilan saja (mis. progress bar), bukan untuk saldo. */
export function clampDisplay(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

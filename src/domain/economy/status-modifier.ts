/**
 * Modifier income berdasarkan status akun. Dipisah agar perubahan aturan status
 * tidak menyentuh formula income inti.
 */

import type { AccountStatus } from '@/state/types';

export type StatusModifierMap = Record<AccountStatus, number>;

export function statusModifier(status: AccountStatus, modifiers: StatusModifierMap): number {
  const value = modifiers[status];
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

/** True bila status menghentikan income sepenuhnya. */
export function isIncomeBlocked(status: AccountStatus, modifiers: StatusModifierMap): boolean {
  return statusModifier(status, modifiers) === 0;
}

/** Status yang membatasi pembelian upgrade / kampanye berisiko. */
export function isRestricted(status: AccountStatus): boolean {
  return status === 'restricted' || status === 'suspended';
}

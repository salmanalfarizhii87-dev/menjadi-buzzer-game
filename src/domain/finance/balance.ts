/**
 * Mutasi saldo. Saldo BOLEH negatif (keputusan D-05: utang in-game).
 * Tidak ada clamp ke 0. Guard hanya untuk nilai non-finite.
 */

import { assertFiniteAmount, toWholeAmount } from '@/core/money';
import { err, ok, type ActionResult } from '@/core/result';
import type { GameSave } from '@/state/types';

export interface BalanceChange {
  money: number;
  isDebt: boolean;
  delta: number;
}

export interface ApplyDeltaOptions {
  /** Bila false dan hasilnya negatif, operasi ditolak. */
  allowNegative?: boolean;
}

/**
 * Terapkan delta ke saldo. Mengembalikan save baru, tidak memutasi input.
 */
export function applyDelta(
  save: GameSave,
  delta: number,
  options: ApplyDeltaOptions = {},
): ActionResult<{ save: GameSave; change: BalanceChange }> {
  const allowNegative = options.allowNegative ?? true;

  if (!Number.isFinite(delta)) {
    return err('invalid_amount', 'error.invalid_amount', `delta=${delta}`);
  }

  const current = assertFiniteAmount(save.player.money, 'money');
  const next = toWholeAmount(current + toWholeAmount(delta));

  if (!Number.isFinite(next)) {
    return err('invalid_amount', 'error.invalid_amount', 'hasil saldo tidak berhingga');
  }

  if (next < 0 && !allowNegative) {
    return err('insufficient_funds', 'error.insufficient_funds', `saldo=${current}, delta=${delta}`);
  }

  const change: BalanceChange = {
    money: next,
    isDebt: next < 0,
    delta: next - toWholeAmount(current),
  };

  return ok({
    save: {
      ...save,
      player: { ...save.player, money: next },
    },
    change,
  });
}

/** Cek apakah saldo cukup untuk sebuah biaya (tanpa memutasi). */
export function canAfford(save: GameSave, cost: number): boolean {
  if (!Number.isFinite(cost) || cost < 0) return false;
  return save.player.money >= cost;
}

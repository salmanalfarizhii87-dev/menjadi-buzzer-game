/**
 * Aksi pemulihan akun: bayar biaya untuk menurunkan suspicion.
 * Pure — validasi tanpa mutasi.
 */

import { err, ok, type ActionResult } from '@/core/result';
import type { BalanceConfig } from '@/data/config/balance';
import type { GameSave } from '@/state/types';
import { selectDisplayBalance, selectPrimaryAccount } from '@/state/selectors';

export interface RecoveryEvaluation {
  cost: number;
  suspicionBefore: number;
  suspicionAfter: number;
  reduction: number;
  canAfford: boolean;
  /** False bila suspicion sudah 0 (tidak ada yang perlu dipulihkan). */
  needed: boolean;
}

export function evaluateRecovery(
  save: GameSave,
  config: BalanceConfig,
): ActionResult<RecoveryEvaluation> {
  const account = selectPrimaryAccount(save);
  if (!account) return err('unknown', 'error.unknown', 'akun utama tidak ditemukan');

  const cost = config.recovery.cost;
  const balance = selectDisplayBalance(save);

  if (!Number.isFinite(cost) || cost < 0) {
    return err('invalid_amount', 'error.invalid_amount', `biaya pemulihan tidak valid: ${cost}`);
  }

  const before = Math.max(0, account.suspicion);
  const after = Math.max(0, before - config.recovery.suspicionReduction);

  return ok({
    cost,
    suspicionBefore: before,
    suspicionAfter: after,
    reduction: before - after,
    canAfford: balance >= cost,
    needed: before > 0,
  });
}

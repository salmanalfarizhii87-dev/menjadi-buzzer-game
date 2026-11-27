/**
 * Evaluasi pembelian upgrade. Pure: tidak memutasi save, tidak menyentuh UI.
 * Menghasilkan seluruh nilai yang dibutuhkan UI (harga, level, rate sebelum &
 * sesudah) sekaligus, agar preview dan eksekusi memakai sumber yang sama.
 */

import { err, ok, type ActionResult } from '@/core/result';
import { calculateIncomeRate } from '@/domain/economy/income';
import { costForNextLevel, isMaxLevel } from './cost';
import type { UpgradeDefinition } from '@/data/upgrades/automation';
import type { BalanceConfig } from '@/data/config/balance';
import type { AccountState, GameSave } from '@/state/types';
import { selectDisplayBalance, selectPrimaryAccount } from '@/state/selectors';

export interface PurchaseEvaluation {
  upgradeId: string;
  cost: number;
  currentLevel: number;
  nextLevel: number;
  maxLevel: number;
  rateBefore: number;
  rateAfter: number;
  rateGain: number;
  balance: number;
  canAfford: boolean;
  isMax: boolean;
}

function incomeConfigFrom(config: BalanceConfig, def: UpgradeDefinition) {
  return {
    income: config.income,
    statusModifiers: config.statusModifiers,
    automationMultiplierPerLevel: def.incomeMultiplierPerLevel,
  };
}

/** Rate income untuk akun tertentu pada level automation tertentu. */
export function rateAtLevel(
  account: AccountState,
  def: UpgradeDefinition,
  config: BalanceConfig,
  level: number,
): number {
  return calculateIncomeRate(
    {
      followers: account.followers,
      performance: account.performance,
      automationLevel: level,
      status: account.status,
    },
    incomeConfigFrom(config, def),
  );
}

export function evaluatePurchase(
  save: GameSave,
  def: UpgradeDefinition,
  config: BalanceConfig,
): ActionResult<PurchaseEvaluation> {
  const account = selectPrimaryAccount(save);
  if (!account) {
    return err('unknown', 'error.unknown', 'akun utama tidak ditemukan');
  }

  const currentLevel = account.automationLevel;
  const isMax = isMaxLevel(def, currentLevel);

  if (isMax) {
    return err('max_level', 'error.max_level', `level ${currentLevel} sudah maksimum`);
  }

  const cost = costForNextLevel(def, currentLevel);
  // Saldo efektif = saldo terkredit + income pending (belum di-flush).
  const balance = selectDisplayBalance(save);

  if (!Number.isFinite(cost) || cost <= 0) {
    return err('invalid_amount', 'error.invalid_amount', `biaya tidak valid: ${cost}`);
  }

  // Saldo negatif (utang) otomatis gagal karena syaratnya money >= cost.
  const canAfford = balance >= cost;

  const rateBefore = rateAtLevel(account, def, config, currentLevel);
  const rateAfter = rateAtLevel(account, def, config, currentLevel + 1);

  return ok({
    upgradeId: def.id,
    cost,
    currentLevel,
    nextLevel: currentLevel + 1,
    maxLevel: def.maxLevel,
    rateBefore,
    rateAfter,
    rateGain: rateAfter - rateBefore,
    balance,
    canAfford,
    isMax,
  });
}

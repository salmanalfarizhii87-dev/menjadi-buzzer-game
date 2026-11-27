/**
 * Use case: beli upgrade automation.
 *
 * Atomik + idempotent:
 * 1. guard in-flight per upgrade (cegah double-click memproses dua kali)
 * 2. flush income pending lebih dulu agar saldo terkredit mencerminkan kondisi nyata
 * 3. evaluasi ulang terhadap state TERBARU (bukan snapshot tombol)
 * 4. potong saldo + naikkan level + tulis transaksi pada salinan state
 * 5. commit sekali, persist segera
 */

import { err, ok, type ActionResult } from '@/core/result';
import { applyDelta } from '@/domain/finance/balance';
import { appendTransaction, descriptionKeyFor } from '@/domain/finance/ledger';
import { evaluatePurchase, type PurchaseEvaluation } from '@/domain/upgrades/purchase';
import { AUTOMATION_UPGRADE_ID, getAutomationDefinition } from '@/data/upgrades/automation';
import type { BalanceConfig } from '@/data/config/balance';
import type { GameStore } from '@/state/game-store';
import type { SaveRepository } from '@/persistence/save-repository';
import type { Clock } from '@/core/clock';
import type { GameSave } from '@/state/types';
import { selectPrimaryAccount } from '@/state/selectors';
import { flushPendingIncome } from '@/application/income/accrue-income';

export interface PurchaseResult {
  evaluation: PurchaseEvaluation;
  newLevel: number;
  newBalance: number;
}

export interface PurchaseUpgradeDeps {
  store: GameStore;
  config: BalanceConfig;
  repository: SaveRepository;
  clock: Clock;
  /** Set bersama untuk seluruh pemanggil; dipakai sebagai guard in-flight. */
  inFlight?: Set<string>;
}

export function createUpgradePurchaser(deps: PurchaseUpgradeDeps) {
  const inFlight = deps.inFlight ?? new Set<string>();

  return function purchaseAutomation(): ActionResult<PurchaseResult> {
    const { store, config, repository, clock } = deps;

    if (inFlight.has(AUTOMATION_UPGRADE_ID)) {
      return err('invalid_transition', 'error.invalid_transition', 'pembelian sedang diproses');
    }

    const def = getAutomationDefinition(config);
    if (!def) {
      return err('unknown', 'error.unknown', 'definisi upgrade tidak ditemukan');
    }

    inFlight.add(AUTOMATION_UPGRADE_ID);

    try {
      // Flush income pending agar saldo terkredit akurat sebelum validasi.
      const flushed = flushPendingIncome(deps);
      if (!flushed.ok) return flushed;

      const state = store.getState();
      const evaluation = evaluatePurchase(state, def, config);
      if (!evaluation.ok) return evaluation;

      const value = evaluation.value;

      if (value.isMax) return err('max_level', 'error.max_level');
      if (!value.canAfford) {
        return err('insufficient_funds', 'error.insufficient_funds', `butuh ${value.cost}`);
      }

      const account = selectPrimaryAccount(state);
      if (!account) return err('unknown', 'error.unknown', 'akun utama tidak ditemukan');

      // 1. Potong saldo.
      const applied = applyDelta(state, -value.cost, { allowNegative: false });
      if (!applied.ok) return applied;

      let next: GameSave = applied.value.save;

      // 2. Naikkan level automation pada akun.
      next = {
        ...next,
        accounts: next.accounts.map((entry) =>
          entry.id === account.id
            ? { ...entry, automationLevel: entry.automationLevel + 1 }
            : entry,
        ),
      };

      // 3. Catat transaksi (balanceAfter diambil dari saldo yang sudah dipotong).
      const now = clock.now();
      next = appendTransaction(next, {
        type: 'upgrade_purchase',
        amount: -value.cost,
        sourceId: def.id,
        descriptionKey: descriptionKeyFor('upgrade_purchase'),
        createdAt: now,
      });

      next = { ...next, meta: { ...next.meta, updatedAt: now } };

      // 4. Commit + persist segera.
      store.setState(next);
      repository.saveNow(next);

      const updatedAccount = selectPrimaryAccount(next);
      return ok({
        evaluation: value,
        newLevel: updatedAccount?.automationLevel ?? value.nextLevel,
        newBalance: next.player.money,
      });
    } finally {
      inFlight.delete(AUTOMATION_UPGRADE_ID);
    }
  };
}

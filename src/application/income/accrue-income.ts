/**
 * Use case: akumulasi income.
 *
 * DESAIN PENTING (perbaikan integritas ledger):
 * Income TIDAK dikreditkan ke `player.money` pada setiap tick. Income
 * diakumulasi di `activeTime.pendingIncome`, lalu dikreditkan + dicatat sebagai
 * transaksi secara bersamaan saat flush (tiap window 30 detik, saat aksi
 * ekonomi, dan saat halaman ditutup).
 *
 * Alasan: kalau saldo dikreditkan per tick tetapi transaksi ditulis belakangan,
 * `balanceAfter` pada ledger tidak bisa direkonsiliasi — jumlah transaksi tidak
 * akan pernah cocok dengan saldo. Dengan kredit-saat-flush, setiap baris ledger
 * konsisten dan total transaksi == perubahan saldo.
 *
 * UI tetap terasa real-time karena saldo yang ditampilkan = money + pendingIncome
 * (`selectDisplayBalance`).
 */

import type { BalanceConfig } from '@/data/config/balance';
import { calculateAccruedIncome } from '@/domain/economy/accrual';
import { applyDelta } from '@/domain/finance/balance';
import { appendTransaction, descriptionKeyFor } from '@/domain/finance/ledger';
import { err, ok, type ActionResult } from '@/core/result';
import type { GameStore } from '@/state/game-store';
import type { SaveRepository } from '@/persistence/save-repository';
import type { Clock } from '@/core/clock';
import { selectIncomeRate, selectPrimaryAccount } from '@/state/selectors';
import type { GameSave } from '@/state/types';

export interface AccrualOutcome {
  /** Rupiah yang ditambahkan ke pendingIncome pada tick ini. */
  accrued: number;
  ratePerSecond: number;
  /** True bila delta waktu dipotong karena melebihi batas. */
  clamped: boolean;
  /** True bila pending dikreditkan ke saldo pada tick ini. */
  flushed: boolean;
  /** Rupiah yang benar-benar masuk ke saldo pada tick ini. */
  credited: number;
}

export interface IncomeDeps {
  store: GameStore;
  config: BalanceConfig;
  repository: SaveRepository;
  clock: Clock;
}

/** Akumulasi income ke pending. Tidak menyentuh saldo. */
export function accrueIncome(deps: IncomeDeps): ActionResult<AccrualOutcome> {
  const { store, config, repository, clock } = deps;

  const state = store.getState();
  const now = clock.now();
  const rate = selectIncomeRate(state, config);
  const elapsedMs = now - state.activeTime.lastAccrualAt;

  if (!Number.isFinite(elapsedMs)) {
    return err('invalid_amount', 'error.invalid_amount', 'elapsed tidak valid');
  }

  if (elapsedMs <= 0) {
    return ok({
      accrued: 0,
      ratePerSecond: rate,
      clamped: false,
      flushed: false,
      credited: 0,
    });
  }

  const accrual = calculateAccruedIncome(
    rate,
    elapsedMs,
    state.activeTime.fractionalIncome,
    config.income.maxAccrualDeltaMs,
  );

  const pendingIncome = state.activeTime.pendingIncome + accrual.wholeAmount;
  const pendingSince = state.activeTime.pendingIncomeSince ?? now;

  let next: GameSave = {
    ...state,
    activeTime: {
      ...state.activeTime,
      lastAccrualAt: now,
      fractionalIncome: accrual.fractionalRemainder,
      pendingIncome,
      pendingIncomeSince: pendingSince,
    },
    meta: { ...state.meta, updatedAt: now },
  };

  // Flush bila window agregasi terlewati (keputusan D-08).
  let flushed = false;
  let credited = 0;

  if (pendingIncome > 0 && now - pendingSince >= config.incomeAggregationWindowMs) {
    const flushedResult = creditPending(next, { config, clock, now });
    if (!flushedResult.ok) return flushedResult;
    next = flushedResult.value;
    flushed = true;
    credited = pendingIncome;
  }

  store.setState(next);
  repository.saveDebounced(next);

  return ok({
    accrued: accrual.wholeAmount,
    ratePerSecond: rate,
    clamped: accrual.clamped,
    flushed,
    credited,
  });
}

/**
 * Kreditkan `pendingIncome` ke saldo dan catat satu transaksi agregat.
 * Pure terhadap input: mengembalikan save baru.
 */
function creditPending(
  state: GameSave,
  opts: { config: BalanceConfig; clock: Clock; now: number },
): ActionResult<GameSave> {
  const amount = state.activeTime.pendingIncome;
  if (amount <= 0) return ok(state);

  const applied = applyDelta(state, amount, { allowNegative: true });
  if (!applied.ok) return applied;

  let next = applied.value.save;

  next = appendTransaction(next, {
    type: 'passive_income',
    amount,
    sourceId: selectPrimaryAccount(next)?.id ?? null,
    descriptionKey: descriptionKeyFor('passive_income'),
    createdAt: opts.now,
  });

  next = {
    ...next,
    activeTime: { ...next.activeTime, pendingIncome: 0, pendingIncomeSince: null },
    meta: { ...next.meta, updatedAt: opts.now },
  };

  return ok(next);
}

/**
 * Flush pending income menjadi saldo + transaksi.
 * Dipanggil sebelum aksi ekonomi lain, saat halaman ditutup, dan saat bootstrap.
 */
export function flushPendingIncome(deps: IncomeDeps): ActionResult<void> {
  const { store, repository, clock, config } = deps;
  const state = store.getState();

  if (state.activeTime.pendingIncome <= 0) return ok(undefined);

  const result = creditPending(state, { config, clock, now: clock.now() });
  if (!result.ok) return result;

  store.setState(result.value);
  repository.saveDebounced(result.value);
  return ok(undefined);
}

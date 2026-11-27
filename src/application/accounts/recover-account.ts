/**
 * Use case: pemulihan akun. Membayar biaya untuk menurunkan suspicion,
 * lalu mengevaluasi ulang tier (bisa turun).
 *
 * Atomik + idempoten terhadap double-click lewat guard in-flight.
 */

import { err, ok, type ActionResult } from '@/core/result';
import { applyDelta } from '@/domain/finance/balance';
import { appendTransaction, descriptionKeyFor } from '@/domain/finance/ledger';
import { evaluateRecovery, type RecoveryEvaluation } from '@/domain/risk/recovery';
import { evaluateTier, type TierChange } from '@/application/risk/evaluate-tier';
import { selectPrimaryAccount } from '@/state/selectors';
import type { BalanceConfig } from '@/data/config/balance';
import type { GameStore } from '@/state/game-store';
import type { SaveRepository } from '@/persistence/save-repository';
import type { Clock } from '@/core/clock';
import type { GameSave } from '@/state/types';

export interface RecoveryOutcome {
  evaluation: RecoveryEvaluation;
  tierChange: TierChange;
  balanceAfter: number;
  suspicionAfter: number;
}

export interface RecoverAccountDeps {
  store: GameStore;
  config: BalanceConfig;
  repository: SaveRepository;
  clock: Clock;
  inFlight?: Set<string>;
}

export function recoverAccount(deps: RecoverAccountDeps): ActionResult<RecoveryOutcome> {
  const { store, config, repository, clock } = deps;
  const inFlight = deps.inFlight ?? new Set<string>();
  const guard = 'recover-account';

  if (inFlight.has(guard)) {
    return err('invalid_transition', 'error.invalid_transition', 'pemulihan sedang diproses');
  }

  inFlight.add(guard);

  try {
    const now = clock.now();
    const state = store.getState();

    const evaluation = evaluateRecovery(state, config);
    if (!evaluation.ok) return evaluation;

    const value = evaluation.value;

    if (!value.needed) {
      return err('invalid_transition', 'error.invalid_transition', 'suspicion sudah 0');
    }

    if (!value.canAfford) {
      return err('insufficient_funds', 'error.insufficient_funds', `butuh ${value.cost}`);
    }

    const account = selectPrimaryAccount(state);
    if (!account) return err('unknown', 'error.unknown', 'akun utama tidak ditemukan');

    const applied = applyDelta(state, -value.cost, { allowNegative: false });
    if (!applied.ok) return applied;

    let next: GameSave = applied.value.save;

    next = {
      ...next,
      accounts: next.accounts.map((entry) =>
        entry.id === account.id ? { ...entry, suspicion: value.suspicionAfter } : entry,
      ),
    };

    next = appendTransaction(next, {
      type: 'recovery_cost',
      amount: -value.cost,
      sourceId: account.id,
      descriptionKey: descriptionKeyFor('recovery_cost'),
      createdAt: now,
    });

    next = { ...next, meta: { ...next.meta, updatedAt: now } };

    const tierResult = evaluateTier(next, { config, now, sourceId: account.id });
    next = tierResult.save;

    store.setState(next);
    repository.saveNow(next);

    return ok({
      evaluation: value,
      tierChange: tierResult.change,
      balanceAfter: next.player.money,
      suspicionAfter: selectPrimaryAccount(next)?.suspicion ?? value.suspicionAfter,
    });
  } finally {
    inFlight.delete(guard);
  }
}

/**
 * Use case: resolusi kampanye.
 *
 * Idempoten: session `resolved` mengembalikan snapshot lama tanpa transaksi
 * baru. Roll dibuat sekali di sini, lalu disimpan di snapshot.
 */

import { err, ok, type ActionResult } from '@/core/result';
import { applyDelta } from '@/domain/finance/balance';
import { appendTransaction, descriptionKeyFor } from '@/domain/finance/ledger';
import { resolveCampaign as resolveDomain } from '@/domain/campaigns/resolve';
import { cryptoRandom } from '@/domain/risk/random';
import { evaluateTier, type TierChange } from '@/application/risk/evaluate-tier';
import { selectPrimaryAccount } from '@/state/selectors';
import type { CampaignDefinition } from '@/domain/campaigns/definition';
import type {
  AccountState,
  CampaignResultSnapshot,
  CampaignSession,
  GameSave,
  TransactionType,
} from '@/state/types';
import type { CampaignUseCaseDeps } from './accept-campaign';

export interface ResolveCampaignDeps extends CampaignUseCaseDeps {
  random?: () => number;
}

export interface ResolveCampaignOutcome {
  snapshot: CampaignResultSnapshot;
  tierChange: TierChange | null;
  alreadyResolved: boolean;
  balanceAfter: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveCampaign(
  deps: ResolveCampaignDeps,
  definitions: readonly CampaignDefinition[],
  sessionId: string,
): ActionResult<ResolveCampaignOutcome> {
  const { store, config, repository, clock } = deps;
  const inFlight = deps.inFlight ?? new Set<string>();
  const guardKey = `resolve-campaign:${sessionId}`;

  if (inFlight.has(guardKey)) {
    return err('invalid_transition', 'error.invalid_transition', 'resolusi sedang diproses');
  }
  inFlight.add(guardKey);

  try {
    const save = store.getState();
    const session = save.campaignSessions.find((entry) => entry.id === sessionId);
    if (!session) return err('campaign_not_found', 'error.campaign_not_found');

    if (session.status === 'resolved' && session.result) {
      return ok({
        snapshot: session.result,
        tierChange: null,
        alreadyResolved: true,
        balanceAfter: save.player.money,
      });
    }

    if (session.status !== 'strategy_selected' && session.status !== 'activity_completed') {
      return err('invalid_transition', 'error.invalid_transition', `status ${session.status}`);
    }

    if (!session.selectedStrategyId || !session.selectedIntensity || !session.selectedRiskPosture) {
      return err('strategy_missing', 'error.strategy_missing');
    }

    if (session.miniGameId !== null && session.miniGameScore === null) {
      return err('invalid_transition', 'error.invalid_transition', 'mini-game belum selesai');
    }

    const definition = definitions.find((entry) => entry.id === session.campaignDefinitionId);
    if (!definition) return err('campaign_not_found', 'error.campaign_not_found');

    const account = selectPrimaryAccount(save);
    if (!account) return err('unknown', 'error.unknown', 'akun utama tidak ditemukan');

    const roll = (deps.random ?? cryptoRandom)();
    if (!Number.isFinite(roll) || roll < 0 || roll > 1) {
      return err('invalid_amount', 'error.invalid_amount', `roll ${roll}`);
    }

    const resolution = resolveDomain({ definition, account, session, config, roll });
    const now = clock.now();

    // 1. Terapkan uang + transaksi terpisah.
    let next: GameSave = save;
    const record = (amount: number, type: TransactionType): ActionResult<void> => {
      if (amount === 0) return ok(undefined);
      const applied = applyDelta(next, amount, { allowNegative: true });
      if (!applied.ok) return err(applied.code, applied.messageKey, applied.detail);
      next = applied.value.save;
      next = appendTransaction(next, {
        type,
        amount,
        sourceId: session.id,
        descriptionKey: descriptionKeyFor(type),
        createdAt: now,
      });
      return ok(undefined);
    };

    for (const entry of [
      { amount: resolution.payment, type: 'campaign_payment' as const },
      { amount: resolution.bonus, type: 'campaign_bonus' as const },
      { amount: -resolution.fine, type: 'campaign_fine' as const },
    ]) {
      const applied = record(entry.amount, entry.type);
      if (!applied.ok) return applied;
    }

    // 2. Terapkan perubahan akun dengan clamp.
    const before = account;
    const accountAfter: AccountState = {
      ...account,
      followers: Math.max(0, Math.round(account.followers + resolution.followersDelta)),
      performance: clamp(account.performance + resolution.performanceDelta, 0, 100),
      reputation: clamp(
        account.reputation + resolution.reputationDelta,
        config.penalty.reputationMin,
        config.penalty.reputationMax,
      ),
      suspicion: clamp(
        account.suspicion + resolution.suspicionDelta,
        0,
        config.penalty.suspicionMax,
      ),
      status: resolution.statusAfter,
    };

    next = {
      ...next,
      accounts: next.accounts.map((entry) =>
        entry.id === account.id ? accountAfter : entry,
      ),
    };

    // 3. Evaluasi tier setelah suspicion berubah (mungkin memicu denda/shadowban).
    const tierResult = evaluateTier(next, { config, now, sourceId: session.id });
    next = tierResult.save;

    // 4. Snapshot sekali; delta memakai nilai aktual setelah clamp.
    const snapshot: CampaignResultSnapshot = {
      roll: resolution.roll,
      successProbability: resolution.successProbability,
      performanceScore: resolution.performanceScore,
      outcome: resolution.outcome,
      reward: resolution.payment,
      bonus: resolution.bonus,
      fine: resolution.fine,
      reputationDelta: accountAfter.reputation - before.reputation,
      suspicionDelta: accountAfter.suspicion - before.suspicion,
      followersDelta: accountAfter.followers - before.followers,
      performanceDelta: accountAfter.performance - before.performance,
      statusBefore: resolution.statusBefore,
      statusAfter: resolution.statusAfter,
      strategyId: session.selectedStrategyId,
      intensity: session.selectedIntensity,
      riskPosture: session.selectedRiskPosture,
      usedMiniGame: session.miniGameId !== null && session.miniGameScore !== null,
      miniGameScore: session.miniGameScore,
      resolvedAt: now,
      tierBefore: save.risk.tier,
      tierAfter: tierResult.change.to,
    };

    const resolvedSession: CampaignSession = {
      ...session,
      status: 'resolved',
      resolvedAt: now,
      result: snapshot,
    };

    next = {
      ...next,
      campaignSessions: next.campaignSessions.map((entry) =>
        entry.id === session.id ? resolvedSession : entry,
      ),
      player: { ...next.player, sessionsCompleted: next.player.sessionsCompleted + 1 },
      meta: { ...next.meta, updatedAt: now },
    };

    store.setState(next);
    repository.saveNow(next);

    return ok({
      snapshot,
      tierChange: tierResult.change,
      alreadyResolved: false,
      balanceAfter: next.player.money,
    });
  } finally {
    inFlight.delete(guardKey);
  }
}

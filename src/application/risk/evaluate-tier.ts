/**
 * Evaluasi risk tier. Dipanggil setelah posting, setelah campaign resolve,
 * setelah pemulihan, dan saat bootstrap (agar suspicion yang menurun karena
 * istirahat ikut dihitung).
 *
 * Idempoten: konsekuensi (denda, shadowban, penyitaan) hanya diterapkan saat
 * tier BENAR-BENAR berubah, bukan setiap pemanggilan.
 */

import { createId } from '@/core/ids';
import { applyDelta } from '@/domain/finance/balance';
import { appendTransaction, descriptionKeyFor } from '@/domain/finance/ledger';
import { getTierConfig, isTierUp, tierForSuspicion } from '@/domain/risk/tier';
import { applyShadowban } from '@/domain/risk/shadowban';
import { removeAsset, selectSeizableAsset } from '@/domain/risk/seizure';
import { selectPrimaryAccount } from '@/state/selectors';
import type { BalanceConfig } from '@/data/config/balance';
import type { GameSave, RiskTier, ViolationKind, ViolationRecord } from '@/state/types';

export interface TierChange {
  changed: boolean;
  from: RiskTier;
  to: RiskTier;
  direction: 'up' | 'down' | 'none';
  violations: ViolationRecord[];
  fineApplied: number;
  seized: { kind: 'property' | 'vehicle'; id: string } | null;
}

export interface EvaluateTierOptions {
  config: BalanceConfig;
  now: number;
  sourceId: string | null;
}

const EMPTY_CHANGE: TierChange = {
  changed: false,
  from: 'safe',
  to: 'safe',
  direction: 'none',
  violations: [],
  fineApplied: 0,
  seized: null,
};

/**
 * Terapkan penurunan suspicion karena istirahat (tidak posting).
 * Pure: mengembalikan save baru.
 */
export function applySuspicionDecay(save: GameSave, config: BalanceConfig, now: number): GameSave {
  const account = selectPrimaryAccount(save);
  if (!account) return save;

  const lastActivity = save.social.lastPostAt ?? 0;
  if (lastActivity <= 0) return save;

  const restMs = now - lastActivity - config.posting.decayGraceMs;
  if (restMs <= 0) return save;

  const decayPoints = (restMs / 60_000) * config.posting.suspicionDecayPerMinute;
  if (decayPoints < 1) return save;

  const nextSuspicion = Math.max(0, account.suspicion - Math.floor(decayPoints));
  if (nextSuspicion === account.suspicion) return save;

  return {
    ...save,
    accounts: save.accounts.map((entry) =>
      entry.id === account.id ? { ...entry, suspicion: nextSuspicion } : entry,
    ),
  };
}

/** Hitung & terapkan transisi tier. */
export function evaluateTier(
  save: GameSave,
  options: EvaluateTierOptions,
): { save: GameSave; change: TierChange } {
  const { config, now, sourceId } = options;
  const account = selectPrimaryAccount(save);

  if (!account) return { save, change: { ...EMPTY_CHANGE } };

  const from: RiskTier = save.risk.tier;
  const to = tierForSuspicion(account.suspicion, config);

  if (from === to) {
    return {
      save: { ...save, risk: { ...save.risk, lastEvaluatedAt: now } },
      change: { ...EMPTY_CHANGE, from, to },
    };
  }

  const direction: TierChange['direction'] = isTierUp(from, to) ? 'up' : 'down';

  let next: GameSave = { ...save, risk: { ...save.risk, tier: to, lastEvaluatedAt: now } };
  const violations: ViolationRecord[] = [];
  let fineApplied = 0;
  let seized: TierChange['seized'] = null;

  if (direction === 'up') {
    const target = getTierConfig(config, to);

    const pushViolation = (kind: ViolationKind, amount: number, reasonKey: string): void => {
      violations.push({
        id: createId('violation', now),
        kind,
        tier: to,
        amount,
        reasonKey,
        sourceId,
        at: now,
      });
    };

    // 1. Denda otomatis.
    if (target.autoFineOnEnter > 0) {
      const applied = applyDelta(next, -target.autoFineOnEnter, { allowNegative: true });
      if (applied.ok) {
        next = applied.value.save;
        next = appendTransaction(next, {
          type: 'campaign_fine',
          amount: -target.autoFineOnEnter,
          sourceId,
          descriptionKey: descriptionKeyFor('campaign_fine'),
          createdAt: now,
        });
        fineApplied = target.autoFineOnEnter;
        pushViolation('fine', target.autoFineOnEnter, `risk.tier.${to}.fine`);
      }
    }

    // 2. Shadowban.
    if (target.shadowbanMs > 0) {
      next = {
        ...next,
        social: applyShadowban(next.social, now, target.shadowbanMs),
      };
      pushViolation('shadowban', 0, `risk.tier.${to}.shadowban`);
    }

    // 3. Penyitaan aset.
    if (target.canSeizeAsset && config.seizure.tier === to) {
      const candidate = selectSeizableAsset(next, config);
      if (candidate) {
        next = removeAsset(next, candidate);
        seized = candidate;
        pushViolation('seizure', 0, 'risk.tier.critical.seizure');
      } else {
        pushViolation('restriction', 0, 'risk.tier.critical.restriction');
      }
    } else if (to === 'watch') {
      pushViolation('warning', 0, 'risk.tier.watch.warning');
    }
  }

  next = { ...next, violations: [...next.violations, ...violations] };

  return {
    save: next,
    change: { changed: true, from, to, direction, violations, fineApplied, seized },
  };
}

export { selectSeizableAsset };

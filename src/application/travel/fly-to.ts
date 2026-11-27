/**
 * Use case: terbang ke negara yang tiketnya dimiliki.
 * Atomik: flush income → validasi → potong biaya (bila ada) → pindah lokasi.
 */

import { err, ok, type ActionResult } from '@/core/result';
import { applyDelta } from '@/domain/finance/balance';
import { appendTransaction, descriptionKeyFor } from '@/domain/finance/ledger';
import { canFly } from '@/domain/travel/unlock';
import { findTravelCountry } from '@/data/travel/countries';
import { flushPendingIncome } from '@/application/income/accrue-income';
import type { GameSave } from '@/state/types';
import type { CampaignUseCaseDeps } from '../campaigns/accept-campaign';

export interface FlyToOutcome {
  countryId: string;
  cost: number;
  balanceAfter: number;
  firstVisit: boolean;
}

export function flyTo(
  deps: CampaignUseCaseDeps,
  countryId: string,
): ActionResult<FlyToOutcome> {
  const { store, config, repository, clock } = deps;
  const inFlight = deps.inFlight ?? new Set<string>();
  const guardKey = `fly:${countryId}`;

  if (inFlight.has(guardKey)) {
    return err('invalid_transition', 'error.invalid_transition', 'perjalanan sedang diproses');
  }
  inFlight.add(guardKey);

  try {
    const flushed = flushPendingIncome(deps);
    if (!flushed.ok) return flushed;

    const save = store.getState();
    const country = findTravelCountry(countryId);
    if (!country) return err('unknown', 'error.unknown', `negara tidak dikenal: ${countryId}`);

    const evaluation = canFly(save, config, countryId, save.player.money);
    if (!evaluation.allowed) {
      if (evaluation.reason === 'locked') {
        return err('locked', 'travel.needTicket');
      }
      if (evaluation.reason === 'insufficient_funds') {
        return err('insufficient_funds', 'error.insufficient_funds');
      }
      return err('invalid_transition', 'error.invalid_transition', 'sudah di negara ini');
    }

    const now = clock.now();
    let next: GameSave = save;

    if (evaluation.cost > 0) {
      const paid = applyDelta(save, -evaluation.cost, { allowNegative: false });
      if (!paid.ok) return paid;
      next = appendTransaction(paid.value.save, {
        type: 'travel_cost',
        amount: -evaluation.cost,
        sourceId: countryId,
        descriptionKey: descriptionKeyFor('travel_cost'),
        createdAt: now,
      });
    }

    const visited = next.character.visitedCountryIds.includes(countryId)
      ? next.character.visitedCountryIds
      : [...next.character.visitedCountryIds, countryId];

    next = {
      ...next,
      character: {
        ...next.character,
        locationCountryId: countryId,
        visitedCountryIds: visited,
      },
      meta: { ...next.meta, updatedAt: now },
    };

    store.setState(next);
    repository.saveNow(next);

    return ok({
      countryId,
      cost: evaluation.cost,
      balanceAfter: next.player.money,
      firstVisit: evaluation.firstVisit,
    });
  } finally {
    inFlight.delete(guardKey);
  }
}

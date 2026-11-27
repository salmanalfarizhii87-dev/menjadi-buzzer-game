/**
 * Use case: terima kontrak kampanye.
 *
 * Atomik: validasi kelayakan → buat session → commit + persist segera.
 * Tidak ada uang yang berpindah pada langkah ini.
 */

import { err, ok, type ActionResult } from '@/core/result';
import { randomSeed } from '@/core/random';
import { selectPrimaryAccount } from '@/state/selectors';
import { createCampaignSession } from '@/domain/campaigns/session';
import {
  ELIGIBILITY_MESSAGE_KEY,
  evaluateEligibility,
  type EligibilityResult,
} from '@/domain/campaigns/eligibility';
import type { CampaignDefinition } from '@/domain/campaigns/definition';
import type { BalanceConfig } from '@/data/config/balance';
import type { GameStore } from '@/state/game-store';
import type { SaveRepository } from '@/persistence/save-repository';
import type { Clock } from '@/core/clock';
import type { CampaignSession, GameSave } from '@/state/types';

export interface AcceptCampaignOutcome {
  session: CampaignSession;
  definition: CampaignDefinition;
  eligibility: EligibilityResult;
}

export interface CampaignUseCaseDeps {
  store: GameStore;
  config: BalanceConfig;
  repository: SaveRepository;
  clock: Clock;
  /** Guard in-flight untuk mencegah double-submit. */
  inFlight?: Set<string>;
}

export function acceptCampaign(
  deps: CampaignUseCaseDeps,
  definitions: readonly CampaignDefinition[],
  campaignDefinitionId: string,
): ActionResult<AcceptCampaignOutcome> {
  const { store, repository, clock } = deps;
  const inFlight = deps.inFlight ?? new Set<string>();
  const guardKey = `accept-campaign:${campaignDefinitionId}`;

  if (inFlight.has(guardKey)) {
    return err('invalid_transition', 'error.invalid_transition', 'kontrak sedang diproses');
  }
  inFlight.add(guardKey);

  try {
    const save = store.getState();
    const definition = definitions.find((entry) => entry.id === campaignDefinitionId);

    if (!definition) {
      return err('campaign_not_found', 'error.campaign_not_found');
    }

    const account = selectPrimaryAccount(save);
    const eligibility = evaluateEligibility(definition, account, save.campaignSessions);

    if (!eligibility.eligible || !account) {
      const reason = eligibility.reasons[0];
      const key = reason ? ELIGIBILITY_MESSAGE_KEY[reason.code] : 'error.campaign_ineligible';
      return err('campaign_ineligible', key, `tidak memenuhi syarat: ${reason?.code ?? 'unknown'}`);
    }

    const now = clock.now();
    const session = createCampaignSession({
      definition,
      accountId: account.id,
      seed: randomSeed(),
      now,
    });

    const next: GameSave = {
      ...save,
      campaignSessions: [...save.campaignSessions, session],
      meta: { ...save.meta, updatedAt: now },
    };

    store.setState(next);
    repository.saveNow(next);

    return ok({ session, definition, eligibility });
  } finally {
    inFlight.delete(guardKey);
  }
}

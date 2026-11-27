/**
 * Use case: pilih strategi kampanye (pendekatan, intensitas, postur risiko).
 *
 * Hanya session berstatus `accepted` yang boleh diubah. Estimasi dihitung
 * sekali di sini agar UI tidak memegang rumus.
 */

import { err, ok, type ActionResult } from '@/core/result';
import { selectPrimaryAccount } from '@/state/selectors';
import {
  applyStrategySelection,
  estimateCampaign,
  isSelectionRelevant,
  type CampaignEstimate,
  type CampaignStrategySelection,
} from '@/domain/campaigns/session';
import type { CampaignDefinition } from '@/domain/campaigns/definition';
import type { GameSave, CampaignSession } from '@/state/types';
import type { CampaignUseCaseDeps } from './accept-campaign';

export interface SelectStrategyInput extends CampaignStrategySelection {
  sessionId: string;
}

export interface SelectStrategyOutcome {
  session: CampaignSession;
  estimate: CampaignEstimate;
}

export function selectCampaignStrategy(
  deps: CampaignUseCaseDeps,
  definitions: readonly CampaignDefinition[],
  input: SelectStrategyInput,
): ActionResult<SelectStrategyOutcome> {
  const { store, config, repository, clock } = deps;
  const inFlight = deps.inFlight ?? new Set<string>();
  const guardKey = `select-strategy:${input.sessionId}`;

  if (inFlight.has(guardKey)) {
    return err('invalid_transition', 'error.invalid_transition', 'strategi sedang diproses');
  }
  inFlight.add(guardKey);

  try {
    const save = store.getState();
    const session = save.campaignSessions.find((entry) => entry.id === input.sessionId);

    if (!session) return err('campaign_not_found', 'error.campaign_not_found');

    const definition = definitions.find((entry) => entry.id === session.campaignDefinitionId);
    if (!definition) return err('campaign_not_found', 'error.campaign_not_found');

    if (session.status !== 'accepted') {
      return err('invalid_transition', 'error.invalid_transition', `status ${session.status}`);
    }

    const selection: CampaignStrategySelection = {
      approachId: input.approachId,
      intensityId: input.intensityId,
      postureId: input.postureId,
    };

    if (!isSelectionRelevant(definition, config, selection)) {
      return err('strategy_missing', 'error.strategy_missing');
    }

    const account = selectPrimaryAccount(save);
    if (!account) return err('unknown', 'error.unknown', 'akun utama tidak ditemukan');

    const estimate = estimateCampaign(definition, account, config, selection);
    const updated = applyStrategySelection(session, selection);
    const now = clock.now();

    const next: GameSave = {
      ...save,
      campaignSessions: save.campaignSessions.map((entry) =>
        entry.id === session.id ? updated : entry,
      ),
      meta: { ...save.meta, updatedAt: now },
    };

    store.setState(next);
    repository.saveNow(next);

    return ok({ session: updated, estimate });
  } finally {
    inFlight.delete(guardKey);
  }
}

/**
 * Use case: simpan skor mini-game tepat satu kali.
 *
 * Prasyarat: session berstatus `strategy_selected`, punya miniGameId, dan
 * belum punya skor. Setelah commit status menjadi `activity_completed`.
 */

import { err, ok, type ActionResult } from '@/core/result';
import type { CampaignSession, GameSave } from '@/state/types';
import type { CampaignUseCaseDeps } from './accept-campaign';

export interface CompleteMiniGameInput {
  sessionId: string;
  score: number;
}

export interface CompleteMiniGameOutcome {
  session: CampaignSession;
  score: number;
}

export function completeMiniGame(
  deps: CampaignUseCaseDeps,
  input: CompleteMiniGameInput,
): ActionResult<CompleteMiniGameOutcome> {
  const { store, repository, clock } = deps;
  const inFlight = deps.inFlight ?? new Set<string>();
  const guardKey = `complete-minigame:${input.sessionId}`;

  if (inFlight.has(guardKey)) {
    return err('invalid_transition', 'error.invalid_transition', 'skor sedang disimpan');
  }
  inFlight.add(guardKey);

  try {
    const save = store.getState();
    const session = save.campaignSessions.find((entry) => entry.id === input.sessionId);
    if (!session) return err('campaign_not_found', 'error.campaign_not_found');

    if (!session.miniGameId) {
      return err('minigame_unknown', 'error.minigame_unknown', 'session tidak punya mini-game');
    }

    if (session.status === 'activity_completed' || session.miniGameScore !== null) {
      return err('minigame_already_completed', 'error.minigame_already_completed');
    }

    if (session.status !== 'strategy_selected') {
      return err('invalid_transition', 'error.invalid_transition', `status ${session.status}`);
    }

    if (!Number.isInteger(input.score) || input.score < 0 || input.score > 100) {
      return err('invalid_amount', 'error.invalid_amount', `skor ${input.score}`);
    }

    const updated: CampaignSession = {
      ...session,
      status: 'activity_completed',
      miniGameScore: input.score,
    };
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

    return ok({ session: updated, score: input.score });
  } finally {
    inFlight.delete(guardKey);
  }
}

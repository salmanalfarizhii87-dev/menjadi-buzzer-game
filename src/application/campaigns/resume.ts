/**
 * Menentukan langkah berikutnya untuk session kampanye yang sedang berjalan.
 * Dipakai layar Karakter dan Task agar tombol "Lanjutkan" konsisten.
 */

import type { CampaignDefinition } from '@/domain/campaigns/definition';
import { findCampaignDefinition } from '@/domain/campaigns/definition';
import { selectActiveSession, selectSessionById } from '@/state/selectors';
import type { CampaignSession, GameSave } from '@/state/types';

export type CampaignStage = 'strategy' | 'activity' | 'result' | 'done';

export interface CampaignResume {
  session: CampaignSession;
  definition: CampaignDefinition;
  stage: CampaignStage;
}

export function stageForSession(
  session: CampaignSession,
  definition: CampaignDefinition,
): CampaignStage {
  switch (session.status) {
    case 'accepted':
      return 'strategy';
    case 'strategy_selected':
      return definition.miniGameId ? 'activity' : 'result';
    case 'activity_completed':
      return 'result';
    default:
      return 'done';
  }
}

export function resumeCampaign(
  save: GameSave,
  definitions: readonly CampaignDefinition[],
  sessionId?: string,
): CampaignResume | null {
  const session = sessionId ? selectSessionById(save, sessionId) : selectActiveSession(save);
  if (!session) return null;

  const definition = findCampaignDefinition(definitions, session.campaignDefinitionId);
  if (!definition) return null;

  return { session, definition, stage: stageForSession(session, definition) };
}

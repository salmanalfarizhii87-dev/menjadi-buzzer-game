/**
 * Kelayakan akun untuk sebuah kontrak. Pure: tidak mengubah state.
 *
 * Satu kontrak hanya boleh punya satu session non-final. Kontrak yang sudah
 * resolved tidak bisa diterima lagi; yang cancelled boleh diambil ulang.
 */

import type { AccountState, CampaignSession } from '@/state/types';
import { isFinalCampaignStatus } from '@/state/types';
import type { CampaignDefinition } from './definition';

export type EligibilityReason =
  | { code: 'performance'; required: number; actual: number }
  | { code: 'status'; status: AccountState['status'] }
  | { code: 'active_session' }
  | { code: 'already_accepted' }
  | { code: 'resolved' };

export interface EligibilityResult {
  eligible: boolean;
  reasons: EligibilityReason[];
}

export const ELIGIBILITY_MESSAGE_KEY = {
  performance: 'campaign.reason.performance',
  status: 'campaign.reason.status',
  active_session: 'campaign.reason.activeSession',
  already_accepted: 'campaign.reason.alreadyAccepted',
  resolved: 'campaign.reason.resolved',
} as const;

export function evaluateEligibility(
  definition: CampaignDefinition,
  account: AccountState | undefined,
  sessions: readonly CampaignSession[],
): EligibilityResult {
  const reasons: EligibilityReason[] = [];

  if (!account) {
    return { eligible: false, reasons: [{ code: 'status', status: 'suspended' }] };
  }

  if (account.performance < definition.requirements.minPerformance) {
    reasons.push({
      code: 'performance',
      required: definition.requirements.minPerformance,
      actual: account.performance,
    });
  }

  if (!definition.requirements.allowedStatuses.includes(account.status)) {
    reasons.push({ code: 'status', status: account.status });
  }

  const ownSessions = sessions.filter(
    (session) => session.campaignDefinitionId === definition.id,
  );
  const ownSession = ownSessions[ownSessions.length - 1];
  if (ownSession) {
    if (ownSession.status === 'resolved') {
      reasons.push({ code: 'resolved' });
    } else if (!isFinalCampaignStatus(ownSession.status)) {
      reasons.push({ code: 'already_accepted' });
    }
  }

  const otherActive = sessions.some(
    (session) =>
      session.campaignDefinitionId !== definition.id && !isFinalCampaignStatus(session.status),
  );
  if (otherActive) reasons.push({ code: 'active_session' });

  return { eligible: reasons.length === 0, reasons };
}

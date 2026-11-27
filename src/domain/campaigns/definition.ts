/**
 * Definisi kontrak kampanye. Tipe ini murni data; tidak ada angka balancing
 * di sini (angka berasal dari `data/campaigns/seed.ts`).
 */

import type { AccountStatus, CampaignInteraction } from '@/state/types';

export interface CampaignRequirements {
  minPerformance: number;
  allowedStatuses: AccountStatus[];
}

export interface CampaignDefinition {
  id: string;
  client: string;
  campaignName: string;
  objective: string;
  targetAudience: string;
  category: string;
  /** 1 = mudah, 3 = sulit. */
  difficulty: number;
  basePayment: number;
  bonusPayment: number;
  /** Risiko dasar 0..1 untuk label kualitatif. */
  baseRisk: number;
  baseSuccessChance: number;
  strategyTags: string[];
  interaction: CampaignInteraction;
  miniGameId: string | null;
  penaltyProfileId: string;
  targetPerformance: number;
  /** Delta suspicion dasar saat kampanye diselesaikan. */
  riskImpact: number;
  requirements: CampaignRequirements;
}

export const CAMPAIGN_INTERACTION_LABEL_KEY: Record<CampaignInteraction, string> = {
  auto: 'campaign.interaction.auto',
  interactive: 'campaign.interaction.interactive',
  hybrid: 'campaign.interaction.hybrid',
};

export function findCampaignDefinition(
  definitions: readonly CampaignDefinition[],
  id: string,
): CampaignDefinition | undefined {
  return definitions.find((definition) => definition.id === id);
}

/**
 * Strategi pendekatan yang relevan untuk kontrak. Bila tidak ada tag yang
 * cocok, semua pendekatan ditampilkan agar pemain tidak buntu.
 */
export function relevantApproachIds(
  definition: CampaignDefinition,
  availableIds: readonly string[],
): string[] {
  const matched = availableIds.filter((id) => definition.strategyTags.includes(id));
  return matched.length > 0 ? matched : [...availableIds];
}

/** Label kualitatif risiko dasar, dipakai UI tanpa menghitung ulang. */
export function riskLabelFor(baseRisk: number): 'low' | 'medium' | 'high' {
  if (baseRisk < 0.25) return 'low';
  if (baseRisk < 0.5) return 'medium';
  return 'high';
}

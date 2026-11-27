/**
 * Siklus hidup session kampanye + estimasi hasil.
 *
 * Semua rumus peluang/imbalan ada di sini agar UI hanya menampilkan angka.
 * Nilai awal `riskImpact` dan `baseSuccessChance` berasal dari seed kontrak;
 * modifier berasal dari `config.strategy`.
 */

import type { BalanceConfig, StrategyOptionConfig } from '@/data/config/balance';
import type { AccountState, CampaignSession } from '@/state/types';
import { createId } from '@/core/ids';
import { computeSuccessProbability } from '@/domain/risk/probability';
import { computeCampaignPerformance } from '@/domain/strategy/performance';
import { relevantApproachIds, type CampaignDefinition } from './definition';

export interface CampaignStrategySelection {
  approachId: string;
  intensityId: string;
  postureId: string;
}

export interface CampaignEstimate {
  approachId: string;
  intensityId: string;
  postureId: string;
  performanceScore: number;
  successChance: number;
  payment: number;
  bonus: number;
  suspicionDelta: number;
}

type StrategyLists = BalanceConfig['strategy'];

function findOption(options: readonly StrategyOptionConfig[], id: string): StrategyOptionConfig | undefined {
  return options.find((option) => option.id === id);
}

/** Pilihan awal: pendekatan relevan pertama, intensitas normal, postur seimbang. */
export function defaultStrategySelection(
  definition: CampaignDefinition,
  config: BalanceConfig,
): CampaignStrategySelection {
  const approachId =
    relevantApproachIds(
      definition,
      config.strategy.contentApproach.map((option) => option.id),
    )[0] ?? 'informative';

  return { approachId, intensityId: 'normal', postureId: 'balanced' };
}

export function isSelectionRelevant(
  definition: CampaignDefinition,
  config: BalanceConfig,
  selection: CampaignStrategySelection,
): boolean {
  const allowed = relevantApproachIds(
    definition,
    config.strategy.contentApproach.map((option) => option.id),
  );
  return (
    allowed.includes(selection.approachId) &&
    config.strategy.activityIntensity.some((option) => option.id === selection.intensityId) &&
    config.strategy.riskPosture.some((option) => option.id === selection.postureId)
  );
}

/**
 * Estimasi deterministik sebelum kampanye dijalankan. Bukan hasil final:
 * roll dan mini-game tetap menentukan outcome pada fase berikutnya.
 */
export function estimateCampaign(
  definition: CampaignDefinition,
  account: AccountState,
  config: BalanceConfig,
  selection: CampaignStrategySelection,
  miniGameScore: number | null = null,
): CampaignEstimate {
  const strategy: StrategyLists = config.strategy;
  const approach = findOption(strategy.contentApproach, selection.approachId);
  const intensity = findOption(strategy.activityIntensity, selection.intensityId);
  const posture = findOption(strategy.riskPosture, selection.postureId);

  const performanceScore = computeCampaignPerformance({
    accountPerformance: account.performance,
    approachModifier: approach?.performanceModifier ?? 0,
    intensityModifier: intensity?.performanceModifier ?? 0,
    postureModifier: posture?.performanceModifier ?? 0,
    miniGameScore,
    miniGameWeight: config.resolution.miniGameWeight,
  });

  const probabilityModifier =
    (approach?.probabilityModifier ?? 0) +
    (intensity?.probabilityModifier ?? 0) +
    (posture?.probabilityModifier ?? 0);

  const successChance = computeSuccessProbability(
    {
      baseChance: definition.baseSuccessChance,
      performanceScore,
      targetPerformance: definition.targetPerformance,
      reputation: account.reputation,
      suspicion: account.suspicion,
      status: account.status,
      strategyModifier: probabilityModifier,
    },
    config.probability,
  );

  const rewardModifier =
    (approach?.rewardModifier ?? 0) +
    (intensity?.rewardModifier ?? 0) +
    (posture?.rewardModifier ?? 0);

  const riskModifier =
    (approach?.riskModifier ?? 0) +
    (intensity?.riskModifier ?? 0) +
    (posture?.riskModifier ?? 0);

  return {
    ...selection,
    performanceScore,
    successChance,
    payment: Math.max(0, Math.round(definition.basePayment * (1 + rewardModifier))),
    bonus: Math.max(0, Math.round(definition.bonusPayment * (1 + rewardModifier))),
    suspicionDelta: Math.max(0, Math.round(definition.riskImpact * (1 + riskModifier))),
  };
}

export function createCampaignSession(input: {
  definition: CampaignDefinition;
  accountId: string;
  seed: number;
  now: number;
}): CampaignSession {
  return {
    id: createId('session', input.now),
    campaignDefinitionId: input.definition.id,
    accountId: input.accountId,
    status: 'accepted',
    acceptedAt: input.now,
    miniGameId: input.definition.miniGameId,
    miniGameSeed: input.seed,
    selectedStrategyId: null,
    selectedIntensity: null,
    selectedRiskPosture: null,
    miniGameScore: null,
    resolvedAt: null,
    result: null,
  };
}

/** Session yang sudah accepted boleh menerima strategi satu kali. */
export function applyStrategySelection(
  session: CampaignSession,
  selection: CampaignStrategySelection,
): CampaignSession {
  if (session.status !== 'accepted') {
    throw new Error(`Session ${session.id} tidak menerima strategi pada status ${session.status}`);
  }

  return {
    ...session,
    status: 'strategy_selected',
    selectedStrategyId: selection.approachId,
    selectedIntensity: selection.intensityId,
    selectedRiskPosture: selection.postureId,
  };
}

/**
 * Resolusi kampanye (pure, 11 langkah PRD).
 *
 * Roll diberikan sebagai argumen; fungsi ini tidak memanggil random sendiri.
 * Pembayaran, bonus, denda, dan delta statistik semuanya dihitung di sini.
 */

import type { BalanceConfig } from '@/data/config/balance';
import type {
  AccountState,
  CampaignOutcome,
  CampaignSession,
} from '@/state/types';
import type { CampaignDefinition } from './definition';
import { estimateCampaign, type CampaignStrategySelection } from './session';
import { applyPenalty } from '@/domain/penalties/apply';
import { penaltyProfileFor } from '@/domain/penalties/profiles';

export interface ResolveCampaignInput {
  definition: CampaignDefinition;
  account: AccountState;
  session: CampaignSession;
  config: BalanceConfig;
  /** 0..1, dibuat sekali oleh application layer. */
  roll: number;
}

export interface CampaignResolution {
  performanceScore: number;
  successProbability: number;
  roll: number;
  outcome: CampaignOutcome;
  payment: number;
  bonus: number;
  fine: number;
  reputationDelta: number;
  suspicionDelta: number;
  followersDelta: number;
  performanceDelta: number;
  statusBefore: AccountState['status'];
  statusAfter: AccountState['status'];
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function resolveCampaign(input: ResolveCampaignInput): CampaignResolution {
  const { definition, account, session, config } = input;

  if (!session.selectedStrategyId || !session.selectedIntensity || !session.selectedRiskPosture) {
    throw new Error('Strategi kampanye belum lengkap');
  }

  const selection: CampaignStrategySelection = {
    approachId: session.selectedStrategyId,
    intensityId: session.selectedIntensity,
    postureId: session.selectedRiskPosture,
  };

  const estimate = estimateCampaign(
    definition,
    account,
    config,
    selection,
    session.miniGameScore,
  );
  const roll = clamp01(input.roll);
  const outcome: CampaignOutcome =
    roll < estimate.successChance ? 'success' : 'failure';

  if (outcome === 'success') {
    const bonus = estimate.performanceScore >= definition.targetPerformance ? estimate.bonus : 0;
    return {
      performanceScore: estimate.performanceScore,
      successProbability: estimate.successChance,
      roll,
      outcome,
      payment: estimate.payment,
      bonus,
      fine: 0,
      reputationDelta: config.resolution.successReputationGain,
      suspicionDelta: estimate.suspicionDelta,
      followersDelta: Math.round(
        config.resolution.successFollowersBase * (0.5 + estimate.performanceScore / 100),
      ),
      performanceDelta: config.resolution.successPerformanceGain,
      statusBefore: account.status,
      statusAfter: account.status,
    };
  }

  const penalty = applyPenalty(
    penaltyProfileFor(config, definition.penaltyProfileId),
    definition.basePayment,
    config,
  );

  return {
    performanceScore: estimate.performanceScore,
    successProbability: estimate.successChance,
    roll,
    outcome,
    payment: 0,
    bonus: 0,
    fine: penalty.fine,
    reputationDelta: penalty.reputationDelta,
    suspicionDelta: estimate.suspicionDelta + penalty.suspicionDelta,
    followersDelta: -config.resolution.failureFollowersLoss,
    performanceDelta: -config.resolution.failurePerformanceLoss,
    statusBefore: account.status,
    statusAfter: penalty.status ?? account.status,
  };
}

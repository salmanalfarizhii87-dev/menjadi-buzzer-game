import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { CAMPAIGNS } from '@/data/campaigns/seed';
import { makeSave } from '@/tests/helpers';
import {
  applyStrategySelection,
  createCampaignSession,
  defaultStrategySelection,
  estimateCampaign,
  isSelectionRelevant,
} from './session';

const campaign = CAMPAIGNS[0]!;
const account = makeSave().accounts[0]!;
const aggressive = { approachId: 'informative', intensityId: 'high', postureId: 'aggressive' };
const conservative = { approachId: 'informative', intensityId: 'low', postureId: 'conservative' };

describe('createCampaignSession', () => {
  it('membuat session accepted dengan seed yang diberikan', () => {
    const session = createCampaignSession({ definition: campaign, accountId: 'acct_x', seed: 42, now: 1000 });
    expect(session.status).toBe('accepted');
    expect(session.miniGameSeed).toBe(42);
    expect(session.acceptedAt).toBe(1000);
    expect(session.result).toBeNull();
  });
});

describe('applyStrategySelection', () => {
  it('mengubah status menjadi strategy_selected', () => {
    const session = createCampaignSession({ definition: campaign, accountId: 'acct_x', seed: 1, now: 1 });
    const updated = applyStrategySelection(session, aggressive);
    expect(updated.status).toBe('strategy_selected');
    expect(updated.selectedStrategyId).toBe('informative');
    expect(updated.selectedIntensity).toBe('high');
    expect(updated.selectedRiskPosture).toBe('aggressive');
  });

  it('menolak perubahan kedua', () => {
    const session = createCampaignSession({ definition: campaign, accountId: 'acct_x', seed: 1, now: 1 });
    const updated = applyStrategySelection(session, aggressive);
    expect(() => applyStrategySelection(updated, conservative)).toThrow();
  });
});

describe('defaultStrategySelection', () => {
  it('selalu relevan dengan tag kontrak', () => {
    for (const definition of CAMPAIGNS) {
      const selection = defaultStrategySelection(definition, BALANCE);
      expect(isSelectionRelevant(definition, BALANCE, selection)).toBe(true);
    }
  });
});

describe('estimateCampaign', () => {
  it('menghasilkan angka integer dan peluang dalam batas config', () => {
    const estimate = estimateCampaign(campaign, account, BALANCE, conservative);
    expect(Number.isInteger(estimate.payment)).toBe(true);
    expect(Number.isInteger(estimate.bonus)).toBe(true);
    expect(estimate.successChance).toBeGreaterThanOrEqual(BALANCE.probability.min);
    expect(estimate.successChance).toBeLessThanOrEqual(BALANCE.probability.max);
    expect(estimate.suspicionDelta).toBeGreaterThanOrEqual(0);
  });

  it('postur agresif menaikkan imbalan dan risiko', () => {
    const low = estimateCampaign(campaign, account, BALANCE, conservative);
    const high = estimateCampaign(campaign, account, BALANCE, aggressive);
    expect(high.payment).toBeGreaterThanOrEqual(low.payment);
    expect(high.suspicionDelta).toBeGreaterThanOrEqual(low.suspicionDelta);
    expect(high.successChance).toBeLessThan(low.successChance);
  });

  it('menolak pendekatan di luar tag kontrak', () => {
    const relevant = { ...conservative, approachId: 'humorous' };
    expect(isSelectionRelevant(campaign, BALANCE, relevant)).toBe(false);
  });
});

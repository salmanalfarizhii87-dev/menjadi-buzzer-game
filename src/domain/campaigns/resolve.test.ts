import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { CAMPAIGNS } from '@/data/campaigns/seed';
import { makeSave } from '@/tests/helpers';
import type { CampaignSession } from '@/state/types';
import { resolveCampaign } from './resolve';

const softLaunch = CAMPAIGNS[0]!;
const viralPush = CAMPAIGNS[1]!;
const account = makeSave().accounts[0]!;

function session(overrides: Partial<CampaignSession> = {}): CampaignSession {
  return {
    id: 'sess_test',
    campaignDefinitionId: softLaunch.id,
    accountId: account.id,
    status: 'strategy_selected',
    acceptedAt: 1,
    miniGameId: null,
    miniGameSeed: 1,
    selectedStrategyId: 'informative',
    selectedIntensity: 'normal',
    selectedRiskPosture: 'balanced',
    miniGameScore: null,
    resolvedAt: null,
    result: null,
    ...overrides,
  };
}

describe('resolveCampaign', () => {
  it('sukses memberi pembayaran, bonus, dan delta positif', () => {
    const result = resolveCampaign({
      definition: softLaunch,
      account,
      session: session(),
      config: BALANCE,
      roll: 0,
    });

    expect(result.outcome).toBe('success');
    expect(result.payment).toBeGreaterThan(0);
    expect(result.bonus).toBeGreaterThan(0);
    expect(result.fine).toBe(0);
    expect(result.reputationDelta).toBeGreaterThan(0);
    expect(result.followersDelta).toBeGreaterThan(0);
    expect(result.performanceDelta).toBeGreaterThan(0);
    expect(result.statusAfter).toBe(account.status);
  });

  it('gagal memberi denda, reputasi turun, dan tanpa pembayaran', () => {
    const result = resolveCampaign({
      definition: viralPush,
      account,
      session: session({
        campaignDefinitionId: viralPush.id,
        selectedStrategyId: 'emotional',
        selectedIntensity: 'high',
        selectedRiskPosture: 'aggressive',
      }),
      config: BALANCE,
      roll: 0.999,
    });

    expect(result.outcome).toBe('failure');
    expect(result.payment).toBe(0);
    expect(result.bonus).toBe(0);
    expect(result.fine).toBeGreaterThan(0);
    expect(result.reputationDelta).toBeLessThan(0);
    expect(result.followersDelta).toBeLessThan(0);
    expect(result.suspicionDelta).toBeGreaterThan(0);
  });

  it('bonus tidak diberikan bila performa di bawah target', () => {
    const weak = { ...account, performance: 0 };
    const result = resolveCampaign({
      definition: softLaunch,
      account: weak,
      session: session(),
      config: BALANCE,
      roll: 0,
    });

    expect(result.outcome).toBe('success');
    expect(result.performanceScore).toBeLessThan(softLaunch.targetPerformance);
    expect(result.bonus).toBe(0);
  });

  it('skor mini-game menaikkan performa dan peluang', () => {
    const without = resolveCampaign({
      definition: softLaunch,
      account,
      session: session(),
      config: BALANCE,
      roll: 0,
    });
    const withScore = resolveCampaign({
      definition: softLaunch,
      account,
      session: session({ miniGameScore: 100 }),
      config: BALANCE,
      roll: 0,
    });

    expect(withScore.performanceScore).toBeGreaterThan(without.performanceScore);
    expect(withScore.successProbability).toBeGreaterThanOrEqual(without.successProbability);
  });

  it('menolak session tanpa strategi lengkap', () => {
    expect(() =>
      resolveCampaign({
        definition: softLaunch,
        account,
        session: session({ selectedStrategyId: null }),
        config: BALANCE,
        roll: 0,
      }),
    ).toThrow();
  });

  it('roll di luar 0..1 di-clamp dan tidak menghasilkan NaN', () => {
    const result = resolveCampaign({
      definition: softLaunch,
      account,
      session: session(),
      config: BALANCE,
      roll: 2,
    });
    expect(Number.isFinite(result.successProbability)).toBe(true);
    expect(result.outcome).toBe('failure');
  });
});

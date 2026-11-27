import { describe, expect, it } from 'vitest';
import { CAMPAIGNS } from '@/data/campaigns/seed';
import { evaluateEligibility } from './eligibility';
import type { CampaignSession } from '@/state/types';
import { makeSave } from '@/tests/helpers';

const campaign = CAMPAIGNS[0]!;

function session(overrides: Partial<CampaignSession> = {}): CampaignSession {
  return {
    id: 'sess_test',
    campaignDefinitionId: campaign.id,
    accountId: 'acct_test',
    status: 'accepted',
    acceptedAt: 1,
    miniGameId: null,
    miniGameSeed: 1,
    selectedStrategyId: null,
    selectedIntensity: null,
    selectedRiskPosture: null,
    miniGameScore: null,
    resolvedAt: null,
    result: null,
    ...overrides,
  };
}

describe('evaluateEligibility', () => {
  it('menerima akun yang memenuhi performa dan status', () => {
    const save = makeSave();
    const result = evaluateEligibility(campaign, save.accounts[0], []);
    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it('menolak saat performa akun kurang', () => {
    const save = makeSave();
    const account = { ...save.accounts[0]!, performance: 0 };
    const result = evaluateEligibility(CAMPAIGNS[1]!, account, []);
    expect(result.eligible).toBe(false);
    expect(result.reasons.map((reason) => reason.code)).toContain('performance');
  });

  it('menolak saat status akun tidak diizinkan', () => {
    const save = makeSave();
    const account = { ...save.accounts[0]!, status: 'suspended' as const };
    const result = evaluateEligibility(campaign, account, []);
    expect(result.eligible).toBe(false);
    expect(result.reasons.map((reason) => reason.code)).toContain('status');
  });

  it('menolak kontrak yang sudah diterima', () => {
    const save = makeSave();
    const result = evaluateEligibility(campaign, save.accounts[0], [session()]);
    expect(result.eligible).toBe(false);
    expect(result.reasons.map((reason) => reason.code)).toContain('already_accepted');
  });

  it('menolak saat ada kampanye lain berjalan', () => {
    const save = makeSave();
    const other = session({ campaignDefinitionId: CAMPAIGNS[1]!.id });
    const result = evaluateEligibility(campaign, save.accounts[0], [other]);
    expect(result.eligible).toBe(false);
    expect(result.reasons.map((reason) => reason.code)).toContain('active_session');
  });

  it('menolak kontrak yang sudah resolved', () => {
    const save = makeSave();
    const result = evaluateEligibility(campaign, save.accounts[0], [session({ status: 'resolved' })]);
    expect(result.eligible).toBe(false);
    expect(result.reasons.map((reason) => reason.code)).toContain('resolved');
  });

  it('memakai session terbaru saat ada riwayat batal lalu diterima lagi', () => {
    const save = makeSave();
    const result = evaluateEligibility(campaign, save.accounts[0], [
      session({ status: 'cancelled' }),
      session({ id: 'sess_baru', status: 'accepted' }),
    ]);
    expect(result.eligible).toBe(false);
    expect(result.reasons.map((reason) => reason.code)).toContain('already_accepted');
  });

  it('mengizinkan kontrak yang dibatalkan untuk diambil ulang', () => {
    const save = makeSave();
    const result = evaluateEligibility(campaign, save.accounts[0], [session({ status: 'cancelled' })]);
    expect(result.eligible).toBe(true);
  });
});

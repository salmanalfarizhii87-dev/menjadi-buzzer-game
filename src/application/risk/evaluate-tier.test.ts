import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { createId } from '@/core/ids';
import {
  applySuspicionDecay,
  evaluateTier,
  selectSeizableAsset,
} from './evaluate-tier';

const NOW = 1_700_000_000_000;
const T0 = NOW - 3_600_000;

function saveWith(overrides: {
  suspicion?: number;
  tier?: 'safe' | 'watch' | 'hot' | 'critical';
  propertyIds?: string[];
  vehicleIds?: string[];
  lastPostAt?: number | null;
} = {}) {
  const save = createInitialSave(BALANCE, T0);
  return {
    ...save,
    accounts: [{ ...save.accounts[0]!, suspicion: overrides.suspicion ?? 10 }],
    risk: { tier: overrides.tier ?? 'safe', lastEvaluatedAt: T0 },
    assets: {
      propertyIds: overrides.propertyIds ?? [],
      vehicleIds: overrides.vehicleIds ?? [],
    },
    social: { ...save.social, lastPostAt: overrides.lastPostAt ?? null },
  };
}

describe('evaluateTier', () => {
  it('tidak berubah bila suspicion masih di tier sama', () => {
    const result = evaluateTier(saveWith({ suspicion: 10 }), {
      config: BALANCE,
      now: NOW,
      sourceId: null,
    });

    expect(result.change.changed).toBe(false);
    expect(result.change.direction).toBe('none');
    expect(result.save.violations).toHaveLength(0);
  });

  it('naik ke watch mencatat peringatan tanpa denda', () => {
    const result = evaluateTier(saveWith({ suspicion: 35, tier: 'safe' }), {
      config: BALANCE,
      now: NOW,
      sourceId: 'chirper',
    });

    expect(result.change.changed).toBe(true);
    expect(result.change.direction).toBe('up');
    expect(result.change.to).toBe('watch');
    expect(result.change.fineApplied).toBe(0);
    expect(result.save.violations).toHaveLength(1);
    expect(result.save.violations[0]!.kind).toBe('warning');
  });

  it('naik ke hot menerapkan denda + shadowban', () => {
    const result = evaluateTier(saveWith({ suspicion: 62, tier: 'watch' }), {
      config: BALANCE,
      now: NOW,
      sourceId: 'chirper',
    });

    const hot = BALANCE.riskTiers.find((tier) => tier.id === 'hot')!;
    expect(result.change.fineApplied).toBe(hot.autoFineOnEnter);
    expect(result.save.social.shadowbannedUntil).toBe(NOW + hot.shadowbanMs);

    const kinds = result.save.violations.map((violation) => violation.kind);
    expect(kinds).toContain('fine');
    expect(kinds).toContain('shadowban');
  });

  it('denda otomatis tercatat sebagai transaksi', () => {
    const result = evaluateTier(saveWith({ suspicion: 62, tier: 'watch' }), {
      config: BALANCE,
      now: NOW,
      sourceId: null,
    });

    const fine = result.save.transactions.find((txn) => txn.type === 'campaign_fine');
    expect(fine).toBeDefined();
    expect(fine!.amount).toBeLessThan(0);
  });

  it('idempoten: evaluasi ulang pada tier sama tidak menagih denda lagi', () => {
    const first = evaluateTier(saveWith({ suspicion: 62, tier: 'watch' }), {
      config: BALANCE,
      now: NOW,
      sourceId: null,
    });

    const second = evaluateTier(first.save, {
      config: BALANCE,
      now: NOW + 1000,
      sourceId: null,
    });

    expect(second.change.changed).toBe(false);
    expect(second.change.fineApplied).toBe(0);
    expect(second.save.violations).toHaveLength(first.save.violations.length);
    expect(
      second.save.transactions.filter((txn) => txn.type === 'campaign_fine'),
    ).toHaveLength(1);
  });

  it('turun tier tidak memberi penalti', () => {
    const result = evaluateTier(saveWith({ suspicion: 10, tier: 'hot' }), {
      config: BALANCE,
      now: NOW,
      sourceId: null,
    });

    expect(result.change.changed).toBe(true);
    expect(result.change.direction).toBe('down');
    expect(result.change.fineApplied).toBe(0);
    expect(result.save.violations).toHaveLength(0);
  });

  it('critical menyita aset bila tersedia', () => {
    const result = evaluateTier(
      saveWith({ suspicion: 92, tier: 'hot', vehicleIds: ['vehicle-sport'] }),
      { config: BALANCE, now: NOW, sourceId: null },
    );

    expect(result.change.seized).toEqual({ kind: 'vehicle', id: 'vehicle-sport' });
    expect(result.save.assets.vehicleIds).toHaveLength(0);
    expect(result.save.violations.some((violation) => violation.kind === 'seizure')).toBe(true);
  });

  it('critical tanpa aset memberi restriction, bukan crash', () => {
    const result = evaluateTier(saveWith({ suspicion: 92, tier: 'hot' }), {
      config: BALANCE,
      now: NOW,
      sourceId: null,
    });

    expect(result.change.seized).toBeNull();
    expect(result.save.violations.some((violation) => violation.kind === 'restriction')).toBe(true);
  });

  it('denda boleh membuat saldo negatif (utang)', () => {
    const save = saveWith({ suspicion: 92, tier: 'hot' });
    const poor = { ...save, player: { ...save.player, money: 10 } };

    const result = evaluateTier(poor, { config: BALANCE, now: NOW, sourceId: null });
    expect(result.save.player.money).toBeLessThan(0);
  });

  it('tidak memutasi save asli', () => {
    const save = saveWith({ suspicion: 62, tier: 'watch' });
    const before = JSON.stringify(save);
    evaluateTier(save, { config: BALANCE, now: NOW, sourceId: null });
    expect(JSON.stringify(save)).toBe(before);
  });
});

describe('selectSeizableAsset', () => {
  it('null bila tidak ada aset', () => {
    expect(selectSeizableAsset(saveWith(), BALANCE)).toBeNull();
  });

  it('memilih dari properti bila ada', () => {
    const result = selectSeizableAsset(saveWith({ propertyIds: ['property-house'] }), BALANCE);
    expect(result).toEqual({ kind: 'property', id: 'property-house' });
  });

  it('prioritas kendaraan terakhir (placeholder termahal)', () => {
    const result = selectSeizableAsset(
      saveWith({ propertyIds: ['property-house'], vehicleIds: ['vehicle-city'] }),
      BALANCE,
    );
    expect(result?.kind).toBe('vehicle');
  });
});

describe('applySuspicionDecay', () => {
  it('tidak menurunkan suspicion sebelum grace period', () => {
    const save = saveWith({ suspicion: 50, lastPostAt: NOW - 60_000 });
    const result = applySuspicionDecay(save, BALANCE, NOW);
    expect(result.accounts[0]!.suspicion).toBe(50);
  });

  it('menurunkan suspicion setelah grace period', () => {
    const longRest = BALANCE.posting.decayGraceMs + 10 * 60_000;
    const save = saveWith({ suspicion: 50, lastPostAt: NOW - longRest });
    const result = applySuspicionDecay(save, BALANCE, NOW);

    expect(result.accounts[0]!.suspicion).toBeLessThan(50);
    expect(result.accounts[0]!.suspicion).toBeGreaterThanOrEqual(0);
  });

  it('tidak pernah di bawah 0', () => {
    const veryLong = 10 * 60 * 60 * 1000;
    const save = saveWith({ suspicion: 5, lastPostAt: NOW - veryLong });
    const result = applySuspicionDecay(save, BALANCE, NOW);
    expect(result.accounts[0]!.suspicion).toBe(0);
  });

  it('tidak melakukan apa pun bila belum pernah posting', () => {
    const save = saveWith({ suspicion: 40, lastPostAt: null });
    const result = applySuspicionDecay(save, BALANCE, NOW);
    expect(result).toBe(save);
  });

  it('decay + evaluateTier menurunkan tier saat cukup istirahat', () => {
    const longRest = BALANCE.posting.decayGraceMs + 60 * 60_000;
    const save = saveWith({ suspicion: 65, tier: 'hot', lastPostAt: NOW - longRest });

    const decayed = applySuspicionDecay(save, BALANCE, NOW);
    const evaluated = evaluateTier(decayed, { config: BALANCE, now: NOW, sourceId: null });

    expect(evaluated.change.direction).toBe('down');
    expect(evaluated.save.violations).toHaveLength(0);
  });
});

describe('id pelanggaran', () => {
  it('memakai prefix vio', () => {
    expect(createId('violation', NOW).startsWith('vio_')).toBe(true);
  });
});

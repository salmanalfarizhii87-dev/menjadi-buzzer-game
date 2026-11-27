import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import {
  applyShadowban,
  clearExpiredShadowban,
  isShadowbanned,
  shadowbanEffects,
  shadowbanRemainingMs,
} from './shadowban';

const NOW = 1_700_000_000_000;

function social(overrides: Partial<{ shadowbannedUntil: number | null }> = {}) {
  const save = createInitialSave(BALANCE, NOW);
  return { ...save.social, ...overrides };
}

describe('isShadowbanned', () => {
  it('false bila belum pernah', () => {
    expect(isShadowbanned(social(), NOW)).toBe(false);
  });

  it('true selama durasi berjalan', () => {
    expect(isShadowbanned(social({ shadowbannedUntil: NOW + 60_000 }), NOW)).toBe(true);
  });

  it('false tepat saat berakhir', () => {
    expect(isShadowbanned(social({ shadowbannedUntil: NOW }), NOW)).toBe(false);
  });
});

describe('shadowbanRemainingMs', () => {
  it('menghitung sisa', () => {
    expect(shadowbanRemainingMs(social({ shadowbannedUntil: NOW + 5000 }), NOW)).toBe(5000);
  });

  it('tidak negatif', () => {
    expect(shadowbanRemainingMs(social({ shadowbannedUntil: NOW - 5000 }), NOW)).toBe(0);
  });
});

describe('applyShadowban', () => {
  it('mengatur waktu berakhir', () => {
    const next = applyShadowban(social(), NOW, 10_000);
    expect(next.shadowbannedUntil).toBe(NOW + 10_000);
  });

  it('tidak memperpendek durasi yang sedang berjalan', () => {
    const active = social({ shadowbannedUntil: NOW + 60_000 });
    const next = applyShadowban(active, NOW, 10_000);
    expect(next.shadowbannedUntil).toBe(NOW + 60_000);
  });

  it('memperpanjang bila durasi baru lebih panjang', () => {
    const active = social({ shadowbannedUntil: NOW + 10_000 });
    const next = applyShadowban(active, NOW, 60_000);
    expect(next.shadowbannedUntil).toBe(NOW + 60_000);
  });

  it('durasi 0 tidak mengubah apa pun', () => {
    const base = social();
    expect(applyShadowban(base, NOW, 0)).toBe(base);
  });

  it('tidak memutasi input', () => {
    const base = social();
    applyShadowban(base, NOW, 10_000);
    expect(base.shadowbannedUntil).toBeNull();
  });
});

describe('clearExpiredShadowban', () => {
  it('menghapus penanda yang sudah lewat', () => {
    const next = clearExpiredShadowban(social({ shadowbannedUntil: NOW - 1 }), NOW);
    expect(next.shadowbannedUntil).toBeNull();
  });

  it('mempertahankan yang masih aktif', () => {
    const active = social({ shadowbannedUntil: NOW + 10_000 });
    expect(clearExpiredShadowban(active, NOW)).toBe(active);
  });
});

describe('shadowbanEffects', () => {
  it('meniadakan followers dan memotong uang', () => {
    const effects = shadowbanEffects(BALANCE);
    expect(effects.followersMultiplier).toBe(0);
    expect(effects.moneyMultiplier).toBe(BALANCE.posting.shadowbanRewardMultiplier);
    expect(effects.moneyMultiplier).toBeLessThan(1);
  });
});

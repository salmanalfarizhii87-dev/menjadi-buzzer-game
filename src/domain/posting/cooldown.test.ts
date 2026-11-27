import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import {
  cooldownRemainingMs,
  formatCooldown,
  getCooldownState,
  isOnCooldown,
} from './cooldown';

const NOW = 1_700_000_000_000;

function social(overrides: Partial<{ cooldownUntil: number | null }> = {}) {
  const save = createInitialSave(BALANCE, NOW);
  return { ...save.social, ...overrides };
}

describe('isOnCooldown', () => {
  it('false bila belum pernah posting', () => {
    expect(isOnCooldown(social(), NOW)).toBe(false);
  });

  it('true sebelum cooldown berakhir', () => {
    expect(isOnCooldown(social({ cooldownUntil: NOW + 30_000 }), NOW)).toBe(true);
  });

  it('false tepat saat cooldown berakhir', () => {
    expect(isOnCooldown(social({ cooldownUntil: NOW }), NOW)).toBe(false);
  });

  it('false setelah cooldown lewat', () => {
    expect(isOnCooldown(social({ cooldownUntil: NOW - 1 }), NOW)).toBe(false);
  });
});

describe('cooldownRemainingMs', () => {
  it('menghitung sisa waktu', () => {
    expect(cooldownRemainingMs(social({ cooldownUntil: NOW + 12_000 }), NOW)).toBe(12_000);
  });

  it('tidak pernah negatif', () => {
    expect(cooldownRemainingMs(social({ cooldownUntil: NOW - 99_000 }), NOW)).toBe(0);
  });
});

describe('getCooldownState', () => {
  it('progress 1 saat selesai', () => {
    const state = getCooldownState(social(), BALANCE, NOW);
    expect(state.active).toBe(false);
    expect(state.progress).toBe(1);
  });

  it('progress 0 tepat setelah posting', () => {
    const state = getCooldownState(
      social({ cooldownUntil: NOW + BALANCE.posting.cooldownMs }),
      BALANCE,
      NOW,
    );
    expect(state.active).toBe(true);
    expect(state.progress).toBeCloseTo(0, 5);
  });

  it('progress separuh di tengah cooldown', () => {
    const half = BALANCE.posting.cooldownMs / 2;
    const state = getCooldownState(
      social({ cooldownUntil: NOW + half }),
      BALANCE,
      NOW,
    );
    expect(state.progress).toBeCloseTo(0.5, 2);
  });
});

describe('formatCooldown', () => {
  it('detik saja di bawah satu menit', () => {
    expect(formatCooldown(9_000)).toBe('9s');
  });

  it('menit + detik di atas satu menit', () => {
    expect(formatCooldown(65_000)).toBe('1m 05s');
  });

  it('aman untuk nilai nol/negatif', () => {
    expect(formatCooldown(0)).toBe('0s');
    expect(formatCooldown(-5000)).toBe('0s');
  });
});

import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import {
  getTierConfig,
  isTierDown,
  isTierUp,
  nextWorseTier,
  suspicionToNextTier,
  tierForSuspicion,
} from './tier';

describe('tierForSuspicion', () => {
  it('memetakan nilai batas dengan benar', () => {
    expect(tierForSuspicion(0, BALANCE)).toBe('safe');
    expect(tierForSuspicion(29, BALANCE)).toBe('safe');
    expect(tierForSuspicion(30, BALANCE)).toBe('watch');
    expect(tierForSuspicion(59, BALANCE)).toBe('watch');
    expect(tierForSuspicion(60, BALANCE)).toBe('hot');
    expect(tierForSuspicion(84, BALANCE)).toBe('hot');
    expect(tierForSuspicion(85, BALANCE)).toBe('critical');
    expect(tierForSuspicion(100, BALANCE)).toBe('critical');
  });

  it('menangani nilai ekstrem dan non-finite', () => {
    expect(tierForSuspicion(-50, BALANCE)).toBe('safe');
    expect(tierForSuspicion(999, BALANCE)).toBe('critical');
    expect(tierForSuspicion(Number.NaN, BALANCE)).toBe('safe');
  });

  it('monoton: naik suspicion tidak pernah menurunkan tier', () => {
    const order = ['safe', 'watch', 'hot', 'critical'];
    let lastIndex = 0;
    for (let suspicion = 0; suspicion <= 100; suspicion += 1) {
      const index = order.indexOf(tierForSuspicion(suspicion, BALANCE));
      expect(index).toBeGreaterThanOrEqual(lastIndex);
      lastIndex = index;
    }
  });
});

describe('getTierConfig', () => {
  it('mengembalikan konfigurasi sesuai tier', () => {
    expect(getTierConfig(BALANCE, 'hot').id).toBe('hot');
  });

  it('jatuh ke tier pertama untuk ID tidak dikenal', () => {
    expect(getTierConfig(BALANCE, 'apocalypse' as never)).toBeDefined();
  });
});

describe('perbandingan tier', () => {
  it('isTierUp benar hanya untuk kenaikan', () => {
    expect(isTierUp('safe', 'watch')).toBe(true);
    expect(isTierUp('hot', 'critical')).toBe(true);
    expect(isTierUp('watch', 'safe')).toBe(false);
    expect(isTierUp('hot', 'hot')).toBe(false);
  });

  it('isTierDown benar hanya untuk penurunan', () => {
    expect(isTierDown('critical', 'watch')).toBe(true);
    expect(isTierDown('safe', 'hot')).toBe(false);
  });
});

describe('nextWorseTier', () => {
  it('mengembalikan tier berikutnya', () => {
    expect(nextWorseTier('safe', BALANCE)).toBe('watch');
    expect(nextWorseTier('watch', BALANCE)).toBe('hot');
    expect(nextWorseTier('hot', BALANCE)).toBe('critical');
  });

  it('null pada tier terburuk', () => {
    expect(nextWorseTier('critical', BALANCE)).toBeNull();
  });
});

describe('suspicionToNextTier', () => {
  it('menghitung sisa menuju tier berikutnya', () => {
    const result = suspicionToNextTier(10, BALANCE);
    expect(result).toEqual({ tier: 'watch', remaining: 20 });
  });

  it('menghitung sisa pada tier panas', () => {
    const result = suspicionToNextTier(70, BALANCE);
    expect(result).toEqual({ tier: 'critical', remaining: 15 });
  });

  it('null saat sudah kritis', () => {
    expect(suspicionToNextTier(95, BALANCE)).toBeNull();
  });
});

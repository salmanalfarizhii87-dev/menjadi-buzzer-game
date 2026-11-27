import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { applyPenalty } from './apply';
import { fineFor, penaltyProfileFor } from './profiles';

const standard = penaltyProfileFor(BALANCE, 'standard');
const lenient = penaltyProfileFor(BALANCE, 'lenient');

describe('penaltyProfileFor', () => {
  it('mengembalikan profil sesuai id', () => {
    expect(penaltyProfileFor(BALANCE, 'severe').fineRatio).toBeGreaterThan(standard.fineRatio);
  });

  it('jatuh ke standard bila id tidak dikenal', () => {
    expect(penaltyProfileFor(BALANCE, 'tidak-ada')).toEqual(standard);
  });
});

describe('fineFor', () => {
  it('memakai persentase bila di atas batas bawah', () => {
    expect(fineFor(1000, standard)).toBe(120);
  });

  it('memakai batas bawah untuk pembayaran kecil', () => {
    expect(fineFor(100, standard)).toBe(standard.fineFloor);
  });
});

describe('applyPenalty', () => {
  it('mengembalikan denda dan delta dari profil', () => {
    const result = applyPenalty(standard, 500, BALANCE);
    expect(result.fine).toBe(60);
    expect(result.reputationDelta).toBe(standard.reputationDelta);
    expect(result.suspicionDelta).toBe(standard.suspicionDelta);
    expect(result.status).toBeNull();
  });

  it('profil lenient lebih ringan dari severe', () => {
    const soft = applyPenalty(lenient, 500, BALANCE);
    const hard = applyPenalty(penaltyProfileFor(BALANCE, 'severe'), 500, BALANCE);
    expect(soft.fine).toBeLessThan(hard.fine);
    expect(soft.suspicionDelta).toBeLessThan(hard.suspicionDelta);
  });
});

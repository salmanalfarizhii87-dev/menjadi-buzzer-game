import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { composePhoto } from './photo';

describe('composePhoto', () => {
  it('memakai ukuran foto dari config', () => {
    const composition = composePhoto(BALANCE);
    expect(composition.width).toBe(BALANCE.travel.photoWidth);
    expect(composition.height).toBe(BALANCE.travel.photoHeight);
  });

  it('menempatkan karakter dan landmark di dalam kanvas', () => {
    const composition = composePhoto(BALANCE);
    const characterHeight = (composition.characterSize * 140) / 120;

    expect(composition.characterX).toBeGreaterThanOrEqual(0);
    expect(composition.characterY + characterHeight).toBeLessThanOrEqual(composition.height);
    expect(composition.landmarkX).toBeGreaterThan(0);
    expect(composition.landmarkY).toBeGreaterThan(0);
    expect(composition.landmarkScale).toBeGreaterThan(0);
  });
});

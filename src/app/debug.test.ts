import { describe, expect, it } from 'vitest';
import { readDebugOptions } from './debug';

describe('readDebugOptions', () => {
  it('nonaktif di produksi', () => {
    expect(readDebugOptions('?debug=1&roll=0', false)).toEqual({
      enabled: false,
      roll: null,
      seed: null,
    });
  });

  it('nonaktif tanpa ?debug=1', () => {
    expect(readDebugOptions('?roll=0', true).enabled).toBe(false);
  });

  it('membaca roll dan seed', () => {
    const options = readDebugOptions('?debug=1&roll=0.25&seed=42', true);
    expect(options).toEqual({ enabled: true, roll: 0.25, seed: 42 });
  });

  it('meng-clamp roll ke 0..1', () => {
    expect(readDebugOptions('?debug=1&roll=2', true).roll).toBe(1);
    expect(readDebugOptions('?debug=1&roll=-1', true).roll).toBe(0);
  });

  it('mengabaikan nilai tidak valid', () => {
    expect(readDebugOptions('?debug=1&roll=abc&seed=1.5', true)).toEqual({
      enabled: true,
      roll: null,
      seed: null,
    });
  });
});

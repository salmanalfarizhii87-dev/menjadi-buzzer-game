import { describe, expect, it } from 'vitest';
import { cryptoRandom, seededRandom } from './random';

describe('seededRandom', () => {
  it('deterministik untuk seed yang sama', () => {
    const a = seededRandom(123);
    const b = seededRandom(123);
    const first = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(first);
  });

  it('menghasilkan nilai di 0..1', () => {
    const next = seededRandom(999);
    for (let index = 0; index < 100; index += 1) {
      const value = next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('seed berbeda memberi urutan berbeda', () => {
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });
});

describe('cryptoRandom', () => {
  it('berada di 0..1', () => {
    for (let index = 0; index < 50; index += 1) {
      const value = cryptoRandom();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

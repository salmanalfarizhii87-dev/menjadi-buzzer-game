/**
 * Sumber acak untuk resolusi kampanye.
 *
 * `cryptoRandom` dipakai di produksi; `seededRandom` deterministik untuk test
 * dan replay. Roll disimpan di result snapshot, jadi layar hasil tidak pernah
 * melakukan roll ulang.
 */

export type RandomSource = () => number;

export function cryptoRandom(): number {
  const cryptoObj = globalThis.crypto;

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const buffer = new Uint32Array(1);
    cryptoObj.getRandomValues(buffer);
    return buffer[0]! / 0x1_0000_0000;
  }

  return Math.random();
}

/** Mulberry32: cukup untuk test, bukan untuk kriptografi. */
export function seededRandom(seed: number): RandomSource {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}

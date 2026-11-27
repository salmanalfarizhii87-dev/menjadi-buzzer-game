/**
 * Sumber acak untuk seed kampanye. Domain tetap pure: seed dibuat di
 * application layer lalu diteruskan sebagai argumen.
 */

export function randomSeed(): number {
  const cryptoObj = globalThis.crypto;

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const buffer = new Uint32Array(1);
    cryptoObj.getRandomValues(buffer);
    return buffer[0]! >>> 0;
  }

  return Math.floor(Math.random() * 0xffff_ffff) >>> 0;
}

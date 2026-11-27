/**
 * ID stabil untuk entity game. Prefix memudahkan debugging saat membaca save.
 */

export const ID_PREFIX = {
  player: 'player',
  account: 'acct',
  upgrade: 'upg',
  session: 'sess',
  campaign: 'cmp',
  transaction: 'txn',
  violation: 'vio',
  post: 'post',
} as const;

export type IdPrefix = keyof typeof ID_PREFIX;
export type IdPrefixValue = (typeof ID_PREFIX)[IdPrefix];

let counter = 0;

function randomSuffix(length = 8): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  let out = '';
  const cryptoObj = globalThis.crypto;

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);
    for (const byte of bytes) out += alphabet[byte % alphabet.length];
    return out;
  }

  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/**
 * ID deterministik per pemanggilan: prefix + timestamp + urutan + suffix acak.
 * Tidak dijamin unik lintas mesin, cukup untuk single-player lokal.
 */
export function createId(kind: IdPrefix, now: number = Date.now()): string {
  counter = (counter + 1) % 1_000_000;
  return `${ID_PREFIX[kind]}_${now.toString(36)}${counter.toString(36).padStart(3, '0')}${randomSuffix(4)}`;
}

/** Untuk test: reset penghitung agar ID dapat diprediksi. */
export function resetIdCounter(): void {
  counter = 0;
}

export function isIdOf(value: string, kind: IdPrefix): boolean {
  return value.startsWith(`${ID_PREFIX[kind]}_`);
}

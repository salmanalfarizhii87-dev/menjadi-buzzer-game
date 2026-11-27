/**
 * Clock abstraction agar seluruh perhitungan waktu bisa diuji dengan waktu palsu.
 * Domain tidak boleh memanggil `Date.now()` langsung.
 */

export interface Clock {
  now(): number;
}

export const systemClock: Clock = {
  now: () => Date.now(),
};

/** Clock yang bisa dimajukan manual — khusus test. */
export function createFakeClock(start: number): Clock & { advance(ms: number): void; set(ms: number): void } {
  let current = start;
  return {
    now: () => current,
    advance(ms: number) {
      current += ms;
    },
    set(ms: number) {
      current = ms;
    },
  };
}

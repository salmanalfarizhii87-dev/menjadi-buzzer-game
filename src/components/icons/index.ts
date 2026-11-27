import { circle, icon, path } from '@/core/svg';

/** Ikon UI. Semua 24×24, stroke currentColor. */

export const icons = {
  home: () => icon([path({ d: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5' })]),
  account: () =>
    icon([
      path({ d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
      path({ d: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' }),
    ]),
  automation: () =>
    icon([
      path({ d: 'M12 2v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M2 12h3m14 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1' }),
      path({ d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' }),
    ]),
  campaigns: () =>
    icon([
      path({ d: 'M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z' }),
      path({ d: 'M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13' }),
    ]),
  finance: () =>
    icon([
      path({ d: 'M3 6h18v12H3z' }),
      path({ d: 'M3 10h18M7 15h3' }),
    ]),
  back: () => icon([path({ d: 'M15 18l-6-6 6-6' })]),
  close: () => icon([path({ d: 'M18 6 6 18M6 6l12 12' })]),
  chevronRight: () => icon([path({ d: 'm9 18 6-6-6-6' })]),
  arrowUp: () => icon([path({ d: 'M12 19V5m0 0-6 6m6-6 6 6' })]),
  arrowDown: () => icon([path({ d: 'M12 5v14m0 0 6-6m-6 6-6-6' })]),
  users: () =>
    icon([
      path({ d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
      path({ d: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' }),
      path({ d: 'M22 21v-2a4 4 0 0 0-3-3.9' }),
    ]),
  spark: () =>
    icon([
      path({ d: 'M12 3v4m0 10v4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8M3 12h4m10 0h4M5.6 18.4l2.8-2.8m7.2-7.2 2.8-2.8' }),
    ]),
  shield: () =>
    icon([
      path({ d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z' }),
      path({ d: 'm9 12 2 2 4-4' }),
    ]),
  alert: () =>
    icon([
      path({ d: 'M12 9v4m0 4h.01' }),
      path({ d: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z' }),
    ]),
  check: () => icon([path({ d: 'm5 13 4 4L19 7' })]),
  coin: () =>
    icon([
      path({ d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z' }),
      path({ d: 'M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4' }),
    ]),
  trophy: () =>
    icon([
      path({ d: 'M8 21h8M12 17v4' }),
      path({ d: 'M7 4h10v5a5 5 0 0 1-10 0V4Z' }),
      path({ d: 'M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3' }),
    ]),
  clock: () =>
    icon([
      path({ d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z' }),
      path({ d: 'M12 7v5l3 2' }),
    ]),
  phone: () =>
    icon([
      path({ d: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z' }),
      path({ d: 'M11 18h2' }),
    ]),
  shop: () =>
    icon([
      path({ d: 'M3 9h18l-1.5-5H4.5L3 9Z' }),
      path({ d: 'M5 9v11h14V9' }),
      path({ d: 'M9 20v-6h6v6' }),
    ]),
  chart: () =>
    icon([
      path({ d: 'M4 20V10M10 20V4M16 20v-7M22 20H2' }),
    ]),
  wallet: () =>
    icon([
      path({ d: 'M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z' }),
      path({ d: 'M3 7V5a2 2 0 0 1 2-2h11' }),
      path({ d: 'M17 13h.01' }),
    ]),
  plane: () =>
    icon([
      path({ d: 'M10 19l2-7 8-3-8-3-2-7-2 7-8 3 8 3 2 7Z' }),
    ]),
  camera: () =>
    icon([
      path({ d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Z' }),
      circle({ cx: 12, cy: 13, r: 4 }),
    ]),
  flag: () =>
    icon([
      path({ d: 'M4 22V4M4 4h12l-2 4 2 4H4' }),
    ]),
  shirt: () =>
    icon([
      path({ d: 'M8 3 4 5 2 9l3 2 2-1v11h10V10l2 1 3-2-2-4-4-2-2 2h-4L8 3Z' }),
    ]),
  house: () =>
    icon([
      path({ d: 'M3 11 12 3l9 8' }),
      path({ d: 'M5 10v11h14V10' }),
      path({ d: 'M10 21v-6h4v6' }),
    ]),
  car: () =>
    icon([
      path({ d: 'M4 16v-3l2-4h12l2 4v3' }),
      path({ d: 'M4 16h16v3H4z' }),
      circle({ cx: 7, cy: 19, r: 1.5 }),
      circle({ cx: 17, cy: 19, r: 1.5 }),
    ]),
  ticket: () =>
    icon([
      path({ d: 'M3 8h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V8Z' }),
      path({ d: 'M14 8v10' }),
    ]),
  /** Ikon app sosial fiktif. */
  appChirper: () =>
    icon([
      path({ d: 'M20 4c-2 1-3.5 1.5-6 1.5C10 5.5 7 8 7 12v1H4l2 3v2a4 4 0 0 0 4 4c5 0 10-4 10-12V4Z' }),
      path({ d: 'M9 12h4' }),
    ]),
  appPulse: () =>
    icon([
      path({ d: 'M2 12h4l2-6 4 12 3-8 2 2h5' }),
    ]),
  appLoop: () =>
    icon([
      path({ d: 'M17 2l4 4-4 4' }),
      path({ d: 'M3 11V9a4 4 0 0 1 4-4h14' }),
      path({ d: 'M7 22l-4-4 4-4' }),
      path({ d: 'M21 13v2a4 4 0 0 1-4 4H3' }),
    ]),
};

export type IconName = keyof typeof icons;

/**
 * Karakter placeholder (SVG original). Layer terpisah agar nanti bisa
 * dikembangkan menjadi sistem modular. Bukan aset final.
 */

import { circle, ellipse, g, path, rect, svg } from '@/core/svg';

export interface PlayerCharacterOptions {
  size?: number;
  /** Ekspresi sederhana; belum dipakai di MVP. */
  mood?: 'neutral' | 'happy';
}

export function playerCharacter(options: PlayerCharacterOptions = {}): SVGSVGElement {
  const { size = 120, mood = 'neutral' } = options;

  return svg(
    {
      viewBox: '0 0 120 140',
      width: size,
      height: (size * 140) / 120,
      role: 'img',
      ariaLabel: 'Karakter pemain',
      class: 'player-character',
    },
    [
      // Bayangan lantai
      ellipse({ cx: 60, cy: 132, rx: 30, ry: 6, fill: 'rgb(63 44 21 / 12%)' }),

      // Badan / jaket
      g({}, [
        path({
          d: 'M36 78h48a10 10 0 0 1 10 10v34a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V88a10 10 0 0 1 10-10Z',
          fill: '#2f9e8f',
          stroke: '#6b4e2e',
          strokeWidth: 3,
        }),
        // Kerah
        path({
          d: 'M52 78l8 12 8-12',
          fill: 'none',
          stroke: '#fffaf0',
          strokeWidth: 3,
          strokeLinecap: 'round',
        }),
        // Lencana
        circle({ cx: 44, cy: 100, r: 5, fill: '#e8a33d', stroke: '#6b4e2e', strokeWidth: 2 }),
      ]),

      // Kepala
      g({}, [
        circle({ cx: 60, cy: 54, r: 26, fill: '#f7d9b8', stroke: '#6b4e2e', strokeWidth: 3 }),
        // Rambut
        path({
          d: 'M34 50c0-16 11-26 26-26s26 10 26 26c0 2-1 4-2 5-2-9-9-14-24-14s-22 5-24 14c-1-1-2-3-2-5Z',
          fill: '#3f2c15',
          stroke: '#6b4e2e',
          strokeWidth: 3,
        }),
        // Mata
        circle({ cx: 51, cy: 55, r: 3.2, fill: '#3f2c15' }),
        circle({ cx: 69, cy: 55, r: 3.2, fill: '#3f2c15' }),
        // Mulut
        mood === 'happy'
          ? path({
              d: 'M52 65c3 5 13 5 16 0',
              fill: 'none',
              stroke: '#6b4e2e',
              strokeWidth: 2.5,
              strokeLinecap: 'round',
            })
          : path({
              d: 'M54 65h12',
              fill: 'none',
              stroke: '#6b4e2e',
              strokeWidth: 2.5,
              strokeLinecap: 'round',
            }),
        // Pipi
        ellipse({ cx: 43, cy: 61, rx: 4, ry: 2.6, fill: '#f0b39a', opacity: 0.7 }),
        ellipse({ cx: 77, cy: 61, rx: 4, ry: 2.6, fill: '#f0b39a', opacity: 0.7 }),
      ]),

      // Ponsel di tangan
      g({}, [
        rect({
          x: 84,
          y: 96,
          width: 18,
          height: 26,
          rx: 4,
          fill: '#fffaf0',
          stroke: '#6b4e2e',
          strokeWidth: 2.5,
          transform: 'rotate(12 93 109)',
        }),
        rect({
          x: 88,
          y: 101,
          width: 10,
          height: 12,
          rx: 2,
          fill: '#4a8fd4',
          transform: 'rotate(12 93 109)',
        }),
      ]),
    ],
  );
}

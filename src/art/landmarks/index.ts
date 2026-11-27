/**
 * Landmark original per negara, digambar dengan bentuk SVG sederhana.
 * Dipakai sebagai thumbnail Travel dan bagian dari komposisi foto.
 */

import { circle, g, line, path, polygon, rect, svg, type SvgChild } from '@/core/svg';

interface Palette {
  base: string;
  dark: string;
  accent: string;
  roof: string;
}

const PALETTES: Record<string, Palette> = {
  nusantara: { base: '#c98a5a', dark: '#6b4426', accent: '#f2c46d', roof: '#a34b32' },
  belanda: { base: '#b86450', dark: '#5a2c24', accent: '#e8d5b0', roof: '#7a3a2e' },
  jepang: { base: '#c4453d', dark: '#6b211d', accent: '#f4e3c6', roof: '#8f2f29' },
  korea: { base: '#4f8a83', dark: '#244a46', accent: '#f0cf86', roof: '#2f5f5a' },
  prancis: { base: '#6f7076', dark: '#33353a', accent: '#d9b26a', roof: '#4a4b51' },
};

const FALLBACK = PALETTES['nusantara']!;

function palette(id: string): Palette {
  return PALETTES[id] ?? FALLBACK;
}

function nusantara(): SvgChild[] {
  const p = palette('nusantara');
  return [
    line({ x1: 76, y1: 126, x2: 78, y2: 152, stroke: p.dark, strokeWidth: 6 }),
    line({ x1: 124, y1: 126, x2: 122, y2: 152, stroke: p.dark, strokeWidth: 6 }),
    rect({ x: 64, y: 78, width: 72, height: 50, rx: 4, fill: p.base, stroke: p.dark, strokeWidth: 4 }),
    polygon({ points: '54,80 100,36 146,80', fill: p.roof, stroke: p.dark, strokeWidth: 4 }),
    rect({ x: 92, y: 102, width: 16, height: 26, fill: p.dark }),
    rect({ x: 72, y: 88, width: 14, height: 14, fill: p.accent, stroke: p.dark, strokeWidth: 2 }),
    rect({ x: 114, y: 88, width: 14, height: 14, fill: p.accent, stroke: p.dark, strokeWidth: 2 }),
  ];
}

function belanda(): SvgChild[] {
  const p = palette('belanda');
  return [
    rect({ x: 70, y: 146, width: 60, height: 8, rx: 2, fill: p.dark }),
    polygon({ points: '80,146 120,146 110,62 90,62', fill: p.base, stroke: p.dark, strokeWidth: 4 }),
    circle({ cx: 100, cy: 56, r: 10, fill: p.roof, stroke: p.dark, strokeWidth: 3 }),
    g({ transform: 'rotate(0 100 56)' }, [
      line({ x1: 100, y1: 46, x2: 100, y2: 16, stroke: p.accent, strokeWidth: 6 }),
      line({ x1: 110, y1: 56, x2: 140, y2: 56, stroke: p.accent, strokeWidth: 6 }),
      line({ x1: 100, y1: 66, x2: 100, y2: 96, stroke: p.accent, strokeWidth: 6 }),
      line({ x1: 90, y1: 56, x2: 60, y2: 56, stroke: p.accent, strokeWidth: 6 }),
    ]),
    rect({ x: 92, y: 108, width: 16, height: 22, fill: p.dark }),
    rect({ x: 92, y: 76, width: 16, height: 12, fill: p.accent, stroke: p.dark, strokeWidth: 2 }),
  ];
}

function jepang(): SvgChild[] {
  const p = palette('jepang');
  return [
    rect({ x: 54, y: 54, width: 13, height: 96, rx: 2, fill: p.base, stroke: p.dark, strokeWidth: 3 }),
    rect({ x: 133, y: 54, width: 13, height: 96, rx: 2, fill: p.base, stroke: p.dark, strokeWidth: 3 }),
    path({
      d: 'M36 54 Q100 30 164 54 L164 66 Q100 42 36 66 Z',
      fill: p.roof,
      stroke: p.dark,
      strokeWidth: 4,
      strokeLinejoin: 'round',
    }),
    rect({ x: 62, y: 78, width: 76, height: 10, fill: p.base, stroke: p.dark, strokeWidth: 3 }),
    rect({ x: 89, y: 66, width: 22, height: 16, fill: p.accent, stroke: p.dark, strokeWidth: 2 }),
    line({ x1: 100, y1: 66, x2: 100, y2: 150, stroke: p.dark, strokeWidth: 2, opacity: 0.35 }),
  ];
}

function korea(): SvgChild[] {
  const p = palette('korea');
  return [
    rect({ x: 54, y: 100, width: 92, height: 50, rx: 3, fill: p.accent, stroke: p.dark, strokeWidth: 4 }),
    path({
      d: 'M34 100 Q100 46 166 100 L154 114 Q100 70 46 114 Z',
      fill: p.roof,
      stroke: p.dark,
      strokeWidth: 4,
      strokeLinejoin: 'round',
    }),
    rect({ x: 62, y: 108, width: 10, height: 42, fill: p.base, stroke: p.dark, strokeWidth: 2 }),
    rect({ x: 128, y: 108, width: 10, height: 42, fill: p.base, stroke: p.dark, strokeWidth: 2 }),
    rect({ x: 90, y: 112, width: 20, height: 38, fill: p.dark }),
    rect({ x: 76, y: 150, width: 48, height: 6, rx: 2, fill: p.base }),
  ];
}

function prancis(): SvgChild[] {
  const p = palette('prancis');
  return [
    path({
      d: 'M64 152 L92 54 L108 54 L136 152',
      fill: 'none',
      stroke: p.dark,
      strokeWidth: 9,
      strokeLinecap: 'round',
    }),
    line({ x1: 74, y1: 128, x2: 126, y2: 128, stroke: p.base, strokeWidth: 6 }),
    line({ x1: 82, y1: 102, x2: 118, y2: 102, stroke: p.base, strokeWidth: 5 }),
    line({ x1: 88, y1: 78, x2: 112, y2: 78, stroke: p.base, strokeWidth: 4 }),
    path({
      d: 'M84 152 Q100 126 116 152',
      fill: 'none',
      stroke: p.accent,
      strokeWidth: 5,
    }),
    line({ x1: 100, y1: 54, x2: 100, y2: 24, stroke: p.dark, strokeWidth: 4 }),
    circle({ cx: 100, cy: 22, r: 4, fill: p.accent }),
  ];
}

function landmarkNodes(id: string): SvgChild[] {
  switch (id) {
    case 'belanda':
      return belanda();
    case 'jepang':
      return jepang();
    case 'korea':
      return korea();
    case 'prancis':
      return prancis();
    default:
      return nusantara();
  }
}

export function landmarkGroup(id: string): SVGGElement {
  return g({}, landmarkNodes(id));
}

export function landmarkSvg(id: string, size = 96): SVGSVGElement {
  return svg(
    {
      viewBox: '0 0 200 160',
      width: size,
      height: (size * 160) / 200,
      class: 'landmark-art',
      role: 'img',
      ariaLabel: 'Landmark',
    },
    landmarkNodes(id),
  );
}

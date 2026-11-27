/**
 * Renderer karakter berbasis layer SVG. Original, bukan salinan referensi.
 *
 * Struktur: base body → shoes → outfit → hair → accessory.
 * Setiap outfit punya bentuk & warna berbeda agar terlihat saat dipakai.
 */

import { circle, ellipse, g, path, rect, svg } from '@/core/svg';
import { resolveCharacterLayers, resolveEquippedOutfit } from '@/domain/character/layers';

export interface CharacterOptions {
  size?: number;
  outfitId: string;
  accessoryIds?: string[];
  mood?: 'neutral' | 'happy';
  /** Tampilkan bayangan lantai. */
  shadow?: boolean;
}

interface OutfitPalette {
  body: string;
  bodyDark: string;
  collar: string;
  accent: string;
}

const OUTFIT_PALETTES: Record<string, OutfitPalette> = {
  'outfit-basic': {
    body: '#2f9e8f',
    bodyDark: '#26857a',
    collar: '#fffaf0',
    accent: '#e8a33d',
  },
  'outfit-casual': {
    body: '#4a8fd4',
    bodyDark: '#3b76b4',
    collar: '#fffaf0',
    accent: '#f2b233',
  },
  'outfit-formal': {
    body: '#3f3a52',
    bodyDark: '#2e2a3d',
    collar: '#fffaf0',
    accent: '#d6403a',
  },
  'outfit-luxury': {
    body: '#6b4e2e',
    bodyDark: '#4a3520',
    collar: '#e8a33d',
    accent: '#f6c76d',
  },
};

function paletteFor(outfitId: string): OutfitPalette {
  return OUTFIT_PALETTES[outfitId] ?? OUTFIT_PALETTES['outfit-basic']!;
}

/** Badan/jaket dengan bentuk berbeda per outfit agar perbedaan terlihat. */
function renderOutfitBody(outfitId: string): SVGElement[] {
  const palette = paletteFor(outfitId);
  const nodes: SVGElement[] = [];

  if (outfitId === 'outfit-formal') {
    // Jas dengan kerah lebar + dasi.
    nodes.push(
      path({
        d: 'M36 78h48a10 10 0 0 1 10 10v34a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V88a10 10 0 0 1 10-10Z',
        fill: palette.body,
        stroke: '#6b4e2e',
        strokeWidth: 3,
      }),
      path({
        d: 'M46 78l6 40M74 78l-6 40',
        fill: 'none',
        stroke: palette.bodyDark,
        strokeWidth: 3,
        strokeLinecap: 'round',
      }),
      path({
        d: 'M52 78l8 10 8-10',
        fill: palette.collar,
        stroke: '#6b4e2e',
        strokeWidth: 2.5,
        strokeLinejoin: 'round',
      }),
      path({
        d: 'M57 88h6l-3 8-3-8Z',
        fill: palette.accent,
        stroke: '#6b4e2e',
        strokeWidth: 2,
      }),
    );
    return nodes;
  }

  if (outfitId === 'outfit-luxury') {
    // Mantel dengan bulu di kerah + gesper emas.
    nodes.push(
      path({
        d: 'M34 78h52a10 10 0 0 1 10 10v36a6 6 0 0 1-6 6H30a6 6 0 0 1-6-6V88a10 10 0 0 1 10-10Z',
        fill: palette.body,
        stroke: '#6b4e2e',
        strokeWidth: 3,
      }),
      path({
        d: 'M36 78c4-6 12-6 16 0 4-6 12-6 16 0 4-6 12-6 16 0',
        fill: palette.collar,
        stroke: '#6b4e2e',
        strokeWidth: 2.5,
        strokeLinecap: 'round',
      }),
      rect({
        x: 56,
        y: 96,
        width: 8,
        height: 8,
        rx: 2,
        fill: palette.accent,
        stroke: '#6b4e2e',
        strokeWidth: 2,
      }),
    );
    return nodes;
  }

  if (outfitId === 'outfit-casual') {
    // Kaos santai dengan garis horizontal.
    nodes.push(
      path({
        d: 'M38 80h44a10 10 0 0 1 10 10v32a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V90a10 10 0 0 1 10-10Z',
        fill: palette.body,
        stroke: '#6b4e2e',
        strokeWidth: 3,
      }),
      path({
        d: 'M38 100h44M38 112h44',
        fill: 'none',
        stroke: palette.bodyDark,
        strokeWidth: 4,
        strokeLinecap: 'round',
        opacity: 0.55,
      }),
      path({
        d: 'M52 80l8 10 8-10',
        fill: 'none',
        stroke: palette.collar,
        strokeWidth: 3,
        strokeLinecap: 'round',
      }),
    );
    return nodes;
  }

  // Default: jaket dengan kerah V dan lencana.
  nodes.push(
    path({
      d: 'M36 78h48a10 10 0 0 1 10 10v34a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V88a10 10 0 0 1 10-10Z',
      fill: palette.body,
      stroke: '#6b4e2e',
      strokeWidth: 3,
    }),
    path({
      d: 'M52 78l8 12 8-12',
      fill: 'none',
      stroke: palette.collar,
      strokeWidth: 3,
      strokeLinecap: 'round',
    }),
    circle({ cx: 44, cy: 100, r: 5, fill: palette.accent, stroke: '#6b4e2e', strokeWidth: 2 }),
  );
  return nodes;
}

export function playerCharacter(options: CharacterOptions): SVGSVGElement {
  const { size = 120, outfitId, accessoryIds = [], mood = 'neutral', shadow = true } = options;
  const layers = resolveCharacterLayers(outfitId, accessoryIds);
  const outfit = resolveEquippedOutfit(outfitId);

  const groups: SVGElement[] = [];

  if (shadow) {
    groups.push(ellipse({ cx: 60, cy: 132, rx: 30, ry: 6, fill: 'rgb(63 44 21 / 12%)' }));
  }

  // Badan di belakang outfit (leher + tangan).
  groups.push(
    g({}, [
      path({
        d: 'M52 74h16v10a8 8 0 0 1-16 0V74Z',
        fill: '#f7d9b8',
        stroke: '#6b4e2e',
        strokeWidth: 2.5,
      }),
    ]),
  );

  for (const layer of layers) {
    if (layer.layer === 'outfit') {
      groups.push(g({}, renderOutfitBody(outfit.id)));
      continue;
    }

    if (layer.layer === 'hair') {
      groups.push(
        g({}, [
          path({
            d: 'M34 50c0-16 11-26 26-26s26 10 26 26c0 2-1 4-2 5-2-9-9-14-24-14s-22 5-24 14c-1-1-2-3-2-5Z',
            fill: '#3f2c15',
            stroke: '#6b4e2e',
            strokeWidth: 3,
          }),
        ]),
      );
      continue;
    }

    if (layer.layer === 'shoes') {
      groups.push(
        g({}, [
          ellipse({ cx: 48, cy: 128, rx: 8, ry: 4, fill: '#4a3520' }),
          ellipse({ cx: 72, cy: 128, rx: 8, ry: 4, fill: '#4a3520' }),
        ]),
      );
      continue;
    }

    if (layer.layer === 'accessory') {
      // Aksesori generik: kacamata sederhana.
      groups.push(
        g({}, [
          circle({ cx: 51, cy: 55, r: 7, fill: 'none', stroke: '#4a3520', strokeWidth: 2 }),
          circle({ cx: 69, cy: 55, r: 7, fill: 'none', stroke: '#4a3520', strokeWidth: 2 }),
          path({ d: 'M58 55h4', stroke: '#4a3520', strokeWidth: 2 }),
        ]),
      );
      continue;
    }
  }

  // Kepala di atas outfit (agar wajah selalu terlihat).
  groups.push(
    g({}, [
      circle({ cx: 60, cy: 54, r: 26, fill: '#f7d9b8', stroke: '#6b4e2e', strokeWidth: 3 }),
      circle({ cx: 51, cy: 55, r: 3.2, fill: '#3f2c15' }),
      circle({ cx: 69, cy: 55, r: 3.2, fill: '#3f2c15' }),
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
      ellipse({ cx: 43, cy: 61, rx: 4, ry: 2.6, fill: '#f0b39a', opacity: 0.7 }),
      ellipse({ cx: 77, cy: 61, rx: 4, ry: 2.6, fill: '#f0b39a', opacity: 0.7 }),
    ]),
  );

  // Ponsel di tangan.
  groups.push(
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
  );

  void outfit;

  return svg(
    {
      viewBox: '0 0 120 140',
      width: size,
      height: (size * 140) / 120,
      role: 'img',
      ariaLabel: 'Karakter pemain',
      class: 'player-character',
    },
    groups,
  );
}

/**
 * Aset raster Stitch. Karakter dan scene memakai PNG hasil generate,
 * bukan SVG. Path publik agar mudah diganti tanpa rebuild komponen.
 */

const OUTFIT_CLASS: Record<string, string> = {
  'outfit-basic': 'outfit-basic',
  'outfit-casual': 'outfit-casual',
  'outfit-formal': 'outfit-formal',
  'outfit-luxury': 'outfit-luxury',
};

const DEFAULT_AVATAR_IMAGE = '/assets/original/creator-chibi.png';

const AVATAR_IMAGE_BY_LABEL: Record<string, string> = {
  'Kilat Klasik': '/assets/original/creator-chibi.png',
  'Rina Strategis': '/assets/original/rina-strategis.png',
  'Bima Topi': '/assets/original/bima-topi.png',
  'Dika Streamer': '/assets/original/dika-streamer.png',
};

export function avatarImage(label: string): HTMLImageElement {
  const image = document.createElement('img');
  image.src = AVATAR_IMAGE_BY_LABEL[label] ?? DEFAULT_AVATAR_IMAGE;
  image.alt = label;
  image.className = 'stitch-avatar';
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}

export function characterImage(outfitId: string, alt = 'Karakter'): HTMLImageElement {
  const image = document.createElement('img');
  image.src = '/assets/original/creator-chibi.png';
  image.alt = alt;
  image.className = `w-full h-full object-contain object-bottom stitch-portrait ${OUTFIT_CLASS[outfitId] ?? 'outfit-basic'}`;
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}

export function sceneImage(outfitId: string, alt = 'Studio buzzer'): HTMLImageElement {
  const image = document.createElement('img');
  image.src = '/assets/original/creator-studio.png';
  image.alt = alt;
  image.className = `w-full h-full object-cover object-center scene-${OUTFIT_CLASS[outfitId] ?? 'outfit-basic'}`;
  image.decoding = 'async';
  return image;
}

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

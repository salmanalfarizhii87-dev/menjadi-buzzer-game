/**
 * Aset raster Stitch. Karakter dan scene memakai PNG hasil generate,
 * bukan SVG. Path publik agar mudah diganti tanpa rebuild komponen.
 */

const AVATAR_BY_OUTFIT: Record<string, string> = {
  'outfit-basic': '/assets/stitch/avatar-base.jpg',
  'outfit-casual': '/assets/stitch/avatar-casual.jpg',
  'outfit-formal': '/assets/stitch/avatar-formal.jpg',
  'outfit-luxury': '/assets/stitch/avatar-luxury.jpg',
};

const SCENE_BY_OUTFIT: Record<string, string> = {
  'outfit-basic': '/assets/stitch/scene-base.jpg',
  'outfit-casual': '/assets/stitch/scene-casual.jpg',
  'outfit-formal': '/assets/stitch/scene-formal.jpg',
  'outfit-luxury': '/assets/stitch/scene-luxury.jpg',
};

export function characterImage(outfitId: string, alt = 'Karakter'): HTMLImageElement {
  const image = document.createElement('img');
  image.src = AVATAR_BY_OUTFIT[outfitId] ?? AVATAR_BY_OUTFIT['outfit-basic']!;
  image.alt = alt;
  image.className = 'w-full h-full object-cover object-top stitch-portrait';
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}

export function sceneImage(outfitId: string, alt = 'Studio buzzer'): HTMLImageElement {
  const image = document.createElement('img');
  image.src = SCENE_BY_OUTFIT[outfitId] ?? SCENE_BY_OUTFIT['outfit-basic']!;
  image.alt = alt;
  image.className = 'w-full h-full object-cover object-center';
  image.decoding = 'async';
  return image;
}

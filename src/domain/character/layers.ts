/**
 * Resolusi layer karakter dari outfit yang dipakai.
 * Pure: hanya menghasilkan daftar layer terurut, tanpa menyentuh DOM.
 */

import {
  findOutfit,
  getDefaultOutfit,
  type CharacterLayerId,
  type OutfitDefinition,
} from '@/data/shop/outfits';

export interface ResolvedLayer {
  layer: CharacterLayerId;
  artId: string;
  zIndex: number;
  outfitId: string | null;
}

const BASE_LAYERS: Array<{ layer: CharacterLayerId; artId: string; zIndex: number }> = [
  { layer: 'base', artId: 'base-body', zIndex: 10 },
  { layer: 'hair', artId: 'hair-default', zIndex: 30 },
  { layer: 'shoes', artId: 'shoes-default', zIndex: 15 },
];

/**
 * Susun layer: base → shoes → outfit → hair → accessory.
 * Outfit yang tidak dikenal jatuh ke outfit default agar karakter tidak kosong.
 */
export function resolveCharacterLayers(
  outfitId: string,
  accessoryIds: readonly string[] = [],
): ResolvedLayer[] {
  const outfit: OutfitDefinition = findOutfit(outfitId) ?? getDefaultOutfit();

  const layers: ResolvedLayer[] = BASE_LAYERS.map((entry) => ({
    layer: entry.layer,
    artId: entry.artId,
    zIndex: entry.zIndex,
    outfitId: null,
  }));

  layers.push({
    layer: 'outfit',
    artId: outfit.artId,
    zIndex: outfit.zIndex,
    outfitId: outfit.id,
  });

  accessoryIds.forEach((id, index) => {
    layers.push({
      layer: 'accessory',
      artId: id,
      zIndex: 40 + index,
      outfitId: null,
    });
  });

  return layers.sort((a, b) => a.zIndex - b.zIndex);
}

/** Outfit yang dipakai saat ini, dengan fallback aman. */
export function resolveEquippedOutfit(outfitId: string): OutfitDefinition {
  return findOutfit(outfitId) ?? getDefaultOutfit();
}

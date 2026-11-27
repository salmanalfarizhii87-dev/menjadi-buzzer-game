/**
 * Katalog outfit. Layer karakter disusun dari sini.
 *
 * PLACEHOLDER — harga dan efek belum balancing final.
 * Semua art ID merujuk pada SVG original di `src/art/character/`.
 */

export type CharacterLayerId = 'base' | 'hair' | 'outfit' | 'accessory' | 'shoes';

export interface OutfitDefinition {
  id: string;
  nameKey: string;
  descKey: string;
  artId: string;
  layer: CharacterLayerId;
  /** Urutan render; makin besar makin depan. */
  zIndex: number;
  /** 0 = outfit awal, selalu dimiliki. */
  price: number;
  /** Bonus kredibilitas kecil (opsional). */
  credibilityBonus?: number;
  seizureExempt?: boolean;
}

export const OUTFITS: OutfitDefinition[] = [
  {
    id: 'outfit-basic',
    nameKey: 'outfit.basic.name',
    descKey: 'outfit.basic.desc',
    artId: 'outfit-basic',
    layer: 'outfit',
    zIndex: 20,
    price: 0,
    seizureExempt: true,
  },
  {
    id: 'outfit-casual',
    nameKey: 'outfit.casual.name',
    descKey: 'outfit.casual.desc',
    artId: 'outfit-casual',
    layer: 'outfit',
    zIndex: 20,
    price: 300,
    credibilityBonus: 2,
  },
  {
    id: 'outfit-formal',
    nameKey: 'outfit.formal.name',
    descKey: 'outfit.formal.desc',
    artId: 'outfit-formal',
    layer: 'outfit',
    zIndex: 20,
    price: 900,
    credibilityBonus: 6,
  },
  {
    id: 'outfit-luxury',
    nameKey: 'outfit.luxury.name',
    descKey: 'outfit.luxury.desc',
    artId: 'outfit-luxury',
    layer: 'outfit',
    zIndex: 20,
    price: 2500,
    credibilityBonus: 12,
  },
];

export const DEFAULT_OUTFIT_ID = 'outfit-basic';

export function findOutfit(id: string): OutfitDefinition | undefined {
  return OUTFITS.find((outfit) => outfit.id === id);
}

export function getDefaultOutfit(): OutfitDefinition {
  const found = findOutfit(DEFAULT_OUTFIT_ID);
  if (!found) throw new Error('Outfit default tidak ditemukan di katalog');
  return found;
}

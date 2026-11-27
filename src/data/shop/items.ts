/**
 * Katalog Shop 4 kategori. Outfit memakai ID yang sama dengan katalog
 * karakter; properti/kendaraan memberi bonus income; tiket membuka negara.
 *
 * PLACEHOLDER — harga dan bonus belum balancing final.
 */

import { OUTFITS } from './outfits';

export type ShopCategory = 'outfit' | 'property' | 'vehicle' | 'ticket';

export interface ShopItem {
  id: string;
  category: ShopCategory;
  nameKey: string;
  descKey: string;
  price: number;
  /** Bonus income untuk properti/kendaraan (0..1). */
  incomeMultiplier?: number;
  /** ID outfit untuk kategori outfit. */
  outfitId?: string;
  credibilityBonus?: number;
  /** ID negara untuk kategori tiket. */
  countryId?: string;
}

const OUTFIT_ITEMS: ShopItem[] = OUTFITS.map((outfit) => ({
  id: outfit.id,
  category: 'outfit',
  nameKey: outfit.nameKey,
  descKey: outfit.descKey,
  price: outfit.price,
  outfitId: outfit.id,
  ...(outfit.credibilityBonus !== undefined
    ? { credibilityBonus: outfit.credibilityBonus }
    : {}),
}));

const PROPERTY_ITEMS: ShopItem[] = [
  {
    id: 'prop-kos',
    category: 'property',
    nameKey: 'shop.prop.kos.name',
    descKey: 'shop.prop.kos.desc',
    price: 800,
    incomeMultiplier: 0.08,
  },
  {
    id: 'prop-kantor',
    category: 'property',
    nameKey: 'shop.prop.kantor.name',
    descKey: 'shop.prop.kantor.desc',
    price: 2200,
    incomeMultiplier: 0.16,
  },
  {
    id: 'prop-studio',
    category: 'property',
    nameKey: 'shop.prop.studio.name',
    descKey: 'shop.prop.studio.desc',
    price: 5200,
    incomeMultiplier: 0.28,
  },
];

const VEHICLE_ITEMS: ShopItem[] = [
  {
    id: 'veh-motor',
    category: 'vehicle',
    nameKey: 'shop.veh.motor.name',
    descKey: 'shop.veh.motor.desc',
    price: 600,
    incomeMultiplier: 0.04,
  },
  {
    id: 'veh-mobil',
    category: 'vehicle',
    nameKey: 'shop.veh.mobil.name',
    descKey: 'shop.veh.mobil.desc',
    price: 1900,
    incomeMultiplier: 0.1,
  },
  {
    id: 'veh-van',
    category: 'vehicle',
    nameKey: 'shop.veh.van.name',
    descKey: 'shop.veh.van.desc',
    price: 4200,
    incomeMultiplier: 0.18,
  },
];

const TICKET_ITEMS: ShopItem[] = [
  {
    id: 'ticket-nusantara',
    category: 'ticket',
    nameKey: 'shop.ticket.nusantara.name',
    descKey: 'shop.ticket.nusantara.desc',
    price: 0,
    countryId: 'nusantara',
  },
  {
    id: 'ticket-belanda',
    category: 'ticket',
    nameKey: 'shop.ticket.belanda.name',
    descKey: 'shop.ticket.belanda.desc',
    price: 1200,
    countryId: 'belanda',
  },
  {
    id: 'ticket-jepang',
    category: 'ticket',
    nameKey: 'shop.ticket.jepang.name',
    descKey: 'shop.ticket.jepang.desc',
    price: 1500,
    countryId: 'jepang',
  },
  {
    id: 'ticket-korea',
    category: 'ticket',
    nameKey: 'shop.ticket.korea.name',
    descKey: 'shop.ticket.korea.desc',
    price: 1400,
    countryId: 'korea',
  },
  {
    id: 'ticket-prancis',
    category: 'ticket',
    nameKey: 'shop.ticket.prancis.name',
    descKey: 'shop.ticket.prancis.desc',
    price: 2000,
    countryId: 'prancis',
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  ...OUTFIT_ITEMS,
  ...PROPERTY_ITEMS,
  ...VEHICLE_ITEMS,
  ...TICKET_ITEMS,
];

const SHOP_CATEGORY_IDS: readonly string[] = ['outfit', 'property', 'vehicle', 'ticket'];

export function isShopCategory(value: string): value is ShopCategory {
  return SHOP_CATEGORY_IDS.includes(value);
}

export function findShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}

export function findTicketForCountry(countryId: string): ShopItem | undefined {
  return SHOP_ITEMS.find(
    (item) => item.category === 'ticket' && item.countryId === countryId,
  );
}

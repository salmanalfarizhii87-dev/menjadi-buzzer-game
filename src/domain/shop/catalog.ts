/**
 * Katalog Shop: filter kategori dan status kepemilikan.
 * Tidak menghitung saldo; `canBuy` menerima saldo yang sudah ditampilkan.
 */

import type { ShopCategory, ShopItem } from '@/data/shop/items';
import type { GameSave } from '@/state/types';

export const SHOP_CATEGORIES: readonly ShopCategory[] = [
  'outfit',
  'property',
  'vehicle',
  'ticket',
];

export function getItemsByCategory(
  items: readonly ShopItem[],
  category: ShopCategory,
): ShopItem[] {
  return items.filter((item) => item.category === category);
}

export function isOwned(save: GameSave, item: ShopItem): boolean {
  switch (item.category) {
    case 'outfit':
      return save.inventory.ownedItemIds.includes(item.outfitId ?? item.id);
    case 'property':
      return save.assets.propertyIds.includes(item.id);
    case 'vehicle':
      return save.assets.vehicleIds.includes(item.id);
    case 'ticket':
      return item.countryId !== undefined && save.tickets.ownedCountryIds.includes(item.countryId);
  }
}

export function canBuy(balance: number, owned: boolean, item: ShopItem): boolean {
  return !owned && Number.isFinite(balance) && balance >= item.price;
}

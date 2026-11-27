/**
 * Kartu item Shop: emblem, nama, harga, status. Tidak memotong saldo.
 */

import { el } from '@/core/dom';
import { formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import type { ShopItem } from '@/data/shop/items';
import { isOwned } from '@/domain/shop/catalog';
import { shopEmblem } from '@/art/shop/emblem';
import type { GameSave } from '@/state/types';

export interface ShopItemCardOptions {
  item: ShopItem;
  save: GameSave;
  balance: number;
  onOpen: () => void;
}

export function shopItemCard(options: ShopItemCardOptions): HTMLElement {
  const { item, save, balance, onOpen } = options;
  const owned = isOwned(save, item);
  const equipped =
    item.category === 'outfit' && save.inventory.equippedOutfitId === (item.outfitId ?? item.id);
  const affordable = balance >= item.price;

  const card = el('button', {
    type: 'button',
    class: owned ? 'shop-card shop-card--owned' : 'shop-card',
    'aria-label': `${t(item.nameKey)}, ${formatMoney(item.price)}`,
  });

  card.appendChild(shopEmblem(item));
  card.appendChild(el('span', { class: 'shop-card__name', text: t(item.nameKey) }));
  card.appendChild(el('span', { class: 'shop-card__price', text: formatMoney(item.price) }));

  if (equipped) {
    card.appendChild(
      el('span', { class: 'shop-card__badge shop-card__badge--equipped', text: t('shop.equipped') }),
    );
  } else if (owned) {
    card.appendChild(el('span', { class: 'shop-card__badge shop-card__badge--owned', text: t('shop.owned') }));
  } else if (!affordable) {
    card.appendChild(
      el('span', {
        class: 'shop-card__badge shop-card__badge--unaffordable',
        text: t('shop.unaffordable'),
      }),
    );
  }

  card.addEventListener('click', onOpen);
  return card;
}

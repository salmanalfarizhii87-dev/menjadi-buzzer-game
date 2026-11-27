/**
 * Emblem item Shop. SVG kategori di atas pelat berwarna, bukan gambar raster.
 */

import { el } from '@/core/dom';
import { icons } from '@/components/icons';
import type { ShopCategory, ShopItem } from '@/data/shop/items';

const CATEGORY_ICON: Record<ShopCategory, () => SVGSVGElement> = {
  outfit: icons.shirt,
  property: icons.house,
  vehicle: icons.car,
  ticket: icons.ticket,
};

export function shopEmblem(item: ShopItem, large = false): HTMLElement {
  const node = el('span', {
    class: `shop-emblem shop-emblem--${item.category}${large ? ' shop-emblem--lg' : ''}`,
    'aria-hidden': 'true',
  });
  node.appendChild(CATEGORY_ICON[item.category]());
  return node;
}

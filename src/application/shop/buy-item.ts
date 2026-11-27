/**
 * Use case: beli item Shop.
 *
 * Atomik: flush income → validasi item/kepemilikan/saldo → potong saldo →
 * transaksi `shop_purchase` → masukkan ke bucket yang sesuai → commit.
 */

import { err, ok, type ActionResult } from '@/core/result';
import { applyDelta } from '@/domain/finance/balance';
import { appendTransaction, descriptionKeyFor } from '@/domain/finance/ledger';
import { evaluatePurchase } from '@/domain/shop/purchase';
import { findShopItem, type ShopItem } from '@/data/shop/items';
import { flushPendingIncome } from '@/application/income/accrue-income';
import type { GameSave } from '@/state/types';
import type { CampaignUseCaseDeps } from '../campaigns/accept-campaign';

export interface BuyItemOutcome {
  item: ShopItem;
  balanceAfter: number;
}

function grantItem(save: GameSave, item: ShopItem): GameSave {
  const ownedItemIds = save.inventory.ownedItemIds.includes(item.id)
    ? save.inventory.ownedItemIds
    : [...save.inventory.ownedItemIds, item.id];

  let next: GameSave = {
    ...save,
    inventory: { ...save.inventory, ownedItemIds },
  };

  switch (item.category) {
    case 'property':
      next = {
        ...next,
        assets: {
          ...next.assets,
          propertyIds: next.assets.propertyIds.includes(item.id)
            ? next.assets.propertyIds
            : [...next.assets.propertyIds, item.id],
        },
      };
      break;
    case 'vehicle':
      next = {
        ...next,
        assets: {
          ...next.assets,
          vehicleIds: next.assets.vehicleIds.includes(item.id)
            ? next.assets.vehicleIds
            : [...next.assets.vehicleIds, item.id],
        },
      };
      break;
    case 'ticket':
      if (item.countryId && !next.tickets.ownedCountryIds.includes(item.countryId)) {
        next = {
          ...next,
          tickets: {
            ...next.tickets,
            ownedCountryIds: [...next.tickets.ownedCountryIds, item.countryId],
          },
        };
      }
      break;
    case 'outfit':
      break;
  }

  return next;
}

export function buyShopItem(
  deps: CampaignUseCaseDeps,
  itemId: string,
): ActionResult<BuyItemOutcome> {
  const { store, repository, clock } = deps;
  const inFlight = deps.inFlight ?? new Set<string>();
  const guardKey = `buy-item:${itemId}`;

  if (inFlight.has(guardKey)) {
    return err('invalid_transition', 'error.invalid_transition', 'pembelian sedang diproses');
  }
  inFlight.add(guardKey);

  try {
    const flushed = flushPendingIncome(deps);
    if (!flushed.ok) return flushed;

    const save = store.getState();
    const item = findShopItem(itemId);
    if (!item) return err('unknown', 'error.unknown', `item tidak dikenal: ${itemId}`);

    const evaluation = evaluatePurchase(save, item, save.player.money);
    if (evaluation.reason === 'owned') {
      return err('locked', 'error.item_owned');
    }
    if (!evaluation.canBuy) {
      return err('insufficient_funds', 'error.insufficient_funds');
    }

    const paid = applyDelta(save, -item.price, { allowNegative: false });
    if (!paid.ok) return paid;

    const now = clock.now();
    let next = appendTransaction(paid.value.save, {
      type: 'shop_purchase',
      amount: -item.price,
      sourceId: item.id,
      descriptionKey: descriptionKeyFor('shop_purchase'),
      createdAt: now,
    });

    next = grantItem(next, item);
    next = { ...next, meta: { ...next.meta, updatedAt: now } };

    store.setState(next);
    repository.saveNow(next);

    return ok({ item, balanceAfter: next.player.money });
  } finally {
    inFlight.delete(guardKey);
  }
}

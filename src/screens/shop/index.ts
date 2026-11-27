/**
 * Screen: Shop (Stitch asset_shop) — 4 kategori, beli langsung.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/asset_shop.html?raw';
import { SHOP_ITEMS, type ShopCategory } from '@/data/shop/items';
import { getItemsByCategory, isOwned } from '@/domain/shop/catalog';
import { formatDecimal, formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { $, bindRouteLinks, setText, stitchRoot } from '@/ui/stitch';
import { icons } from '@/components/icons';
import { selectDisplayBalance, selectIncomeRate } from '@/state/selectors';
import type { GameSave } from '@/state/types';

const PANELS: Record<ShopCategory, { tab: string; panel: string }> = {
  outfit: { tab: 'pakaian', panel: 'panel-pakaian' },
  property: { tab: 'properti', panel: 'panel-properti' },
  vehicle: { tab: 'kendaraan', panel: 'panel-kendaraan' },
  ticket: { tab: 'tiket', panel: 'panel-tiket' },
};

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);

  const initialCategory = (Object.entries(PANELS).find(([, value]) => value.tab === params['category'])?.[0] ?? 'outfit') as ShopCategory;
  let active: ShopCategory = initialCategory;

  const tabButtons = Array.from(screen.querySelectorAll<HTMLButtonElement>('.shop-tab'));
  const setTab = (category: ShopCategory): void => {
    active = category;
    for (const button of tabButtons) {
      const isActive = button.dataset['tab'] === PANELS[category].tab;
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.className = `shop-tab ${isActive ? 'ref-btn-yellow' : 'ref-btn-white'} px-gutter-xs py-gutter-sm rounded-xl text-ink-dark font-headline text-label-sm cursor-pointer`;
    }
    for (const [, value] of Object.entries(PANELS)) {
      $<HTMLElement>(screen, `#${value.panel}`).classList.toggle('hidden', value.panel !== PANELS[category].panel);
    }
  };

  const cardSource = $<HTMLElement>(screen, '#panel-pakaian article.ref-card');

  const renderItems = (state: GameSave): void => {
    for (const value of Object.values(PANELS)) {
      const panel = $<HTMLElement>(screen, `#${value.panel}`);
      panel.replaceChildren();
    }

    for (const category of Object.keys(PANELS) as ShopCategory[]) {
      const panel = $<HTMLElement>(screen, `#${PANELS[category].panel}`);
      for (const item of getItemsByCategory(SHOP_ITEMS, category)) {
        const owned = isOwned(state, item);
        const equipped = category === 'outfit' && state.inventory.equippedOutfitId === (item.outfitId ?? item.id);
        const card = cardSource.cloneNode(true) as HTMLElement;
        card.classList.add('cursor-pointer');

        const emblem = card.querySelector<HTMLElement>('[data-stitch-img]');
        if (emblem) {
          const categoryIcon = {
            outfit: icons.shirt,
            property: icons.house,
            vehicle: icons.car,
            ticket: icons.ticket,
          }[category]();
          emblem.className = `shop-item-art shop-item-art--${category}`;
          emblem.replaceChildren(categoryIcon);
        }

        const title = card.querySelector<HTMLElement>('h2');
        if (title) title.textContent = t(item.nameKey);
        const desc = card.querySelector<HTMLElement>('p');
        if (desc) {
          if (item.incomeMultiplier !== undefined) desc.textContent = `+${Math.round(item.incomeMultiplier * 100)}% Passive Income`;
          else if (item.credibilityBonus !== undefined) desc.textContent = `+${item.credibilityBonus} Kredibilitas`;
          else if (item.countryId) desc.textContent = `Buka Travel: ${t(`country.${item.countryId}`)}`;
          else desc.textContent = t(item.descKey);
        }

        const action = card.querySelector<HTMLElement>('button, span.px-gutter-sm');
        if (action) {
          if (owned) {
            const badge = document.createElement('span');
            badge.className = 'px-gutter-sm py-gutter-xs rounded-full bg-success text-on-success font-headline text-label-sm shrink-0';
            badge.textContent = equipped ? 'Terpasang' : 'Dimiliki';
            action.replaceWith(badge);
          } else {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = formatMoney(item.price);
            button.className = 'ref-btn-green px-gutter-md py-gutter-xs rounded-lg font-headline text-label-sm text-light-surface-bright tabular-nums shrink-0 cursor-pointer';
            button.addEventListener('click', (event) => {
              event.stopPropagation();
              const result = ctx.actions.buyShopItem(item.id);
              if (!result.ok) {
                ctx.toasts.error(t(result.messageKey));
                return;
              }
              ctx.toasts.success(t('shop.purchased'));
              renderItems(ctx.store.getState());
            });
            action.replaceWith(button);
          }
        }

        card.addEventListener('click', () => {
          if (category === 'outfit') ctx.navigate('outfits');
        });
        panel.appendChild(card);
      }
    }
    setTab(active);
  };

  for (const button of tabButtons) {
    button.addEventListener('click', () => {
      const category = (Object.keys(PANELS) as ShopCategory[]).find(
        (key) => PANELS[key].tab === button.dataset['tab'],
      );
      if (category) setTab(category);
    });
  }

  const patchHeader = (state: GameSave): void => {
    setText(screen, '#shop-balance', formatMoney(selectDisplayBalance(state)));
    const rate = screen.querySelector<HTMLElement>('header .ref-cyan-pill .font-mono');
    if (rate) rate.textContent = `+Rp ${formatDecimal(selectIncomeRate(state, ctx.config), 2)}/dtk`;
    const level = screen.querySelector<HTMLElement>('header .ref-gem-box span');
    if (level) level.textContent = `Lv ${state.player.careerLevel}`;
  };

  renderItems(ctx.store.getState());
  patchHeader(ctx.store.getState());
  root.replaceChildren(screen);

  let scheduled = false;
  const unsubscribe = ctx.store.subscribe((state) => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      patchHeader(state);
    });
  });
  ctx.signal.addEventListener('abort', () => unsubscribe(), { once: true });
}

const screenModule: ScreenModule = { id: 'shop', mount };
export default screenModule;

/**
 * Screen: detail item Shop + beli + pasang outfit.
 * Harga dan bonus dibaca dari data; saldo dari selector.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import { button } from '@/components/buttons/button';
import { panel } from '@/components/cards/panel';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { primaryNav } from '@/components/navigation/primary-nav';
import { shopEmblem } from '@/art/shop/emblem';
import { el } from '@/core/dom';
import { formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { findShopItem } from '@/data/shop/items';
import { isOwned } from '@/domain/shop/catalog';
import { selectDisplayBalance } from '@/state/selectors';
import '../shop/shop.css';

function fact(label: string, value: string, valueClass = ''): HTMLElement {
  return el('div', { class: 'shop-fact' }, [
    el('span', { class: 'shop-fact__label', text: label }),
    el('span', { class: `shop-fact__value ${valueClass}`.trim(), text: value }),
  ]);
}

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const render = (): void => {
    const state = ctx.store.getState();
    const balance = selectDisplayBalance(state);
    const item = findShopItem(params['id'] ?? '');

    const content = mainContent();
    const screen = el('section', { class: 'screen anim-fade' });

    if (!item) {
      screen.appendChild(
        panel({
          title: t('screen.shopDetail.title'),
          children: [el('p', { class: 'text-soft', text: t('shop.empty') })],
          footer: button({
            label: 'Kembali',
            variant: 'primary',
            block: true,
            onClick: () => ctx.navigate('shop'),
          }),
        }),
      );
      content.appendChild(screen);
      root.replaceChildren(
        appFrame({
          topBar: topBar({
            title: t('screen.shopDetail.title'),
            subtitle: t('screen.shopDetail.subtitle'),
            balance,
            showBack: true,
            onBack: () => ctx.navigate('shop'),
          }),
          nav: primaryNav({ currentScreen: 'shop-detail', onNavigate: (id) => ctx.navigate(id) }),
          content,
        }),
      );
      return;
    }

    const owned = isOwned(state, item);
    const equipped =
      item.category === 'outfit' && state.inventory.equippedOutfitId === (item.outfitId ?? item.id);
    const affordable = balance >= item.price;

    screen.appendChild(
      panel({
        children: [
          el('div', { class: 'shop-detail-head' }, [
            shopEmblem(item, true),
            el('span', { class: 'shop-detail-name', text: t(item.nameKey) }),
            el('span', { class: 'shop-detail-desc', text: t(item.descKey) }),
          ]),
        ],
      }),
    );

    const facts = el('div', { class: 'shop-facts' }, [
      fact(t('shop.price'), formatMoney(item.price), 'shop-fact__value--gold'),
      fact(t(`shop.category.${item.category}`), owned ? t('shop.owned') : '—'),
    ]);

    if (item.incomeMultiplier !== undefined) {
      facts.appendChild(
        fact(
          t('shop.incomeBonus'),
          `+${Math.round(item.incomeMultiplier * 100)}%`,
          'shop-fact__value--success',
        ),
      );
    }
    if (item.credibilityBonus !== undefined) {
      facts.appendChild(fact(t('shop.credibility'), `+${item.credibilityBonus}`));
    }
    if (item.countryId) {
      facts.appendChild(fact(t('shop.country'), t(`country.${item.countryId}`)));
    }

    screen.appendChild(panel({ title: t('screen.shopDetail.title'), children: [facts] }));

    if (owned) {
      screen.appendChild(
        el('p', {
          class: 'shop-status shop-status--owned',
          text: equipped ? t('shop.equipped') : t('shop.owned'),
        }),
      );
    } else if (!affordable) {
      screen.appendChild(
        el('p', {
          class: 'shop-status shop-status--warning',
          text: `${t('shop.notEnoughTitle')} · ${t('shop.price')} ${formatMoney(item.price)}`,
        }),
      );
    }

    const actions = el('div', { class: 'shop-actions' });

    if (!owned) {
      actions.appendChild(
        button({
          label: affordable ? t('shop.buy') : t('shop.unaffordable'),
          variant: 'gold',
          block: true,
          disabled: !affordable,
          onClick: () => {
            const result = ctx.actions.buyShopItem(item.id);
            if (!result.ok) {
              ctx.toasts.error(t(result.messageKey));
              return;
            }
            ctx.toasts.success(t('shop.purchased'));
            render();
          },
        }),
      );
      actions.appendChild(
        el('p', { class: 'text-muted', text: t('shop.purchaseHint') }),
      );
    } else if (item.category === 'outfit') {
      actions.appendChild(
        button({
          label: equipped ? t('shop.equipped') : t('shop.equip'),
          variant: 'primary',
          block: true,
          disabled: equipped,
          onClick: () => {
            const result = ctx.actions.equipOutfit(item.outfitId ?? item.id);
            if (!result.ok) {
              ctx.toasts.error(t(result.messageKey));
              return;
            }
            ctx.toasts.success(t('shop.equipSuccess'));
            render();
          },
        }),
      );
    }

    screen.appendChild(actions);
    content.appendChild(screen);

    root.replaceChildren(
      appFrame({
        topBar: topBar({
          title: t('screen.shopDetail.title'),
          subtitle: t(item.nameKey),
          balance,
          showBack: true,
          onBack: () => ctx.navigate('shop'),
        }),
        nav: primaryNav({ currentScreen: 'shop-detail', onNavigate: (id) => ctx.navigate(id) }),
        content,
      }),
    );
  };

  render();
}

const screenModule: ScreenModule = { id: 'shop-detail', mount };
export default screenModule;

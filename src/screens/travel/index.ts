/**
 * Screen: Travel — daftar negara, status tiket, biaya, terbang, dan foto.
 * Tindakan terbang memakai `actions.flyTo`; layar hanya menampilkan.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import { panel } from '@/components/cards/panel';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { landmarkSvg } from '@/art/landmarks';
import { el } from '@/core/dom';
import { formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { TRAVEL_COUNTRIES } from '@/data/travel/countries';
import { findTicketForCountry } from '@/data/shop/items';
import { canFly, travelCost } from '@/domain/travel/unlock';
import {
  selectCurrentCountry,
  selectDisplayBalance,
  selectVisitedCountries,
} from '@/state/selectors';
import './travel.css';

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const render = (): void => {
    const state = ctx.store.getState();
    const balance = selectDisplayBalance(state);
    const current = selectCurrentCountry(state);
    const visited = selectVisitedCountries(state);
    const owned = state.tickets.ownedCountryIds;

    const content = mainContent();
    const screen = el('section', { class: 'screen anim-fade tb-map-content' });
    screen.appendChild(
      el('div', { class: 'tb-map-hero', role: 'img', 'aria-label': 'Pemandangan kota untuk layar peta' }, [
        el('span', { class: 'tb-map-hero__title', text: 'PETA' }),
      ]),
    );
    screen.appendChild(
      el('div', {
        class: 'tb-map-note',
        text: 'Kembangkan bisnismu ke seluruh penjuru dunia. Buka kota baru untuk memperluas lapakmu.',
      }),
    );
    const list = el('div', { class: 'travel-list' });

    for (const country of TRAVEL_COUNTRIES) {
      const unlocked = owned.includes(country.id);
      const isCurrent = current === country.id;
      const wasVisited = visited.includes(country.id);
      const fare = travelCost(ctx.config, country.id);
      const evaluation = canFly(state, ctx.config, country.id, balance);

      const row = el('div', {
        class: isCurrent ? 'travel-row travel-row--current' : 'travel-row',
      }, [
        el('span', { class: 'travel-row__landmark', 'aria-hidden': 'true' }, [
          landmarkSvg(country.landmarkId, 52),
        ]),
        el('span', { class: 'travel-row__body' }, [
          el('span', { class: 'travel-row__name', text: t(country.nameKey) }),
          el('span', {
            class: 'travel-row__meta',
            text: isCurrent
              ? `${t('travel.current')} · ${t(country.landmarkNameKey)}`
              : wasVisited
                ? t('travel.visited')
                : unlocked
                  ? `${t(country.landmarkNameKey)} · ${formatMoney(fare)}`
                  : t('travel.needTicket'),
          }),
        ]),
      ]);

      if (isCurrent) {
        row.appendChild(
          el('button', {
            type: 'button',
            class: 'travel-row__action travel-row__action--gold',
            text: t('travel.takePhoto'),
            onclick: () => ctx.navigate('photo'),
          }),
        );
      } else if (unlocked) {
        const flyButton = el('button', {
          type: 'button',
          class: 'travel-row__action travel-row__action--teal',
          text: t('travel.fly'),
        });
        flyButton.disabled = !evaluation.allowed;
        flyButton.addEventListener('click', () => {
          const result = ctx.actions.flyTo(country.id);
          if (!result.ok) {
            ctx.toasts.error(t(result.messageKey));
            return;
          }
          ctx.toasts.success(t('travel.arrived'));
          render();
        });
        row.appendChild(flyButton);
      } else {
        const ticket = findTicketForCountry(country.id);
        if (ticket) {
          row.appendChild(
            el('button', {
              type: 'button',
              class: 'travel-row__action travel-row__action--gold',
              text: t('travel.buyTicket'),
              onclick: () => ctx.navigate('shop-detail', { id: ticket.id }),
            }),
          );
        } else {
          row.appendChild(
            el('span', {
              class: 'travel-row__badge travel-row__badge--locked',
              text: t('travel.locked'),
            }),
          );
        }
      }

      list.appendChild(row);
    }

    screen.appendChild(
      panel({
        title: t('travel.collection'),
        subtitle: `${owned.length}/${TRAVEL_COUNTRIES.length}`,
        children: [list],
      }),
    );

    content.appendChild(screen);

    const backBar = el('div', { class: 'tb-map-backbar' });
    const backButton = el('button', {
      type: 'button',
      class: 'tb-map-back-button',
      text: '←',
      'aria-label': 'Kembali ke lapak',
    });
    backButton.addEventListener('click', () => ctx.navigate('character'));
    backBar.appendChild(backButton);

    const frame = appFrame({
      topBar: topBar({
        title: t('screen.travel.title'),
        subtitle: t('screen.travel.subtitle'),
        balance,
        showBack: true,
        onBack: () => ctx.navigate('character'),
      }),
      nav: backBar,
      content,
    });
    frame.classList.add('tb-map-page');
    root.replaceChildren(frame);
  };

  render();
}

const screenModule: ScreenModule = { id: 'travel', mount };
export default screenModule;

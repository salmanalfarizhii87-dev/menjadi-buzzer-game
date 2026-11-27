/**
 * Screen: Saham — portofolio ringkas + daftar 4 emiten (harga & perubahan).
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import { panel } from '@/components/cards/panel';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { primaryNav } from '@/components/navigation/primary-nav';
import { el } from '@/core/dom';
import { formatDecimal, formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { COMPANIES } from '@/data/stocks/companies';
import {
  selectDisplayBalance,
  selectHolding,
  selectPortfolioSummary,
  selectStockChange,
  selectStockPrice,
} from '@/state/selectors';
import './stocks.css';

function changeClass(percent: number): string {
  if (percent > 0) return 'stock-change stock-change--up';
  if (percent < 0) return 'stock-change stock-change--down';
  return 'stock-change stock-change--flat';
}

function signedPercent(percent: number): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${formatDecimal(percent, 1)}%`;
}

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const render = (): void => {
    const state = ctx.store.getState();
    const balance = selectDisplayBalance(state);
    const summary = selectPortfolioSummary(state);

    const content = mainContent();
    const screen = el('section', { class: 'screen anim-fade' });

    const portfolio = el('div', { class: 'portfolio-grid' }, [
      el('div', { class: 'portfolio-tile' }, [
        el('span', { class: 'portfolio-tile__label', text: t('stocks.marketValue') }),
        el('span', { class: 'portfolio-tile__value', text: formatMoney(summary.marketValue) }),
      ]),
      el('div', { class: 'portfolio-tile' }, [
        el('span', { class: 'portfolio-tile__label', text: t('stocks.pnl') }),
        el('span', {
          class:
            summary.unrealizedPnl > 0
              ? 'portfolio-tile__value portfolio-tile__value--up'
              : summary.unrealizedPnl < 0
                ? 'portfolio-tile__value portfolio-tile__value--down'
                : 'portfolio-tile__value',
          text: formatMoney(summary.unrealizedPnl),
        }),
      ]),
    ]);

    screen.appendChild(
      panel({
        title: t('stocks.portfolio'),
        subtitle: `${summary.holdingsCount} emiten · ${t('stocks.tickHint')}`,
        children: [portfolio],
      }),
    );

    const list = el('div', { class: 'stock-list' });

    for (const company of COMPANIES) {
      const price = selectStockPrice(state, company.ticker) ?? company.basePrice;
      const change = selectStockChange(state, company.ticker);
      const holding = selectHolding(state, company.ticker);

      const row = el('button', {
        type: 'button',
        class: 'stock-row',
        'aria-label': `${company.ticker} ${formatMoney(price)} ${signedPercent(change.percent)}`,
      }, [
        el('span', { class: 'stock-row__ticker', text: company.ticker }),
        el('span', { class: 'stock-row__body' }, [
          el('span', { class: 'stock-row__name', text: t(company.nameKey) }),
          el('span', {
            class: 'stock-row__sector',
            text: holding
              ? `${t(company.sectorKey)} · ${holding.shares} ${t('stocks.shares')}`
              : t(company.sectorKey),
          }),
        ]),
        el('span', { class: 'stock-row__price', text: formatMoney(price) }),
        el('span', { class: changeClass(change.percent), text: signedPercent(change.percent) }),
      ]);

      row.addEventListener('click', () => ctx.navigate('stock-detail', { ticker: company.ticker }));
      list.appendChild(row);
    }

    screen.appendChild(
      panel({
        title: t('stocks.ticker'),
        subtitle: `${COMPANIES.length} emiten`,
        children: [list],
      }),
    );

    content.appendChild(screen);

    root.replaceChildren(
      appFrame({
        topBar: topBar({
          title: t('screen.stocks.title'),
          subtitle: t('screen.stocks.subtitle'),
          balance,
        }),
        nav: primaryNav({ currentScreen: 'stocks', onNavigate: (id) => ctx.navigate(id) }),
        content,
      }),
    );
  };

  render();

  let scheduled = false;
  const unsubscribe = ctx.store.subscribe(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const scrollY = window.scrollY;
      render();
      window.scrollTo(0, scrollY);
    });
  });

  ctx.signal.addEventListener('abort', () => unsubscribe(), { once: true });
}

const screenModule: ScreenModule = { id: 'stocks', mount };
export default screenModule;

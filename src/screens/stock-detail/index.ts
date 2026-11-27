/**
 * Screen: detail emiten — grafik harga, holding, form beli/jual.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import { button } from '@/components/buttons/button';
import { panel } from '@/components/cards/panel';
import { sparkline } from '@/components/stocks/sparkline';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { primaryNav } from '@/components/navigation/primary-nav';
import { el } from '@/core/dom';
import { formatDecimal, formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { findCompany } from '@/data/stocks/companies';
import {
  selectDisplayBalance,
  selectHolding,
  selectStockChange,
  selectStockPrice,
} from '@/state/selectors';
import { valueHolding } from '@/domain/stocks/portfolio';
import '../stocks/stocks.css';

function signedPercent(percent: number): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${formatDecimal(percent, 1)}%`;
}

function fact(label: string, value: string, valueClass = ''): HTMLElement {
  return el('div', { class: 'stock-fact' }, [
    el('span', { class: 'stock-fact__label', text: label }),
    el('span', { class: `stock-fact__value ${valueClass}`.trim(), text: value }),
  ]);
}

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const ticker = params['ticker'] ?? '';

  const render = (): void => {
    const state = ctx.store.getState();
    const balance = selectDisplayBalance(state);
    const company = findCompany(ticker);

    const content = mainContent();
    const screen = el('section', { class: 'screen anim-fade' });

    if (!company) {
      screen.appendChild(
        panel({
          title: t('screen.stockDetail.title'),
          children: [el('p', { class: 'text-soft', text: 'Emiten tidak ditemukan.' })],
          footer: button({
            label: 'Kembali',
            variant: 'primary',
            block: true,
            onClick: () => ctx.navigate('stocks'),
          }),
        }),
      );
      content.appendChild(screen);
      root.replaceChildren(
        appFrame({
          topBar: topBar({
            title: t('screen.stockDetail.title'),
            subtitle: t('screen.stockDetail.subtitle'),
            balance,
            showBack: true,
            onBack: () => ctx.navigate('stocks'),
          }),
          nav: primaryNav({ currentScreen: 'stock-detail', onNavigate: (id) => ctx.navigate(id) }),
          content,
        }),
      );
      return;
    }

    const price = selectStockPrice(state, company.ticker) ?? company.basePrice;
    const change = selectStockChange(state, company.ticker);
    const holding = selectHolding(state, company.ticker);
    const history = state.stocks.history[company.ticker] ?? [];

    screen.appendChild(
      panel({
        children: [
          el('div', { class: 'stock-head' }, [
            el('div', { class: 'stack stack--tight' }, [
              el('span', { class: 'stock-head__name', text: t(company.nameKey) }),
              el('span', {
                class: 'stock-head__sector',
                text: `${company.ticker} · ${t(company.sectorKey)}`,
              }),
            ]),
            el('div', { class: 'stock-price' }, [
              el('span', { class: 'stock-price__value', text: formatMoney(price) }),
              el('span', {
                class:
                  change.percent > 0
                    ? 'stock-change stock-change--up'
                    : change.percent < 0
                      ? 'stock-change stock-change--down'
                      : 'stock-change stock-change--flat',
                text: signedPercent(change.percent),
              }),
            ]),
          ]),
          sparkline(history),
        ],
      }),
    );

    const facts = el('div', { class: 'stock-facts' });

    if (holding) {
      const valuation = valueHolding(holding, price);
      facts.appendChild(fact(t('stocks.sharesHeld'), String(holding.shares)));
      facts.appendChild(fact(t('stocks.avgCost'), formatMoney(holding.avgCost)));
      facts.appendChild(fact(t('stocks.marketValue'), formatMoney(valuation.marketValue)));
      facts.appendChild(
        fact(
          t('stocks.pnl'),
          formatMoney(valuation.unrealizedPnl),
          valuation.unrealizedPnl > 0
            ? 'stock-fact__value--up'
            : valuation.unrealizedPnl < 0
              ? 'stock-fact__value--down'
              : '',
        ),
      );
    } else {
      facts.appendChild(el('p', { class: 'text-muted', text: t('stocks.noHolding') }));
    }

    screen.appendChild(panel({ title: t('stocks.portfolio'), children: [facts] }));

    const input = el('input', {
      type: 'number',
      min: '1',
      step: '1',
      value: String(ctx.config.stocks.quickTradeShares),
      inputmode: 'numeric',
      class: 'stock-input',
      'aria-label': t('stocks.quantity'),
    });

    const estimate = el('span', { class: 'stock-estimate__value' });
    const updateEstimate = (): void => {
      const shares = Number(input.value);
      estimate.textContent = Number.isFinite(shares) && shares > 0
        ? formatMoney(Math.round(shares * price))
        : '—';
    };
    input.addEventListener('input', updateEstimate);
    updateEstimate();

    const trade = (side: 'buy' | 'sell'): void => {
      const shares = Number(input.value);
      const result = ctx.actions.tradeStock({ ticker: company.ticker, shares, side });

      if (!result.ok) {
        ctx.toasts.error(t(result.messageKey));
        return;
      }

      ctx.toasts.success(t(side === 'buy' ? 'stocks.buySuccess' : 'stocks.sellSuccess'));
      render();
    };

    const tradeRow = el('div', { class: 'stock-trade' }, [
      el('label', { class: 'stock-trade__row' }, [
        el('span', { class: 'text-muted', text: t('stocks.quantity') }),
        input,
      ]),
      el('div', { class: 'stock-estimate' }, [
        el('span', { text: `${t('stocks.price')} · ${formatMoney(price)}` }),
        estimate,
      ]),
      el('div', { class: 'stock-buttons' }, [
        button({
          label: t('stocks.buy'),
          variant: 'gold',
          block: true,
          onClick: () => trade('buy'),
        }),
        button({
          label: t('stocks.sell'),
          variant: 'danger',
          block: true,
          onClick: () => trade('sell'),
        }),
      ]),
    ]);

    screen.appendChild(panel({ title: t('stocks.tradeTitle'), children: [tradeRow] }));

    content.appendChild(screen);

    root.replaceChildren(
      appFrame({
        topBar: topBar({
          title: company.ticker,
          subtitle: t(company.nameKey),
          balance,
          showBack: true,
          onBack: () => ctx.navigate('stocks'),
        }),
        nav: primaryNav({ currentScreen: 'stock-detail', onNavigate: (id) => ctx.navigate(id) }),
        content,
      }),
    );
  };

  render();
}

const screenModule: ScreenModule = { id: 'stock-detail', mount };
export default screenModule;

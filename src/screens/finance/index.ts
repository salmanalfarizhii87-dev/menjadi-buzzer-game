/**
 * Screen: Finance (Stitch finance_history) — ringkasan, filter arus, riwayat.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/finance_history.html?raw';
import { formatMoney, isDebt } from '@/core/money';
import { t } from '@/data/strings/id';
import { $, bindRouteLinks, setText, stitchRoot } from '@/ui/stitch';
import {
  selectCampaignEntries,
  selectDisplayBalance,
  selectRecentTransactions,
} from '@/state/selectors';
import { campaignCardStatus } from '@/components/campaigns/campaign-card';
import type { Transaction } from '@/state/types';
import { targetForTransaction } from './targets';

type FlowFilter = 'all' | 'in' | 'out';

function timeAgo(at: number): string {
  const minutes = Math.max(0, Math.floor((Date.now() - at) / 60_000));
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hr lalu`;
}

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);

  let filter: FlowFilter = 'all';

  const tabs = {
    all: $<HTMLButtonElement>(screen, '#tab-tx-all'),
    in: $<HTMLButtonElement>(screen, '#tab-tx-in'),
    out: $<HTMLButtonElement>(screen, '#tab-tx-out'),
  };

  const applyTabs = (counts: { all: number; in: number; out: number }): void => {
    tabs.all.textContent = `Semua (${counts.all})`;
    tabs.in.textContent = `Masuk (${counts.in})`;
    tabs.out.textContent = `Keluar (${counts.out})`;
    for (const [key, button] of Object.entries(tabs)) {
      const active = key === filter;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.className = `ref-btn-${active ? 'yellow' : 'white'} px-gutter-sm py-gutter-sm rounded-xl text-ink-dark font-headline text-body-sm cursor-pointer`;
    }
  };

  const cardSource = $<HTMLElement>(screen, '#tx-list article.tx-row');

  const renderList = (): void => {
    const state = ctx.store.getState();
    const all = selectRecentTransactions(state, 60);
    const visible = all.filter((transaction) => {
      if (filter === 'all') return true;
      return filter === 'in' ? transaction.amount >= 0 : transaction.amount < 0;
    });

    applyTabs({
      all: all.length,
      in: all.filter((transaction) => transaction.amount >= 0).length,
      out: all.filter((transaction) => transaction.amount < 0).length,
    });

    const list = $<HTMLElement>(screen, '#tx-list');
    list.replaceChildren();

    if (visible.length === 0) {
      const empty = document.createElement('article');
      empty.className = 'ref-card rounded-xl p-gutter-lg text-center font-body text-body-sm text-light-on-surface-variant';
      empty.textContent = t('finance.empty');
      list.appendChild(empty);
      return;
    }

    for (const transaction of visible.slice(0, 30)) {
      list.appendChild(renderRow(transaction));
    }
  };

  const renderRow = (transaction: Transaction): HTMLElement => {
    const card = cardSource.cloneNode(true) as HTMLElement;
    card.dataset['flow'] = transaction.amount >= 0 ? 'in' : 'out';
    const title = card.querySelector<HTMLElement>('h2');
    if (title) title.textContent = t(transaction.descriptionKey);
    const meta = card.querySelector<HTMLElement>('p.font-body');
    if (meta) meta.textContent = `${transaction.type} • ${timeAgo(transaction.createdAt)}`;
    const amount = card.querySelector<HTMLElement>('.text-right p');
    if (amount) {
      amount.textContent = `${transaction.amount >= 0 ? '+' : ''}${formatMoney(transaction.amount)}`;
      amount.className = `font-headline text-title-md ${transaction.amount >= 0 ? 'text-success' : 'text-light-error'} tabular-nums`;
    }
    const after = card.querySelector<HTMLElement>('.text-right p + p');
    if (after) after.textContent = `Saldo ${formatMoney(transaction.balanceAfter)}`;

    const target = targetForTransaction(transaction);
    if (target) {
      card.classList.add('cursor-pointer');
      card.addEventListener('click', () => ctx.navigate(target.screen, target.params));
    }
    return card;
  };

  tabs.all.addEventListener('click', () => {
    filter = 'all';
    renderList();
  });
  tabs.in.addEventListener('click', () => {
    filter = 'in';
    renderList();
  });
  tabs.out.addEventListener('click', () => {
    filter = 'out';
    renderList();
  });

  const patch = (): void => {
    const state = ctx.store.getState();
    const balance = selectDisplayBalance(state);
    const all = selectRecentTransactions(state, 60);
    setText(screen, '#fin-balance-hud', formatMoney(balance));
    setText(screen, '#fin-balance-main', formatMoney(balance));

    const label = $<HTMLElement>(screen, 'section[aria-label="Ringkasan saldo"] p.font-body');
    label.textContent = isDebt(balance) ? 'Utang' : 'Saldo Saat Ini';

    const badge = $<HTMLElement>(screen, 'section[aria-label="Ringkasan saldo"] span.bg-btn-yellow');
    badge.textContent = `${all.length} Transaksi`;

    const totals = screen.querySelectorAll<HTMLElement>('section[aria-label="Ringkasan saldo"] .grid p.font-headline');
    const income = all.filter((transaction) => transaction.amount >= 0).reduce((sum, transaction) => sum + transaction.amount, 0);
    const expense = all.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + transaction.amount, 0);
    if (totals[0]) totals[0].textContent = `+${formatMoney(income)}`;
    if (totals[1]) totals[1].textContent = formatMoney(expense);

    const campaignBadge = screen.querySelector<HTMLElement>('nav a[aria-label="Kampanye"] span');
    const available = selectCampaignEntries(state).filter((entry) => campaignCardStatus(entry) === 'available').length;
    if (campaignBadge) campaignBadge.textContent = String(available);
  };

  renderList();
  patch();
  root.replaceChildren(screen);

  let lastCount = ctx.store.getState().transactions.length;
  let scheduled = false;
  const unsubscribe = ctx.store.subscribe(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const count = ctx.store.getState().transactions.length;
      if (count !== lastCount) {
        lastCount = count;
        renderList();
      }
      patch();
    });
  });
  ctx.signal.addEventListener('abort', () => unsubscribe(), { once: true });
}

const screenModule: ScreenModule = { id: 'finance', mount };
export default screenModule;

import { el, type Child } from '@/core/dom';
import { formatMoney, isDebt } from '@/core/money';
import { iconButton } from '@/components/buttons/button';
import { icons } from '@/components/icons';
import './app-shell.css';

export interface TopBarOptions {
  title: string;
  subtitle?: string;
  balance?: number;
  showBack?: boolean;
  onBack?: () => void;
  actions?: Child[];
  brand?: boolean;
}

export function topBar(options: TopBarOptions): HTMLElement {
  const bar = el('header', { class: 'app-topbar' });

  if (options.showBack && options.onBack) {
    bar.appendChild(iconButton({ label: 'Kembali', icon: icons.back(), onClick: options.onBack }));
  } else if (options.brand) {
    const brand = el('div', { class: 'app-topbar__brand' });
    brand.appendChild(el('div', { class: 'app-topbar__mark', 'aria-hidden': 'true' }));
    bar.appendChild(brand);
  }

  const titles = el('div', { class: 'app-topbar__titles' });
  titles.appendChild(el('h1', { class: 'app-topbar__title', text: options.title }));
  if (options.subtitle) {
    titles.appendChild(el('p', { class: 'app-topbar__subtitle', text: options.subtitle }));
  }
  bar.appendChild(titles);

  const actions = el('div', { class: 'app-topbar__actions' });

  if (options.actions) {
    for (const action of options.actions) actions.appendChild(action as Node);
  }

  if (options.balance !== undefined) {
    const debt = isDebt(options.balance);
    const pill = el('div', {
      class: debt ? 'balance-pill balance-pill--debt' : 'balance-pill',
      title: debt ? 'Saldo minus (utang)' : 'Saldo',
    });
    if (debt) pill.appendChild(el('span', { class: 'balance-pill__label', text: 'Utang' }));
    pill.appendChild(el('span', { text: formatMoney(options.balance) }));
    actions.appendChild(pill);
  }

  bar.appendChild(actions);
  return bar;
}

export interface AppFrameOptions {
  topBar: HTMLElement | null;
  nav: HTMLElement | null;
  content: HTMLElement;
  fullBleed?: boolean;
}

export function appFrame(options: AppFrameOptions): HTMLElement {
  const frame = el('div', { class: 'app-frame' });
  if (options.topBar) frame.appendChild(options.topBar);
  if (options.fullBleed) options.content.classList.add('app-main--full');
  frame.appendChild(options.content);
  if (options.nav) frame.appendChild(options.nav);
  return frame;
}

export function mainContent(children?: Child | Child[]): HTMLElement {
  return el('main', { class: 'app-main', id: 'main' }, children);
}

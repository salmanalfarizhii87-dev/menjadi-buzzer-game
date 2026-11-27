import { el } from '@/core/dom';
import { icons } from '@/components/icons';
import { t } from '@/data/strings/id';
import { TABS, tabForScreen, type TabId } from '@/app/navigation';
import type { ScreenId } from '@/app/lifecycle';

const TAB_ICONS: Record<TabId, () => SVGSVGElement> = {
  karakter: icons.account,
  task: icons.campaigns,
  handphone: icons.phone,
  shop: icons.shop,
  saham: icons.chart,
};

export interface PrimaryNavOptions {
  currentScreen: ScreenId;
  onNavigate: (screenId: ScreenId) => void;
}

/** Bottom navigation 5 tab (PRD v2.0). */
export function primaryNav(options: PrimaryNavOptions): HTMLElement {
  const nav = el('nav', { class: 'app-nav', 'aria-label': 'Navigasi utama' });
  const activeTab = tabForScreen(options.currentScreen);

  for (const tab of TABS) {
    const isActive = tab.id === activeTab;
    const label = t(tab.labelKey);

    const button = el('button', {
      type: 'button',
      class: 'app-nav__item',
      ...(isActive ? { 'aria-current': 'page' } : {}),
      'aria-label': label,
    });

    const tile = el('span', { class: 'app-nav__tile', 'aria-hidden': 'true' });
    tile.appendChild(TAB_ICONS[tab.id]());
    button.appendChild(tile);
    button.appendChild(el('span', { class: 'app-nav__label', text: label }));
    button.addEventListener('click', () => options.onNavigate(tab.target));

    nav.appendChild(button);
  }

  return nav;
}

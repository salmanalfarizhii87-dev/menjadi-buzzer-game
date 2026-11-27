/**
 * Navigasi utama 5 tab (PRD v2.0).
 *
 * Setiap tab punya kumpulan layar; tab dianggap aktif bila layar saat ini
 * termasuk di dalamnya. Ini memisahkan "tab" (navigasi) dari "screen" (render).
 */

import type { ScreenId } from './lifecycle';

export type TabId = 'karakter' | 'task' | 'handphone' | 'shop' | 'saham';

export interface TabDefinition {
  id: TabId;
  labelKey: string;
  /** Layar yang membuat tab ini aktif. */
  screens: ScreenId[];
  /** Layar tujuan saat tab ditekan. */
  target: ScreenId;
}

export const TABS: readonly TabDefinition[] = [
  {
    id: 'karakter',
    labelKey: 'nav.character',
    screens: ['character', 'account-detail', 'automation', 'finance', 'travel', 'photo', 'title', 'settings', 'customizer', 'outfits', 'accessories', 'studio', 'rewards'],
    target: 'character',
  },
  {
    id: 'task',
    labelKey: 'nav.task',
    screens: [
      'task',
      'violations',
      'campaign-brief',
      'campaign-strategy',
      'campaign-minigame',
      'campaign-result',
    ],
    target: 'task',
  },
  {
    id: 'handphone',
    labelKey: 'nav.handphone',
    screens: ['handphone', 'composer', 'post-result'],
    target: 'handphone',
  },
  {
    id: 'shop',
    labelKey: 'nav.shop',
    screens: ['shop', 'shop-detail'],
    target: 'shop',
  },
  {
    id: 'saham',
    labelKey: 'nav.stocks',
    screens: ['stocks', 'stock-detail'],
    target: 'stocks',
  },
];

export const ALL_TABS: readonly TabId[] = TABS.map((tab) => tab.id);

export function tabForScreen(screenId: ScreenId): TabId {
  for (const tab of TABS) {
    if (tab.screens.includes(screenId)) return tab.id;
  }
  return 'karakter';
}

export function getTab(tabId: TabId): TabDefinition {
  const found = TABS.find((tab) => tab.id === tabId);
  if (!found) throw new Error(`Tab tidak dikenal: ${tabId}`);
  return found;
}

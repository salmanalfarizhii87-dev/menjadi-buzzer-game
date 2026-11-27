/**
 * Registry layar dengan dynamic import eksplisit agar bundler bisa memecah chunk.
 * 19 layar (PRD v2.0).
 */

import type { ScreenId, ScreenModule } from './lifecycle';

export type ScreenLoader = () => Promise<{ default: ScreenModule }>;

export const screenLoaders: Record<ScreenId, ScreenLoader> = {
  title: () => import('@/screens/title'),
  settings: () => import('@/screens/settings'),
  customizer: () => import('@/screens/customizer'),
  outfits: () => import('@/screens/outfits'),
  accessories: () => import('@/screens/accessories'),
  studio: () => import('@/screens/studio'),
  rewards: () => import('@/screens/rewards'),
  character: () => import('@/screens/character'),
  'account-detail': () => import('@/screens/account-detail'),
  automation: () => import('@/screens/automation'),
  finance: () => import('@/screens/finance'),
  travel: () => import('@/screens/travel'),
  photo: () => import('@/screens/photo'),
  task: () => import('@/screens/task'),
  violations: () => import('@/screens/violations'),
  'campaign-brief': () => import('@/screens/campaign-brief'),
  'campaign-strategy': () => import('@/screens/campaign-strategy'),
  'campaign-minigame': () => import('@/screens/campaign-minigame'),
  'campaign-result': () => import('@/screens/campaign-result'),
  handphone: () => import('@/screens/handphone'),
  composer: () => import('@/screens/composer'),
  'post-result': () => import('@/screens/post-result'),
  shop: () => import('@/screens/shop'),
  'shop-detail': () => import('@/screens/shop-detail'),
  stocks: () => import('@/screens/stocks'),
  'stock-detail': () => import('@/screens/stock-detail'),
};

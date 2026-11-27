/**
 * Kontrak layar. Setiap layar wajib punya `id`, `mount`, dan `unmount`.
 * Listener didaftarkan lewat `ctx.signal` (AbortSignal) agar otomatis dilepas.
 */

import type { GameStore } from '@/state/game-store';
import type { GameActions } from '@/state/actions';
import type { BalanceConfig } from '@/data/config/balance';
import type { ToastService } from '@/components/toast/toast';
import type { OverlayService } from '@/components/modal/modal';
import type { Clock } from '@/core/clock';

export type ScreenId =
  | 'title'
  | 'settings'
  | 'customizer'
  | 'outfits'
  | 'accessories'
  | 'studio'
  | 'rewards'
  | 'character'
  | 'account-detail'
  | 'automation'
  | 'finance'
  | 'travel'
  | 'photo'
  | 'task'
  | 'violations'
  | 'campaign-brief'
  | 'campaign-strategy'
  | 'campaign-minigame'
  | 'campaign-result'
  | 'handphone'
  | 'composer'
  | 'post-result'
  | 'shop'
  | 'shop-detail'
  | 'stocks'
  | 'stock-detail';

export const SCREEN_IDS: readonly ScreenId[] = [
  'title',
  'settings',
  'customizer',
  'outfits',
  'accessories',
  'studio',
  'rewards',
  'character',
  'account-detail',
  'automation',
  'finance',
  'travel',
  'photo',
  'task',
  'violations',
  'campaign-brief',
  'campaign-strategy',
  'campaign-minigame',
  'campaign-result',
  'handphone',
  'composer',
  'post-result',
  'shop',
  'shop-detail',
  'stocks',
  'stock-detail',
];

export type ScreenParams = Record<string, string>;

export interface ScreenContext {
  store: GameStore;
  actions: GameActions;
  config: BalanceConfig;
  navigate: (screenId: ScreenId, params?: ScreenParams) => void;
  back: () => void;
  overlays: OverlayService;
  toasts: ToastService;
  clock: Clock;
  /** AbortSignal yang hidup selama screen terpasang. */
  signal: AbortSignal;
}

export interface ScreenModule {
  id: ScreenId;
  /** `mount` dipanggil setelah `#app` dibersihkan. */
  mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void;
  unmount?(): void;
}

export function isScreenId(value: string): value is ScreenId {
  return (SCREEN_IDS as readonly string[]).includes(value);
}

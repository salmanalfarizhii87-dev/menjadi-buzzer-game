/**
 * App context: satu objek yang dibagikan ke seluruh layar.
 */

import type { BalanceConfig } from '@/data/config/balance';
import type { Clock } from '@/core/clock';
import type { ToastService } from '@/components/toast/toast';
import type { OverlayService } from '@/components/modal/modal';
import type { GameStore } from '@/state/game-store';
import type { GameActions } from '@/state/actions';
import type { ScreenContext, ScreenId, ScreenParams } from './lifecycle';

export interface AppContext {
  store: GameStore;
  actions: GameActions;
  config: BalanceConfig;
  clock: Clock;
  overlays: OverlayService;
  toasts: ToastService;
  navigate: (screenId: ScreenId, params?: ScreenParams) => void;
  back: () => void;
}

export function createScreenContext(app: AppContext, signal: AbortSignal): ScreenContext {
  return {
    store: app.store,
    actions: app.actions,
    config: app.config,
    clock: app.clock,
    overlays: app.overlays,
    toasts: app.toasts,
    navigate: app.navigate,
    back: app.back,
    signal,
  };
}

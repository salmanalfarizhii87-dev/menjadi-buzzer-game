/**
 * Scheduler pasar: memanggil `tickMarket` setiap `config.stocks.tickMs`.
 * Dilewati saat tab tersembunyi agar tidak ada harga bergerak tanpa waktu aktif.
 */

import type { BalanceConfig } from '@/data/config/balance';
import type { GameActions } from '@/state/actions';

export interface StockScheduler {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

export interface StockSchedulerOptions {
  actions: GameActions;
  config: BalanceConfig;
  setIntervalFn?: (handler: () => void, ms: number) => number;
  clearIntervalFn?: (handle: number) => void;
}

export function createStockScheduler(options: StockSchedulerOptions): StockScheduler {
  const { actions, config } = options;
  const setIntervalFn =
    options.setIntervalFn ??
    ((handler: () => void, ms: number) =>
      globalThis.setInterval(handler, ms) as unknown as number);
  const clearIntervalFn =
    options.clearIntervalFn ??
    ((handle: number) =>
      globalThis.clearInterval(handle as unknown as ReturnType<typeof setInterval>));

  let handle: number | null = null;

  const tick = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    actions.tickMarket();
  };

  return {
    start() {
      if (handle !== null) return;
      handle = setIntervalFn(tick, config.stocks.tickMs);
    },
    stop() {
      if (handle === null) return;
      clearIntervalFn(handle);
      handle = null;
    },
    isRunning: () => handle !== null,
  };
}

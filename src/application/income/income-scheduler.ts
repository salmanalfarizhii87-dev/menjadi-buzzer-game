/**
 * Scheduler income. Satu interval global untuk seluruh aplikasi — bukan per
 * screen. Accrual tetap berbasis elapsed timestamp; interval hanya memicu update.
 */

import type { GameActions } from '@/state/actions';
import type { BalanceConfig } from '@/data/config/balance';

export interface IncomeScheduler {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

export interface IncomeSchedulerOptions {
  actions: GameActions;
  config: BalanceConfig;
  /** Default: setInterval browser. Bisa diganti untuk test. */
  setIntervalFn?: (handler: () => void, ms: number) => number;
  clearIntervalFn?: (handle: number) => void;
}

export function createIncomeScheduler(options: IncomeSchedulerOptions): IncomeScheduler {
  const { actions, config } = options;
  const setIntervalFn =
    options.setIntervalFn ??
    ((handler: () => void, ms: number) => globalThis.setInterval(handler, ms) as unknown as number);
  const clearIntervalFn =
    options.clearIntervalFn ??
    ((handle: number) => globalThis.clearInterval(handle as unknown as ReturnType<typeof setInterval>));

  let handle: number | null = null;

  const tick = (): void => {
    actions.accrueIncome();
  };

  return {
    start() {
      if (handle !== null) return;
      handle = setIntervalFn(tick, config.incomeTickMs);
    },
    stop() {
      if (handle === null) return;
      clearIntervalFn(handle);
      handle = null;
    },
    isRunning: () => handle !== null,
  };
}

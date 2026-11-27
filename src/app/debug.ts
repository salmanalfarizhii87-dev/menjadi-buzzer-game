/**
 * Fixture deterministik khusus dev: `?debug=1&roll=0&seed=42`.
 * Tidak aktif pada build produksi.
 */

import type { BalanceConfig } from '@/data/config/balance';
import type { GameActions } from '@/state/actions';
import type { GameStore } from '@/state/game-store';

export interface DebugOptions {
  enabled: boolean;
  roll: number | null;
  seed: number | null;
}

export interface DebugApi {
  store: GameStore;
  actions: GameActions;
  config: BalanceConfig;
  roll: number | null;
  seed: number | null;
}

declare global {
  interface Window {
    __menjadiBuzzer?: DebugApi;
  }
}

export function readDebugOptions(search: string, isDev: boolean): DebugOptions {
  const params = new URLSearchParams(search);
  if (!isDev || params.get('debug') !== '1') {
    return { enabled: false, roll: null, seed: null };
  }

  const roll = Number(params.get('roll'));
  const seed = Number(params.get('seed'));

  return {
    enabled: true,
    roll: params.has('roll') && Number.isFinite(roll) ? Math.min(1, Math.max(0, roll)) : null,
    seed: params.has('seed') && Number.isInteger(seed) ? seed : null,
  };
}

export function installDebugApi(api: DebugApi): void {
  if (typeof window !== 'undefined') {
    window.__menjadiBuzzer = api;
  }
}

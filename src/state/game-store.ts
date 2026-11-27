/**
 * Game store: sumber kebenaran tunggal untuk state aktif.
 *
 * - `dispatch` menerima reducer murni dan menghasilkan state baru.
 * - Tidak ada mutasi state di tempat.
 * - Subscriber dipanggil setelah state berubah; tidak dipanggil bila state identik.
 */

import type { GameSave } from './types';

export type StoreListener = (state: Readonly<GameSave>) => void;

export type Reducer = (state: GameSave) => GameSave;

export interface GameStore {
  getState(): Readonly<GameSave>;
  setState(next: GameSave): void;
  dispatch(reducer: Reducer): void;
  subscribe(listener: StoreListener): () => void;
  /** Dipanggil setiap kali state berubah, setelah subscriber UI. Untuk persist. */
  onCommit(listener: StoreListener): () => void;
}

export interface CreateStoreOptions {
  initialState: GameSave;
  /** Dipanggil setelah state berubah (debounce/persist diurus pemanggil). */
  onCommit?: (state: Readonly<GameSave>) => void;
}

export function createGameStore(options: CreateStoreOptions): GameStore {
  let state = options.initialState;
  const listeners = new Set<StoreListener>();
  const commitListeners = new Set<StoreListener>();

  const notify = (next: Readonly<GameSave>): void => {
    for (const listener of [...listeners]) listener(next);
    for (const listener of [...commitListeners]) listener(next);
    options.onCommit?.(next);
  };

  return {
    getState: () => state,

    setState(next: GameSave) {
      if (next === state) return;
      state = next;
      notify(state);
    },

    dispatch(reducer: Reducer) {
      const next = reducer(state);
      if (next === state) return;
      state = next;
      notify(state);
    },

    subscribe(listener: StoreListener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    onCommit(listener: StoreListener) {
      commitListeners.add(listener);
      return () => {
        commitListeners.delete(listener);
      };
    },
  };
}

import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from './game-store';

const NOW = 1_700_000_000_000;

describe('createGameStore', () => {
  it('mengembalikan state awal', () => {
    const save = createInitialSave(BALANCE, NOW);
    const store = createGameStore({ initialState: save });
    expect(store.getState().player.money).toBe(500);
  });

  it('dispatch menghasilkan state baru tanpa memutasi state lama', () => {
    const save = createInitialSave(BALANCE, NOW);
    const store = createGameStore({ initialState: save });

    store.dispatch((state) => ({
      ...state,
      player: { ...state.player, money: state.player.money + 100 },
    }));

    expect(store.getState().player.money).toBe(600);
    expect(save.player.money).toBe(500);
  });

  it('subscriber dipanggil saat state berubah', () => {
    const save = createInitialSave(BALANCE, NOW);
    const store = createGameStore({ initialState: save });
    const seen: number[] = [];

    store.subscribe((state) => seen.push(state.player.money));
    store.dispatch((state) => ({ ...state, player: { ...state.player, money: 900 } }));

    expect(seen).toEqual([900]);
  });

  it('subscriber TIDAK dipanggil bila reducer mengembalikan state identik', () => {
    const save = createInitialSave(BALANCE, NOW);
    const store = createGameStore({ initialState: save });
    let calls = 0;

    store.subscribe(() => {
      calls += 1;
    });

    store.dispatch((state) => state);
    expect(calls).toBe(0);
  });

  it('unsubscribe menghentikan notifikasi', () => {
    const save = createInitialSave(BALANCE, NOW);
    const store = createGameStore({ initialState: save });
    let calls = 0;

    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });

    store.dispatch((state) => ({ ...state, player: { ...state.player, money: 1 } }));
    unsubscribe();
    store.dispatch((state) => ({ ...state, player: { ...state.player, money: 2 } }));

    expect(calls).toBe(1);
  });

  it('onCommit juga dipanggil untuk kebutuhan persist', () => {
    const save = createInitialSave(BALANCE, NOW);
    const commits: number[] = [];
    const store = createGameStore({
      initialState: save,
      onCommit: (state) => commits.push(state.player.money),
    });

    store.dispatch((state) => ({ ...state, player: { ...state.player, money: 42 } }));
    expect(commits).toEqual([42]);
  });

  it('setState mengganti state secara langsung', () => {
    const save = createInitialSave(BALANCE, NOW);
    const store = createGameStore({ initialState: save });
    const next = { ...save, player: { ...save.player, money: 777 } };

    store.setState(next);
    expect(store.getState().player.money).toBe(777);
  });

  it('setState dengan objek sama tidak memicu notifikasi', () => {
    const save = createInitialSave(BALANCE, NOW);
    const store = createGameStore({ initialState: save });
    let calls = 0;
    store.subscribe(() => {
      calls += 1;
    });

    store.setState(save);
    expect(calls).toBe(0);
  });
});

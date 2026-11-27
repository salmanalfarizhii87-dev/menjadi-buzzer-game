import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createFakeClock } from '@/core/clock';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from '@/state/game-store';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameActions } from '@/state/actions';
import { installMemoryStorage, uninstallMemoryStorage } from '@/tests/helpers';

const START = 1_700_000_000_000;
let clock: ReturnType<typeof createFakeClock>;

beforeEach(() => {
  installMemoryStorage();
  clock = createFakeClock(START);
});

afterEach(() => {
  uninstallMemoryStorage();
});

function setup(money = 2000) {
  const base = createInitialSave(BALANCE, START);
  const store = createGameStore({ initialState: { ...base, player: { ...base.player, money } } });
  const repository = createSaveRepository({ now: () => clock.now(), debounceMs: 0 });
  const actions = createGameActions({ store, config: BALANCE, repository, clock });
  return { store, actions };
}

describe('flyTo', () => {
  it('menolak negara tanpa tiket', () => {
    const { actions } = setup();
    const result = actions.flyTo('belanda');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('locked');
  });

  it('terbang setelah tiket dibeli: saldo terpotong + lokasi berubah', () => {
    const { store, actions } = setup();
    expect(actions.buyShopItem('ticket-belanda').ok).toBe(true);

    const result = actions.flyTo('belanda');
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const save = store.getState();
    expect(result.value.cost).toBe(200);
    expect(save.player.money).toBe(600);
    expect(save.character.locationCountryId).toBe('belanda');
    expect(save.character.visitedCountryIds).toContain('belanda');
    expect(save.transactions.some((transaction) => transaction.type === 'travel_cost')).toBe(true);
  });

  it('menolak terbang ke negara saat ini', () => {
    const { actions } = setup();
    const result = actions.flyTo('nusantara');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_transition');
  });

  it('negara yang sudah dikunjungi tidak menambah koleksi ganda', () => {
    const { store, actions } = setup();
    expect(actions.buyShopItem('ticket-belanda').ok).toBe(true);
    expect(actions.flyTo('belanda').ok).toBe(true);
    expect(actions.flyTo('nusantara').ok).toBe(true);

    const revisit = actions.flyTo('belanda');
    expect(revisit.ok).toBe(true);
    if (!revisit.ok) return;
    expect(revisit.value.firstVisit).toBe(false);

    const visited = store.getState().character.visitedCountryIds;
    expect(visited.filter((id) => id === 'belanda')).toHaveLength(1);
  });

  it('menolak saat saldo kurang untuk biaya terbang', () => {
    const { actions } = setup(1200);
    expect(actions.buyShopItem('ticket-belanda').ok).toBe(true);

    const result = actions.flyTo('belanda');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('insufficient_funds');
  });
});

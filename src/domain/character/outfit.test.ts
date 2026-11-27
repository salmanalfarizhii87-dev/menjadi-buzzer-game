import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { equipOutfit, evaluateEquipOutfit } from './outfit';

const NOW = 1_700_000_000_000;

function save() {
  return createInitialSave(BALANCE, NOW);
}

describe('evaluateEquipOutfit', () => {
  it('mengizinkan outfit yang dimiliki', () => {
    const result = evaluateEquipOutfit(save(), 'outfit-basic');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.alreadyEquipped).toBe(true);
  });

  it('menolak outfit yang belum dimiliki', () => {
    const result = evaluateEquipOutfit(save(), 'outfit-luxury');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe('locked');
  });

  it('menolak outfit yang tidak dikenal', () => {
    const result = evaluateEquipOutfit(save(), 'outfit-ghost');
    expect(result.ok).toBe(false);
  });

  it('menandai belum terpasang bila berbeda', () => {
    const state = save();
    const withOwned = {
      ...state,
      inventory: {
        ...state.inventory,
        ownedItemIds: [...state.inventory.ownedItemIds, 'outfit-casual'],
      },
    };
    const result = evaluateEquipOutfit(withOwned, 'outfit-casual');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.alreadyEquipped).toBe(false);
  });
});

describe('equipOutfit', () => {
  it('mengubah outfit di inventory dan character', () => {
    const state = save();
    const withOwned = {
      ...state,
      inventory: {
        ...state.inventory,
        ownedItemIds: [...state.inventory.ownedItemIds, 'outfit-formal'],
      },
    };

    const result = equipOutfit(withOwned, 'outfit-formal');
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.inventory.equippedOutfitId).toBe('outfit-formal');
    expect(result.value.character.outfitId).toBe('outfit-formal');
  });

  it('tidak memutasi save asli', () => {
    const state = save();
    const withOwned = {
      ...state,
      inventory: {
        ...state.inventory,
        ownedItemIds: [...state.inventory.ownedItemIds, 'outfit-casual'],
      },
    };

    equipOutfit(withOwned, 'outfit-casual');
    expect(withOwned.inventory.equippedOutfitId).toBe('outfit-basic');
  });

  it('mengembalikan save yang sama bila sudah terpasang', () => {
    const state = save();
    const result = equipOutfit(state, 'outfit-basic');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toBe(state);
  });

  it('menolak outfit yang belum dimiliki', () => {
    const result = equipOutfit(save(), 'outfit-luxury');
    expect(result.ok).toBe(false);
  });
});

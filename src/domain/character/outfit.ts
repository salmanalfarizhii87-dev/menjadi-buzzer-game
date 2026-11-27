/**
 * Aturan pemakaian outfit. Pure — validasi tanpa mutasi.
 */

import { findOutfit, type OutfitDefinition } from '@/data/shop/outfits';
import { err, ok, type ActionResult } from '@/core/result';
import type { GameSave } from '@/state/types';

export interface EquipEvaluation {
  outfit: OutfitDefinition;
  alreadyEquipped: boolean;
}

export function evaluateEquipOutfit(save: GameSave, outfitId: string): ActionResult<EquipEvaluation> {
  const outfit = findOutfit(outfitId);
  if (!outfit) {
    return err('campaign_not_found', 'error.unknown', `outfit tidak dikenal: ${outfitId}`);
  }

  const owned = save.inventory.ownedItemIds.includes(outfitId);
  if (!owned) {
    return err('locked', 'error.locked', `outfit belum dimiliki: ${outfitId}`);
  }

  return ok({
    outfit,
    alreadyEquipped: save.inventory.equippedOutfitId === outfitId,
  });
}

/** Terapkan outfit ke save (pure). */
export function equipOutfit(save: GameSave, outfitId: string): ActionResult<GameSave> {
  const evaluation = evaluateEquipOutfit(save, outfitId);
  if (!evaluation.ok) return evaluation;

  if (evaluation.value.alreadyEquipped) return ok(save);

  return ok({
    ...save,
    inventory: { ...save.inventory, equippedOutfitId: outfitId },
    character: { ...save.character, outfitId },
  });
}

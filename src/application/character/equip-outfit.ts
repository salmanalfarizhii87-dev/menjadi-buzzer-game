/**
 * Use case: pasang outfit yang sudah dimiliki. Validasi & mutasi save
 * dilakukan domain `equipOutfit`; action menambah persist.
 */

import { ok, type ActionResult } from '@/core/result';
import { equipOutfit } from '@/domain/character/outfit';
import type { CampaignUseCaseDeps } from '../campaigns/accept-campaign';

export interface EquipOutfitOutcome {
  outfitId: string;
}

export function equipOutfitAction(
  deps: CampaignUseCaseDeps,
  outfitId: string,
): ActionResult<EquipOutfitOutcome> {
  const { store, repository, clock } = deps;
  const inFlight = deps.inFlight ?? new Set<string>();
  const guardKey = `equip-outfit:${outfitId}`;

  if (inFlight.has(guardKey)) {
    return ok({ outfitId });
  }
  inFlight.add(guardKey);

  try {
    const save = store.getState();
    const applied = equipOutfit(save, outfitId);
    if (!applied.ok) return applied;

    if (applied.value === save) {
      return ok({ outfitId });
    }

    const now = clock.now();
    const next = { ...applied.value, meta: { ...applied.value.meta, updatedAt: now } };

    store.setState(next);
    repository.saveNow(next);

    return ok({ outfitId });
  } finally {
    inFlight.delete(guardKey);
  }
}

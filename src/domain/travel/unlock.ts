/**
 * Aturan terbang: tiket harus dimiliki, bukan negara saat ini, dan saldo
 * cukup untuk biaya. Pure — application layer yang memotong saldo.
 */

import type { BalanceConfig } from '@/data/config/balance';
import type { GameSave } from '@/state/types';

export type FlightBlockReason = 'locked' | 'current' | 'insufficient_funds';

export interface FlightEvaluation {
  countryId: string;
  cost: number;
  allowed: boolean;
  firstVisit: boolean;
  reason?: FlightBlockReason;
}

export function travelCost(config: BalanceConfig, countryId: string): number {
  return config.travel.countryCosts[countryId] ?? config.travel.defaultTravelCost;
}

export function isUnlocked(save: GameSave, countryId: string): boolean {
  return save.tickets.ownedCountryIds.includes(countryId);
}

export function canFly(
  save: GameSave,
  config: BalanceConfig,
  countryId: string,
  balance = save.player.money,
): FlightEvaluation {
  const cost = travelCost(config, countryId);
  const firstVisit = !save.character.visitedCountryIds.includes(countryId);

  if (!isUnlocked(save, countryId)) {
    return { countryId, cost, allowed: false, firstVisit, reason: 'locked' };
  }
  if (save.character.locationCountryId === countryId) {
    return { countryId, cost, allowed: false, firstVisit, reason: 'current' };
  }
  if (balance < cost) {
    return { countryId, cost, allowed: false, firstVisit, reason: 'insufficient_funds' };
  }
  return { countryId, cost, allowed: true, firstVisit };
}

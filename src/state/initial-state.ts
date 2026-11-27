/**
 * State awal pemain. Semua nilai berasal dari `BALANCE.startingState`.
 */

import { createId } from '@/core/ids';
import { assertFiniteAmount } from '@/core/money';
import {
  APP_SCHEMA_VERSION,
  type AccountState,
  type GameSave,
  type PlayerState,
} from './types';
import type { BalanceConfig } from '@/data/config/balance';
import { COMPANIES } from '@/data/stocks/companies';
import { createInitialMarket } from '@/domain/stocks/market';

export const DEFAULT_OUTFIT_ID = 'outfit-basic';

export function createInitialPlayer(config: BalanceConfig, now: number): PlayerState {
  const start = config.startingState;
  return {
    id: createId('player', now),
    money: assertFiniteAmount(start.money),
    reputation: start.reputation,
    careerLevel: start.careerLevel,
    careerXP: start.careerXP,
    sessionsCompleted: 0,
    createdAt: now,
  };
}

export function createInitialAccount(config: BalanceConfig, now: number): AccountState {
  const start = config.startingState.account;
  return {
    id: createId('account', now),
    name: start.name,
    platformId: start.platformId,
    followers: start.followers,
    performance: start.performance,
    reputation: start.reputation,
    suspicion: start.suspicion,
    status: start.status,
    automationLevel: start.automationLevel,
  };
}

export function createInitialSave(config: BalanceConfig, now: number): GameSave {
  const start = config.startingState;
  const outfitId = start.character.outfitId || DEFAULT_OUTFIT_ID;

  return {
    schemaVersion: APP_SCHEMA_VERSION,
    player: createInitialPlayer(config, now),
    accounts: [createInitialAccount(config, now)],
    upgrades: [],
    campaignSessions: [],
    transactions: [],
    activeTime: {
      lastAccrualAt: now,
      fractionalIncome: 0,
      pendingIncome: 0,
      pendingIncomeSince: null,
    },
    settings: {
      soundEnabled: true,
      reducedMotion: false,
      confirmRisk: true,
      incomePop: true,
      qaMode: false,
    },
    meta: {
      createdAt: now,
      updatedAt: now,
    },
    // v2
    character: {
      outfitId,
      accessoryIds: [],
      locationCountryId: start.character.locationCountryId,
      visitedCountryIds: [...start.character.visitedCountryIds],
    },
    inventory: {
      ownedItemIds: [outfitId],
      equippedOutfitId: outfitId,
      equippedAccessoryIds: [],
    },
    assets: {
      propertyIds: [],
      vehicleIds: [],
    },
    tickets: {
      // Negara awal dianggap sudah dapat diakses tanpa tiket.
      ownedCountryIds: [start.character.locationCountryId],
    },
    stocks: {
      holdings: [],
      ...createInitialMarket(COMPANIES, now),
      seed: Math.floor(now % 2_147_483_647),
      lastTickAt: now,
      tickIndex: 0,
    },
    social: {
      cooldownUntil: null,
      postingCount: 0,
      shadowbannedUntil: null,
      lastPostAt: null,
    },
    violations: [],
    risk: {
      tier: 'safe',
      lastEvaluatedAt: now,
    },
  };
}

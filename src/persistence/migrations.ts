/**
 * Registry migrasi schema save. Setiap migrasi menaikkan versi tepat satu
 * langkah dan harus idempoten terhadap input yang sudah benar.
 */

import type { ValidationIssue } from './save-schema';

export type Migration = (payload: unknown) => unknown;

export interface MigrationRegistry {
  /** Versi target aplikasi saat ini. */
  currentVersion: number;
  /** key = versi asal, value = fungsi menuju versi asal + 1. */
  steps: Record<number, Migration>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * v1 → v2: tambah karakter, inventori, aset, tiket, saham, sosial, violations, risk.
 *
 * Data v1 dipertahankan seluruhnya. Field baru memakai default yang aman sehingga
 * pemain lama tetap bisa melanjutkan tanpa kehilangan saldo/akun/transaksi.
 */
export function migrateV1ToV2(payload: unknown): unknown {
  if (!isObject(payload)) return payload;

  const outfitId = 'outfit-basic';
  const startingCountryId = 'nusantara';

  const existingCharacter = isObject(payload.character) ? payload.character : null;
  const existingInventory = isObject(payload.inventory) ? payload.inventory : null;
  const existingAssets = isObject(payload.assets) ? payload.assets : null;
  const existingTickets = isObject(payload.tickets) ? payload.tickets : null;
  const existingStocks = isObject(payload.stocks) ? payload.stocks : null;
  const existingSocial = isObject(payload.social) ? payload.social : null;
  const existingRisk = isObject(payload.risk) ? payload.risk : null;

  const now = typeof payload.meta === 'object' && payload.meta !== null
    ? Number((payload.meta as Record<string, unknown>).updatedAt) || 0
    : 0;

  const resolvedOutfitId =
    existingCharacter && typeof existingCharacter.outfitId === 'string'
      ? existingCharacter.outfitId
      : outfitId;

  return {
    ...payload,
    schemaVersion: 2,
    character: existingCharacter ?? {
      outfitId: resolvedOutfitId,
      accessoryIds: [],
      locationCountryId: startingCountryId,
      visitedCountryIds: [startingCountryId],
    },
    inventory: existingInventory ?? {
      ownedItemIds: [resolvedOutfitId],
      equippedOutfitId: resolvedOutfitId,
      equippedAccessoryIds: [],
    },
    assets: existingAssets ?? { propertyIds: [], vehicleIds: [] },
    tickets: existingTickets ?? { ownedCountryIds: [startingCountryId] },
    stocks: existingStocks ?? {
      holdings: [],
      prices: {},
      history: {},
      seed: Math.floor(now % 2_147_483_647),
      lastTickAt: now,
      tickIndex: 0,
    },
    social: existingSocial ?? {
      cooldownUntil: null,
      postingCount: 0,
      shadowbannedUntil: null,
      lastPostAt: null,
    },
    violations: Array.isArray(payload.violations) ? payload.violations : [],
    risk: existingRisk ?? { tier: 'safe', lastEvaluatedAt: now },
  };
}

export const MIGRATIONS: MigrationRegistry = {
  currentVersion: 2,
  steps: {
    1: migrateV1ToV2,
  },
};

export type MigrationResult =
  | { ok: true; payload: unknown; migratedFrom: number | null }
  | { ok: false; code: 'newer_than_app' | 'missing_migration'; issues: ValidationIssue[] };

export function migratePayload(
  payload: unknown,
  savedVersion: number,
  registry: MigrationRegistry = MIGRATIONS,
): MigrationResult {
  if (savedVersion > registry.currentVersion) {
    return {
      ok: false,
      code: 'newer_than_app',
      issues: [
        {
          path: 'schemaVersion',
          message: `save versi ${savedVersion} lebih baru dari aplikasi (${registry.currentVersion})`,
        },
      ],
    };
  }

  if (savedVersion === registry.currentVersion) {
    return { ok: true, payload, migratedFrom: null };
  }

  let current = payload;
  let version = savedVersion;

  while (version < registry.currentVersion) {
    const step = registry.steps[version];
    if (!step) {
      return {
        ok: false,
        code: 'missing_migration',
        issues: [
          {
            path: 'schemaVersion',
            message: `tidak ada migrasi dari versi ${version} ke ${version + 1}`,
          },
        ],
      };
    }
    current = step(current);
    version += 1;
  }

  return { ok: true, payload: current, migratedFrom: savedVersion };
}

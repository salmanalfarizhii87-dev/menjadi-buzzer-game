/**
 * Validasi struktur save. Ditulis manual (tanpa dependency) agar bundle tetap
 * kecil dan pesan error spesifik.
 */

import {
  APP_ID,
  APP_SCHEMA_VERSION,
  ALL_ACCOUNT_STATUSES,
  ALL_CAMPAIGN_STATUSES,
  ALL_TRANSACTION_TYPES,
  type AccountState,
  type AccountStatus,
  type CampaignResultSnapshot,
  type CampaignSession,
  type CampaignStatus,
  type GameSave,
  type PlayerState,
  type Transaction,
  type TransactionType,
  type UpgradeState,
  ALL_RISK_TIERS,
  ALL_VIOLATION_KINDS,
  type RiskTier,
  type ViolationKind,
} from '@/state/types';

export interface ValidationIssue {
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; save: GameSave }
  | { ok: false; issues: ValidationIssue[] };

export interface SaveEnvelope {
  appId: string;
  schemaVersion: number;
  savedAt: number;
  payload: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function pushIssue(issues: ValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

function validatePlayer(value: unknown, issues: ValidationIssue[]): PlayerState | null {
  if (!isObject(value)) {
    pushIssue(issues, 'player', 'harus berupa objek');
    return null;
  }
  if (!isNonEmptyString(value.id)) pushIssue(issues, 'player.id', 'harus string tidak kosong');
  if (!isFiniteNumber(value.money)) pushIssue(issues, 'player.money', 'harus angka berhingga');
  if (!isFiniteNumber(value.reputation)) pushIssue(issues, 'player.reputation', 'harus angka');
  if (!isFiniteNumber(value.careerLevel)) pushIssue(issues, 'player.careerLevel', 'harus angka');
  if (!isFiniteNumber(value.careerXP)) pushIssue(issues, 'player.careerXP', 'harus angka');
  if (!isFiniteNumber(value.sessionsCompleted)) {
    pushIssue(issues, 'player.sessionsCompleted', 'harus angka');
  }
  if (!isFiniteNumber(value.createdAt)) pushIssue(issues, 'player.createdAt', 'harus angka');

  if (issues.length > 0) return null;
  return value as unknown as PlayerState;
}

function validateAccount(value: unknown, index: number, issues: ValidationIssue[]): AccountState | null {
  const path = `accounts[${index}]`;
  if (!isObject(value)) {
    pushIssue(issues, path, 'harus berupa objek');
    return null;
  }
  if (!isNonEmptyString(value.id)) pushIssue(issues, `${path}.id`, 'harus string');
  if (!isNonEmptyString(value.name)) pushIssue(issues, `${path}.name`, 'harus string');
  if (!isNonEmptyString(value.platformId)) pushIssue(issues, `${path}.platformId`, 'harus string');
  if (!isFiniteNumber(value.followers)) pushIssue(issues, `${path}.followers`, 'harus angka');
  if (!isFiniteNumber(value.performance)) pushIssue(issues, `${path}.performance`, 'harus angka');
  if (!isFiniteNumber(value.reputation)) pushIssue(issues, `${path}.reputation`, 'harus angka');
  if (!isFiniteNumber(value.suspicion)) pushIssue(issues, `${path}.suspicion`, 'harus angka');
  if (!isFiniteNumber(value.automationLevel)) {
    pushIssue(issues, `${path}.automationLevel`, 'harus angka');
  }
  if (!ALL_ACCOUNT_STATUSES.includes(value.status as AccountStatus)) {
    pushIssue(issues, `${path}.status`, 'status akun tidak dikenal');
  }
  return issues.length > 0 ? null : (value as unknown as AccountState);
}

function validateUpgrade(value: unknown, index: number, issues: ValidationIssue[]): UpgradeState | null {
  const path = `upgrades[${index}]`;
  if (!isObject(value)) {
    pushIssue(issues, path, 'harus berupa objek');
    return null;
  }
  if (!isNonEmptyString(value.id)) pushIssue(issues, `${path}.id`, 'harus string');
  if (!isNonEmptyString(value.accountId)) pushIssue(issues, `${path}.accountId`, 'harus string');
  if (!isNonEmptyString(value.upgradeKey)) pushIssue(issues, `${path}.upgradeKey`, 'harus string');
  if (!isFiniteNumber(value.level)) pushIssue(issues, `${path}.level`, 'harus angka');
  return issues.length > 0 ? null : (value as unknown as UpgradeState);
}

function validateResultSnapshot(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isObject(value)) {
    pushIssue(issues, path, 'harus berupa objek');
    return;
  }
  if (!isFiniteNumber(value.roll)) pushIssue(issues, `${path}.roll`, 'harus angka');
  if (!isFiniteNumber(value.successProbability)) {
    pushIssue(issues, `${path}.successProbability`, 'harus angka');
  }
  if (!isFiniteNumber(value.performanceScore)) {
    pushIssue(issues, `${path}.performanceScore`, 'harus angka');
  }
  if (value.outcome !== 'success' && value.outcome !== 'partial' && value.outcome !== 'failure') {
    pushIssue(issues, `${path}.outcome`, 'outcome tidak dikenal');
  }
  if (!isFiniteNumber(value.reward)) pushIssue(issues, `${path}.reward`, 'harus angka');
  if (!isFiniteNumber(value.bonus)) pushIssue(issues, `${path}.bonus`, 'harus angka');
  if (!isFiniteNumber(value.fine)) pushIssue(issues, `${path}.fine`, 'harus angka');
}

function validateSession(value: unknown, index: number, issues: ValidationIssue[]): CampaignSession | null {
  const path = `campaignSessions[${index}]`;
  if (!isObject(value)) {
    pushIssue(issues, path, 'harus berupa objek');
    return null;
  }
  if (!isNonEmptyString(value.id)) pushIssue(issues, `${path}.id`, 'harus string');
  if (!isNonEmptyString(value.campaignDefinitionId)) {
    pushIssue(issues, `${path}.campaignDefinitionId`, 'harus string');
  }
  if (!isNonEmptyString(value.accountId)) pushIssue(issues, `${path}.accountId`, 'harus string');
  if (!ALL_CAMPAIGN_STATUSES.includes(value.status as CampaignStatus)) {
    pushIssue(issues, `${path}.status`, 'status campaign tidak dikenal');
  }
  if (!isFiniteNumber(value.acceptedAt)) pushIssue(issues, `${path}.acceptedAt`, 'harus angka');
  if (!isFiniteNumber(value.miniGameSeed)) pushIssue(issues, `${path}.miniGameSeed`, 'harus angka');
  if (value.result !== null && value.result !== undefined) {
    validateResultSnapshot(value.result, `${path}.result`, issues);
  }
  return issues.length > 0 ? null : (value as unknown as CampaignSession);
}

function validateTransaction(value: unknown, index: number, issues: ValidationIssue[]): Transaction | null {
  const path = `transactions[${index}]`;
  if (!isObject(value)) {
    pushIssue(issues, path, 'harus berupa objek');
    return null;
  }
  if (!isNonEmptyString(value.id)) pushIssue(issues, `${path}.id`, 'harus string');
  if (!ALL_TRANSACTION_TYPES.includes(value.type as TransactionType)) {
    pushIssue(issues, `${path}.type`, 'tipe transaksi tidak dikenal');
  }
  if (!isFiniteNumber(value.amount)) pushIssue(issues, `${path}.amount`, 'harus angka');
  if (!isFiniteNumber(value.balanceAfter)) pushIssue(issues, `${path}.balanceAfter`, 'harus angka');
  if (!isFiniteNumber(value.createdAt)) pushIssue(issues, `${path}.createdAt`, 'harus angka');
  if (!isNonEmptyString(value.descriptionKey)) {
    pushIssue(issues, `${path}.descriptionKey`, 'harus string');
  }
  return issues.length > 0 ? null : (value as unknown as Transaction);
}

function validateStringArray(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, 'harus array');
    return;
  }
  value.forEach((entry, index) => {
    if (typeof entry !== 'string') pushIssue(issues, `${path}[${index}]`, 'harus string');
  });
}

function validateCharacter(value: unknown, issues: ValidationIssue[]): void {
  if (!isObject(value)) {
    pushIssue(issues, 'character', 'harus objek');
    return;
  }
  if (!isNonEmptyString(value.outfitId)) pushIssue(issues, 'character.outfitId', 'harus string');
  validateStringArray(value.accessoryIds, 'character.accessoryIds', issues);
  if (!isNonEmptyString(value.locationCountryId)) {
    pushIssue(issues, 'character.locationCountryId', 'harus string');
  }
  validateStringArray(value.visitedCountryIds, 'character.visitedCountryIds', issues);
}

function validateInventory(value: unknown, issues: ValidationIssue[]): void {
  if (!isObject(value)) {
    pushIssue(issues, 'inventory', 'harus objek');
    return;
  }
  validateStringArray(value.ownedItemIds, 'inventory.ownedItemIds', issues);
  if (!isNonEmptyString(value.equippedOutfitId)) {
    pushIssue(issues, 'inventory.equippedOutfitId', 'harus string');
  }
  validateStringArray(value.equippedAccessoryIds, 'inventory.equippedAccessoryIds', issues);
}

function validateAssets(value: unknown, issues: ValidationIssue[]): void {
  if (!isObject(value)) {
    pushIssue(issues, 'assets', 'harus objek');
    return;
  }
  validateStringArray(value.propertyIds, 'assets.propertyIds', issues);
  validateStringArray(value.vehicleIds, 'assets.vehicleIds', issues);
}

function validateTickets(value: unknown, issues: ValidationIssue[]): void {
  if (!isObject(value)) {
    pushIssue(issues, 'tickets', 'harus objek');
    return;
  }
  validateStringArray(value.ownedCountryIds, 'tickets.ownedCountryIds', issues);
}

function validateStocks(value: unknown, issues: ValidationIssue[]): void {
  if (!isObject(value)) {
    pushIssue(issues, 'stocks', 'harus objek');
    return;
  }
  if (!Array.isArray(value.holdings)) {
    pushIssue(issues, 'stocks.holdings', 'harus array');
  } else {
    value.holdings.forEach((holding, index) => {
      const path = `stocks.holdings[${index}]`;
      if (!isObject(holding)) {
        pushIssue(issues, path, 'harus objek');
        return;
      }
      if (!isNonEmptyString(holding.ticker)) pushIssue(issues, `${path}.ticker`, 'harus string');
      if (!isFiniteNumber(holding.shares)) pushIssue(issues, `${path}.shares`, 'harus angka');
      if (!isFiniteNumber(holding.avgCost)) pushIssue(issues, `${path}.avgCost`, 'harus angka');
    });
  }
  if (!isObject(value.prices)) pushIssue(issues, 'stocks.prices', 'harus objek');
  if (!isObject(value.history)) pushIssue(issues, 'stocks.history', 'harus objek');
  if (!isFiniteNumber(value.seed)) pushIssue(issues, 'stocks.seed', 'harus angka');
  if (!isFiniteNumber(value.lastTickAt)) pushIssue(issues, 'stocks.lastTickAt', 'harus angka');
}

function validateSocial(value: unknown, issues: ValidationIssue[]): void {
  if (!isObject(value)) {
    pushIssue(issues, 'social', 'harus objek');
    return;
  }
  if (!isFiniteNumber(value.postingCount)) pushIssue(issues, 'social.postingCount', 'harus angka');
  if (value.cooldownUntil !== null && !isFiniteNumber(value.cooldownUntil)) {
    pushIssue(issues, 'social.cooldownUntil', 'harus angka atau null');
  }
  if (value.shadowbannedUntil !== null && !isFiniteNumber(value.shadowbannedUntil)) {
    pushIssue(issues, 'social.shadowbannedUntil', 'harus angka atau null');
  }
}

function validateViolations(value: unknown, issues: ValidationIssue[]): void {
  if (!Array.isArray(value)) {
    pushIssue(issues, 'violations', 'harus array');
    return;
  }
  value.forEach((entry, index) => {
    const path = `violations[${index}]`;
    if (!isObject(entry)) {
      pushIssue(issues, path, 'harus objek');
      return;
    }
    if (!isNonEmptyString(entry.id)) pushIssue(issues, `${path}.id`, 'harus string');
    if (!ALL_VIOLATION_KINDS.includes(entry.kind as ViolationKind)) {
      pushIssue(issues, `${path}.kind`, 'jenis pelanggaran tidak dikenal');
    }
    if (!ALL_RISK_TIERS.includes(entry.tier as RiskTier)) {
      pushIssue(issues, `${path}.tier`, 'tier tidak dikenal');
    }
    if (!isFiniteNumber(entry.amount)) pushIssue(issues, `${path}.amount`, 'harus angka');
    if (!isFiniteNumber(entry.at)) pushIssue(issues, `${path}.at`, 'harus angka');
  });
}

function validateRisk(value: unknown, issues: ValidationIssue[]): void {
  if (!isObject(value)) {
    pushIssue(issues, 'risk', 'harus objek');
    return;
  }
  if (!ALL_RISK_TIERS.includes(value.tier as RiskTier)) {
    pushIssue(issues, 'risk.tier', 'tier tidak dikenal');
  }
  if (!isFiniteNumber(value.lastEvaluatedAt)) {
    pushIssue(issues, 'risk.lastEvaluatedAt', 'harus angka');
  }
}

/** Validasi payload save lengkap. */
export function validateSavePayload(value: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isObject(value)) {
    return { ok: false, issues: [{ path: '$', message: 'payload harus berupa objek' }] };
  }

  if (value.schemaVersion !== APP_SCHEMA_VERSION) {
    pushIssue(issues, 'schemaVersion', `harus ${APP_SCHEMA_VERSION}`);
  }

  validatePlayer(value.player, issues);

  if (!Array.isArray(value.accounts) || value.accounts.length === 0) {
    pushIssue(issues, 'accounts', 'harus array dengan minimal satu akun');
  } else {
    value.accounts.forEach((account, index) => validateAccount(account, index, issues));
  }

  if (!Array.isArray(value.upgrades)) {
    pushIssue(issues, 'upgrades', 'harus array');
  } else {
    value.upgrades.forEach((upgrade, index) => validateUpgrade(upgrade, index, issues));
  }

  if (!Array.isArray(value.campaignSessions)) {
    pushIssue(issues, 'campaignSessions', 'harus array');
  } else {
    value.campaignSessions.forEach((session, index) => validateSession(session, index, issues));
  }

  if (!Array.isArray(value.transactions)) {
    pushIssue(issues, 'transactions', 'harus array');
  } else {
    value.transactions.forEach((transaction, index) =>
      validateTransaction(transaction, index, issues),
    );
  }

  if (!isObject(value.activeTime)) {
    pushIssue(issues, 'activeTime', 'harus objek');
  } else {
    if (!isFiniteNumber(value.activeTime.lastAccrualAt)) {
      pushIssue(issues, 'activeTime.lastAccrualAt', 'harus angka');
    }
    if (!isFiniteNumber(value.activeTime.fractionalIncome)) {
      pushIssue(issues, 'activeTime.fractionalIncome', 'harus angka');
    }
    if (!isFiniteNumber(value.activeTime.pendingIncome)) {
      pushIssue(issues, 'activeTime.pendingIncome', 'harus angka');
    }
  }

  if (!isObject(value.settings)) {
    pushIssue(issues, 'settings', 'harus objek');
  } else {
    if (typeof value.settings.soundEnabled !== 'boolean') {
      pushIssue(issues, 'settings.soundEnabled', 'harus boolean');
    }
    if (typeof value.settings.reducedMotion !== 'boolean') {
      pushIssue(issues, 'settings.reducedMotion', 'harus boolean');
    }
  }

  if (!isObject(value.meta)) {
    pushIssue(issues, 'meta', 'harus objek');
  } else {
    if (!isFiniteNumber(value.meta.createdAt)) pushIssue(issues, 'meta.createdAt', 'harus angka');
    if (!isFiniteNumber(value.meta.updatedAt)) pushIssue(issues, 'meta.updatedAt', 'harus angka');
  }

  validateCharacter(value.character, issues);
  validateInventory(value.inventory, issues);
  validateAssets(value.assets, issues);
  validateTickets(value.tickets, issues);
  validateStocks(value.stocks, issues);
  validateSocial(value.social, issues);
  validateViolations(value.violations, issues);
  validateRisk(value.risk, issues);

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, save: value as unknown as GameSave };
}

/** Validasi envelope sebelum membaca payload. */
export function parseEnvelope(raw: string):
  | { ok: true; envelope: SaveEnvelope }
  | { ok: false; issues: ValidationIssue[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return {
      ok: false,
      issues: [{ path: '$', message: `JSON tidak valid: ${String(error)}` }],
    };
  }

  const issues: ValidationIssue[] = [];

  if (!isObject(parsed)) {
    return { ok: false, issues: [{ path: '$', message: 'envelope harus objek' }] };
  }
  if (parsed.appId !== APP_ID) {
    pushIssue(issues, 'appId', `harus "${APP_ID}"`);
  }
  if (!isFiniteNumber(parsed.schemaVersion)) {
    pushIssue(issues, 'schemaVersion', 'harus angka');
  }
  if (!isFiniteNumber(parsed.savedAt)) {
    pushIssue(issues, 'savedAt', 'harus angka');
  }
  if (!('payload' in parsed)) {
    pushIssue(issues, 'payload', 'wajib ada');
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, envelope: parsed as unknown as SaveEnvelope };
}

export type { CampaignResultSnapshot };

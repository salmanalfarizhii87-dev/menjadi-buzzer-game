/**
 * Selector: pure, tidak memutasi state, tidak menulis storage.
 * Semua nilai turunan yang dibutuhkan UI dihitung di sini.
 */

import type {
  AccountState,
  CampaignSession,
  GameSave,
  RiskTier,
  Transaction,
} from '@/state/types';
import { isFinalCampaignStatus } from '@/state/types';
import { tierForSuspicion } from '@/domain/risk/tier';
import { findOutfit } from '@/data/shop/outfits';
import { assetIncomeEffect } from '@/domain/shop/effects';
import { summarizePortfolio, type PortfolioSummary } from '@/domain/stocks/portfolio';
import { CAMPAIGNS } from '@/data/campaigns/seed';
import {
  evaluateEligibility,
  type EligibilityResult,
} from '@/domain/campaigns/eligibility';
import type { CampaignDefinition } from '@/domain/campaigns/definition';
import { calculateIncomeBreakdown, type IncomeBreakdown } from '@/domain/economy/income';
import type { BalanceConfig } from '@/data/config/balance';

export function selectBalance(save: GameSave): number {
  return save.player.money;
}

/**
 * Saldo yang ditampilkan ke pemain = saldo terkredit + income pending.
 * Income diakumulasi di `pendingIncome` dan baru masuk `money` saat flush, agar
 * ledger tetap konsisten. UI tetap terasa real-time lewat nilai ini.
 */
export function selectDisplayBalance(save: GameSave): number {
  return save.player.money + save.activeTime.pendingIncome;
}

export function selectIsDebt(save: GameSave): boolean {
  return selectDisplayBalance(save) < 0;
}

export function selectPrimaryAccount(save: GameSave): AccountState | undefined {
  return save.accounts[0];
}

export function selectAccountById(save: GameSave, accountId: string): AccountState | undefined {
  return save.accounts.find((account) => account.id === accountId);
}

/** Multiplier automation untuk akun, dihitung dari definisi upgrade di config. */
export function selectAutomationMultiplier(save: GameSave, config: BalanceConfig): number {
  const account = selectPrimaryAccount(save);
  if (!account) return 1;

  const definition = config.upgrades.find((entry) => entry.id === 'automation-basic');
  if (!definition) return 1;

  return 1 + account.automationLevel * definition.incomeMultiplierPerLevel;
}

export function selectIncomeBreakdown(save: GameSave, config: BalanceConfig): IncomeBreakdown {
  const account = selectPrimaryAccount(save);
  const automationDefinition = config.upgrades.find((entry) => entry.id === 'automation-basic');

  if (!account) {
    return {
      baseRate: config.income.baseRate,
      followersFactor: 0,
      performanceFactor: 0,
      automationMultiplier: 1,
      assetMultiplier: 1,
      statusModifier: 0,
      ratePerSecond: 0,
    };
  }

  const breakdown = calculateIncomeBreakdown(
    {
      followers: account.followers,
      performance: account.performance,
      automationLevel: account.automationLevel,
      status: account.status,
      assetMultiplier: assetIncomeEffect(save, config).multiplier,
    },
    {
      income: config.income,
      statusModifiers: config.statusModifiers,
      automationMultiplierPerLevel: automationDefinition?.incomeMultiplierPerLevel ?? 0,
    },
  );

  // Pengali risk tier: makin tinggi suspicion, makin kecil pendapatan.
  const tier = selectTierForSuspicion(account.suspicion, config);
  const tierConfig = config.riskTiers.find((entry) => entry.id === tier);
  const riskMultiplier = tierConfig?.incomeMultiplier ?? 1;

  return {
    ...breakdown,
    riskMultiplier,
    ratePerSecond: breakdown.ratePerSecond * riskMultiplier,
  };
}

export function selectIncomeRate(save: GameSave, config: BalanceConfig): number {
  return selectIncomeBreakdown(save, config).ratePerSecond;
}

/** Session yang belum final; maksimal satu pada MVP. */
export function selectActiveSession(save: GameSave): CampaignSession | undefined {
  return save.campaignSessions.find((session) => !isFinalCampaignStatus(session.status));
}

export function selectSessionById(save: GameSave, sessionId: string): CampaignSession | undefined {
  return save.campaignSessions.find((session) => session.id === sessionId);
}

export interface CampaignEntry {
  definition: CampaignDefinition;
  session: CampaignSession | undefined;
  eligibility: EligibilityResult;
}

/** Daftar kontrak untuk layar Task: definisi + session terakhir + kelayakan. */
export function selectCampaignEntries(save: GameSave): CampaignEntry[] {
  const account = selectPrimaryAccount(save);

  return CAMPAIGNS.map((definition) => {
    const sessions = save.campaignSessions.filter(
      (session) => session.campaignDefinitionId === definition.id,
    );
    const session = sessions[sessions.length - 1];

    return {
      definition,
      session,
      eligibility: evaluateEligibility(definition, account, save.campaignSessions),
    };
  });
}

export function selectCampaignEntry(save: GameSave, definitionId: string): CampaignEntry | undefined {
  return selectCampaignEntries(save).find((entry) => entry.definition.id === definitionId);
}

export function selectResolvedSessions(save: GameSave): CampaignSession[] {
  return save.campaignSessions.filter((session) => session.status === 'resolved');
}

export function selectSessionForCampaign(
  save: GameSave,
  campaignDefinitionId: string,
): CampaignSession | undefined {
  return save.campaignSessions.find(
    (session) => session.campaignDefinitionId === campaignDefinitionId,
  );
}

/** Transaksi terbaru lebih dahulu. */
export function selectRecentTransactions(save: GameSave, limit: number): Transaction[] {
  const sorted = [...save.transactions].sort((a, b) => b.createdAt - a.createdAt);
  return limit > 0 ? sorted.slice(0, limit) : sorted;
}

export function selectTransactionsByType(
  save: GameSave,
  type: Transaction['type'],
): Transaction[] {
  return save.transactions.filter((transaction) => transaction.type === type);
}

export interface RiskSummary {
  level: 'low' | 'medium' | 'high';
  suspicion: number;
  status: AccountState['status'];
  reputation: number;
}

export function selectAccountRiskSummary(save: GameSave, config: BalanceConfig): RiskSummary {
  const account = selectPrimaryAccount(save);
  if (!account) {
    return { level: 'high', suspicion: 100, status: 'suspended', reputation: 0 };
  }

  const thresholds = config.statusThresholds;
  let level: RiskSummary['level'] = 'low';
  if (account.suspicion >= thresholds.warningSuspicion) level = 'medium';
  if (account.suspicion >= thresholds.restrictedSuspicion) level = 'high';
  if (account.status === 'restricted' || account.status === 'suspended') level = 'high';

  return {
    level,
    suspicion: account.suspicion,
    status: account.status,
    reputation: account.reputation,
  };
}

export function selectHasPendingIncome(save: GameSave): boolean {
  return save.activeTime.pendingIncome > 0;
}

// ---------------------------------------------------------------------------
// v2 — risk tier
// ---------------------------------------------------------------------------

/** Tier dari suspicion. Delegasi ke domain agar satu sumber aturan. */
export function selectTierForSuspicion(suspicion: number, config: BalanceConfig): RiskTier {
  return tierForSuspicion(suspicion, config);
}

export interface RiskMeterState {
  tier: RiskTier;
  suspicion: number;
  tierConfig: BalanceConfig['riskTiers'][number];
}

export function selectRiskMeter(save: GameSave, config: BalanceConfig): RiskMeterState {
  const account = selectPrimaryAccount(save);
  const suspicion = account ? account.suspicion : 0;
  const tier = selectTierForSuspicion(suspicion, config);
  const tierConfig =
    config.riskTiers.find((entry) => entry.id === tier) ?? config.riskTiers[0]!;
  return { tier, suspicion, tierConfig };
}

/** Pengali income dari risk tier aktif. */
export function selectRiskIncomeMultiplier(save: GameSave, config: BalanceConfig): number {
  return selectRiskMeter(save, config).tierConfig.incomeMultiplier;
}

// ---------------------------------------------------------------------------
// v2 — karakter & inventori
// ---------------------------------------------------------------------------

export function selectEquippedOutfit(save: GameSave) {
  return findOutfit(save.inventory.equippedOutfitId) ?? findOutfit(save.character.outfitId);
}

export function selectOwnedItemIds(save: GameSave): readonly string[] {
  return save.inventory.ownedItemIds;
}

export function selectVisitedCountries(save: GameSave): readonly string[] {
  return save.character.visitedCountryIds;
}

export function selectCurrentCountry(save: GameSave): string {
  return save.character.locationCountryId;
}

export function selectViolations(save: GameSave) {
  return [...save.violations].sort((a, b) => b.at - a.at);
}

// ---------------------------------------------------------------------------
// v2 — saham
// ---------------------------------------------------------------------------

export function selectStockPrice(save: GameSave, ticker: string): number | undefined {
  const price = save.stocks.prices[ticker];
  return Number.isFinite(price) ? price : undefined;
}

export interface StockChange {
  change: number;
  percent: number;
}

/** Perubahan terhadap titik harga sebelumnya. */
export function selectStockChange(save: GameSave, ticker: string): StockChange {
  const points = save.stocks.history[ticker] ?? [];
  const current = save.stocks.prices[ticker] ?? 0;
  const previous = points.length >= 2 ? points[points.length - 2]!.price : current;
  const change = current - previous;
  const percent = previous > 0 ? (change / previous) * 100 : 0;
  return { change, percent };
}

export function selectHolding(save: GameSave, ticker: string) {
  return save.stocks.holdings.find((holding) => holding.ticker === ticker);
}

export function selectPortfolioSummary(save: GameSave): PortfolioSummary {
  return summarizePortfolio(save.stocks.holdings, save.stocks.prices);
}

// ---------------------------------------------------------------------------
// v2 — sosial
// ---------------------------------------------------------------------------

export function selectSocial(save: GameSave) {
  return save.social;
}

export function selectIsShadowbanned(save: GameSave, now: number): boolean {
  return save.social.shadowbannedUntil !== null && now < save.social.shadowbannedUntil;
}

export function selectPostingCooldown(
  save: GameSave,
  config: BalanceConfig,
  now: number,
): { active: boolean; remainingMs: number; progress: number } {
  const until = save.social.cooldownUntil;
  const total = config.posting.cooldownMs;
  const remaining = until === null ? 0 : Math.max(0, until - now);
  return {
    active: remaining > 0,
    remainingMs: remaining,
    progress: total > 0 ? Math.min(1, Math.max(0, 1 - remaining / total)) : 1,
  };
}

/**
 * Perhitungan income rate. Satu-satunya tempat formula pendapatan.
 *
 * incomePerSecond = baseRate
 *                 × followersFactor
 *                 × performanceFactor
 *                 × automationMultiplier
 *                 × statusModifier
 *
 * Semua koefisien dari `BalanceConfig`. Tidak ada angka hard-coded di sini.
 */

import type { AccountStatus } from '@/state/types';
import type { IncomeConfig } from '@/data/config/balance';
import { statusModifier as resolveStatusModifier } from './status-modifier';

export interface IncomeContext {
  followers: number;
  performance: number;
  automationLevel: number;
  status: AccountStatus;
  /** Multiplier dari properti/kendaraan (1 = tanpa aset). */
  assetMultiplier?: number;
}

export interface IncomeConfigs {
  income: IncomeConfig;
  statusModifiers: Record<AccountStatus, number>;
  automationMultiplierPerLevel: number;
}

/** Faktor followers: kurva pangkat dengan cap. */
export function followersFactor(followers: number, config: IncomeConfig): number {
  if (!Number.isFinite(followers) || followers <= 0) return 0;
  const ratio = followers / config.followerReference;
  if (ratio <= 0) return 0;
  const factor = Math.pow(ratio, config.followerExponent);
  return Math.min(factor, config.followerFactorCap);
}

/** Faktor performance: dinormalisasi terhadap titik referensi, dengan floor dan cap. */
export function performanceFactor(performance: number, config: IncomeConfig): number {
  if (!Number.isFinite(performance)) return config.performanceFactorFloor;
  const ratio = performance / config.performanceReference;
  if (ratio <= 0) return config.performanceFactorFloor;
  const factor = Math.pow(ratio, config.performanceExponent);
  return Math.min(Math.max(factor, config.performanceFactorFloor), config.performanceFactorCap);
}

/** Multiplier automation: linear per level. */
export function automationMultiplier(level: number, perLevel: number): number {
  if (!Number.isFinite(level) || level <= 0) return 1;
  return 1 + level * perLevel;
}

export function statusModifier(status: AccountStatus, config: IncomeConfigs): number {
  return resolveStatusModifier(status, config.statusModifiers);
}

export interface IncomeBreakdown {
  baseRate: number;
  followersFactor: number;
  performanceFactor: number;
  automationMultiplier: number;
  assetMultiplier: number;
  statusModifier: number;
  /** Pengali dari risk tier (1 = aman). */
  riskMultiplier?: number;
  ratePerSecond: number;
}

/** Rate lengkap beserta komponennya, untuk preview di UI. */
export function calculateIncomeBreakdown(
  context: IncomeContext,
  config: IncomeConfigs,
): IncomeBreakdown {
  const fFactor = followersFactor(context.followers, config.income);
  const pFactor = performanceFactor(context.performance, config.income);
  const aMultiplier = automationMultiplier(context.automationLevel, config.automationMultiplierPerLevel);
  const sModifier = statusModifier(context.status, config);
  const assets =
    context.assetMultiplier !== undefined && Number.isFinite(context.assetMultiplier)
      ? Math.max(0, context.assetMultiplier)
      : 1;

  const ratePerSecond =
    config.income.baseRate * fFactor * pFactor * aMultiplier * sModifier * assets;

  return {
    baseRate: config.income.baseRate,
    followersFactor: fFactor,
    performanceFactor: pFactor,
    automationMultiplier: aMultiplier,
    assetMultiplier: assets,
    statusModifier: sModifier,
    ratePerSecond: Number.isFinite(ratePerSecond) ? ratePerSecond : 0,
  };
}

export function calculateIncomeRate(context: IncomeContext, config: IncomeConfigs): number {
  return calculateIncomeBreakdown(context, config).ratePerSecond;
}

/**
 * Pasar saham deterministik.
 *
 * Harga awal = basePrice. Setiap tick memakai seeded gaussian dari
 * (seed emiten, indeks tick), sehingga seed sama menghasilkan urutan harga
 * yang sama. Harga di-clamp dan dibulatkan ke rupiah.
 */

import type { BalanceConfig } from '@/data/config/balance';
import type { StockCompany } from '@/data/stocks/companies';
import type { StockPricePoint, StockState } from '@/state/types';
import { seededRandom } from '@/domain/risk/random';

export interface MarketInit {
  prices: Record<string, number>;
  history: Record<string, StockPricePoint[]>;
}

function tickerHash(ticker: string): number {
  let hash = 2166136261;
  for (let index = 0; index < ticker.length; index += 1) {
    hash ^= ticker.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function gaussian(random: () => number): number {
  const first = Math.max(random(), 1e-9);
  const second = random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

export function createInitialMarket(
  companies: readonly StockCompany[],
  now: number,
): MarketInit {
  const prices: Record<string, number> = {};
  const history: Record<string, StockPricePoint[]> = {};

  for (const company of companies) {
    prices[company.ticker] = company.basePrice;
    history[company.ticker] = [{ at: now, price: company.basePrice }];
  }

  return { prices, history };
}

/** Harga berikutnya untuk satu emiten; pure dan deterministik. */
export function nextPrice(
  company: StockCompany,
  currentPrice: number,
  seed: number,
  tickIndex: number,
  dtMs: number,
  config: BalanceConfig['stocks'],
): number {
  const random = seededRandom((seed ^ tickerHash(company.ticker)) + tickIndex * 0x9e3779b9);
  const dtUnits = Math.max(0.1, dtMs / config.tickMs);
  const change =
    company.drift * dtUnits + company.volatility * Math.sqrt(dtUnits) * gaussian(random);
  const raw = currentPrice * (1 + change);
  return Math.round(Math.min(config.maxPrice, Math.max(config.minPrice, raw)));
}

export function tickPrices(
  prices: Record<string, number>,
  companies: readonly StockCompany[],
  seed: number,
  tickIndex: number,
  dtMs: number,
  config: BalanceConfig['stocks'],
): Record<string, number> {
  const next: Record<string, number> = { ...prices };
  for (const company of companies) {
    const current = prices[company.ticker] ?? company.basePrice;
    next[company.ticker] = nextPrice(company, current, seed, tickIndex, dtMs, config);
  }
  return next;
}

/** Majukan pasar satu tick, termasuk history dan lastTickAt. */
export function advanceMarket(
  stocks: StockState,
  companies: readonly StockCompany[],
  config: BalanceConfig['stocks'],
  now: number,
): StockState {
  const tickIndex =
    stocks.tickIndex ??
    Math.max(0, ...Object.values(stocks.history).map((points) => points.length));
  const dtMs = Math.max(config.tickMs, now - stocks.lastTickAt);
  const prices = tickPrices(stocks.prices, companies, stocks.seed, tickIndex, dtMs, config);

  const history: Record<string, StockPricePoint[]> = { ...stocks.history };
  for (const company of companies) {
    const points = history[company.ticker] ?? [];
    const nextPoints = [...points, { at: now, price: prices[company.ticker]! }];
    history[company.ticker] = nextPoints.slice(-config.maxHistoryPoints);
  }

  return { ...stocks, prices, history, lastTickAt: now, tickIndex: tickIndex + 1 };
}

/** Isi harga/history yang kosong pada save lama tanpa mengubah seed. */
export function ensureMarket(
  stocks: StockState,
  companies: readonly StockCompany[],
  now: number,
): StockState {
  const complete = companies.every((company) => Number.isFinite(stocks.prices[company.ticker]));
  if (complete) return stocks;

  const initial = createInitialMarket(companies, now);
  return {
    ...stocks,
    prices: { ...initial.prices, ...stocks.prices },
    history: { ...initial.history, ...stocks.history },
  };
}

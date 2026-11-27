/**
 * Nilai portofolio dan untung/rugi belum terealisasi.
 */

import type { StockHolding } from '@/state/types';

export interface HoldingValuation {
  ticker: string;
  shares: number;
  avgCost: number;
  price: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
}

export interface PortfolioSummary {
  holdingsCount: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
}

export function valueHolding(holding: StockHolding, price: number): HoldingValuation {
  const safePrice = Number.isFinite(price) && price > 0 ? price : 0;
  const marketValue = Math.round(holding.shares * safePrice);
  const costBasis = Math.round(holding.shares * holding.avgCost);

  return {
    ticker: holding.ticker,
    shares: holding.shares,
    avgCost: holding.avgCost,
    price: safePrice,
    marketValue,
    costBasis,
    unrealizedPnl: marketValue - costBasis,
  };
}

export function summarizePortfolio(
  holdings: readonly StockHolding[],
  prices: Record<string, number>,
): PortfolioSummary {
  let marketValue = 0;
  let costBasis = 0;

  for (const holding of holdings) {
    const valuation = valueHolding(holding, prices[holding.ticker] ?? 0);
    marketValue += valuation.marketValue;
    costBasis += valuation.costBasis;
  }

  return {
    holdingsCount: holdings.length,
    marketValue,
    costBasis,
    unrealizedPnl: marketValue - costBasis,
  };
}

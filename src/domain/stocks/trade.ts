/**
 * Transaksi saham (pure). Saldo tidak diubah di sini; application layer yang
 * memotong/menambah uang dan mencatat transaksi.
 */

import { err, ok, type ActionResult } from '@/core/result';
import type { StockHolding } from '@/state/types';

export interface BuyStockResult {
  holdings: StockHolding[];
  cost: number;
}

export interface SellStockResult {
  holdings: StockHolding[];
  proceeds: number;
}

function validTrade(shares: number, price: number): boolean {
  return Number.isInteger(shares) && shares > 0 && Number.isFinite(price) && price > 0;
}

export function buyStock(
  holdings: readonly StockHolding[],
  ticker: string,
  shares: number,
  price: number,
  money: number,
): ActionResult<BuyStockResult> {
  if (!validTrade(shares, price)) {
    return err('invalid_amount', 'error.invalid_amount', `shares=${shares}, price=${price}`);
  }

  const cost = Math.round(shares * price);
  if (money < cost) {
    return err('insufficient_funds', 'error.insufficient_funds', `butuh ${cost}`);
  }

  const index = holdings.findIndex((holding) => holding.ticker === ticker);
  if (index < 0) {
    return ok({
      holdings: [...holdings, { ticker, shares, avgCost: price }],
      cost,
    });
  }

  const existing = holdings[index]!;
  const totalShares = existing.shares + shares;
  const avgCost = Math.round(
    (existing.shares * existing.avgCost + shares * price) / totalShares,
  );
  const next = [...holdings];
  next[index] = { ...existing, shares: totalShares, avgCost };

  return ok({ holdings: next, cost });
}

export function sellStock(
  holdings: readonly StockHolding[],
  ticker: string,
  shares: number,
  price: number,
): ActionResult<SellStockResult> {
  if (!validTrade(shares, price)) {
    return err('invalid_amount', 'error.invalid_amount', `shares=${shares}, price=${price}`);
  }

  const index = holdings.findIndex((holding) => holding.ticker === ticker);
  const existing = index >= 0 ? holdings[index]! : null;
  if (!existing || shares > existing.shares) {
    return err(
      'invalid_amount',
      'error.invalid_amount',
      `lembar dimiliki=${existing?.shares ?? 0}, dijual=${shares}`,
    );
  }

  const proceeds = Math.round(shares * price);
  const remaining = existing.shares - shares;
  const next = remaining > 0
    ? holdings.map((holding, position) =>
        position === index ? { ...holding, shares: remaining } : holding,
      )
    : holdings.filter((_, position) => position !== index);

  return ok({ holdings: next, proceeds });
}

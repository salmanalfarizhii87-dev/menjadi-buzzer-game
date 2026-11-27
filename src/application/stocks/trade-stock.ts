/**
 * Use case: beli/jual saham. Atomik + guard in-flight + `saveNow`.
 */

import { err, ok, type ActionResult } from '@/core/result';
import { applyDelta } from '@/domain/finance/balance';
import { appendTransaction, descriptionKeyFor } from '@/domain/finance/ledger';
import { buyStock, sellStock } from '@/domain/stocks/trade';
import { findCompany } from '@/data/stocks/companies';
import { flushPendingIncome } from '@/application/income/accrue-income';
import type { StockHolding, GameSave } from '@/state/types';
import type { CampaignUseCaseDeps } from '../campaigns/accept-campaign';

export type TradeSide = 'buy' | 'sell';

export interface TradeStockInput {
  ticker: string;
  shares: number;
  side: TradeSide;
}

export interface TradeStockOutcome {
  side: TradeSide;
  ticker: string;
  shares: number;
  price: number;
  amount: number;
  balanceAfter: number;
  holdings: StockHolding[];
}

export function tradeStock(
  deps: CampaignUseCaseDeps,
  input: TradeStockInput,
): ActionResult<TradeStockOutcome> {
  const { store, repository, clock } = deps;
  const inFlight = deps.inFlight ?? new Set<string>();
  const guardKey = `trade-stock:${input.ticker}`;

  if (inFlight.has(guardKey)) {
    return err('invalid_transition', 'error.invalid_transition', 'transaksi sedang diproses');
  }
  inFlight.add(guardKey);

  try {
    const flushed = flushPendingIncome(deps);
    if (!flushed.ok) return flushed;

    const save = store.getState();
    const company = findCompany(input.ticker);
    if (!company) return err('unknown', 'error.unknown', `emiten tidak dikenal: ${input.ticker}`);

    const price = save.stocks.prices[input.ticker] ?? company.basePrice;
    const now = clock.now();

    let next: GameSave;
    let amount: number;
    let holdings: StockHolding[];

    if (input.side === 'buy') {
      const result = buyStock(
        save.stocks.holdings,
        input.ticker,
        input.shares,
        price,
        save.player.money,
      );
      if (!result.ok) return result;

      const paid = applyDelta(save, -result.value.cost, { allowNegative: false });
      if (!paid.ok) return paid;

      next = paid.value.save;
      amount = -result.value.cost;
      holdings = result.value.holdings;
    } else {
      const result = sellStock(save.stocks.holdings, input.ticker, input.shares, price);
      if (!result.ok) return result;

      const received = applyDelta(save, result.value.proceeds, { allowNegative: true });
      if (!received.ok) return received;

      next = received.value.save;
      amount = result.value.proceeds;
      holdings = result.value.holdings;
    }

    next = appendTransaction(next, {
      type: input.side === 'buy' ? 'stock_buy' : 'stock_sell',
      amount,
      sourceId: input.ticker,
      descriptionKey: descriptionKeyFor(input.side === 'buy' ? 'stock_buy' : 'stock_sell'),
      createdAt: now,
    });

    next = {
      ...next,
      stocks: { ...next.stocks, holdings },
      meta: { ...next.meta, updatedAt: now },
    };

    store.setState(next);
    repository.saveNow(next);

    return ok({
      side: input.side,
      ticker: input.ticker,
      shares: input.shares,
      price,
      amount,
      balanceAfter: next.player.money,
      holdings,
    });
  } finally {
    inFlight.delete(guardKey);
  }
}

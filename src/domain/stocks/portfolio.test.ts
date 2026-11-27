import { describe, expect, it } from 'vitest';
import { summarizePortfolio, valueHolding } from './portfolio';

describe('valueHolding', () => {
  it('menghitung nilai pasar dan PnL', () => {
    const valuation = valueHolding({ ticker: 'KOPI', shares: 10, avgCost: 100 }, 120);
    expect(valuation.marketValue).toBe(1200);
    expect(valuation.costBasis).toBe(1000);
    expect(valuation.unrealizedPnl).toBe(200);
  });

  it('menangani harga tidak valid sebagai 0', () => {
    const valuation = valueHolding({ ticker: 'KOPI', shares: 10, avgCost: 100 }, Number.NaN);
    expect(valuation.marketValue).toBe(0);
    expect(valuation.unrealizedPnl).toBe(-1000);
  });
});

describe('summarizePortfolio', () => {
  it('menjumlahkan semua holding', () => {
    const summary = summarizePortfolio(
      [
        { ticker: 'KOPI', shares: 10, avgCost: 100 },
        { ticker: 'PIXL', shares: 2, avgCost: 300 },
      ],
      { KOPI: 120, PIXL: 250 },
    );

    expect(summary.holdingsCount).toBe(2);
    expect(summary.marketValue).toBe(1700);
    expect(summary.costBasis).toBe(1600);
    expect(summary.unrealizedPnl).toBe(100);
  });

  it('portofolio kosong bernilai 0', () => {
    expect(summarizePortfolio([], {})).toEqual({
      holdingsCount: 0,
      marketValue: 0,
      costBasis: 0,
      unrealizedPnl: 0,
    });
  });
});

import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { COMPANIES } from '@/data/stocks/companies';
import { makeSave } from '@/tests/helpers';
import {
  advanceMarket,
  createInitialMarket,
  ensureMarket,
  nextPrice,
  tickPrices,
} from './market';

const config = BALANCE.stocks;
const company = COMPANIES[0]!;
const NOW = 1_700_000_000_000;

describe('createInitialMarket', () => {
  it('memakai basePrice dan satu titik history per emiten', () => {
    const market = createInitialMarket(COMPANIES, NOW);
    for (const entry of COMPANIES) {
      expect(market.prices[entry.ticker]).toBe(entry.basePrice);
      expect(market.history[entry.ticker]).toEqual([{ at: NOW, price: entry.basePrice }]);
    }
  });
});

describe('nextPrice', () => {
  it('deterministik untuk seed dan tick yang sama', () => {
    const a = nextPrice(company, company.basePrice, 42, 3, config.tickMs, config);
    const b = nextPrice(company, company.basePrice, 42, 3, config.tickMs, config);
    expect(a).toBe(b);
  });

  it('tick berbeda memberi harga berbeda', () => {
    const a = nextPrice(company, company.basePrice, 42, 3, config.tickMs, config);
    const b = nextPrice(company, company.basePrice, 42, 4, config.tickMs, config);
    expect(a).not.toBe(b);
  });

  it('menghasilkan integer dalam batas harga', () => {
    for (let tick = 0; tick < 40; tick += 1) {
      const price = nextPrice(company, 120, 7, tick, config.tickMs, config);
      expect(Number.isInteger(price)).toBe(true);
      expect(price).toBeGreaterThanOrEqual(config.minPrice);
      expect(price).toBeLessThanOrEqual(config.maxPrice);
    }
  });
});

describe('tickPrices', () => {
  it('memperbarui semua emiten', () => {
    const prices = createInitialMarket(COMPANIES, NOW).prices;
    const next = tickPrices(prices, COMPANIES, 1, 1, config.tickMs, config);
    for (const entry of COMPANIES) {
      expect(Number.isInteger(next[entry.ticker])).toBe(true);
    }
  });
});

describe('advanceMarket', () => {
  it('menambah history, membatasi panjang, dan memperbarui lastTickAt', () => {
    const save = makeSave();
    const stocks = { ...save.stocks, lastTickAt: NOW };
    const next = advanceMarket(stocks, COMPANIES, { ...config, maxHistoryPoints: 3 }, NOW + config.tickMs);

    expect(next.lastTickAt).toBe(NOW + config.tickMs);
    expect(next.history[company.ticker]!.length).toBeLessThanOrEqual(3);
    expect(next.history[company.ticker]!.at(-1)!.at).toBe(NOW + config.tickMs);
    expect(next.tickIndex).toBe(1);

    const second = advanceMarket(next, COMPANIES, { ...config, maxHistoryPoints: 3 }, NOW + config.tickMs * 2);
    expect(second.tickIndex).toBe(2);
  });
});

describe('ensureMarket', () => {
  it('mengisi harga yang kosong tanpa mengubah seed', () => {
    const save = makeSave();
    const empty = { ...save.stocks, prices: {}, history: {}, seed: 99 };
    const filled = ensureMarket(empty, COMPANIES, NOW);

    expect(filled.seed).toBe(99);
    expect(filled.prices[company.ticker]).toBe(company.basePrice);
    expect(filled.history[company.ticker]).toHaveLength(1);
  });
});

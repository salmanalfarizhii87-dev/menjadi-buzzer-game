/**
 * Emiten fiktif. Volatility = simpangan per tick, drift = kecenderungan
 * per tick. Semua angka placeholder untuk balancing.
 */

export interface StockCompany {
  ticker: string;
  nameKey: string;
  sectorKey: string;
  basePrice: number;
  volatility: number;
  drift: number;
}

export const COMPANIES: StockCompany[] = [
  {
    ticker: 'KOPI',
    nameKey: 'stocks.company.kopi.name',
    sectorKey: 'stocks.company.kopi.sector',
    basePrice: 120,
    volatility: 0.018,
    drift: 0.0004,
  },
  {
    ticker: 'PIXL',
    nameKey: 'stocks.company.pixl.name',
    sectorKey: 'stocks.company.pixl.sector',
    basePrice: 340,
    volatility: 0.04,
    drift: 0.0008,
  },
  {
    ticker: 'NGNT',
    nameKey: 'stocks.company.ngnt.name',
    sectorKey: 'stocks.company.ngnt.sector',
    basePrice: 75,
    volatility: 0.028,
    drift: -0.0003,
  },
  {
    ticker: 'SKYN',
    nameKey: 'stocks.company.skyn.name',
    sectorKey: 'stocks.company.skyn.sector',
    basePrice: 880,
    volatility: 0.055,
    drift: 0.0012,
  },
];

export function findCompany(ticker: string): StockCompany | undefined {
  return COMPANIES.find((company) => company.ticker === ticker);
}

/**
 * Use case: majukan harga pasar satu tick.
 *
 * Tidak ada pergerakan offline: bootstrap mereset `lastTickAt` ke sekarang,
 * dan tick hanya dijalankan oleh scheduler saat halaman terbuka.
 */

import { ok, type ActionResult } from '@/core/result';
import { COMPANIES } from '@/data/stocks/companies';
import { advanceMarket, ensureMarket } from '@/domain/stocks/market';
import type { GameSave } from '@/state/types';
import type { CampaignUseCaseDeps } from '../campaigns/accept-campaign';

export interface TickMarketOutcome {
  changed: boolean;
  tickedAt: number;
}

export function tickMarket(deps: CampaignUseCaseDeps): ActionResult<TickMarketOutcome> {
  const { store, config, repository, clock } = deps;
  const now = clock.now();
  const save = store.getState();

  let stocks = ensureMarket(save.stocks, COMPANIES, now);
  const initialized = stocks !== save.stocks;

  if (now - stocks.lastTickAt < config.stocks.tickMs) {
    if (initialized) {
      const next: GameSave = { ...save, stocks };
      store.setState(next);
      repository.saveDebounced(next);
    }
    return ok({ changed: false, tickedAt: stocks.lastTickAt });
  }

  stocks = advanceMarket(stocks, COMPANIES, config.stocks, now);
  const next: GameSave = {
    ...save,
    stocks,
    meta: { ...save.meta, updatedAt: now },
  };

  store.setState(next);
  repository.saveDebounced(next);

  return ok({ changed: true, tickedAt: now });
}

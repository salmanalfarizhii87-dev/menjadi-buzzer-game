/**
 * Application actions: orkestrasi use case. Memvalidasi prasyarat, memanggil
 * domain service, lalu commit state ke store dan persist.
 *
 * Aturan atomik: hitung dulu seluruh perubahan pada salinan state, baru commit.
 * Jangan pernah memotong saldo lebih dulu lalu gagal di tengah.
 */

import type { BalanceConfig } from '@/data/config/balance';
import { ok, type ActionResult } from '@/core/result';
import type { GameStore } from '@/state/game-store';
import { createInitialSave } from '@/state/initial-state';
import type { SaveRepository } from '@/persistence/save-repository';
import type { Clock } from '@/core/clock';
import type { PostInput } from '@/domain/posting/composer';
import {
  accrueIncome as accrueIncomeUseCase,
  flushPendingIncome as flushPendingIncomeUseCase,
  type AccrualOutcome,
} from '@/application/income/accrue-income';
import {
  createUpgradePurchaser,
  type PurchaseResult,
} from '@/application/upgrades/purchase-upgrade';
import { createPost, type PostOutcome } from '@/application/posting/create-post';
import {
  applySuspicionDecay,
  evaluateTier,
  type TierChange,
} from '@/application/risk/evaluate-tier';
import {
  recoverAccount as recoverAccountUseCase,
  type RecoveryOutcome,
} from '@/application/accounts/recover-account';
import {
  acceptCampaign as acceptCampaignUseCase,
  type AcceptCampaignOutcome,
} from '@/application/campaigns/accept-campaign';
import {
  selectCampaignStrategy as selectCampaignStrategyUseCase,
  type SelectStrategyInput,
  type SelectStrategyOutcome,
} from '@/application/campaigns/select-strategy';
import {
  completeMiniGame as completeMiniGameUseCase,
  type CompleteMiniGameInput,
  type CompleteMiniGameOutcome,
} from '@/application/campaigns/complete-minigame';
import {
  resolveCampaign as resolveCampaignUseCase,
  type ResolveCampaignOutcome,
} from '@/application/campaigns/resolve-campaign';
import {
  buyShopItem as buyShopItemUseCase,
  type BuyItemOutcome,
} from '@/application/shop/buy-item';
import {
  equipOutfitAction,
  type EquipOutfitOutcome,
} from '@/application/character/equip-outfit';
import {
  tickMarket as tickMarketUseCase,
  type TickMarketOutcome,
} from '@/application/stocks/tick-market';
import {
  tradeStock as tradeStockUseCase,
  type TradeStockInput,
  type TradeStockOutcome,
} from '@/application/stocks/trade-stock';
import {
  flyTo as flyToUseCase,
  type FlyToOutcome,
} from '@/application/travel/fly-to';
import { CAMPAIGNS } from '@/data/campaigns/seed';
import type { GameSave, GameSettings } from '@/state/types';

export type {
  AccrualOutcome,
  PurchaseResult,
  PostOutcome,
  TierChange,
  RecoveryOutcome,
  AcceptCampaignOutcome,
  SelectStrategyInput,
  SelectStrategyOutcome,
  CompleteMiniGameInput,
  CompleteMiniGameOutcome,
  ResolveCampaignOutcome,
  BuyItemOutcome,
  EquipOutfitOutcome,
  TickMarketOutcome,
  TradeStockInput,
  TradeStockOutcome,
  FlyToOutcome,
};

export interface GameActions {
  /** Akumulasi income berdasarkan elapsed time. Tidak menghitung offline income. */
  accrueIncome(): ActionResult<AccrualOutcome>;
  /** Ubah income pending menjadi transaksi (dipanggil sebelum aksi ekonomi lain). */
  flushPendingIncome(): ActionResult<void>;
  /** Beli satu level automation. Atomik + guard double-click. */
  purchaseAutomationUpgrade(): ActionResult<PurchaseResult>;
  /** Posting manual dari handphone. Deterministik + cooldown. */
  createPost(input: PostInput): ActionResult<PostOutcome>;
  /** Terapkan penurunan suspicion karena istirahat lalu evaluasi tier. */
  settleRisk(): void;
  /** Bayar biaya untuk menurunkan suspicion, lalu evaluasi ulang tier. */
  recoverAccount(): ActionResult<RecoveryOutcome>;
  /** Terima kontrak kampanye (session baru, tanpa mutasi saldo). */
  acceptCampaign(campaignDefinitionId: string): ActionResult<AcceptCampaignOutcome>;
  /** Simpan pilihan strategi untuk session yang sudah diterima. */
  selectCampaignStrategy(input: SelectStrategyInput): ActionResult<SelectStrategyOutcome>;
  /** Simpan skor mini-game sekali untuk session aktif. */
  completeMiniGame(input: CompleteMiniGameInput): ActionResult<CompleteMiniGameOutcome>;
  /** Selesaikan kampanye: satu roll, snapshot, reward/penalty. Idempoten. */
  resolveCampaign(sessionId: string): ActionResult<ResolveCampaignOutcome>;
  /** Ubah preferensi boolean di settings dan persist. */
  updateSetting(key: keyof GameSettings, value: boolean): void;
  /** Beli item Shop (outfit/properti/kendaraan/tiket). Atomik. */
  buyShopItem(itemId: string): ActionResult<BuyItemOutcome>;
  /** Pasang outfit yang sudah dimiliki. */
  equipOutfit(outfitId: string): ActionResult<EquipOutfitOutcome>;
  /** Majukan harga pasar satu tick (dipanggil scheduler). */
  tickMarket(): ActionResult<TickMarketOutcome>;
  /** Beli/jual saham. Atomik + guard in-flight. */
  tradeStock(input: TradeStockInput): ActionResult<TradeStockOutcome>;
  /** Terbang ke negara yang tiketnya dimiliki. */
  flyTo(countryId: string): ActionResult<FlyToOutcome>;
  /** Reset save ke state awal. Hanya dipakai di build dev + konfirmasi UI. */
  resetSave(): ActionResult<void>;
  /** Ubah nama akun utama dan simpan secara langsung. */
  renamePrimaryAccount(name: string): void;
  /** Persist state saat ini segera. */
  flush(): void;
}

export interface GameActionsDeps {
  store: GameStore;
  config: BalanceConfig;
  repository: SaveRepository;
  clock: Clock;
  /** Sumber roll; default cryptoRandom. Test memakai seededRandom. */
  random?: () => number;
}

export function createGameActions(deps: GameActionsDeps): GameActions {
  const { store, config, repository, clock } = deps;
  const purchaseAutomation = createUpgradePurchaser(deps);
  const inFlight = new Set<string>();

  return {
    accrueIncome: () => accrueIncomeUseCase(deps),
    flushPendingIncome: () => flushPendingIncomeUseCase(deps),
    purchaseAutomationUpgrade: () => purchaseAutomation(),

    createPost(input: PostInput) {
      return createPost({ ...deps, inFlight }, input);
    },

    recoverAccount() {
      return recoverAccountUseCase({ ...deps, inFlight });
    },

    acceptCampaign(campaignDefinitionId: string) {
      return acceptCampaignUseCase({ ...deps, inFlight }, CAMPAIGNS, campaignDefinitionId);
    },

    selectCampaignStrategy(input: SelectStrategyInput) {
      return selectCampaignStrategyUseCase({ ...deps, inFlight }, CAMPAIGNS, input);
    },

    completeMiniGame(input: CompleteMiniGameInput) {
      return completeMiniGameUseCase({ ...deps, inFlight }, input);
    },

    resolveCampaign(sessionId: string) {
      return resolveCampaignUseCase({ ...deps, inFlight }, CAMPAIGNS, sessionId);
    },

    updateSetting(key: keyof GameSettings, value: boolean): void {
      const save = store.getState();
      const next: GameSave = {
        ...save,
        settings: { ...save.settings, [key]: value },
        meta: { ...save.meta, updatedAt: clock.now() },
      };
      store.setState(next);
      repository.saveNow(next);
    },

    buyShopItem(itemId: string) {
      return buyShopItemUseCase({ ...deps, inFlight }, itemId);
    },

    equipOutfit(outfitId: string) {
      return equipOutfitAction({ ...deps, inFlight }, outfitId);
    },

    tickMarket() {
      return tickMarketUseCase(deps);
    },

    tradeStock(input: TradeStockInput) {
      return tradeStockUseCase({ ...deps, inFlight }, input);
    },

    flyTo(countryId: string) {
      return flyToUseCase({ ...deps, inFlight }, countryId);
    },

    settleRisk(): void {
      const now = clock.now();
      const decayed = applySuspicionDecay(store.getState(), config, now);
      const evaluated = evaluateTier(decayed, { config, now, sourceId: null });

      if (evaluated.save === store.getState()) return;

      const next: GameSave = {
        ...evaluated.save,
        meta: { ...evaluated.save.meta, updatedAt: now },
      };
      store.setState(next);
      repository.saveDebounced(next);
    },

    resetSave(): ActionResult<void> {
      const now = clock.now();
      const fresh = createInitialSave(config, now);
      repository.clear();
      store.setState(fresh);
      repository.saveNow(fresh);
      return ok(undefined);
    },

    renamePrimaryAccount(name: string): void {
      const normalized = name
        .normalize('NFKC')
        .trim()
        .replace(/^@+/u, '')
        .replace(/[^\p{L}\p{N}_]/gu, '')
        .slice(0, 20);
      const save = store.getState();
      const [primary, ...others] = save.accounts;
      if (!normalized || !primary) return;

      const next: GameSave = {
        ...save,
        accounts: [{ ...primary, name: `@${normalized}` }, ...others],
        meta: { ...save.meta, updatedAt: clock.now() },
      };
      store.setState(next);
      repository.saveNow(next);
    },

    flush(): void {
      repository.flush();
    },
  };
}

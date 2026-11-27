/**
 * Konfigurasi balancing. SEMUA angka permainan berasal dari sini.
 *
 * Semua nilai ditandai PLACEHOLDER — belum balancing final. Jangan menyalin
 * angka dari sini ke komponen UI; baca lewat selector/domain service.
 */

import type { AccountStatus, RiskTier } from '@/state/types';

export interface StartingStateConfig {
  money: number;
  reputation: number;
  careerLevel: number;
  careerXP: number;
  account: {
    name: string;
    platformId: string;
    platformLabel: string;
    followers: number;
    performance: number;
    reputation: number;
    suspicion: number;
    status: AccountStatus;
    automationLevel: number;
  };
  character: {
    outfitId: string;
    locationCountryId: string;
    visitedCountryIds: string[];
  };
}

export interface IncomeConfig {
  /** Rupiah per detik untuk akun dengan followers 1.000 dan performance 50. */
  baseRate: number;
  followerReference: number;
  followerExponent: number;
  followerFactorCap: number;
  performanceReference: number;
  performanceExponent: number;
  performanceFactorCap: number;
  performanceFactorFloor: number;
  /** Delta waktu maksimum yang dihitung dalam satu accrual (tab throttled ekstrem). */
  maxAccrualDeltaMs: number;
  /** Batas atas total bonus income dari aset (properti + kendaraan). */
  assetBonusCap: number;
}

export interface ProbabilityConfig {
  min: number;
  max: number;
  performanceWeight: number;
  reputationWeight: number;
  suspicionWeight: number;
  statusPenalty: Record<AccountStatus, number>;
}

export interface PenaltyProfile {
  fineRatio: number;
  fineFloor: number;
  reputationDelta: number;
  suspicionDelta: number;
  forceStatus: AccountStatus | null;
}

export interface PenaltyConfig {
  profiles: Record<string, PenaltyProfile>;
  suspicionMax: number;
  reputationMin: number;
  reputationMax: number;
}

export interface StatusThresholdConfig {
  warningSuspicion: number;
  restrictedSuspicion: number;
  suspendedSuspicion: number;
}

export interface UpgradeConfigEntry {
  id: string;
  titleKey: string;
  descriptionKey: string;
  maxLevel: number;
  baseCost: number;
  costGrowth: number;
  incomeMultiplierPerLevel: number;
}

export interface StrategyOptionConfig {
  id: string;
  labelKey: string;
  performanceModifier: number;
  probabilityModifier: number;
  riskModifier: number;
  rewardModifier: number;
}

export interface MiniGameConfig {
  captionRounds: number;
  engagementAttempts: number;
  engagementTargetWidth: number;
}

export interface RecoveryConfig {
  cost: number;
  suspicionReduction: number;
}
export interface ResolutionConfig {
  /** Bobot pengaruh skor mini-game terhadap performa (poin per 1 skor di atas 50). */
  miniGameWeight: number;
  /** Followers dasar saat sukses; diskalakan performa. */
  successFollowersBase: number;
  successPerformanceGain: number;
  successReputationGain: number;
  failureFollowersLoss: number;
  failurePerformanceLoss: number;
}

// ---------------------------------------------------------------------------
// v2 — posting
// ---------------------------------------------------------------------------

export interface PostingConfig {
  /** Cooldown antar posting (ms). */
  cooldownMs: number;
  /** Rupiah per 1 engagement. */
  moneyPerEngagement: number;
  /** Followers per 1 engagement. */
  followersPerEngagement: number;
  /** Suspicion dasar per posting. */
  baseSuspicion: number;
  /** Pengali reward saat shadowban. */
  shadowbanRewardMultiplier: number;
  /** Batas atas suspicion. */
  suspicionCap: number;
  /** Penurunan suspicion per menit saat tidak posting (istirahat). */
  suspicionDecayPerMinute: number;
  /** Jeda minimal sebelum decay mulai (ms). */
  decayGraceMs: number;
}

// ---------------------------------------------------------------------------
// v2 — risk tier
// ---------------------------------------------------------------------------

export interface RiskTierConfig {
  id: RiskTier;
  labelKey: string;
  minSuspicion: number;
  maxSuspicion: number;
  /** Pengali income saat tier ini aktif. */
  incomeMultiplier: number;
  /** Pengali followers dari posting (0 = shadowban). */
  postingFollowersMultiplier: number;
  /** Denda otomatis sekali saat masuk tier ini. */
  autoFineOnEnter: number;
  /** Apakah tier ini bisa memicu penyitaan aset. */
  canSeizeAsset: boolean;
  /** Durasi shadowban saat masuk tier ini (ms). */
  shadowbanMs: number;
}

export interface SeizureConfig {
  /** Hanya tier ini yang boleh menyita. */
  tier: RiskTier;
  /** Sita aset termahal lebih dulu. */
  seizeMostValuableFirst: boolean;
}

// ---------------------------------------------------------------------------
// v2 — saham
// ---------------------------------------------------------------------------

export interface StocksConfig {
  tickMs: number;
  /** Batas titik riwayat harga per emiten. */
  maxHistoryPoints: number;
  minPrice: number;
  maxPrice: number;
  /** Jumlah lembar per transaksi cepat. */
  quickTradeShares: number;
}

// ---------------------------------------------------------------------------
// v2 — travel
// ---------------------------------------------------------------------------

export interface TravelConfig {
  /** Biaya default perjalanan bila negara tidak menentukan sendiri. */
  defaultTravelCost: number;
  /** Biaya terbang per negara. */
  countryCosts: Record<string, number>;
  /** Ukuran ekspor foto. */
  photoWidth: number;
  photoHeight: number;
}

export interface BalanceConfig {
  startingState: StartingStateConfig;
  income: IncomeConfig;
  statusModifiers: Record<AccountStatus, number>;
  probability: ProbabilityConfig;
  penalty: PenaltyConfig;
  statusThresholds: StatusThresholdConfig;
  upgrades: UpgradeConfigEntry[];
  strategy: {
    contentApproach: StrategyOptionConfig[];
    activityIntensity: StrategyOptionConfig[];
    riskPosture: StrategyOptionConfig[];
  };
  miniGames: MiniGameConfig;
  resolution: ResolutionConfig;
  recovery: RecoveryConfig;
  incomeAggregationWindowMs: number;
  allowNegativeBalance: boolean;
  incomeTickMs: number;
  // v2
  posting: PostingConfig;
  riskTiers: RiskTierConfig[];
  seizure: SeizureConfig;
  stocks: StocksConfig;
  travel: TravelConfig;
}

export const BALANCE: BalanceConfig = {
  // PLACEHOLDER — belum balancing final.
  startingState: {
    money: 500,
    reputation: 0,
    careerLevel: 1,
    careerXP: 0,
    account: {
      name: '@KilatDaily',
      platformId: 'chirper',
      platformLabel: 'Chirper',
      followers: 1000,
      performance: 50,
      reputation: 0,
      suspicion: 10,
      status: 'normal',
      automationLevel: 0,
    },
    character: {
      outfitId: 'outfit-basic',
      locationCountryId: 'nusantara',
      visitedCountryIds: ['nusantara'],
    },
  },

  // PLACEHOLDER — belum balancing final.
  income: {
    baseRate: 0.5,
    followerReference: 1000,
    followerExponent: 0.85,
    followerFactorCap: 8,
    performanceReference: 50,
    performanceExponent: 1.2,
    performanceFactorCap: 3,
    performanceFactorFloor: 0.15,
    maxAccrualDeltaMs: 5 * 60 * 1000,
    assetBonusCap: 1.5,
  },

  // PLACEHOLDER — belum balancing final.
  statusModifiers: {
    normal: 1,
    warning: 0.85,
    restricted: 0.55,
    suspended: 0,
  },

  // PLACEHOLDER — belum balancing final.
  probability: {
    min: 0.05,
    max: 0.95,
    performanceWeight: 0.35,
    reputationWeight: 0.15,
    suspicionWeight: 0.3,
    statusPenalty: {
      normal: 0,
      warning: 0.05,
      restricted: 0.12,
      suspended: 0.25,
    },
  },

  // PLACEHOLDER — belum balancing final.
  penalty: {
    profiles: {
      lenient: {
        fineRatio: 0.05,
        fineFloor: 25,
        reputationDelta: -2,
        suspicionDelta: 4,
        forceStatus: null,
      },
      standard: {
        fineRatio: 0.12,
        fineFloor: 50,
        reputationDelta: -5,
        suspicionDelta: 8,
        forceStatus: null,
      },
      severe: {
        fineRatio: 0.25,
        fineFloor: 100,
        reputationDelta: -10,
        suspicionDelta: 14,
        forceStatus: null,
      },
    },
    suspicionMax: 100,
    reputationMin: -100,
    reputationMax: 100,
  },

  // PLACEHOLDER — belum balancing final.
  statusThresholds: {
    warningSuspicion: 40,
    restrictedSuspicion: 70,
    suspendedSuspicion: 95,
  },

  // PLACEHOLDER — belum balancing final.
  upgrades: [
    {
      id: 'automation-basic',
      titleKey: 'upgrade.automationBasic.title',
      descriptionKey: 'upgrade.automationBasic.description',
      maxLevel: 5,
      baseCost: 100,
      costGrowth: 2.4,
      incomeMultiplierPerLevel: 0.25,
    },
  ],

  // PLACEHOLDER — belum balancing final.
  strategy: {
    contentApproach: [
      {
        id: 'informative',
        labelKey: 'strategy.approach.informative',
        performanceModifier: 8,
        probabilityModifier: 0.04,
        riskModifier: -0.05,
        rewardModifier: 0,
      },
      {
        id: 'emotional',
        labelKey: 'strategy.approach.emotional',
        performanceModifier: 12,
        probabilityModifier: 0.02,
        riskModifier: 0.05,
        rewardModifier: 0.05,
      },
      {
        id: 'humorous',
        labelKey: 'strategy.approach.humorous',
        performanceModifier: 10,
        probabilityModifier: -0.01,
        riskModifier: 0.08,
        rewardModifier: 0.08,
      },
    ],
    activityIntensity: [
      {
        id: 'low',
        labelKey: 'strategy.intensity.low',
        performanceModifier: -4,
        probabilityModifier: 0.05,
        riskModifier: -0.15,
        rewardModifier: -0.1,
      },
      {
        id: 'normal',
        labelKey: 'strategy.intensity.normal',
        performanceModifier: 4,
        probabilityModifier: 0,
        riskModifier: 0,
        rewardModifier: 0,
      },
      {
        id: 'high',
        labelKey: 'strategy.intensity.high',
        performanceModifier: 10,
        probabilityModifier: -0.06,
        riskModifier: 0.2,
        rewardModifier: 0.2,
      },
    ],
    riskPosture: [
      {
        id: 'conservative',
        labelKey: 'strategy.posture.conservative',
        performanceModifier: -2,
        probabilityModifier: 0.08,
        riskModifier: -0.2,
        rewardModifier: -0.15,
      },
      {
        id: 'balanced',
        labelKey: 'strategy.posture.balanced',
        performanceModifier: 2,
        probabilityModifier: 0,
        riskModifier: 0,
        rewardModifier: 0,
      },
      {
        id: 'aggressive',
        labelKey: 'strategy.posture.aggressive',
        performanceModifier: 8,
        probabilityModifier: -0.1,
        riskModifier: 0.3,
        rewardModifier: 0.35,
      },
    ],
  },

  // PLACEHOLDER — belum balancing final.
  miniGames: {
    captionRounds: 3,
    engagementAttempts: 3,
    engagementTargetWidth: 0.18,
  },

  // PLACEHOLDER — belum balancing final.
  resolution: {
    miniGameWeight: 0.4,
    successFollowersBase: 12,
    successPerformanceGain: 3,
    successReputationGain: 2,
    failureFollowersLoss: 5,
    failurePerformanceLoss: 2,
  },

  // PLACEHOLDER — belum balancing final.
  recovery: {
    cost: 150,
    suspicionReduction: 25,
  },

  incomeAggregationWindowMs: 30_000,
  allowNegativeBalance: true,
  incomeTickMs: 1_000,

  // PLACEHOLDER — belum balancing final.
  posting: {
    cooldownMs: 60_000,
    moneyPerEngagement: 0.8,
    followersPerEngagement: 0.4,
    baseSuspicion: 3,
    shadowbanRewardMultiplier: 0.2,
    suspicionCap: 100,
    suspicionDecayPerMinute: 1.5,
    decayGraceMs: 5 * 60 * 1000,
  },

  // PLACEHOLDER — belum balancing final.
  riskTiers: [
    {
      id: 'safe',
      labelKey: 'risk.tier.safe',
      minSuspicion: 0,
      maxSuspicion: 29,
      incomeMultiplier: 1,
      postingFollowersMultiplier: 1,
      autoFineOnEnter: 0,
      canSeizeAsset: false,
      shadowbanMs: 0,
    },
    {
      id: 'watch',
      labelKey: 'risk.tier.watch',
      minSuspicion: 30,
      maxSuspicion: 59,
      incomeMultiplier: 0.9,
      postingFollowersMultiplier: 0.9,
      autoFineOnEnter: 0,
      canSeizeAsset: false,
      shadowbanMs: 0,
    },
    {
      id: 'hot',
      labelKey: 'risk.tier.hot',
      minSuspicion: 60,
      maxSuspicion: 84,
      incomeMultiplier: 0.65,
      postingFollowersMultiplier: 0,
      autoFineOnEnter: 50,
      canSeizeAsset: false,
      shadowbanMs: 10 * 60 * 1000,
    },
    {
      id: 'critical',
      labelKey: 'risk.tier.critical',
      minSuspicion: 85,
      maxSuspicion: 100,
      incomeMultiplier: 0.3,
      postingFollowersMultiplier: 0,
      autoFineOnEnter: 150,
      canSeizeAsset: true,
      shadowbanMs: 30 * 60 * 1000,
    },
  ],

  // PLACEHOLDER — belum balancing final.
  seizure: {
    tier: 'critical',
    seizeMostValuableFirst: true,
  },

  // PLACEHOLDER — belum balancing final.
  stocks: {
    tickMs: 15_000,
    maxHistoryPoints: 60,
    minPrice: 20,
    maxPrice: 5000,
    quickTradeShares: 2,
  },

  // PLACEHOLDER — belum balancing final.
  travel: {
    defaultTravelCost: 0,
    countryCosts: {
      nusantara: 0,
      belanda: 200,
      jepang: 260,
      korea: 240,
      prancis: 320,
    },
    photoWidth: 1080,
    photoHeight: 1350,
  },
};

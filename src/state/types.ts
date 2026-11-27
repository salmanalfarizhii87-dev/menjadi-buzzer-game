/**
 * Tipe domain game. Satu save = satu profil pemain (MVP single-player).
 *
 * Aturan: angka uang adalah integer (satuan terkecil = 1). Saldo BOLEH negatif
 * (keputusan D-05: utang in-game). Jangan menambah field turunan yang bisa
 * dihitung ulang, kecuali snapshot historis (campaign result).
 *
 * v2: tambah karakter, inventory, aset, tiket, saham, social, violations, risk.
 */

export const APP_ID = 'menjadi-buzzer';
export const APP_SCHEMA_VERSION = 2;

export type AccountStatus = 'normal' | 'warning' | 'restricted' | 'suspended';

export type CampaignStatus =
  | 'available'
  | 'accepted'
  | 'strategy_selected'
  | 'activity_completed'
  | 'resolved'
  | 'cancelled';

export type CampaignOutcome = 'success' | 'partial' | 'failure';

export type CampaignInteraction = 'auto' | 'interactive' | 'hybrid';

export type RiskTier = 'safe' | 'watch' | 'hot' | 'critical';

export type TransactionType =
  | 'passive_income'
  | 'posting_income'
  | 'campaign_payment'
  | 'campaign_bonus'
  | 'upgrade_purchase'
  | 'campaign_fine'
  | 'recovery_cost'
  | 'shop_purchase'
  | 'stock_buy'
  | 'stock_sell'
  | 'travel_cost';

export interface PlayerState {
  id: string;
  money: number;
  reputation: number;
  careerLevel: number;
  careerXP: number;
  sessionsCompleted: number;
  createdAt: number;
}

export interface AccountState {
  id: string;
  name: string;
  platformId: string;
  followers: number;
  performance: number;
  reputation: number;
  suspicion: number;
  status: AccountStatus;
  automationLevel: number;
}

export interface UpgradeState {
  id: string;
  accountId: string;
  upgradeKey: string;
  level: number;
}

export interface CampaignResultSnapshot {
  roll: number;
  successProbability: number;
  performanceScore: number;
  outcome: CampaignOutcome;
  reward: number;
  bonus: number;
  fine: number;
  reputationDelta: number;
  suspicionDelta: number;
  followersDelta: number;
  performanceDelta: number;
  statusBefore: AccountStatus;
  statusAfter: AccountStatus;
  strategyId: string;
  intensity: string;
  riskPosture: string;
  usedMiniGame: boolean;
  miniGameScore: number | null;
  resolvedAt: number;
  /** Tier sebelum/sesudah resolusi; opsional untuk save lama. */
  tierBefore?: RiskTier;
  tierAfter?: RiskTier;
}

export interface CampaignSession {
  id: string;
  campaignDefinitionId: string;
  accountId: string;
  status: CampaignStatus;
  acceptedAt: number;
  miniGameId: string | null;
  miniGameSeed: number;
  selectedStrategyId: string | null;
  selectedIntensity: string | null;
  selectedRiskPosture: string | null;
  miniGameScore: number | null;
  resolvedAt: number | null;
  result: CampaignResultSnapshot | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Positif = masuk, negatif = keluar. */
  amount: number;
  balanceAfter: number;
  sourceId: string | null;
  createdAt: number;
  descriptionKey: string;
}

export interface ActiveTimeState {
  /** Waktu accrual terakhir. Di-reset ke `now` saat bootstrap agar tidak ada offline income. */
  lastAccrualAt: number;
  /** Sisa pecahan income yang belum dibulatkan menjadi 1 rupiah. */
  fractionalIncome: number;
  /** Akumulasi income yang belum ditulis sebagai transaksi (agregasi 30 detik). */
  pendingIncome: number;
  pendingIncomeSince: number | null;
}

// ---------------------------------------------------------------------------
// v2 — karakter, inventori, aset, tiket
// ---------------------------------------------------------------------------

export interface CharacterState {
  /** Outfit yang sedang dipakai. */
  outfitId: string;
  accessoryIds: string[];
  /** Negara tempat karakter berada. */
  locationCountryId: string;
  /** Negara yang pernah dikunjungi (unik). */
  visitedCountryIds: string[];
}

export interface InventoryState {
  /** Semua item yang sudah dibeli (outfit, properti, kendaraan, tiket). */
  ownedItemIds: string[];
  equippedOutfitId: string;
  equippedAccessoryIds: string[];
}

export interface OwnedAssetsState {
  propertyIds: string[];
  vehicleIds: string[];
}

export interface TicketState {
  ownedCountryIds: string[];
}

// ---------------------------------------------------------------------------
// v2 — saham
// ---------------------------------------------------------------------------

export interface StockHolding {
  ticker: string;
  shares: number;
  /** Harga rata-rata beli, untuk menghitung untung/rugi. */
  avgCost: number;
}

export interface StockPricePoint {
  at: number;
  price: number;
}

export interface StockState {
  holdings: StockHolding[];
  /** Harga terkini per ticker. */
  prices: Record<string, number>;
  /** Riwayat harga terbatas per ticker. */
  history: Record<string, StockPricePoint[]>;
  /** Seed RNG — harga deterministik untuk seed yang sama. */
  seed: number;
  /** Tick terakhir. Di-reset ke `now` saat bootstrap agar tidak ada pergerakan offline. */
  lastTickAt: number;
  /** Penghitung tick untuk RNG; opsional agar save lama tetap valid. */
  tickIndex?: number;
}

// ---------------------------------------------------------------------------
// v2 — sosial & risiko
// ---------------------------------------------------------------------------

export interface SocialState {
  cooldownUntil: number | null;
  postingCount: number;
  shadowbannedUntil: number | null;
  lastPostAt: number | null;
}

export type ViolationKind = 'warning' | 'fine' | 'shadowban' | 'restriction' | 'seizure';

export interface ViolationRecord {
  id: string;
  kind: ViolationKind;
  tier: RiskTier;
  /** Nominal denda; 0 untuk jenis non-finansial. */
  amount: number;
  reasonKey: string;
  sourceId: string | null;
  at: number;
}

export interface RiskState {
  tier: RiskTier;
  lastEvaluatedAt: number;
}

// ---------------------------------------------------------------------------

export interface GameSettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
  /** Preferensi UI opsional (save lama boleh tidak punya). */
  confirmRisk?: boolean;
  incomePop?: boolean;
  qaMode?: boolean;
}

export interface SaveMeta {
  createdAt: number;
  updatedAt: number;
}

export interface GameSave {
  schemaVersion: number;
  player: PlayerState;
  accounts: AccountState[];
  upgrades: UpgradeState[];
  campaignSessions: CampaignSession[];
  transactions: Transaction[];
  activeTime: ActiveTimeState;
  settings: GameSettings;
  meta: SaveMeta;
  // v2
  character: CharacterState;
  inventory: InventoryState;
  assets: OwnedAssetsState;
  tickets: TicketState;
  stocks: StockState;
  social: SocialState;
  violations: ViolationRecord[];
  risk: RiskState;
}

/** Status yang dianggap final untuk sebuah campaign session. */
export const FINAL_CAMPAIGN_STATUSES: readonly CampaignStatus[] = ['resolved', 'cancelled'];

export function isFinalCampaignStatus(status: CampaignStatus): boolean {
  return FINAL_CAMPAIGN_STATUSES.includes(status);
}

export const ALL_ACCOUNT_STATUSES: readonly AccountStatus[] = [
  'normal',
  'warning',
  'restricted',
  'suspended',
];

export const ALL_CAMPAIGN_STATUSES: readonly CampaignStatus[] = [
  'available',
  'accepted',
  'strategy_selected',
  'activity_completed',
  'resolved',
  'cancelled',
];

export const ALL_TRANSACTION_TYPES: readonly TransactionType[] = [
  'passive_income',
  'posting_income',
  'campaign_payment',
  'campaign_bonus',
  'upgrade_purchase',
  'campaign_fine',
  'recovery_cost',
  'shop_purchase',
  'stock_buy',
  'stock_sell',
  'travel_cost',
];

export const ALL_RISK_TIERS: readonly RiskTier[] = ['safe', 'watch', 'hot', 'critical'];

export const ALL_VIOLATION_KINDS: readonly ViolationKind[] = [
  'warning',
  'fine',
  'shadowban',
  'restriction',
  'seizure',
];

/** Urutan tier dari paling aman ke paling buruk. */
export const RISK_TIER_ORDER: Record<RiskTier, number> = {
  safe: 0,
  watch: 1,
  hot: 2,
  critical: 3,
};

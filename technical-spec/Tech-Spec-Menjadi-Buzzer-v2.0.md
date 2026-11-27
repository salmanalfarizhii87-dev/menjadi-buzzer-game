# TECHNICAL SPECIFICATION (TECH SPEC)
# MENJADI BUZZER — v2.0

> Status: Draft untuk implementasi MVP 5 menu
> Dokumen acuan: Brainstorm, GDD v1.0–v1.3, **PRD v2.0**, Tech Spec v1.0
> Target: browser game 2D berbasis web, client-first, PWA-ready

---

## 1. RUANG LINGKUP DOKUMEN

Tech Spec v2.0 **melengkapi** Tech Spec v1.0, tidak menggantikannya.

**Tetap berlaku dari v1.0** (tanpa perubahan):
- Stack: Vite + TypeScript strict + vanilla DOM/SVG + CSS. Tanpa framework UI.
- Larangan Canvas/WebGL.
- Screen contract `mount/unmount` + dynamic import.
- `localStorage` hanya lewat `persistence/`.
- Formula ekonomi/probability hanya di `domain/`.
- Tidak ada backend, login, cloud save, leaderboard.
- Aturan keamanan `el()` tanpa prop `html`.
- PWA ditunda sampai core stabil.

**Ditambahkan / diubah di v2.0**:
- Navigasi 5 tab (Karakter, Task, Handphone, Shop, Saham).
- 9 layar baru.
- 4 domain baru: `posting`, `shop`, `stocks`, `travel`.
- Risk tier bertingkat + shadowban + penyitaan aset.
- Character/outfit layering.
- Semua tercantum di bawah.

---

## 2. PERUBAHAN MODEL DATA

### 2.1 Tambahan pada `GameSave`

```ts
interface GameSave {
  // ...field v1.0 tetap...
  character: CharacterState;
  inventory: InventoryState;
  assets: OwnedAssetsState;
  tickets: TicketState;
  stocks: StockState;
  social: SocialState;
  violations: ViolationRecord[];
  risk: RiskState;
}
```

### 2.2 Tipe Baru

```ts
type RiskTier = 'safe' | 'watch' | 'hot' | 'critical';

interface CharacterState {
  outfitId: string;
  accessoryIds: string[];
  locationCountryId: string;
  visitedCountryIds: string[];
}

interface InventoryState {
  ownedItemIds: string[];
  equippedOutfitId: string;
  equippedAccessoryIds: string[];
}

interface OwnedAssetsState {
  propertyIds: string[];
  vehicleIds: string[];
}

interface TicketState {
  ownedCountryIds: string[];
}

interface StockHolding {
  ticker: string;
  shares: number;
  avgCost: number;
}

interface StockPricePoint {
  at: number;
  price: number;
}

interface StockState {
  holdings: StockHolding[];
  prices: Record<string, number>;
  history: Record<string, StockPricePoint[]>;
  seed: number;
  lastTickAt: number;
}

interface SocialState {
  cooldownUntil: number | null;
  postingCount: number;
  shadowbannedUntil: number | null;
  lastPostAt: number | null;
}

type ViolationKind = 'warning' | 'fine' | 'shadowban' | 'restriction' | 'seizure';

interface ViolationRecord {
  id: string;
  kind: ViolationKind;
  tier: RiskTier;
  amount: number;
  reasonKey: string;
  sourceId: string | null;
  at: number;
}

interface RiskState {
  tier: RiskTier;
  lastEvaluatedAt: number;
}
```

### 2.3 Tipe Transaksi Baru

```ts
type TransactionType =
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
```

### 2.4 Migrasi

`schemaVersion: 1 → 2`. Migrasi wajib menambahkan seluruh field baru dengan nilai default dari config, mempertahankan `player`, `accounts`, `transactions`, dan campaign lama.

```ts
const migrations: Record<number, Migration> = {
  1: migrateV1ToV2, // tambah character/inventory/assets/tickets/stocks/social/violations/risk
};
```

Aturan: backup raw sebelum migrasi; jangan hapus save lama; jika gagal, recovery UI.

---

## 3. STRUKTUR FOLDER (TAMBAHAN)

```text
src/
├── app/
│   ├── screen-registry.ts        # + 9 screen baru
│   └── navigation.ts             # 5 tab: karakter|task|handphone|shop|saham
├── domain/
│   ├── posting/
│   │   ├── composer.ts           # opsi caption/hashtag/jam
│   │   ├── resolve-post.ts       # engagement, followers, uang, suspicion
│   │   └── cooldown.ts
│   ├── risk/
│   │   ├── tier.ts               # suspicion → RiskTier
│   │   ├── consequences.ts       # efek per tier
│   │   ├── shadowban.ts
│   │   └── seizure.ts            # pilih aset yang disita
│   ├── shop/
│   │   ├── catalog.ts
│   │   ├── purchase.ts           # validasi + atomik
│   │   └── effects.ts            # bonus properti/kendaraan
│   ├── stocks/
│   │   ├── market.ts             # harga seeded, tick
│   │   ├── trade.ts              # beli/jual
│   │   └── portfolio.ts          # nilai, untung/rugi
│   ├── travel/
│   │   ├── countries.ts
│   │   ├── unlock.ts             # cek tiket
│   │   └── photo.ts              # komposisi + ekspor
│   └── character/
│       ├── outfit.ts             # layer resolution
│       └── layers.ts
├── application/
│   ├── posting/create-post.ts
│   ├── risk/evaluate-tier.ts
│   ├── shop/buy-item.ts
│   ├── stocks/tick-market.ts
│   ├── stocks/trade-stock.ts
│   └── travel/fly-to.ts
├── data/
│   ├── social/apps.ts            # Chirper, Pulse, Loop
│   ├── social/composer-options.ts
│   ├── shop/items.ts             # outfit, properti, kendaraan, tiket
│   ├── stocks/companies.ts
│   ├── travel/countries.ts
│   └── risk/tiers.ts
├── screens/
│   ├── character/                # tab 1 (ganti home)
│   ├── task/                     # tab 2
│   ├── handphone/                # tab 3
│   ├── composer/
│   ├── post-result/
│   ├── shop/
│   ├── shop-detail/
│   ├── stocks/
│   ├── stock-detail/
│   ├── travel/
│   ├── photo/
│   └── violations/               # tab Pelanggaran
├── art/
│   ├── character/                # layer: body, hair, outfit, accessory
│   ├── landmarks/                # SVG landmark per negara
│   └── shop/                     # ikon item
└── components/
    ├── risk-meter/
    ├── phone-frame/
    └── tabs/
```

### 3.1 Aturan Lapisan (tetap)

- `domain/` tidak mengimpor DOM/CSS/screen.
- `application/` mengorkestrasi, memanggil domain, commit state.
- `screens/` memakai selector + action, tidak menghitung formula.
- `persistence/` satu-satunya yang menyentuh `localStorage`.

---

## 4. SCREEN REGISTRY v2.0

| Screen ID | Tab | Modul | Status |
|---|---|---|---|
| `character` | Karakter | `screens/character` | Baru (ganti `home`) |
| `account-detail` | Karakter → sub | `screens/account-detail` | Ada |
| `automation` | Karakter → sub | `screens/automation` | Ada |
| `finance` | Karakter → sub | `screens/finance` | Ada |
| `travel` | Karakter → sub | `screens/travel` | Baru |
| `photo` | Karakter → sub | `screens/photo` | Baru |
| `task` | Task | `screens/task` | Baru (ganti `campaign-board`) |
| `violations` | Task → tab | `screens/violations` | Baru |
| `campaign-brief` | Task → sub | `screens/campaign-brief` | Ada |
| `campaign-strategy` | Task → sub | `screens/campaign-strategy` | Ada |
| `campaign-minigame` | Task → sub | `screens/campaign-minigame` | Ada |
| `campaign-result` | Task → sub | `screens/campaign-result` | Ada |
| `handphone` | Handphone | `screens/handphone` | Baru |
| `composer` | Handphone → sub | `screens/composer` | Baru |
| `post-result` | Handphone → sub | `screens/post-result` | Baru |
| `shop` | Shop | `screens/shop` | Baru |
| `shop-detail` | Shop → sub | `screens/shop-detail` | Baru |
| `stocks` | Saham | `screens/stocks` | Baru |
| `stock-detail` | Saham → sub | `screens/stock-detail` | Baru |

Total: **19 layar**. Nav utama hanya 5 tab.

### 4.1 Mapping Tab → Layar

```ts
const TAB_MEMBERSHIP: Record<TabId, ScreenId[]> = {
  karakter: ['character', 'account-detail', 'automation', 'finance', 'travel', 'photo'],
  task: ['task', 'violations', 'campaign-brief', 'campaign-strategy', 'campaign-minigame', 'campaign-result'],
  handphone: ['handphone', 'composer', 'post-result'],
  shop: ['shop', 'shop-detail'],
  saham: ['stocks', 'stock-detail'],
};
```

Nav aktif = tab yang memiliki layar saat ini.

---

## 5. POSTING MANUAL

### 5.1 Data

```ts
interface SocialApp {
  id: string;
  name: string;
  taglineKey: string;
  iconId: string;
  followerMultiplier: number;
  suspicionMultiplier: number;
  rewardMultiplier: number;
}

interface CaptionOption {
  id: string;
  textKey: string;
  tone: 'informative' | 'emotional' | 'humorous' | 'provocative';
  baseEngagement: number;
}

interface HashtagOption {
  id: string;
  label: string;
  reachModifier: number;
  suspicionModifier: number;
}

interface TimingOption {
  id: 'quiet' | 'normal' | 'peak';
  labelKey: string;
  engagementModifier: number;
  suspicionModifier: number;
}
```

### 5.2 Resolusi Posting

```ts
interface PostInput {
  appId: string;
  captionId: string;
  hashtagId: string;
  timingId: string;
}

interface PostResult {
  engagement: number;
  followersDelta: number;
  moneyDelta: number;
  suspicionDelta: number;
  shadowbanned: boolean;
  captionMatch: number; // 0..1, kecocokan caption dengan app
  at: number;
}
```

Formula konseptual (semua bobot dari config):

```text
engagement   = app.followerMultiplier
             × caption.baseEngagement
             × hashtag.reachModifier
             × timing.engagementModifier
             × account.performance / 50

moneyDelta   = floor(engagement × config.posting.moneyPerEngagement)
followersDelta = floor(engagement × config.posting.followersPerEngagement)
suspicionDelta = ceil(config.posting.baseSuspicion
                    × app.suspicionMultiplier
                    × hashtag.suspicionModifier
                    × timing.suspicionModifier)
```

### 5.3 Aturan

- Cooldown: `config.posting.cooldownMs` (placeholder 60_000).
- Shadowban: jika `social.shadowbannedUntil > now`, `followersDelta = 0` dan `moneyDelta` dipotong `config.posting.shadowbanRewardMultiplier`.
- Satu posting = satu transaksi `posting_income` (walau nominal 0, tetap dicatat untuk audit? **Tidak** — hanya dicatat bila `moneyDelta > 0`).
- Posting **tidak** memakai random roll; hasil deterministik dari pilihan pemain. Ini menjaga "keputusan terasa" dan menghindari tuduhan acak.
- Suspicion naik **selalu** (kecuali shadowban memperkuat).
- Setelah posting, evaluasi tier (`application/risk/evaluate-tier.ts`).

---

## 6. RISK TIER

### 6.1 Konfigurasi

```ts
interface RiskTierConfig {
  id: RiskTier;
  labelKey: string;
  minSuspicion: number;
  maxSuspicion: number;
  incomeMultiplier: number;
  postingFollowersMultiplier: number;
  autoFineOnEnter: number;
  canSeizeAsset: boolean;
}
```

Placeholder:

| Tier | Suspicion | income | posting followers | autoFine | seize |
|---|---|---:|---:|---:|---|
| safe | 0–29 | 1.00 | 1.00 | 0 | tidak |
| watch | 30–59 | 0.90 | 0.90 | 0 | tidak |
| hot | 60–84 | 0.65 | 0 (shadowban) | 50 | tidak |
| critical | 85–100 | 0.30 | 0 (shadowban) | 150 | ya |

### 6.2 Transisi

`evaluate-tier` dipanggil setelah: posting, campaign resolve, recovery, dan setiap flush income (untuk memastikan tier konsisten dengan suspicion).

Saat tier **naik**:
1. Catat `ViolationRecord` dengan `kind: 'warning' | 'fine' | 'shadowban' | 'restriction'`.
2. Terapkan `autoFineOnEnter` (sekali per kenaikan, bukan per tick).
3. Set `social.shadowbannedUntil` bila tier ≥ hot.
4. Bila `critical` dan `canSeizeAsset`, jalankan `seizure` — pilih satu aset (properti atau kendaraan) dan hapus dari kepemilikan, catat `ViolationRecord kind: 'seizure'`.

Saat tier **turun**: hanya update `risk.tier`; shadowban dibiarkan sampai waktunya habis.

**Idempotency**: transisi hanya terjadi bila `nextTier !== currentTier`. Menyimpan tier di state mencegah denda berulang.

### 6.3 Efek pada Income

`incomeRate` dikalikan `riskTier.incomeMultiplier` **dan** `account.status` modifier. Keduanya berlaku; hasil akhir tidak boleh negatif.

### 6.4 Penyitaan Aset

```ts
function selectSeizableAsset(save, rng): { kind: 'property' | 'vehicle'; id: string } | null
```

- Prioritas: aset termahal dulu agar terasa (placeholder; perlu playtest).
- Jika tidak ada aset, tidak ada penyitaan — hanya restriction.
- Aset yang disita hilang dari kepemilikan; transaksi kompensasi **tidak** dibuat (bukan uang keluar), tetapi `ViolationRecord` dicatat.

---

## 7. SHOP

### 7.1 Katalog

```ts
type ShopCategory = 'outfit' | 'property' | 'vehicle' | 'ticket';

interface ShopItem {
  id: string;
  category: ShopCategory;
  nameKey: string;
  descKey: string;
  price: number;
  artId: string;
  /** Efek terukur; semua opsional. */
  effects?: {
    incomeMultiplier?: number;
    credibilityBonus?: number;
    followerBonus?: number;
  };
  /** Untuk kategori ticket. */
  countryId?: string;
  /** Tidak bisa disita. */
  seizureExempt?: boolean;
}
```

### 7.2 Aturan

- Beli: validasi `money >= price`, belum dimiliki, item valid.
- Atomik: potong saldo → tambah kepemilikan → transaksi `shop_purchase` → commit → `saveNow`.
- `outfit` → masuk `inventory.ownedItemIds`, bisa dipasang.
- `property`/`vehicle` → masuk `assets`, memberi `incomeMultiplier` bila ada.
- `ticket` → masuk `tickets.ownedCountryIds`, membuka negara.
- Item yang dimiliki: tombol "Dimiliki"/"Pasang", bukan "Beli".
- Efek income dari aset dikalikan bersama: `1 + sum(effects.incomeMultiplier - 1)` dengan cap dari config.

---

## 8. SAHAM

### 8.1 Data

```ts
interface StockCompany {
  ticker: string;
  nameKey: string;
  sector: string;
  initialPrice: number;
  volatility: number; // 0..1
  drift: number;      // kecenderungan naik/turun
}
```

### 8.2 Pergerakan Harga

- **Seeded RNG** dari `stocks.seed` — bukan `Math.random()`.
- Tick hanya saat game terbuka, interval `config.stocks.tickMs` (placeholder 15_000).
- Formula:

```text
nextPrice = clamp(
  price × (1 + drift × dt + volatility × gaussian(rng) × sqrt(dt)),
  minPrice,
  maxPrice
)
```

- `history` dibatasi `config.stocks.maxHistoryPoints` (mis. 60) agar save tidak membengkak.
- Harga tidak bergerak saat game tertutup: saat bootstrap, `lastTickAt = now` (pola sama dengan income).

### 8.3 Beli/Jual

```ts
function buyStock(save, ticker, shares): ActionResult
function sellStock(save, ticker, shares): ActionResult
```

- Beli: `cost = shares × price`; validasi saldo; update `holdings` (weighted average `avgCost`); transaksi `stock_buy`.
- Jual: validasi `shares <= holding.shares`; `proceeds = shares × price`; kurangi holding (hapus bila 0); transaksi `stock_sell`.
- Semua atomik, `saveNow`.

### 8.4 Portofolio

`marketValue = shares × currentPrice`; `unrealizedPnL = marketValue - shares × avgCost`.

---

## 9. TRAVEL

### 9.1 Data

```ts
interface CountryDefinition {
  id: string;
  nameKey: string;
  landmarkId: string;
  landmarkNameKey: string;
  travelCost: number;
  ticketItemId: string;
}
```

### 9.2 Aturan

- Terbang: butuh `tickets.ownedCountryIds.includes(countryId)`.
- Biaya perjalanan `travelCost` (opsional; bisa 0 bila tiket sudah mencakup).
- Set `character.locationCountryId`; tambahkan ke `visitedCountryIds` bila baru.
- Transaksi `travel_cost` bila biaya > 0.

### 9.3 Foto

- Komposisi SVG: background landmark + karakter (outfit terpasang) + frame.
- Ekspor: render SVG → `<canvas>` sementara → `toBlob('image/png')` → unduh via `<a download>`.
- **Canvas hanya dipakai untuk ekspor gambar**, bukan rendering game. Ini pengecualian terdokumentasi dari larangan Canvas.
- Tanpa server, tanpa unggah.

---

## 10. KARAKTER & OUTFIT

### 10.1 Layer

```ts
type CharacterLayerId = 'base' | 'hair' | 'outfit' | 'accessory' | 'shoes';

interface OutfitDefinition {
  id: string;
  nameKey: string;
  artId: string;
  layer: CharacterLayerId;
  /** Urutan render; makin besar makin depan. */
  zIndex: number;
}
```

### 10.2 Renderer

`renderCharacter(container, { outfitId, accessoryIds })` menyusun `<g>` sesuai `zIndex`. Semua SVG original, tidak menyalin aset referensi.

### 10.3 Aturan

- Save hanya menyimpan ID, bukan markup SVG.
- Mengganti outfit tidak memicu transaksi (sudah dibeli).
- Outfit default selalu tersedia agar karakter tidak kosong.

---

## 11. UPDATE PADA SISTEM LAMA

### 11.1 Income

Tambahan pengali tier:

```text
incomePerSecond = baseRate
                × followersFactor
                × performanceFactor
                × automationMultiplier
                × statusModifier
                × riskTierIncomeMultiplier
```

`riskTierIncomeMultiplier` dari config tier aktif.

### 11.2 Ledger

Tipe transaksi bertambah 4. `descriptionKey` wajib untuk semua tipe. `balanceAfter` tetap diambil dari saldo setelah mutasi (pola F3).

### 11.3 Navigasi

`home` → `character`. `campaign-board` → `task`. Nav 5 tab. `back()` tetap stack internal.

### 11.4 Selector Baru

```ts
selectRiskTier(save, config)
selectRiskMeter(save, config)          // { tier, suspicion, label, segments }
selectOwnedItems(save)
selectEquippedOutfit(save)
selectShopCatalog(save, config, category)
selectPostingCooldown(save, config)    // { active, remainingMs }
selectStockPortfolio(save, config)
selectCountries(save, config)          // { unlocked, visited }
selectViolations(save)
```

---

## 12. TESTING (TAMBAHAN)

### 12.1 Unit

- `resolve-post`: kombinasi caption/hashtag/jam; deterministik; suspicion selalu naik.
- `cooldown`: tolak posting saat aktif; lolos setelah waktu.
- `tier`: threshold, transisi naik/turun, idempotensi denda.
- `seizure`: pilih aset, tidak ada aset → null, aset exempt dilewati.
- `shop purchase`: validasi saldo, duplikat, efek income.
- `stock market`: seeded deterministik (seed sama → harga sama), clamp, history cap.
- `stock trade`: beli/jual, avgCost, jual melebihi kepemilikan.
- `travel unlock`: tanpa tiket ditolak; dengan tiket berhasil; visited unik.

### 12.2 Integration

- Posting → suspicion naik → tier berubah → income turun.
- Beli outfit → pasang → refresh → tetap.
- Beli tiket → travel → foto.
- Beli saham → tick → jual.
- Refresh di setiap tahap.

### 12.3 E2E

Alur penuh 5 menu dalam satu sesi, plus refresh di tengah.

---

## 13. PERFORMANCE

- Posting & saham: tick ringan (saham 15 detik), bukan per frame.
- History saham dibatasi agar save < 1 MB.
- Gambar karakter: SVG layer, bukan raster besar.
- Ekspor foto: dilakukan sekali saat tombol ditekan, bukan loop.

---

## 14. ACCEPTANCE CRITERIA TEKNIS

- [ ] `schemaVersion: 2` + migrasi dari 1.
- [ ] 19 layar terdaftar, 5 tab memetakan dengan benar.
- [ ] Posting deterministik, cooldown bekerja, tercatat di ledger.
- [ ] Risk tier menaikkan/menurunkan efek, denda idempoten.
- [ ] Penyitaan aset hanya pada critical, tercatat di Pelanggaran.
- [ ] Shop 4 kategori, atomik, tiket membuka negara.
- [ ] Saham seeded, tick hanya saat terbuka, beli/jual valid.
- [ ] Travel butuh tiket, foto dapat diunduh.
- [ ] Karakter merender outfit dari ID.
- [ ] Semua transaksi baru muncul di Keuangan.
- [ ] Tidak ada framework UI, tidak ada Canvas untuk rendering game.
- [ ] `localStorage` hanya di `persistence/`.

---

## 15. OPEN DECISIONS TEKNIS

| ID | Topik | Default |
|---|---|---|
| TD-101 | Nama app medsos | Chirper / Pulse / Loop |
| TD-102 | Cooldown posting | 60 detik |
| TD-103 | Tick saham | 15 detik |
| TD-104 | Volatilitas saham | 0.02–0.08 per tick |
| TD-105 | Penyitaan aset | Aset termahal saat critical |
| TD-106 | Shadowban durasi | 10 menit |
| TD-107 | Batas history saham | 60 titik |
| TD-108 | Ekspor foto | PNG 1080×1350 |

---

## 16. CHANGE LOG

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 26 Nov 2026 | Tech Spec pertama (MVP sempit) |
| 2.0 | 26 Nov 2026 | Tambah 5 menu, 19 layar, domain posting/risk-tier/shop/stocks/travel/character, schema v2 + migrasi, pengali risk tier pada income |

---

**END OF DOCUMENT — MENJADI BUZZER TECH SPEC v2.0**

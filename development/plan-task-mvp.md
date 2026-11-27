# PLAN TASK — MENJADI BUZZER MVP v2.0

**Versi:** 2.0 (selaras PRD v2.0 + Tech Spec v2.0: 5 menu wajib)
**Tanggal:** 26 November 2026
**Status:** Disetujui — eksekusi bertahap
**Acuan:** `project-requirements/PRD-Menjadi-Buzzer-v2.0.md`, `technical-spec/Tech-Spec-Menjadi-Buzzer-v2.0.md`, `project-overview/brainstorm.md`, GDD v1.0–v1.3, `ui-ux-design/*`, `/ui-reference`
**Target akhir:** M12 — MVP 5 menu, seluruh acceptance criteria MUST lulus

---

## 0. CARA PAKAI

- Task dieksekusi berurutan per fase. Fase tidak dimulai sebelum **Gate** fase sebelumnya lulus.
- Centang `[ ]` → `[x]` hanya setelah diverifikasi (test + browser).
- Keputusan produk yang belum disetujui → **STOP**, laporkan.
- Tidak mengubah: `project-overview/brainstorm.md`, `game-design/*`.

---

## 1. STATUS EKSEKUSI

| Fase | Isi | Status |
|---|---|---|
| F0 | Foundation (Vite, TS, token, audit UI) | ✓ selesai |
| F1 | State, persistence, router, shell | ✓ selesai |
| F2 | Idle economy + Home + Account | ✓ selesai |
| F3 | Automation upgrade | ✓ selesai |
| F4 | **Refactor: nav 5 tab + Karakter + outfit** | ✓ selesai |
| F5 | **Handphone + posting manual + engine risk tier** | ✓ selesai |
| F6 | **Tab Pelanggaran + pemulihan** | ✓ selesai |
| F7 | Task + Campaign foundation | ✓ selesai |
| F8 | Mini-game (caption + engagement) | ✓ selesai |
| F9 | Resolution, penalty, result | ✓ selesai |
| F10 | **Shop 4 kategori** | ✓ selesai |
| F11 | **Saham** | ✓ selesai |
| F12 | **Travel + foto landmark** | ✓ selesai |
| F13 | Keuangan lengkap + QA + responsive | ✓ selesai |

**Bukti F0–F6:** 325 test lulus (29 file), build sukses, ledger konsisten, tanpa error console.

---

## 2. KEPUTUSAN

### 2.1 Disetujui

| ID | Topik | Keputusan |
|---|---|---|
| D-01 | Mini-game | Dua: Caption Challenge + Engagement Challenge, eksekusi serial (F8A → F8B) |
| D-02 | Income crediting | Pending → flush (dikreditkan saat flush agar ledger konsisten) |
| D-05 | Fine > saldo | Saldo boleh negatif (utang in-game), tanpa clamp |
| D-06 | Layout | Potret basis, kolom terpusat 480 px |
| D-08 | Ledger | Agregasi passive income per 30 detik |
| **D-11** | **Scope 5 menu** | **Kelima menu wajib di MVP** |
| **D-12** | **Navigasi** | **5 tab brainstorm; layar v1.0 jadi sub-menu** |
| **D-13** | **Handphone** | **Dua jalur: posting manual (kecil, aman) + campaign (besar, berisiko)** |
| **D-14** | **Posting** | Deterministik (bukan random), cooldown 60 detik, selalu menaikkan suspicion |
| **D-15** | **Risk tier** | 4 tingkat: safe/watch/hot/critical, efek berlapis, denda idempoten |
| **D-16** | **Penyitaan aset** | Hanya critical, aset termahal, tercatat di Pelanggaran |
| **D-17** | **Saham** | Seeded RNG, tick 15 detik hanya saat terbuka |
| **D-18** | **Foto** | SVG komposisi → ekspor PNG via canvas sementara (satu-satunya Canvas) |

### 2.2 Default (boleh dikoreksi sebelum fase terkait)

| ID | Topik | Default |
|---|---|---|
| D-03 | Partial Success | Tidak diimplementasikan |
| D-04 | Presisi uang | Integer |
| D-07 | Bahasa | Indonesia via dictionary |
| D-09 | Reset save | Hanya build dev |
| D-10 | PWA | Ditunda ke F13 opsional |
| D-19 | Nama app medsos | Chirper, Pulse, Loop |
| D-20 | Negara | 5 placeholder |
| D-21 | Emiten saham | 3–5 fiktif |

---

## 3. GUARDRAIL

1. Vanilla TS + DOM + SVG + CSS. Dilarang React/Vue/Svelte/Solid.
2. Canvas hanya untuk ekspor foto (D-18), bukan rendering game.
3. `localStorage` hanya di `persistence/`.
4. Formula ekonomi/probability/posting/saham hanya di `domain/`.
5. Tanpa `innerHTML` untuk data dinamis.
6. Tanpa `alert()` untuk error.
7. Random roll campaign sekali; posting deterministik; saham seeded.
8. Action ekonomi atomik: validasi → hitung → next state → transaksi → persist.
9. Saldo negatif legal; purchase wajib `money >= cost`.
10. Tidak menyalin aset/logo/nama dari `/ui-reference`.
11. Semua angka balancing di `src/data/config/`.
12. Setiap domain berformula wajib unit test.
13. Tidak klaim "sudah dites" tanpa menjalankan test.

---

## 4. FASE 4 — REFACTOR NAVIGASI + KARAKTER + OUTFIT

**Milestone:** M4. **Ini fase paling berisiko** karena mengubah struktur yang sudah jalan.

### 4.1 Schema v2

- [x] **T4.1** `src/state/types.ts` — `CharacterState`, `InventoryState`, `OwnedAssetsState`, `TicketState`, `StockState`, `SocialState`, `ViolationRecord`, `RiskState`, `RiskTier`; 11 `TransactionType`. `APP_SCHEMA_VERSION = 2`.
- [x] **T4.2** `src/data/config/balance.ts` — blok `posting`, `riskTiers` (4 tier), `seizure`, `stocks`, `travel`, `character`; `income.assetBonusCap`. Semua `PLACEHOLDER`.
- [x] **T4.3** `src/persistence/migrations.ts` — `migrateV1ToV2`: tambah semua field baru dengan default; pertahankan player/accounts/transactions/campaignSessions. Idempoten.
- [x] **T4.4** `src/persistence/save-schema.ts` — validator untuk character, inventory, assets, tickets, stocks, social, violations, risk.
- [x] **T4.5** Test migrasi: 9 test (`migrations.test.ts`) — schema naik, data v1 utuh, field baru lengkap, idempoten, aman untuk non-objek.

### 4.2 Navigasi 5 tab

- [x] **T4.6** `src/app/navigation.ts` — `TabId`, `TABS` (5), `tabForScreen`, `getTab`.
- [x] **T4.7** `src/app/screen-registry.ts` — 19 screen ID; `home` → `character`, `campaign-board` → `task`.
- [x] **T4.8** `src/components/navigation/primary-nav.ts` — 5 tab (Karakter/Task/Handphone/Shop/Saham), `aria-current` dari `tabForScreen`. Ikon baru: phone, shop, chart, wallet, plane, camera, flag.
- [x] **T4.9** `src/screens/character/` — karakter + outfit, saldo, income rate, risk meter, lokasi, koleksi negara, 4 shortcut, kartu kampanye aktif.
- [x] **T4.10** `src/screens/home` dihapus (tidak ada dua implementasi).
- [x] **T4.11** Semua `navigate('home')` → `'character'`; `campaign-board` dihapus.

### 4.3 Karakter & outfit

- [x] **T4.12** `src/data/shop/outfits.ts` — 4 outfit: `outfit-basic` (gratis, seizureExempt), casual (300), formal (900), luxury (2500). Field lengkap + `credibilityBonus`.
- [x] **T4.13** `src/domain/character/layers.ts` — `resolveCharacterLayers` (base→shoes→outfit→hair→accessory, terurut zIndex), `resolveEquippedOutfit`.
- [x] **T4.14** `src/art/character/renderer.ts` — `playerCharacter({ outfitId })` layered SVG dengan palet & bentuk berbeda per outfit. Menggantikan `player-placeholder.ts`.
- [x] **T4.15** `src/domain/character/outfit.ts` — `evaluateEquipOutfit`, `equipOutfit` (pure, validasi kepemilikan).
- [x] **T4.16** `src/application/character/equip-outfit.ts` — **dipindah ke F10** (butuh Shop untuk membeli outfit; saat ini baru outfit default yang dimiliki).
- [x] **T4.17** `src/components/risk-meter/` — 4 tier, warna + label + segmen + track; varian compact.

### 4.4 Placeholder layar baru

- [x] **T4.18** Placeholder jujur untuk 11 layar: `task`, `violations`, `handphone`, `composer`, `post-result`, `shop`, `shop-detail`, `stocks`, `stock-detail`, `travel`, `photo`. Tanpa tombol palsu.

**Gate F4:** 5 tab berfungsi, karakter tampil dengan outfit dari ID, save v1 termigrasi ke v2 tanpa kehilangan data, 19 screen terdaftar, test lama tetap lulus.

**Status F4: LULUS.** 205 test lulus (19 file). Verifikasi browser:
- 5 tab (Karakter/Task/Handphone/Shop/Saham) berfungsi, `aria-current` benar di semua tab.
- Karakter tampil layered SVG dengan outfit "Kaos Kilat" (dari `outfit-basic`), lokasi "Nusantara", 4 shortcut (Akun/Upgrade/Keuangan/Travel).
- Migrasi v1→v2: money 4321, 7777 followers, 45 suspicion, `@OldAccount`, 5 sessions — semua utuh; field baru lengkap; `schemaVersion: 2` tersimpan segera.
- Risk meter: suspicion 65 → "Panas" (3 segmen, rate 0,50→0,33); 92 → "Kritis" (4 segmen, rate 0,15).
- Desktop 1280px: frame 480px di `left: 400`, nav ikut terpusat.
- 0 error console, tanpa horizontal overflow (390/390).

### 4.5 Temuan & perbaikan saat verifikasi

1. **Pengali risk tier belum terpasang di income** — rate tidak turun saat tier buruk. Diperbaiki di `selectIncomeBreakdown`: `ratePerSecond × tierConfig.incomeMultiplier`, ditambah field `riskMultiplier` pada `IncomeBreakdown`. 4 test baru membuktikan proporsionalitas.
2. **Migrasi tidak langsung dipersist** — hasil migrasi hanya di memori sampai ada commit berikutnya. Diperbaiki: `repository.saveNow(save)` segera setelah migrasi berhasil.
3. **`stocks.lastTickAt` tidak di-reset saat bootstrap** — berpotensi harga bergerak untuk waktu tertutup. Diperbaiki: reset bersama `lastAccrualAt`.

---

## 5. FASE 5 — HANDPHONE + POSTING MANUAL

**Milestone:** M5.

> **Catatan pergeseran:** engine risk tier (transisi, denda otomatis, shadowban, penyitaan, riwayat pelanggaran) dipindah ke fase ini karena posting membutuhkannya agar bermakna. F6 kini fokus ke **UI tab Pelanggaran, aksi pemulihan, dan pengujian lanjutan**.

- [x] **T5.1** `src/data/social/apps.ts` — 3 app fiktif: Chirper (teks), Pulse (video), Loop (utas). Field: `id, name, taglineKey, preferredTone, followerMultiplier, suspicionMultiplier, rewardMultiplier`.
- [x] **T5.2** `src/data/social/composer-options.ts` — 4 caption (dengan `tone` + `baseEngagement`), 4 hashtag (`reachModifier`, `suspicionModifier`), 3 timing (quiet/normal/peak).
- [x] **T5.3** `src/domain/posting/composer.ts` — `validatePostInput`, `DEFAULT_POST_INPUT` (opsi paling aman, bukan paling berisiko).
- [x] **T5.4** `src/domain/posting/resolve-post.ts` — `resolvePost` **deterministik tanpa RNG**, `reachLabel`, `riskLabel`. Formula sesuai Tech Spec §5.2.
- [x] **T5.5** `src/domain/posting/cooldown.ts` — `isOnCooldown`, `cooldownRemainingMs`, `getCooldownState`, `formatCooldown`.
- [x] **T5.6** `src/application/posting/create-post.ts` — urutan atomik: validasi input → validasi cooldown → hitung → terapkan money/followers/suspicion → transaksi `posting_income` → set cooldown → evaluasi tier → commit → `saveNow`. Guard in-flight.
- [x] **T5.6b** `src/application/risk/evaluate-tier.ts` — `evaluateTier` (idempoten per transisi), `applySuspicionDecay` (istirahat menurunkan suspicion), `selectSeizableAsset`.
- [x] **T5.7** `src/screens/handphone/` — bingkai ponsel, 3 app (pilih → feed berganti), risk meter, banner shadowban, cooldown bar, tombol Posting.
- [x] **T5.8** `src/screens/composer/` — caption/hashtag/jam sebagai kartu radio, preview kualitatif (Jangkauan/Risiko/uang/followers), tombol Posting disabled saat cooldown.
- [x] **T5.9** `src/screens/post-result/` — rincian hasil, peringatan kenaikan tier + denda, banner utang, tombol kembali. Membaca router params; tidak memutasi state.
- [x] **T5.10** `src/components/phone-frame/` — `phoneFrame`, `appGrid`, `cooldownBar`, `phoneBanner`.
- [x] **T5.11** Ikon app fiktif: `appChirper`, `appPulse`, `appLoop` (SVG original).

**Gate F5:** posting 3× beruntun → cooldown menolak ke-2 dan ke-3; suspicion naik; hasil deterministik; transaksi tercatat; refresh mempertahankan cooldown.

**Status F5: LULUS.** 271 test lulus (24 file). Verifikasi browser:
- Tab Handphone: bingkai ponsel, 3 app, feed berganti saat app dipilih, risk meter tampil.
- Composer: 3 grup (Caption/Hashtag/Jam), default = opsi paling aman, preview kualitatif.
- Posting: engagement 42, uang Rp 33, followers +16, suspicion +3, transaksi `posting_income:33@533`.
- Cooldown: tombol berubah "Cooldown 59s" + disabled + progress bar; refresh tetap 56s.
- Eskalasi tier: suspicion 58 + posting agresif → 64 (Panas), denda Rp 50, shadowban aktif, 3 violation (`warning`, `fine`, `shadowban`).
- Banner shadowban tampil di handphone.
- 0 error console, tanpa overflow 390px.

### 5.1 Temuan & perbaikan

1. **Label preview redundan** ("Jangkauan / Jangkauan rendah"). Ditambah key `social.reach.short.*` dan `social.risk.short.*`.
2. **`pagehide` flush bisa menimpa save yang dimigrasi manual** saat pengujian. Bukan bug aplikasi — `flush()` hanya menulis bila ada pending; didokumentasikan agar pengujian memakai context baru.

---

## 6. FASE 6 — TAB PELANGGARAN + PEMULIHAN

**Milestone:** M6.

> Engine tier (transisi, denda, shadowban, penyitaan) sudah dibangun di F5 karena dibutuhkan posting. F6 memecahnya menjadi domain modul, menambah aksi pemulihan, dan membangun UI.

- [x] **T6.1** `src/domain/risk/tier.ts` — `tierForSuspicion`, `getTierConfig`, `isTierUp/Down`, `nextWorseTier`, `suspicionToNextTier`.
- [x] **T6.2** `src/state/selectors.ts` — `selectTierForSuspicion` kini mendelegasikan ke domain (satu sumber aturan).
- [x] **T6.3** `src/domain/risk/consequences.ts` — `consequencesForTier`, `allTierConsequences`, ringkasan efek (`summaryKeys`).
- [x] **T6.4** `src/domain/risk/shadowban.ts` — `isShadowbanned`, `shadowbanRemainingMs`, `applyShadowban` (tidak memperpendek), `clearExpiredShadowban`, `shadowbanEffects`.
- [x] **T6.5** `src/domain/risk/seizure.ts` — `listSeizableAssets`, `selectSeizableAsset`, `removeAsset` (diekstrak dari application layer).
- [x] **T6.6** `src/domain/risk/recovery.ts` — `evaluateRecovery` (biaya, suspicion sebelum/sesudah, mampu/tidak).
- [x] **T6.7** `src/application/accounts/recover-account.ts` — atomik: validasi → potong saldo → transaksi `recovery_cost` → turunkan suspicion → evaluasi tier → commit.
- [x] **T6.8** `src/application/risk/evaluate-tier.ts` — direfaktor memakai modul domain; tetap idempoten per transisi.
- [x] **T6.9** `src/components/violations/` — `rulesTable` (4 tier + efek + penanda tier aktif), `violationHistory`, `recoveryBox`.
- [x] **T6.10** `src/screens/task/` — shell dua tab: **Kontrak** (empty state jujur, diisi F7) dan **Pelanggaran** (aturan + riwayat + pemulihan) dengan badge jumlah pelanggaran.
- [x] **T6.11** `src/screens/violations/` — layar mandiri untuk deep-link (dipakai F9 dari result kampanye).

**Gate F6:** suspicion 68 (Panas) menampilkan 3 efek + 3 riwayat; pemulihan Rp 150 menurunkan suspicion 68 → 43 dan tier Panas → Waspada; saldo 500 → 350; transaksi `recovery_cost` tercatat; idempoten (tidak dobel).

**Status F6: LULUS.** 325 test lulus (29 file). Verifikasi browser:
- Tab Task: dua tab internal, default Kontrak, badge "3" di Pelanggaran.
- Tabel aturan: Aman (0–29) / Waspada (30–59) / Panas (60–84) / Kritis (85–100) dengan efek masing-masing; baris aktif ditandai.
- Riwayat: Denda −Rp 50, Shadowban, Peringatan, lengkap dengan tanggal + tier.
- Pemulihan: "Bayar Rp 150 untuk menurunkan suspicion 68 → 43" → saldo 500 → 350, meter berubah ke Waspada, toast konfirmasi.
- 0 error console.

### 6.1 Temuan & perbaikan

1. **Dobel logika tier** antara selector dan application layer. Dihapus; selector kini mendelegasikan ke `domain/risk/tier.ts`.
2. **Pesan kekurangan saldo salah hitung** pada kotak pemulihan (`cost - cost = 0`). Diperbaiki memakai `selectDisplayBalance`.
3. **Uji dengan `risk.tier` tidak konsisten** memicu denda otomatis palsu (safe → hot dianggap naik). Fixture test diperbaiki: tier awal harus cocok dengan suspicion.

---

## 7. FASE 7 — TASK + CAMPAIGN FOUNDATION

**Milestone:** M7.

- [x] **T7.1** `src/data/campaigns/seed.ts` — tetap 4 kontrak; tambah field `riskImpact` (delta suspicion).
- [x] **T7.2** `src/domain/campaigns/{definition,eligibility,session}.ts` — pindahkan dari rencana v1.0, sesuaikan import.
- [x] **T7.3** `src/application/campaigns/{accept-campaign,select-strategy,resume}.ts`.
- [x] **T7.4** `src/screens/task/` — daftar kontrak (kartu: nama, klien, difficulty, payment, bonus, risk, interaction, status).
- [x] **T7.5** `src/screens/campaign-brief/` — detail + Accept (disabled + alasan).
- [x] **T7.6** `src/screens/campaign-strategy/` — strategi relevan, intensity, risk posture, estimasi, warning akun.
- [x] **T7.7** Karakter: kartu "Lanjutkan kampanye" bila ada session aktif.

**Gate F7:** accept → refresh → session pulih; accept ganda ditolak.
**Status F7: LULUS.** 349 test lulus (32 file). Verifikasi browser (127.0.0.1:5221):
- Tab Task menampilkan 4 kartu kontrak dengan badge status, pembayaran, bonus, risiko, dan pips kesulitan.
- Brief `Soft Launch Gerai Baru`: tombol Terima aktif → session `accepted`; kembali ke Task badge berubah "Berjalan" dan tombol brief menjadi "Lanjutkan".
- Session bertahan setelah reload; strip "Lanjutkan kampanye" muncul di Task dan mengarah ke tahap yang benar.
- Accept ganda ditolak (unit test `campaign_ineligible`); kontrak lain terkunci saat ada session aktif.
- Performa 5: `Push Peluncuran Viral` menampilkan alasan "Performa akun belum cukup (5/30)" dan tombol Terima nonaktif.
- `Caption Drive Mingguan` hanya menampilkan 2 pendekatan relevan (Informatif, Emosional) dari 3; estimasi berubah saat intensitas/postur diganti.
- Konfirmasi strategi menyimpan status `strategy_selected` dan mengarah ke mini-game (kontrak interaktif) atau result (kontrak auto).
- 0 error console; tidak ada overflow horizontal pada 360/390/768/1280 (frame tetap 480 px di desktop).

### 7.1 Temuan & perbaikan
1. **Label syarat kedua salah** memakai "Tipe interaksi" untuk status akun. Ditambah kunci `campaign.accountStatus`.
2. **Pilihan strategi ter-reset** setiap render karena state lokal dideklarasikan di dalam `render()`. Dipindah ke closure mount + scroll dipulihkan setelah render.
3. **`riskImpact` belum ada di seed** sehingga estimasi suspicion tidak bisa dihitung. Ditambahkan per kontrak (4/18/9/13) dan dipakai `estimateCampaign`.
4. **Route "Lanjutkan" tersebar** (Karakter memetakan status sendiri). Dipusatkan di `application/campaigns/resume.ts` + `screens/campaign-routes.ts`.

---

## 8. FASE 8 — MINI-GAME

**Milestone:** M8. Serial: F8A caption → Gate → F8B engagement.

- [x] **T8.1** `src/domain/minigames/types.ts` + `registry.ts` (host + 2 modul lazy).
- [x] **T8.2** `src/domain/minigames/caption-challenge.ts` + `src/data/minigames/caption-challenge.ts` — 3 ronde, scorer 0–100.
- [x] **T8.3** `src/screens/campaign-minigame/` — host + modul caption (tombol ≥44 px, keyboard 1–4).
- [x] **T8.4** `src/application/campaigns/complete-minigame.ts` — simpan skor sekali.
- [x] **T8.5** `src/domain/minigames/engagement-challenge.ts` + modul layar — 5 percobaan timing, target zone dari seed session.
- [x] **T8.6** `src/domain/strategy/performance.ts` — normalisasi skor kedua mini-game ke 0–100.

**Gate F8:** caption menyimpan skor & tidak bisa diulang; engagement memakai target seed sama setelah refresh; skor 80 dari kedua mini-game memberi dampak setara.
**Status F8: LULUS.** 377 test lulus (36 file). Verifikasi browser (127.0.0.1:5221):
- Caption: lobby → 3 ronde ("Ronde 1/3" … "Ronde 3/3"), 4 opsi per ronde, keyboard 1–4. Memilih opsi terbaik 3× menghasilkan skor 100; panel selesai menampilkan "Skor sudah tersimpan dan tidak bisa diulang"; save berisi `status=activity_completed`, `miniGameScore=100`.
- Engagement: target `data-target=0.6619` sebelum dan sesudah refresh (seed session sama), lebar zona 18%. Lima penekanan Stop menyimpan skor 35 dan status `activity_completed`.
- Host memuat modul secara lazy (chunk `caption`, `engagement`, dan domain scorer terpisah).
- 0 error console; tidak ada overflow horizontal di 360/390/768.
- Normalisasi: `performanceFromMiniGames([80, 80]) = 80` (dampak setara).

### 8.1 Temuan & perbatasan
1. **Kunci string `minigame.*` sudah ada dari v1** dengan nama berbeda (`instruction`, `round`, `score`, `complete`). Duplikat dihapus dan UI memakai kunci lama agar tidak ada dua sumber teks.
2. **Timer/rAF bocor** bila pemain keluar di tengah ronde. Caption membersihkan `setTimeout` pada abort; engagement membatalkan `requestAnimationFrame`.
3. **Percobaan yang sedang berjalan belum dipersist.** Skor final tersimpan sekali, tetapi refresh saat ronde berlangsung mengulang ronde. Gate F8 tidak mencakup ini; perlu field progres di session + migrasi schema bila FR-084 "refresh tidak memberi attempt baru" diterapkan ketat (catat untuk F13).

---

## 9. FASE 9 — RESOLUTION, PENALTY, RESULT

**Milestone:** M9.

- [x] **T9.1** `src/domain/risk/probability.ts` — clamp, bobot config.
- [x] **T9.2** `src/domain/risk/random.ts` — `cryptoRandom` + `seededRandom`.
- [x] **T9.3** `src/domain/campaigns/resolve.ts` — 11 langkah PRD, pure.
- [x] **T9.4** `src/domain/penalties/{profiles,apply}.ts` — 3 profil.
- [x] **T9.5** `src/application/campaigns/resolve-campaign.ts` — guard resolved, snapshot sekali, transaksi payment/bonus/fine, update akun + suspicion, **evaluasi tier**, commit.
- [x] **T9.6** `src/screens/campaign-result/` — outcome, skor, payment, bonus, delta, fine, perubahan tier, alasan, banner utang.
- [x] **T9.7** Result dapat dibuka ulang dari Task tanpa mutasi.

**Gate F9:** success & failure teruji; resolve ganda tidak menambah transaksi; campaign yang memicu tier naik mencatat violation.
**Status F9: LULUS.** 407 test lulus (41 file). Verifikasi browser (127.0.0.1:5221, roll dikunci lewat stub `crypto.getRandomValues`):
- Sukses (`Soft Launch`): banner "Kampanye Berhasil", skor 64, pembayaran Rp 120 + bonus Rp 40, saldo 500 → 660, transaksi `campaign_payment` + `campaign_bonus`.
- Gagal (`Push Peluncuran Viral`, suspicion 30): banner "Kampanye Gagal", denda Rp 225, reputasi −10, suspicion +42 (30 → 72), saldo 500 → 225 (termasuk denda tier Rp 50).
- Tier naik Waspada → Panas: dua violation tercatat dengan `sourceId` session (denda + shadowban), panel konsekuensi tampil di result.
- Reopen hasil dari Task: 2 transaksi kampanye tetap 2, `sessionsCompleted` tetap 1 (kenaikan saldo kecil berasal dari passive income, bukan resolusi).
- 0 error console; overflow aman di 360 px.

### 9.1 Temuan & perbaikan
1. **Result butuh pintu resolusi.** Kontrak auto dan mini-game selesai sama-sama menuju `campaign-result`; layar memanggil `resolveCampaign` sekali (idempoten) sebelum render. Reopen hanya membaca snapshot.
2. **Snapshot belum menyimpan tier.** Ditambah `tierBefore`/`tierAfter` opsional; save lama tetap valid karena validator tidak mewajibkan field baru.
3. **Label "Pembayaran diterima Rp 0" muncul saat gagal.** Baris pembayaran/bonus kini hanya dirender bila nilainya > 0.
4. **Peluang dan performa sempat punya dua rumus** (estimasi F7 vs resolusi F9). Keduanya kini memakai `domain/risk/probability.ts` + `domain/strategy/performance.ts`.
5. **Resolusi bisa dipanggil sebelum mini-game selesai** lewat deep link. Guard `miniGameId != null && miniGameScore == null` ditambahkan dan diuji.

---

## 10. FASE 10 — SHOP 4 KATEGORI

**Milestone:** M10.

- [x] **T10.1** `src/data/shop/items.ts` — katalog: outfit (4+), properti (3), kendaraan (3), tiket (5 negara).
- [x] **T10.2** `src/domain/shop/catalog.ts` — `getItemsByCategory`, `isOwned`, `canBuy`.
- [x] **T10.3** `src/domain/shop/purchase.ts` — `evaluatePurchase` pure.
- [x] **T10.4** `src/domain/shop/effects.ts` — akumulasi `incomeMultiplier` dari properti/kendaraan dengan cap.
- [x] **T10.5** `src/application/shop/buy-item.ts` — atomik, guard in-flight, `saveNow`.
- [x] **T10.6** `src/screens/shop/` — 4 tab kategori, kartu item (gambar, nama, harga, status).
- [x] **T10.7** `src/screens/shop-detail/` — detail + beli + pasang outfit.
- [x] **T10.8** Integrasi efek: `income.ts` mengalikan bonus aset.

**Gate F10:** beli outfit → tampil di Karakter → pasang → refresh tetap; beli tiket → negara terbuka di Travel; beli ganda ditolak; efek income terukur.
**Status F10: LULUS.** 427 test lulus (45 file). Verifikasi browser (127.0.0.1:5221):
- Shop: 4 tab (Pakaian/Properti/Kendaraan/Tiket), outfit 4 kartu dengan emblem SVG. Item tak mampu menampilkan "Saldo belum cukup · Harga Rp 2.500" dan tombol nonaktif.
- Beli Kasual Signal (Rp 300): saldo 500 → 202 (termasuk income pasif), transaksi `shop_purchase`, status "Dimiliki" → "Pasang" → "Terpasang" (nonaktif). Karakter menampilkan "Kasual Signal" dan tetap setelah reload; kartu Shop berbadge "Terpasang".
- Beli Kos Sederhana (Rp 800): `assets.propertyIds` terisi, income rate 0,50 → 0,54/detik (+8%).
- Beli Tiket Belanda: `tickets.ownedCountryIds` berisi `belanda`; Travel menampilkan status "Tiket dimiliki" + badge "Terbuka", negara lain tetap menawarkan "Beli tiket".
- Beli ganda ditolak (`locked`, tanpa transaksi baru) dan tombol beli hilang setelah dimiliki.
- 0 error console; tidak ada overflow di 360/390.

### 10.1 Temuan & perbaikan
1. **CSS tab internal tinggal di `violations.css`.** Dipindah ke `components/tabs/tabs.css` agar Task dan Shop memakai satu sumber; grid kini otomatis mengikuti jumlah tab.
2. **Travel menampilkan "Terbuka" dua kali** (meta + badge). Meta untuk tiket yang dimiliki menjadi "Tiket dimiliki".
3. **Pembelian harus flush income lebih dulu** agar `balanceAfter` dan ledger konsisten; transaksi `passive_income` ikut tercatat di pembelian pertama.
4. **Membeli outfit tidak otomatis memasang.** Pemain memilih "Pasang" secara eksplisit; state karakter tidak berubah tanpa aksi.

---

## 11. FASE 11 — SAHAM

**Milestone:** M11.

- [x] **T11.1** `src/data/stocks/companies.ts` — 4 emiten fiktif (ticker, harga awal, volatility, drift).
- [x] **T11.2** `src/domain/stocks/market.ts` — `tickPrices(prices, seed, dt, config)`, seeded gaussian, clamp, history cap.
- [x] **T11.3** `src/domain/stocks/trade.ts` — `buyStock`, `sellStock` pure.
- [x] **T11.4** `src/domain/stocks/portfolio.ts` — nilai pasar, unrealized PnL.
- [x] **T11.5** `src/application/stocks/tick-market.ts` — scheduler 15 detik, hanya saat terbuka; bootstrap set `lastTickAt = now`.
- [x] **T11.6** `src/application/stocks/trade-stock.ts` — atomik + `saveNow`.
- [x] **T11.7** `src/screens/stocks/` — portofolio ringkas, daftar emiten (harga + %).
- [x] **T11.8** `src/screens/stock-detail/` — grafik sederhana (SVG polyline), beli/jual, validasi.

**Gate F11:** seed sama → harga sama; beli → saldo turun + holding; jual melebihi kepemilikan ditolak; harga tidak bergerak setelah reload tanpa waktu aktif; tercatat di Keuangan.
**Status F11: LULUS.** 454 test lulus (49 file). Verifikasi browser (127.0.0.1:5221):
- Daftar 4 emiten (KOPI/PIXL/NGNT/SKYN) dengan harga awal Rp 120/340/75/880, badge perubahan 0,0%, portofolio Rp 0.
- Detail KOPI: grafik SVG tampil, input default 10 lembar → total Rp 1.200. Beli 10 ditolak "Saldo tidak cukup"; beli 2 memotong saldo 500 → 262 dan holding 2 lembar @ Rp 120.
- Jual 1 menambah saldo 262 → 384 dan menyisakan 1 lembar; jual 5 ditolak tanpa perubahan.
- Ledger berisi `stock_buy -240` dan `stock_sell +120`; layar Keuangan menampilkan "Beli saham −Rp 120" dan "Pendapatan pasif +Rp 1".
- Tunggu 16 detik: history KOPI 1 → 2, harga 120 → 121. Reload lalu tunggu 2 detik: history tetap 2, harga tetap 121 (tanpa pergerakan offline).
- 0 error console; tidak ada overflow di 360 px (daftar, detail, keuangan).

### 11.1 Temuan & perbaikan
1. **Layar Keuangan masih placeholder**, padahal gate meminta transaksi terlihat. Dibuat fondasi ledger (saldo + 50 transaksi terbaru); filter/pagination/tautan sumber tetap F13.
2. **RNG macet setelah history mencapai cap** karena indeks tick diambil dari panjang history. Ditambah `stocks.tickIndex` opsional yang terus naik; save lama tetap valid.
3. **Save lama bisa punya `prices` kosong.** Bootstrap memanggil `ensureMarket` sebelum `lastTickAt` direset, jadi harga awal terisi dan tidak ada pergerakan offline.
4. **Scheduler pasar** melewati tick saat tab tersembunyi; harga hanya bergerak saat game terbuka.

---

## 12. FASE 12 — TRAVEL + FOTO

**Milestone:** M12.

- [x] **T12.1** `src/data/travel/countries.ts` — 5 negara placeholder + landmark.
- [x] **T12.2** `src/art/landmarks/` — 5 SVG landmark original.
- [x] **T12.3** `src/domain/travel/unlock.ts` — `isUnlocked`, `canFly`.
- [x] **T12.4** `src/application/travel/fly-to.ts` — validasi tiket, set lokasi, tambah visited, transaksi bila biaya.
- [x] **T12.5** `src/screens/travel/` — daftar negara (terkunci/terbuka/dikunjungi), tombol terbang.
- [x] **T12.6** `src/domain/travel/photo.ts` — komposisi SVG (landmark + karakter + frame).
- [x] **T12.7** `src/screens/photo/` — preview + tombol unduh PNG (canvas sementara, satu-satunya Canvas).
- [x] **T12.8** Karakter: tampilkan lokasi aktif + koleksi negara.

**Gate F12:** negara terkunci menolak; tiket membuka; terbang mengubah lokasi; foto terunduh sebagai PNG; koleksi unik.
**Status F12: LULUS.** 469 test lulus (52 file). Verifikasi browser (127.0.0.1:5221):
- Travel: 5 negara, 5 thumbnail landmark SVG. Nusantara "Lokasi saat ini" + tombol Ambil Foto; 4 negara lain menampilkan "Butuh tiket" + Beli tiket.
- Beli tiket Belanda → Travel menampilkan "Kincir Angin · Rp 200" + tombol Terbang. Terbang memotong Rp 200, lokasi karakter menjadi Belanda, koleksi Nusantara+Belanda, transaksi `travel_cost` tercatat.
- Foto: preview komposisi (landmark + karakter + bingkai + caption). Unduh menghasilkan `menjadi-buzzer-belanda.png` 181.453 byte dengan signature PNG `89504e470d0a1a0a`.
- Terbang kembali ke Nusantara lalu Belanda: `visitedCountryIds` tetap unik (`['nusantara','belanda']`), koleksi 2/5.
- 0 error console; tidak ada overflow di 360/390 (travel dan foto).

### 12.1 Temuan & perbaikan
1. **Negara dipindah ke `data/travel/countries.ts`** agar landmark ikut definisi negara; karakter dan travel memakai satu sumber.
2. **Biaya terbang belum ada di config.** Ditambah `travel.countryCosts` (nusantara 0, belanda 200, jepang 260, korea 240, prancis 320); `flyTo` mencatat `travel_cost` hanya bila biaya > 0.
3. **Ekspor PNG butuh SVG mandiri.** Scene diberi `xmlns`/width/height, diserialisasi, digambar ke canvas sementara (satu-satunya Canvas), lalu diunduh via data URL.
4. **Negara terkunci sempat tanpa jalan keluar.** Baris terkunci sekarang menautkan langsung ke detail tiket di Shop.

---

## 13. FASE 13 — KEUANGAN LENGKAP + QA

**Milestone:** M12 final.

- [x] **T13.1** `src/screens/finance/` — 11 tipe transaksi, filter, pagination, empty state, label utang.
- [x] **T13.2** Referensi transaksi → navigate ke sumber (campaign result, shop item, emiten).
- [x] **T13.3** Corrupt save + quota penuh + versi lebih baru: recovery tanpa overwrite.
- [x] **T13.4** Responsif 360/390/768/1280; tanpa overflow.
- [x] **T13.5** A11y: focus visible, `aria-current`, `aria-live`, kontras ≥4.5:1, status tidak hanya warna.
- [x] **T13.6** Unit + integration + E2E lengkap.
- [x] **T13.7** Fixture deterministik `?debug=1` (force success/failure, seed).
- [x] **T13.8** Ukur bundle; catat metrik.
- [x] **T13.9** Balancing pass 1 siklus penuh.
- [x] **T13.10** Laporan akhir di `development/`.

**Gate F13:** seluruh acceptance criteria PRD v2.0 §13 lulus.
**Status F13: LULUS.** 487 test lulus (57 file) + 3 E2E Playwright. Verifikasi browser:
- Keuangan: 12 chip filter (Semua + 11 tipe), pagination 20 + "Muat lebih banyak", empty state per filter, label "Utang" saat saldo negatif, tautan transaksi (Beli saham → detail KOPI).
- Responsif: 16 layar × 360/390/768/1280 tanpa overflow; frame 480 px di desktop; mini-game aman di 360/390.
- A11y: focus-visible outline 3 px, `aria-current` 1 tab aktif, toast `role="alert"`, caption option 52–54 px, kontras teks ≥4,5:1 setelah token digelapkan.
- Recovery: save rusak diarsipkan; tombol "Pulihkan cadangan" mengembalikan saldo 4.321; save versi 999 tetap utuh (tidak ditimpa); kuota penuh tidak mengubah save lama.
- Debug: `?debug=1&roll=0&seed=42` → seed 42, outcome success; referensi debug tidak ada di bundel produksi.
- Build: entry 82,16 kB (gzip 25,15 kB), total dist ±412 KB.
- Laporan: `development/final-report.md` + `development/balancing-report.md`.

### 13.1 Temuan & perbaikan
1. **Mode recovery menimpa save.** `settleRisk`, scheduler, dan `onHide` tetap berjalan saat save rusak/versi baru, sehingga state awal tertulis. Kini semua penulisan otomatis dimatikan sampai pemain memilih; "Mulai baru" reload setelah reset.
2. **Probe storage memakan error kuota.** Probe tulis dijalankan setiap akses dan mengubah error `quota` menjadi `unavailable`. Probe kini di-cache per objek storage.
3. **Kontras di bawah 4,5:1.** Muted 4,35 dan gold 3,34 pada panel terang. Token digelapkan, gradient badge dibuat lebih gelap, dan teks gold memakai `gold-700`.
4. **Transaksi keuangan tidak bisa ditelusuri.** Ditambah filter/pagination + pemetaan sumber ke campaign result, Shop, Saham, Travel, Automation, Handphone, Pelanggaran.
5. **Debug fixture harus dev-only.** `readDebugOptions` dan `installDebugApi` dibungkus `import.meta.env.DEV`; dicek tidak ada `__menjadiBuzzer` di bundel produksi.
6. **Saham sulit dicoba di sesi awal.** Default quick trade 10 → 2 lembar agar terjangkau saldo awal.

---

## 14. TRACEABILITY

| FR | Task |
|---|---|
| FR-001..006 (player, save, karakter) | T4.1–T4.5, T4.12–T4.17 |
| FR-010..017 (income) | T2.1–T2.6 (selesai), T6.7 |
| FR-020..037 (akun, upgrade) | selesai (F2/F3) |
| FR-040..051 (posting) | T5.1–T5.11 |
| FR-060..065 (campaign board) | T7.1–T7.7 |
| FR-070..075 (strategy) | T7.6 |
| FR-080..085 (mini-game) | T8.1–T8.6 |
| FR-090..096 (resolution) | T9.1–T9.7 |
| FR-100..107 (reward/penalty) | T9.4–T9.7 |
| FR-110..117 (risk tier) | T6.1–T6.9 |
| FR-120..129 (shop) | T10.1–T10.8 |
| FR-130..138 (saham) | T11.1–T11.8 |
| FR-140..146 (travel) | T12.1–T12.8 |
| FR-150..159 (keuangan) | T13.1–T13.2 |
| FR-160..166 (persistence) | T4.1–T4.5, T13.3 |
| EC-01..EC-20 | tersebar di gate tiap fase |

---

## 15. RISIKO

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Refactor nav merusak F1–F3 | Regresi besar | F4 punya gate khusus; test lama wajib tetap lulus |
| Scope 5 menu terlalu besar | MVP tidak selesai | Eksekusi serial per gate; tidak lompat fase |
| Migrasi v1→v2 kehilangan data | Save rusak | Backup sebelum migrasi; test migrasi wajib |
| Posting terlalu menguntungkan | Campaign jadi tak relevan | Balancing: posting kecil, campaign besar; playtest |
| Risk tier terlalu menghukum | Pemain stuck | Denda dibatasi, recovery tersedia, suspension tidak permanen |
| Saham membuat save bengkak | localStorage penuh | History cap 60 titik |
| Penyitaan aset terasa tidak adil | Churn | Hanya critical, tercatat jelas, ada peringatan sebelum |
| Dua mini-game memperbesar F8 | F8 molor | Serial: caption lulus gate dulu |

---

## 16. DEFINITION OF DONE

- [ ] 5 tab berfungsi, 19 layar terhubung.
- [ ] Karakter + outfit tersimpan.
- [ ] Passive income jalan, dipengaruhi followers/performance/automation/status/tier.
- [ ] Posting manual deterministik + cooldown + suspicion.
- [ ] Risk tier 4 tingkat dengan denda idempoten.
- [ ] Campaign lengkap: accept → strategy → mini-game/auto → result.
- [ ] Shop 4 kategori, tiket membuka negara.
- [ ] Saham beli/jual, harga seeded, portofolio.
- [ ] Travel + foto PNG.
- [ ] Keuangan 11 tipe transaksi.
- [ ] Save v2 + migrasi + recovery.
- [ ] Desktop & mobile usable.
- [ ] UI original, tidak menyalin referensi.
- [ ] Semua MUST acceptance criteria lulus.

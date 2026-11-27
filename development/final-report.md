# Final Report — Menjadi Buzzer MVP

Tanggal: 27 November 2026  
Stack: Vite + TypeScript strict + DOM/SVG + CSS (tanpa framework UI)  
Save: `localStorage` (satu-satunya akses lewat `src/persistence/`)

## 1. Status fase

| Fase | Isi | Status |
|---|---|---|
| F0 | Foundation, token, audit UI | ✓ |
| F1 | State, persistence, router, shell | ✓ |
| F2 | Idle economy + Home/Character | ✓ |
| F3 | Automation upgrade | ✓ |
| F4 | Navigasi 5 tab + karakter/outfit | ✓ |
| F5 | Handphone + posting + risk tier | ✓ |
| F6 | Tab Pelanggaran + pemulihan | ✓ |
| F7 | Task + campaign foundation | ✓ |
| F8 | Mini-game caption + engagement | ✓ |
| F9 | Resolution, penalty, result | ✓ |
| F10 | Shop 4 kategori | ✓ |
| F11 | Saham | ✓ |
| F12 | Travel + foto landmark | ✓ |
| F13 | Keuangan lengkap + QA | ✓ |

## 2. Fitur yang terpasang

- **Karakter**: layered SVG, outfit bisa dibeli/dipasang, risk meter 4 tier,
  lokasi aktif, koleksi negara, shortcut Akun/Upgrade/Keuangan/Travel.
- **Ekonomi**: passive income berbasis elapsed time (tanpa offline income),
  automation 5 level, pengali status + risk tier + aset, ledger append-only.
- **Posting**: 3 app fiktif, composer caption/hashtag/jam, cooldown,
  deterministic reward, suspicion naik, shadowban berpengaruh.
- **Kampanye**: 4 kontrak, brief + syarat, strategi/intensitas/postur,
  caption & engagement challenge, satu roll, snapshot, result idempoten,
  penalti 3 profil, tier consequence (denda/shadowban/penyitaan).
- **Shop**: outfit/properti/kendaraan/tiket, efek income aset dengan cap,
  tiket membuka negara.
- **Saham**: 4 emiten, harga seeded per tick 15 detik, beli/jual + PnL,
  portofolio, grafik SVG.
- **Travel**: 5 negara + landmark SVG original, biaya terbang, koleksi unik,
  ekspor foto PNG 1080×1350.
- **Keuangan**: saldo/utang, filter 11 tipe transaksi, pagination 20,
  tautan ke campaign result / shop item / emiten / layar sumber.
- **PWA**: ditunda (D-10).

## 3. Verifikasi

- **Unit + integration**: `487 test / 57 file` lulus (termasuk full-cycle test).
- **E2E**: `npm run test:e2e` → 3 test Playwright lulus (karakter/tab, kampanye roll terkunci, tautan transaksi ke saham).
- **Build**: `npm run build` sukses. Entry `82,16 kB` (gzip `25,15 kB`),
  total `dist` ±412 KB, 56 chunk aset.
- **Responsif**: 16 layar × lebar 360/390/768/1280 tanpa overflow horizontal;
  frame 480 px di desktop, full-width di mobile.
- **A11y**: focus-visible outline 3 px, `aria-current` pada nav aktif,
  toast `role="alert"`/`status`, kontrol mini-game 52–54 px, status memakai
  teks (bukan warna saja), kontras token teks ≥4,5:1.
- **Persistence**: refresh mempertahankan sesi kampanye, roll, dan transaksi;
  resolve/purchase ganda ditolak; save rusak diarsipkan tanpa ditimpa;
  versi lebih baru tidak ditimpa; kuota penuh tidak merusak save lama;
  cadangan pra-migrasi bisa dipulihkan.
- **Debug fixture (dev-only)**: `?debug=1&roll=0&seed=42` mengunci roll dan
  seed; contoh: seed 42 → outcome `success`. Tidak ada referensi debug di
  bundel produksi.

## 4. Keputusan penting

- Saldo integer rupiah, boleh negatif (utang), label "Utang".
- Tidak ada offline income; pasar saham juga tidak bergerak offline.
- Satu roll per kampanye; snapshot disimpan; result tidak pernah roll ulang.
- Semua formula ekonomi/peluang di `src/domain/`; UI hanya menampilkan.
- Aset visual: seluruh ikon, karakter, landmark, dan komposisi foto dibuat
  original sebagai SVG. Tidak ada aset/latar/karakter dari `/ui-reference`
  atau paket `game-assets/` yang dipakai.

## 5. Batasan yang diketahui

1. **Percobaan mini-game yang sedang berjalan belum dipersist.** Skor final
   tersimpan sekali dan tidak bisa diulang, tetapi refresh di tengah ronde
   mengulang ronde. Perbaikan ketat FR-084 memerlukan field progres + migrasi
   schema.
2. **Tanpa server authoritative.** Random roll berjalan di client; MVP tidak
   mengklaim aman dari manipulasi.
3. **`game-assets/` belum dipakai.** Integrasi paket aset pihak ketiga
   membutuhkan keputusan format dan persetujuan terpisah.
4. **PWA, audio, dan sinkronisasi cloud** belum ada.

## 6. Cara menjalankan

```bash
npm install
npm run dev        # buka http://127.0.0.1:5173/
npm run test       # 487 unit/integration test
npm run test:e2e   # 3 E2E Playwright
npm run build      # build produksi ke dist/
npm run preview
```

Debug (dev): `http://127.0.0.1:5173/?debug=1&roll=0&seed=42`

E2E memakai dev server sendiri di `127.0.0.1:4173` (lihat `playwright.config.ts`).

## 7. Dokumen terkait

- `development/plan-task-mvp.md` — rencana & status per fase.
- `development/balancing-report.md` — angka ekonomi & payback.
- `development/ui-reference-audit.md` — audit 54 screenshot referensi.
- `project-requirements/PRD-Menjadi-Buzzer-v2.0.md` — acceptance criteria.

# SCREEN SPECIFICATIONS — MENJADI BUZZER v2.0

**Versi:** 2.0 (5 menu, 19 layar)
**Status:** Draft
**Platform:** Browser Game · Potret-first, desktop kolom terpusat

## 1. Tujuan

Merinci tujuan, informasi, komponen, aksi, state, dan navigasi setiap layar MVP v2.0. Tidak mengubah aturan gameplay di PRD/Tech Spec.

## 2. Aturan Umum

- Pelajari seluruh `/ui-reference` sebelum membuat UI.
- Terapkan design token dari `design-system.md`.
- Data dari store/selector; UI tidak menghitung formula.
- Vanilla TS + DOM + CSS + SVG. Tanpa framework.
- Setiap mutasi punya feedback dan mencegah double submit.
- Setiap layar mempertahankan state saat navigasi.
- Sediakan default, disabled, empty, loading, error state.
- Potret-first, kolom maks 480 px, tanpa overflow horizontal.
- Aset original dari `/game-assets`; placeholder ditandai.

## 3. Global App Shell

- Top bar: judul layar + subjudul + pil saldo (label "Utang" bila negatif).
- Bottom nav 5 tab: Karakter, Task, Handphone, Shop, Saham.
- Risk meter ringkas di top bar Karakter & Handphone.
- Layer feedback: `#overlay-root` (modal), `#toast-root` (toast).

---

# 4. TAB 1 — KARAKTER

## 4.1 Screen `character`

**Tujuan:** pusat identitas, ringkasan bisnis, dan akses ke sub-layar.

### Informasi
- Karakter besar dengan outfit terpasang.
- Saldo + income rate.
- Risk meter (label tier + segmen).
- Lokasi aktif (negara).
- Automation level.

### Komponen
- Scene karakter (SVG layered).
- Balance display besar.
- Income rate pill.
- Risk meter.
- Location chip.
- 4 shortcut: Akun, Upgrade, Keuangan, Travel.
- Kartu "Lanjutkan kampanye" bila ada session aktif.

### Aksi
- Buka Akun / Upgrade / Keuangan / Travel.
- Lanjutkan campaign.

### States
- New save (outfit default).
- Normal.
- Utang (saldo negatif).
- Restricted (status akun).
- Shadowban aktif (badge).
- Loading boot.

### Acceptance
- Karakter tampil dengan outfit dari ID, bukan markup di save.
- Risk meter terbaca tanpa mengandalkan warna.
- Income tetap berjalan saat pindah tab.

## 4.2 Screen `account-detail`

Sama seperti v1.0 §5, ditambah:
- Menampilkan kontribusi risk tier terhadap income.
- Shortcut ke tab Pelanggaran bila suspicion tinggi.

## 4.3 Screen `automation`

Sama seperti v1.0 §6. Tidak berubah.

## 4.4 Screen `finance`

Sama seperti v1.0 §12, ditambah 4 tipe transaksi baru (posting, shop, stock buy/sell, travel) — total 11 tipe.

## 4.5 Screen `travel`

**Tujuan:** memilih negara tujuan.

### Informasi per negara
- Nama negara, nama landmark, ilustrasi landmark.
- Status: Terkunci (belum punya tiket) / Terbuka / Sudah dikunjungi.
- Biaya perjalanan (bila ada).

### Komponen
- Daftar kartu negara.
- Badge status.
- Tombol Terbang (disabled bila terkunci, dengan alasan).
- Ringkasan koleksi ("3 dari 5 negara dikunjungi").

### Aksi
- Terbang ke negara terbuka.
- Buka layar Foto (bila sudah berada di negara).

### States
- Terkunci + alasan.
- Terbuka.
- Dikunjungi.
- Sedang di negara ini (badge "Lokasi saat ini").

### Acceptance
- Negara tanpa tiket tidak bisa dituju.
- Setelah terbang, lokasi di Karakter berubah.
- Koleksi tidak menduplikasi negara yang sama.

## 4.6 Screen `photo`

**Tujuan:** membuat dan mengunduh foto landmark.

### Komponen
- Preview komposisi SVG: landmark + karakter (outfit terpasang) + frame.
- Tombol Unduh PNG.
- Tombol kembali.

### States
- Preview siap.
- Proses ekspor.
- Gagal ekspor (pesan jelas).

### Acceptance
- Hasil unduhan adalah file PNG, bukan markup.
- Tanpa unggah ke server.

---

# 5. TAB 2 — TASK

## 5.1 Screen `task`

**Tujuan:** pusat kontrak kampanye dan pelanggaran.

### Struktur
- Header ringkas: jumlah kontrak tersedia, risk tier saat ini.
- Dua tab internal: **Kontrak** | **Pelanggaran**.

### Tab Kontrak
- Kartu: nama, klien, difficulty, base payment, bonus, risk indicator, interaction type, status.
- Kontrak ineligible: alasan.
- Empty state bila tidak ada kontrak.

### Aksi
- Buka Campaign Brief.
- Pindah ke tab Pelanggaran.

### States
- Available / ineligible / accepted / completed / failed.
- Empty list.
- Loading (bila kelak async).

## 5.2 Screen `violations`

**Tujuan:** transparansi konsekuensi.

### Informasi
- Tabel aturan: 4 tier, rentang suspicion, efek (income, posting, denda, penyitaan).
- Riwayat pelanggaran: tanggal, jenis, tier, nominal, penyebab.

### States
- Belum ada pelanggaran (empty, dengan penjelasan aturan).
- Ada riwayat.
- Tier saat ini ditandai.

### Acceptance
- Read-only; tidak mengubah state.
- Pemain dapat memahami penyebab tiap penalti.

## 5.3 Screen `campaign-brief`

Sama seperti v1.0 §8, ditambah:
- Dampak terhadap risk meter (delta suspicion yang mungkin).
- Peringatan bila tier saat ini akan naik.

## 5.4 Screen `campaign-strategy`

Sama seperti v1.0 §9, ditambah:
- Estimasi dampak suspicion.
- Peringatan kondisi akun + tier.

## 5.5 Screen `campaign-minigame`

Sama seperti v1.0 §10. Dua modul: Caption Challenge, Engagement Challenge.

## 5.6 Screen `campaign-result`

Sama seperti v1.0 §11, ditambah:
- Delta suspicion + apakah memicu tier baru.
- Bila tier naik: ringkasan konsekuensi yang diterapkan (denda, shadowban, penyitaan).

---

# 6. TAB 3 — HANDPHONE

## 6.1 Screen `handphone`

**Tujuan:** pusat aktivitas posting.

### Komponen
- Bingkai ponsel (phone frame).
- Header ponsel: risk meter ringkas + indikator cooldown.
- Daftar app: Chirper, Pulse, Loop (ikon + nama + tagline).
- Feed ringkas per app (placeholder konten fiktif).
- Tombol Posting besar.

### Aksi
- Buka app (memilih app aktif).
- Buka Composer.
- Kembali ke Karakter (via tab).

### States
- Normal.
- Cooldown aktif (tombol disabled + sisa waktu).
- Shadowban aktif (banner jelas: posting tidak menghasilkan followers).
- Empty feed.

### Acceptance
- Minimal 2 app dapat dibuka.
- Risk meter terlihat di layar ini.
- Cooldown menghalangi posting beruntun.

## 6.2 Screen `composer`

**Tujuan:** menyusun posting.

### Komponen
- Pilihan caption (3–4 opsi, teks fiktif).
- Pilihan hashtag (3–4 opsi).
- Pilihan jam posting: Quiet / Normal / Peak.
- Preview estimasi kualitatif (bukan angka presisi): "Jangkauan: sedang", "Risiko: tinggi".
- Tombol Posting (disabled bila cooldown).

### States
- Default.
- Pilihan berubah (preview ikut berubah).
- Cooldown.
- Processing.

### Acceptance
- Default tidak diam-diam memilih opsi paling berisiko.
- Pilihan tersimpan saat pindah layar (bila draft disimpan).

## 6.3 Screen `post-result`

**Tujuan:** umpan balik hasil posting.

### Komponen
- Engagement, followers delta, uang, suspicion delta.
- Peringatan bila tier naik.
- Tombol kembali ke feed.

### States
- Hasil bagus.
- Hasil buruk.
- Shadowban (followers 0).
- Tier naik.

### Acceptance
- Hasil deterministik untuk input yang sama.
- Tidak ada tombol yang menerapkan ulang reward.

---

# 7. TAB 4 — SHOP

## 7.1 Screen `shop`

### Komponen
- 4 tab kategori: Pakaian, Properti, Kendaraan, Tiket.
- Kartu item: gambar, nama, harga, badge status (Dimiliki / Terpasang / Terkunci).
- Saldo di top bar.

### States
- Item tersedia.
- Tidak mampu (harga merah).
- Dimiliki.
- Terpasang.
- Empty per kategori.

## 7.2 Screen `shop-detail`

### Komponen
- Gambar besar item.
- Nama, deskripsi, harga.
- Efek terukur (bila ada).
- Tombol Beli / Pasang / Dimiliki.

### States
- Belum dimiliki.
- Tidak mampu.
- Dimiliki (belum dipasang).
- Terpasang.
- Processing.

### Acceptance
- Pembelian atomik, satu kali.
- Outfit dapat langsung dipasang.
- Tiket membuka negara.

---

# 8. TAB 5 — SAHAM

## 8.1 Screen `stocks`

### Komponen
- Ringkasan portofolio: total nilai pasar, total untung/rugi.
- Daftar emiten: ticker, nama fiktif, harga, perubahan persen (warna + tanda +/−).
- Indikator "harga bergerak saat game terbuka".

### States
- Belum punya saham.
- Punya saham (untung).
- Punya saham (rugi).
- Empty.

## 8.2 Screen `stock-detail`

### Komponen
- Nama emiten, ticker, sektor.
- Harga saat ini + perubahan.
- Grafik garis sederhana (SVG polyline).
- Kepemilikan: lembar, avg cost, nilai pasar, PnL.
- Input jumlah lembar + tombol Beli / Jual.

### States
- Belum memiliki.
- Memiliki.
- Jumlah melebihi saldo (beli) atau kepemilikan (jual) → tombol disabled + alasan.
- Processing.

### Acceptance
- Harga bergerak hanya saat game terbuka.
- Jual melebihi kepemilikan ditolak.
- Semua transaksi tercatat.

---

# 9. Global UI States

Setiap layar mempertimbangkan: default, loading/processing, disabled, empty, error, success/failure feedback, responsive.

# 10. Aturan Visual

- Semua detail visual mengikuti `design-system.md`.
- Seluruh `/ui-reference` wajib dipelajari.
- Jangan menyalin aset, logo, karakter, nama, atau identitas.
- Placeholder ditandai jelas.

# 11. Dokumen Terkait

- `ui-flow.md`
- `design-system.md`
- `../project-requirements/PRD-Menjadi-Buzzer-v2.0.md`
- `../technical-spec/Tech-Spec-Menjadi-Buzzer-v2.0.md`
- `../ui-reference/`

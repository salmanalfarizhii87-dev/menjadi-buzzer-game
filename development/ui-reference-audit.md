# UI REFERENCE AUDIT — MENJADI BUZZER

**Tanggal:** 26 November 2026
**Sumber:** `ui-reference/` — 54 screenshot PNG, resolusi ~262–278 × 469–476 px (rasio potret ≈ 9:16 mobile)
**Tujuan:** Ekstrak pola layout, hierarki, komponen, dan bahasa visual sebagai acuan **orisinal**, bukan untuk disalin.
**Status:** Selesai — 54/54 screenshot diperiksa.

---

## 1. KATEGORI SCREENSHOT

| Grup | Nomor file | Isi |
|---|---|---|
| Onboarding | 1–8 | Slide tutorial berurutan dengan indikator titik, tombol Next/Lanjut, tombol bahasa EN/ID |
| Gameplay utama | 9, 15, 20, 24, 53, 54 | Scene dunia + HUD atas + bottom nav 5 tab + modal overlay |
| Manajemen staf/karyawan | 10, 11 | Daftar card karyawan, state locked, tombol Rekrut/Upgrade |
| Menu & upgrade | 12, 13, 14, 16, 17 | Daftar item grid, seleksi slot, kartu upgrade dengan harga |
| Katalog/kota | 18 | Grid card 2 kolom dengan state terkunci |
| Prestige/endgame | 19 | Panel progress besar, dua tombol keputusan (reset/simpan) |
| Toko/IAP | 21 | Daftar paket dengan badge harga, ribbon promo |
| Quest harian | 22 | Daftar task dengan progress bar + tombol Klaim |
| Event | 23 | Daftar event dengan badge multiplier |
| Prestasi/achievement | 48 | Grid card 2 kolom, progress 0/25, state locked |
| Leaderboard | 49 | Podium 3 besar + daftar peringkat |
| Settings | 50, 51 | Grup panel dengan header ribbon, baris list, tombol reset merah |
| Kustomisasi | 38, 40, 42–47 | Preview besar di atas, tab kategori, grid warna, toggle |
| Mini-game | 32, 33, 34, 35, 36, 37 | Layar intro, HUD timer+skor+combo, area interaksi, layar hasil bintang |
| Dialog keputusan | 39 | Modal pilihan berisiko dengan 3 opsi berwarna berbeda + label konsekuensi |
| Detail pesanan/penawaran | 26 | Daftar kartu dengan badge tier (Kecil/Sedang/Besar) dan reward |
| Pasar malam (locked) | 27 | Layar state "tutup" dengan ilustrasi besar dan penjelasan |
| Koleksi | 28 | Grid card item dengan progress fragmen |
| Battle pass | 29 | Dua kolom (Gratis/Premium) dengan garis timeline |
| Peralatan/upgrade permanen | 30 | List card dengan badge multiplier |
| Resep | 31 | List card dengan tombol harga gem |
| Saldo | 53 | Modal "Uangmu" dengan angka besar + breakdown per detik/menit/jam |

---

## 2. POLA LAYOUT (OBSERVASI)

### 2.1 Struktur global
- **Satu kolom penuh, potret.** Tidak ada layout dua kolom horizontal di level halaman. Bahkan grid item selalu 2–3 kolom kecil di dalam satu kolom utama.
- **Top bar tetap (sticky)** tinggi ~48–56 px: tombol back (kotak biru membulat, panah putih) → judul + subjudul → pil mata uang kanan.
- **Bottom nav tetap** tinggi ~56 px, 5 tab, ikon di atas label, latar cokelat gelap, tab aktif diberi highlight terang + ikon berwarna.
- **Konten scroll** di antara top bar dan bottom nav.
- Modal/sheet menutupi konten dengan backdrop gelap transparan, panel muncul dari tengah atau bawah.

### 2.2 Hierarki informasi
1. Angka uang selalu paling besar dan paling kontras di layar mana pun.
2. Rate income (`/detik`) adalah teks sekunder kecil tepat di bawah saldo.
3. Judul layar + subjudul konteks di top bar.
4. Aksi utama = satu tombol besar penuh lebar di bagian bawah.
5. Detail/statistik dikelompokkan dalam card berlabel.

### 2.3 Pola berulang yang layak diadopsi
| Pola | Deskripsi | Dipakai di Menjadi Buzzer |
|---|---|---|
| Card berbingkai | Panel krem dengan border cokelat 2 px, radius ~14 px, shadow bawah 3 px solid | Semua card akun/campaign/upgrade |
| Tombol glossy | Gradient vertikal + highlight atas + shadow bawah solid | Semua tombol aksi |
| Ribbon header | Banner merah/oranye melengkung di atas panel modal | Modal konfirmasi, header grup |
| Pil mata uang | Pill cokelat gelap dengan ikon koin + angka | Saldo di top bar |
| Progress bar | Track cokelat gelap, isi gradient, teks persentase di tengah | Level upgrade, progress quest, suspicion meter |
| Badge status | Pil kecil berwarna (hijau/ungu/merah) dengan teks pendek | Status akun, risk indicator |
| Baris list berikon | Ikon kotak kiri + judul + deskripsi + chevron kanan | Finance rows, settings, menu |
| Grid card 2 kolom | Preview gambar atas, judul, status di bawah | Campaign board (bila >4 kontrak) |
| State terkunci | Ilustrasi desaturasi + ikon gembok + teks alasan | Kontrak ineligible, upgrade locked |

---

## 3. BAHASA VISUAL (OBSERVASI, BUKAN SALINAN)

### 3.1 Karakter
- Gaya chibi: kepala besar (~40% tinggi badan), mata titik besar, tubuh kecil, outline tebal gelap.
- Diperlakukan sebagai ilustrasi vektor tajam (SVG), bukan raster.
- Karakter ditampilkan dalam **lingkaran berbingkai** saat onboarding, dan berdiri bebas di scene gameplay.

### 3.2 Treatment panel
- Panel krem hangat (`#FDF3DC`–`#FFF9EA`) dengan border cokelat tua (`#7A4A1E`) 2–3 px.
- Shadow bukan blur, tapi **offset solid** ke bawah 3–4 px berwarna cokelat transparan — memberi kesan "kartu tebal".
- Sudut membulat besar (12–18 px).
- Header panel kadang memakai ribbon melengkung dengan teks putih ber-outline.

### 3.3 Latar
- Gradient vertikal hangat (amber → oranye muda) dengan **pola motif halus** berulang (bunga/daun) opacity rendah.
- Scene gameplay memakai ilustrasi kota/lingkungan penuh sebagai latar.

### 3.4 Tipografi
- Display: rounded bold, tebal, kadang dengan outline putih + shadow gelap.
- Body: rounded sans, semi-bold, ukuran kecil (11–13 px pada 266 px lebar ≈ 13–15 px pada 390 px).
- Angka uang memakai digit lebar dan tebal.

### 3.5 Warna (dibaca dari screenshot)
| Peran | Rentang warna teramati |
|---|---|
| Latar canvas | amber `#F0BE5E` → `#E5A03C` |
| Panel | krem `#FDF3DC` |
| Border/outline | cokelat `#7A4A1E` |
| Aksi primer | hijau `#7BC043` → `#5CA62E` |
| Aksi sekunder | biru `#4A9DE0` |
| Aksi konfirmasi/emas | oranye-kuning `#F2B233` |
| Bahaya/reset | merah `#D9534F` |
| Teks utama | cokelat gelap `#4A2F14` |

---

## 4. KEPUTUSAN ADAPTASI UNTUK MENJADI BUZZER

Referensi dipakai untuk **pola**, bukan identitas. Identitas Menjadi Buzzer dibuat berbeda:

| Aspek | Referensi | Menjadi Buzzer (keputusan) |
|---|---|---|
| Latar | Amber pekat + motif bunga | **Pasir hangat** `#FBF3E4` + pola titik/halftone halus (motif "feed/signal", bukan bunga) |
| Aksi primer | Hijau limau | **Teal** `#2F9E8F` — pembeda identitas, tetap kontras tinggi |
| Aksen sekunder | Biru | **Biru sinyal** `#4A8FD4` |
| Bahaya | Merah | **Koral** `#D6403A` |
| Emas/highlight | Kuning | `#E8A33D` (dipakai untuk reward, bukan aksi) |
| Bentuk card | Border cokelat + shadow solid | Sama polanya, border `#6B4E2E`, shadow solid 3 px |
| Karakter | Chibi koki | Chibi buzzer original (SVG layer: badan, kepala, rambut, jaket, ponsel) |
| Top bar | Back + judul + pil mata uang | Sama polanya; pil saldo + indikator suspicion |
| Bottom nav | 5 tab | 5 tab: Home, Akun, Upgrade, Kampanye, Keuangan |

### 4.1 Yang TIDAK diadopsi
- Motif bunga/daun khas referensi.
- Palet amber-hijau limau identik.
- Ikon, ilustrasi, nama, maskot, atau tipografi berlisensi milik referensi.
- Sistem IAP/gem, battle pass, leaderboard, event, prestige — di luar scope MVP.
- Layout scene dunia penuh (MVP tidak butuh world map).

---

## 5. IMPLIKASI TEKNIS

1. **Layout:** satu kolom, `max-width: 480px`, terpusat di desktop dengan latar lebih gelap di luar kolom (sesuai D-06).
2. **Aset:** semua ilustrasi/ikon sebagai SVG (Tech Spec §16). Placeholder karakter dibuat sebagai SVG builder, bukan file raster.
3. **Font:** stack sistem rounded untuk F0; font self-hosted ditambahkan saat aset produksi siap (jangan pakai CDN — aplikasi harus tetap offline-capable).
4. **Shadow:** gunakan `box-shadow: 0 3px 0 <border-color>` untuk kesan kartu tebal; hindari blur besar.
5. **Feedback:** toast ringkas untuk transaksi, modal ribbon untuk keputusan berisiko.
6. **State terkunci:** selalu sertakan teks alasan, jangan hanya gembok.

---

## 6. CHECKLIST AUDIT

- [x] Seluruh 54 screenshot diperiksa satu per satu.
- [x] Pola layout dan hierarki dicatat.
- [x] Palet dan treatment panel dicatat.
- [x] Tipografi dan skala dicatat.
- [x] Komponen berulang diinventaris.
- [x] Batas adaptasi (apa yang tidak diadopsi) ditetapkan.
- [x] Implikasi teknis untuk implementasi dicatat.

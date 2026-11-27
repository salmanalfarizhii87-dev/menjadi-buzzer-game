# UI Stitch Implementation Report

Sumber: `game_ui_stitch/` (18 layar + design system).  
Pendekatan: template HTML Stitch dipakai sebagai markup statis, Tailwind dikompilasi
lokal dengan token Stitch, lalu nilai dinamis ditambal lewat DOM (`textContent`,
`replaceChildren`). Tidak ada HTML dinamis dari data pemain.

## 1. Layar yang dipasang

| Stitch | Route layar | Status data |
|---|---|---|
| `title_screen` | `title` (boot) | saldo, handle, followers, lanjut/reset |
| `business_home` | `character` | HUD, income, suspicion, misi, jumlah kontrak |
| `campaign_board` | `task` | 4 kontrak asli, status, misi posting, aturan tier |
| `campaign_brief` | `campaign-brief` | data kontrak, syarat, konsekuensi, accept |
| `strategy_risk_selection` | `campaign-strategy` | pendekatan relevan, postur, estimasi |
| `caption_challenge` | `campaign-minigame` | 3 ronde, timer 20 dtk, skor |
| `engagement_challenge` | `campaign-minigame` | 3 ketukan, target dari seed |
| `campaign_result` | `campaign-result` | snapshot sukses |
| `campaign_result_failure` | `campaign-result` | snapshot gagal |
| `account_detail` | `account-detail` | statistik akun + tier |
| `asset_shop` | `shop` | 4 kategori, beli langsung |
| `finance_history` | `finance` | ringkasan, filter arus, riwayat |
| `character_customizer` | `customizer` | avatar, outfit/aksesori aktif, tab |
| `kustom_karakter_outfits` | `outfits` | 4 outfit, pasang outfit |
| `kustom_karakter_accessories` | `accessories` | pratinjau karakter |
| `studio_location` | `studio` | layout Stitch (konten properti masih sampel) |
| `rewards_collectibles` | `rewards` | layout Stitch (isi koleksi masih sampel) |
| `settings_options` | `settings` | toggle audio/gameplay, reset save |

Font lokal: Fredoka, Spline Sans, DM Mono (`public/fonts/stitch/`).

## 2. Aset karakter & scene (raster)

Semua karakter/scene di layar Stitch memakai JPEG raster, bukan SVG:
`public/assets/stitch/avatar-{base,casual,formal,luxury}.jpg` dan
`scene-{base,casual,formal,luxury}.jpg` (820×820 dan 984×1380, total ±824 KB).

- Avatar dipakai di Home, Title, Account, Settings, Customizer, Outfits,
  Accessories. Scene dipakai di Home dan Title; memilih outfit mengganti
  avatar + scene sesuai outfit.
- URL `lh3.googleusercontent.com` dari file Stitch sudah mati (mengembalikan
  halaman login Google), jadi tidak bisa dipakai.
- Generate lewat Gemini (`google/gemini-3.1-flash-lite-image`) gagal karena
  kuota free-tier akun = 0. Fallback raster dibuat lewat endpoint gambar
  eksternal, lalu di-crop untuk membuang watermark. Tidak ada hotlink.
- Item Shop tetap memakai plat warna + inisial (bukan karakter/scene).


## 2b. Mekanisme game hidup (adaptasi TapakRun)

Mekanisme yang diadaptasi dari apa yang terlihat di `tapakrun.appcademy.app`
(tanpa menyalin aset/karakter/nama):
- scene berlapis dengan parallax saat karakter bergerak,
- karakter idle bob, walking animation, jump, dan reaksi bubble saat diketuk,
- partikel/nyala lampu bergerak, sapuan cahaya, dan portrait idle di layar lain,
- input pointer + keyboard/arah lewat `requestAnimationFrame`, dihentikan saat
  layar dibongkar (`AbortSignal`).

Implementasi: `src/components/game-stage/game-stage.ts` + `game-stage.css`.
Home memakai kontrol ◀ ▲ ▶; Title memakai stage tanpa kontrol. Background
`public/assets/stitch/room-bg.jpg` (kamar kosong) dan avatar raster dipasang
sebagai layer terpisah, jadi karakter bisa bergerak independen dari scene.

## 3. Verifikasi

- `487` unit/integration test lulus.
- `3` E2E Playwright lulus.
- Build sukses; CSS Stitch `40,6 kB` (gzip `8,8 kB`), entry JS `100,9 kB` (gzip `30,7 kB`).
- Tanpa overflow horizontal pada 360/390/768/1280 di Home, Task, Shop, Account, Finance.
- Alur teruji: title → home → board → brief → strategy → result; caption 3 ronde;
  beli item; finance; settings/customizer/studio/rewards terbuka tanpa error console.

## 4. Batasan saat ini

1. Layar yang tidak ada di Stitch tetap memakai UI lama: handphone, composer,
   post-result, shop-detail, stocks/stock-detail, travel/photo, automation,
   violations.
2. Navigasi mengikuti Stitch 5 tab (Home, Akun, Kampanye, Upgrade, Keuangan).
   Akibatnya Saham dan Travel belum punya pintu masuk dari tab; handphone
   dijangkau lewat misi harian di Campaign Board.
3. Isi `studio_location` dan `rewards_collectibles` masih teks/achievement
   contoh dari Stitch; baru header/saldo yang terhubung ke save.
4. Ilustrasi Google asli tidak tersedia; diganti scene/karakter SVG internal.

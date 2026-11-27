# DESIGN SYSTEM — MENJADI BUZZER v2.0

**Versi:** 2.0 (token final dari audit `/ui-reference`)
**Status:** Aktif — token sudah ditetapkan, bukan lagi PENDING
**Tujuan:** Aturan visual dan komponen konsisten untuk 19 layar MVP.

## 1. Tujuan dan Batas

Dokumen ini menerjemahkan pola visual `/ui-reference` menjadi sistem desain **orisinal** Menjadi Buzzer. Referensi dipakai untuk mempelajari pola, bukan menyalin identitas.

## 2. Hierarki Sumber

1. GDD — pengalaman & aturan gameplay.
2. PRD v2.0 — kebutuhan UI/UX, layar, state, acceptance.
3. Tech Spec v2.0 — batas implementasi.
4. `ui-flow.md` — navigasi.
5. `screen-specifications.md` — komposisi layar.
6. Dokumen ini — aturan visual lintas layar.
7. `/ui-reference` — bahan observasi, diterjemahkan orisinal.

## 3. Arah Visual

### 3.1 Prinsip
- Ramah, playful, terasa seperti game manajemen kasual.
- Informasi ekonomi & risiko selalu mudah dibaca.
- Panel/card mengelompokkan informasi terkait.
- Identitas orisinal; bukan salinan referensi.

### 3.2 Hasil Audit Referensi

| Aspek | Temuan referensi | Adaptasi Menjadi Buzzer |
|---|---|---|
| Layout | Satu kolom potret, top bar sticky, bottom nav 5 tab | Sama polanya; kolom maks 480 px |
| Panel | Krem + border cokelat 2 px + shadow offset solid | Border `#6B4E2E`, shadow `0 3px 0` |
| Tombol | Gradient + highlight atas + shadow bawah | 5 varian: primary/accent/gold/danger/ghost |
| Warna | Amber + hijau limau | **Pasir hangat + teal** (identitas berbeda) |
| Karakter | Chibi koki | Chibi buzzer original, layer SVG |
| Feedback | Ribbon modal, toast | Sama polanya |
| Ikon | Rounded, tebal | Stroke 2 px, rounded cap, 24×24 |

## 4. Design Tokens

Sumber tunggal: `src/styles/tokens.css`. Tidak ada nilai warna/radius/spacing hard-coded di komponen.

### 4.1 Warna

| Token | Nilai | Fungsi |
|---|---|---|
| `--color-brand-500` | `#2F9E8F` | Aksi utama |
| `--color-brand-600` | `#26857A` | Aksi utama (tekan) |
| `--color-brand-100` | `#D9F2EE` | Latar aksen |
| `--color-accent-500` | `#4A8FD4` | Aksi sekunder |
| `--color-gold-500` | `#E8A33D` | Reward / highlight |
| `--color-danger-500` | `#D6403A` | Bahaya / kegagalan |
| `--color-warning-500` | `#E08A2E` | Peringatan |
| `--color-success-500` | `#4F9D52` | Keberhasilan |
| `--color-canvas` | `#FBF3E4` | Latar aplikasi |
| `--color-panel` | `#FFFAF0` | Panel |
| `--color-border` | `#6B4E2E` | Border utama |
| `--color-text` | `#3F2C15` | Teks utama |

### 4.2 Tipografi

| Role | Token | Penggunaan |
|---|---|---|
| Display | `--font-display` | Judul layar, angka besar |
| Body | `--font-body` | Teks isi |
| Numeric | `--font-numeric` | Saldo, income, harga |

Skala: 11 / 12 / 13 / 15 / 17 / 20 / 24 / 30 / 36 px. Angka ekonomi memakai `font-variant-numeric: tabular-nums`.

### 4.3 Spacing & Radius

Spacing kelipatan 4 px (4–48). Radius: 6 / 10 / 14 / 18 / 24 / pill.

### 4.4 Shadow

Shadow berupa **offset solid**, bukan blur:
- `--shadow-card: 0 3px 0 var(--color-border)`
- `--shadow-raised: 0 4px 0 var(--color-border-strong)`

## 5. Komponen

| Komponen | Penggunaan | States |
|---|---|---|
| App shell | Kerangka | default |
| Primary navigation (5 tab) | Navigasi utama | active, inactive |
| Top bar | Judul + saldo | default, debt |
| Button | Aksi | default, hover, pressed, disabled, focus |
| Panel / card | Kelompok informasi | default, raised, sunken |
| Stat display | Saldo, followers, performance | default, positive, negative |
| Income indicator | Rate + feedback | default, increment |
| **Risk meter** | Suspicion tier | safe, watch, hot, critical |
| Status badge | Status akun | status-specific |
| Progress bar | Level, progress | default, warning, danger |
| Upgrade card | Pembelian upgrade | available, insufficient, max |
| Campaign card | Ringkasan kontrak | eligible, ineligible, accepted, done |
| **Shop item card** | Item katalog | available, unaffordable, owned, equipped |
| **Stock row** | Emiten | up, down, flat |
| **Phone frame** | Wadah handphone | default |
| **Character renderer** | Karakter + outfit | layered |
| Modal / dialog | Konfirmasi | open, closed |
| Toast | Feedback | success, warning, error, info |
| Empty state | Data kosong | empty |
| Loading state | Proses | loading |
| Error state | Kegagalan | error |

Jangan membuat komponen baru yang menduplikasi fungsi yang sudah ada.

## 6. Warna Semantik & Risiko

- Success hanya untuk hasil/aksi berhasil.
- Warning untuk risiko/perhatian.
- Danger untuk failure, denda, penyitaan.
- **Risk meter wajib memakai warna + label teks + jumlah segmen** — tidak boleh warna saja.
- Mapping tier:

| Tier | Warna | Label |
|---|---|---|
| safe | success | Aman |
| watch | warning | Waspada |
| hot | danger (oranye) | Panas |
| critical | danger | Kritis |

## 7. Ikon & Ilustrasi

- Ikon UI terpisah dari ilustrasi dekoratif.
- Stroke konsisten 2 px, rounded cap, `viewBox="0 0 24 24"`.
- SVG wajib `viewBox`, scalable, dapat diberi class.
- Karakter: layer SVG (`base`, `hair`, `outfit`, `accessory`, `shoes`), disusun per `zIndex`.
- Landmark: SVG original per negara, gaya konsisten.
- Jangan memakai emoji sebagai pengganti aset final.
- Jangan mengekstrak aset dari game referensi.

## 8. Motion

- Motion singkat menjelaskan perubahan state.
- Feedback wajib untuk: income increment, posting result, tier change, purchase, campaign outcome, penalty.
- `prefers-reduced-motion` mematikan semua animasi non-esensial.
- Animasi saham tidak boleh berkedip terus-menerus.

## 9. Accessibility

- Kontras teks utama ≥ 4.5:1.
- Focus visible di semua kontrol.
- Status tidak hanya warna.
- Touch target ≥ 44 px.
- Label kontrol jelas; error menjelaskan apa & langkah berikutnya.
- `aria-current` pada tab aktif; `aria-live` pada toast.

## 10. Layout Responsif

- Potret-first; kolom `max-width: 480px` terpusat.
- Desktop menambah padding/background gelap di luar kolom.
- Uji 360 / 390 / 768 / 1280 px.
- Tanpa horizontal overflow di 360 px.
- Daftar panjang (Keuangan, Saham, Shop) harus nyaman di-scroll.

## 11. File Implementasi

- Token: `src/styles/tokens.css`
- Reset/global: `src/styles/reset.css`, `global.css`
- Layout: `src/styles/layout.css`
- Motion: `src/styles/motion.css`
- Komponen: `src/components/`
- Ikon UI: `src/components/icons/`
- Ilustrasi: `src/art/`
- Aset statis: `/game-assets/`

## 12. Checklist Sebelum UI Dianggap Siap

- [ ] Seluruh `/ui-reference` diperiksa.
- [ ] Token dipakai; tidak ada warna hard-coded.
- [ ] Risk meter terbaca tanpa warna saja.
- [ ] Semua komponen punya state relevan.
- [ ] Konsistensi 19 layar diperiksa.
- [ ] Desktop & mobile diuji.
- [ ] Tidak ada aset/identitas yang disalin.

## 13. Dokumen Terkait

- `ui-flow.md`
- `screen-specifications.md`
- `../project-requirements/PRD-Menjadi-Buzzer-v2.0.md`
- `../technical-spec/Tech-Spec-Menjadi-Buzzer-v2.0.md`
- `../ui-reference/`

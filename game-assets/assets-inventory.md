# ASSETS INVENTORY — MENJADI BUZZER v2.0

**Versi:** 2.0 (5 menu, 19 layar)
**Status:** Draft inventory kebutuhan aset
**Root folder:** `/game-assets`

## 1. Tujuan

Daftar pusat aset visual: kebutuhan, kategori, nama file, format, status, penggunaan, dependensi.

Inventory ini **tidak mengklaim** aset sudah tersedia. Status `PLANNED` berarti belum diproduksi.

## 2. Struktur Folder

```text
/game-assets/
├── assets-inventory.md
├── character/
│   ├── player/          # base body, hair
│   ├── outfits/         # layer pakaian
│   ├── accessories/     # aksesori
│   └── shoes/
├── environment/
│   ├── backgrounds/     # latar scene
│   ├── landmarks/       # landmark per negara
│   └── props/
├── items/
│   ├── ui-related/
│   ├── property/        # rumah, kantor
│   ├── vehicle/         # kendaraan
│   └── tickets/         # tiket negara
└── icons/
    ├── navigation/      # 5 tab
    ├── stats/
    ├── actions/
    ├── status/
    ├── risk/            # ikon tier
    ├── social/          # ikon app medsos fiktif
    └── currencies/
```

## 3. Aturan Penamaan

- Huruf kecil, kebab-case.
- Nama berdasarkan fungsi/objek.
- Suffix varian eksplisit.
- Hindari `image1`, `final2`, `new-final`.

Contoh: `character/outfits/outfit-teal-jacket.svg`, `environment/landmarks/landmark-jakarta.svg`.

## 4. Format Teknis

- SVG untuk ikon, karakter, landmark, outfit.
- WebP/PNG untuk raster (latar besar) bila perlu.
- SVG wajib `viewBox`, scalable, dapat diberi class.
- Save hanya menyimpan ID aset, bukan markup.
- Font di `public/fonts/`, bukan folder ilustrasi.
- Aset harus dioptimalkan.

## 5. Status Aset

`PLANNED` · `IN_PROGRESS` · `REVIEW` · `APPROVED` · `REJECTED` · `DEFERRED`

## 6. Inventory MVP

### 6.1 Karakter

| Asset ID | Kebutuhan | Folder | Format | Penggunaan | Status |
|---|---|---|---|---|---|
| CHR-001 | Body base karakter | `character/player/` | SVG | Karakter di semua layar | PLANNED |
| CHR-002 | Rambut default | `character/player/` | SVG | Layer karakter | PLANNED |
| CHR-003 | Sepatu default | `character/shoes/` | SVG | Layer karakter | PLANNED |
| OUT-001 | Outfit dasar (gratis) | `character/outfits/` | SVG | Outfit awal | PLANNED |
| OUT-002 | Outfit kasual | `character/outfits/` | SVG | Shop kategori Pakaian | PLANNED |
| OUT-003 | Outfit formal | `character/outfits/` | SVG | Shop kategori Pakaian | PLANNED |
| OUT-004 | Outfit mewah | `character/outfits/` | SVG | Shop kategori Pakaian | PLANNED |
| ACC-001 | Aksesori jam | `character/accessories/` | SVG | Layer aksesori | PLANNED |
| ACC-002 | Aksesori kacamata | `character/accessories/` | SVG | Layer aksesori | PLANNED |

### 6.2 Environment

| Asset ID | Kebutuhan | Folder | Format | Penggunaan | Status |
|---|---|---|---|---|---|
| ENV-001 | Latar scene Karakter | `environment/backgrounds/` | SVG/WebP | Layar Karakter | PLANNED |
| LMK-001 | Landmark negara 1 | `environment/landmarks/` | SVG | Layar Travel & Foto | PLANNED |
| LMK-002 | Landmark negara 2 | `environment/landmarks/` | SVG | Layar Travel & Foto | PLANNED |
| LMK-003 | Landmark negara 3 | `environment/landmarks/` | SVG | Layar Travel & Foto | PLANNED |
| LMK-004 | Landmark negara 4 | `environment/landmarks/` | SVG | Layar Travel & Foto | PLANNED |
| LMK-005 | Landmark negara 5 | `environment/landmarks/` | SVG | Layar Travel & Foto | PLANNED |

### 6.3 Item Shop

| Asset ID | Kebutuhan | Folder | Format | Penggunaan | Status |
|---|---|---|---|---|---|
| PRP-001 | Properti rumah kecil | `items/property/` | SVG | Shop & Karakter | PLANNED |
| PRP-002 | Properti kantor | `items/property/` | SVG | Shop & Karakter | PLANNED |
| PRP-003 | Properti gedung | `items/property/` | SVG | Shop & Karakter | PLANNED |
| VHC-001 | Kendaraan kota | `items/vehicle/` | SVG | Shop & Karakter | PLANNED |
| VHC-002 | Kendaraan sport | `items/vehicle/` | SVG | Shop & Karakter | PLANNED |
| VHC-003 | Kendaraan mewah | `items/vehicle/` | SVG | Shop & Karakter | PLANNED |
| TKT-001..005 | Tiket 5 negara | `items/tickets/` | SVG | Shop kategori Tiket | PLANNED |

### 6.4 Ikon

| Asset ID | Kebutuhan | Folder | Format | Penggunaan | Status |
|---|---|---|---|---|---|
| ICO-001 | Ikon 5 tab navigasi | `icons/navigation/` | SVG | Bottom nav | PLANNED |
| ICO-002 | Ikon statistik | `icons/stats/` | SVG | Akun, Karakter | PLANNED |
| ICO-003 | Ikon aksi | `icons/actions/` | SVG | Tombol | PLANNED |
| ICO-004 | Ikon status | `icons/status/` | SVG | Badge status | PLANNED |
| ICO-005 | Ikon tier risiko | `icons/risk/` | SVG | Risk meter | PLANNED |
| ICO-006 | Ikon app medsos fiktif | `icons/social/` | SVG | Layar Handphone | PLANNED |
| ICO-007 | Ikon mata uang | `icons/currencies/` | SVG | Saldo, transaksi | PLANNED |

## 7. Batas MVP

### 7.1 Karakter
- Wajib: 1 body base, 1 rambut, 1 sepatu, 4 outfit, 2 aksesori.
- Kustomisasi wajah detail: DEFERRED.
- Wardrobe lengkap: DEFERRED.

### 7.2 Environment
- Wajib: 1 latar Karakter, 5 landmark.
- Lokasi tambahan (kafe, mall, kantor interior): DEFERRED.

### 7.3 Item
- Properti 3, kendaraan 3, tiket 5.
- Collectible dan reward item: DEFERRED.

### 7.4 Ikon
- Pisahkan navigasi, statistik, aksi, status, risk, social, mata uang.
- Ikon harus terbaca pada 22–24 px.

## 8. Asset Manifest

Saat aset diproduksi, catat: `assetId`, `filePath`, `category`, `format`, `width`, `height`, `viewBox`, `transparent`, `usage`, `status`, `source`, `license`, `notes`.

## 9. Quality Checklist

- [ ] Aset sesuai fungsi layar.
- [ ] Gaya konsisten dengan Design System.
- [ ] Orisinal atau berlisensi jelas.
- [ ] Tidak menyalin dari `/ui-reference`.
- [ ] Nama file mengikuti kebijakan.
- [ ] SVG valid, punya `viewBox`, tanpa script berbahaya.
- [ ] Raster dioptimalkan.
- [ ] Status inventory diperbarui.
- [ ] Aset tak terpakai tidak dibundel.

## 10. Instruksi AI Agent

1. Baca inventory sebelum membuat/memindahkan/mengganti aset.
2. Baca `../ui-ux-design/design-system.md` dan `screen-specifications.md`.
3. Pelajari `/ui-reference` sebelum menentukan visual final.
4. Jangan membuat aset yang tidak dibutuhkan layar MVP.
5. Jangan menimpa aset `APPROVED` tanpa izin.
6. Jangan mengklaim `APPROVED` sebelum diperiksa.
7. Perbarui inventory setiap kali aset berubah.
8. Jangan mengunduh/menyalin aset game referensi.
9. Jangan memperluas folder item menjadi sistem gameplay di luar MVP.

## 11. Dokumen Terkait

- `../ui-ux-design/design-system.md`
- `../ui-ux-design/screen-specifications.md`
- `../ui-ux-design/ui-flow.md`
- `../project-requirements/PRD-Menjadi-Buzzer-v2.0.md`
- `../technical-spec/Tech-Spec-Menjadi-Buzzer-v2.0.md`
- `/ui-reference/`

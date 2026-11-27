# Balancing Report — Menjadi Buzzer (MVP)

Tanggal: 27 November 2026. Semua angka masih **PLACEHOLDER** dan berasal dari
`src/data/config/balance.ts` + seed data.

## 1. Baseline awal

| Metrik | Nilai |
|---|---|
| Saldo awal | Rp 500 |
| Followers | 1.000 |
| Performance | 50/100 |
| Suspicion | 10 (Aman) |
| Income dasar | Rp 0,50/detik (Rp 30/menit, Rp 1.800/jam) |
| Automation | Level 0, biaya L1 Rp 100, +25% income/level |
| Tiket awal | Nusantara |

## 2. Waktu balik modal (payback)

| Pembelian | Biaya | Efek | Payback (tanpa faktor lain) |
|---|---|---|---|
| Automation L1 | Rp 100 | +Rp 0,125/detik | 800 detik (~13 menit) |
| Automation L2 | Rp 240 | +Rp 0,125/detik | 1.920 detik (~32 menit) |
| Kasual Signal | Rp 300 | kosmetik (+2 kredibilitas) | — |
| Motor Bebek | Rp 600 | +4% income (+Rp 0,02/detik) | 30.000 detik (~8,3 jam) |
| Kos Sederhana | Rp 800 | +8% income (+Rp 0,04/detik) | 20.000 detik (~5,6 jam) |
| Tiket Belanda | Rp 1.200 + Rp 200 terbang | membuka negara | — |

Catatan: properti/kendaraan memang investasi jangka panjang; total bonus mentah
semua aset = 84%, masih di bawah `assetBonusCap` 150%.

## 3. Sumber pemasukan satu siklus

| Sumber | Nilai |
|---|---|
| Passive income | Rp 0,50/detik |
| Posting Chirper aman | ±Rp 30–60 per posting (cooldown 60 detik) |
| Kampanye Soft Launch | Rp 120 + bonus Rp 40 |
| Kampanye Push Viral | Rp 900 + bonus Rp 500 (risiko tinggi) |
| Kampanye Caption Drive | Rp 380 + bonus Rp 180 |
| Kampanye Hybrid Sprint | Rp 620 + bonus Rp 320 |
| Saham | selisih harga; default quick trade 2 lembar |

## 4. Risiko & penalti

| Tier | Suspicion | Income | Denda otomatis |
|---|---|---|---|
| Aman | 0–29 | 100% | — |
| Waspada | 30–59 | 90% | — |
| Panas | 60–84 | 65% | Rp 50 + shadowban |
| Kritis | 85–100 | 30% | Rp 150 + shadowban + penyitaan |

Profil penalti kampanye: lenient (5%, floor Rp 25), standard (12%, floor Rp 50),
severe (25%, floor Rp 100). Perbaikan suspicion: Rp 150 untuk −25 poin.

## 5. Penyesuaian pada pass ini

1. **Default quick trade saham 10 → 2 lembar.** Dengan saldo awal Rp 500,
   10 lembar KOPI (Rp 1.200) tidak terjangkau; 2 lembar (Rp 240) bisa dicoba
   pada sesi pertama.
2. **Kontras teks** diperbaiki (bukan angka ekonomi): muted dan gold digelapkan
   agar rasio ≥4,5:1 pada panel terang.

## 6. Observasi untuk balancing berikutnya

- Payback aset >5 jam; bila pemain harus merasakan efek lebih cepat, naikkan
  bonus per item atau turunkan harga (ubah hanya `balance.ts`/`items.ts`).
- Bonus kampanye berisiko tinggi (Rp 1.400 total) jauh di atas safe contract;
  ini disengaja, tetapi perlu dipantau bersama penalti severe.
- Ticket + biaya terbang (Rp 1.400–Rp 2.320) adalah tujuan sesi awal yang wajar
  setelah 2–3 kampanye.
- Semua batas suspicion, peluang, dan penalti tetap satu sumber di config.

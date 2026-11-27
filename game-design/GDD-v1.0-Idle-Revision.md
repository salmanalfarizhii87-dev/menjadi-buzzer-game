# GAME DESIGN DOCUMENT (GDD)
# MENJADI BUZZER — v1.0 (Idle Revision)

**Status:** Draft Revisi Konsep Dasar  
**Genre:** Semi Idle Management Simulation / Life Simulation / Strategy  
**Platform:** Browser Game (Web)  
**Mode:** Single Player  
**Gameplay Model:** Semi Idle + Active Risk-Reward Activities  
**Visual Reference:** `/ui-reference`  
**Dokumen induk ide awal:** `brainstorm_menjadibuzzer.md` — immutable, tidak boleh diubah

---

# 1. GAME OVERVIEW

## 1.1 Deskripsi Game

**Menjadi Buzzer** adalah game simulasi kehidupan dan manajemen bisnis yang mengajak pemain membangun karier sebagai buzzer di dunia media sosial fiktif. Pemain memulai sebagai buzzer individu dengan satu akun dan sumber daya terbatas. Seiring waktu, pemain mengembangkan akun, membangun jaringan akun, lalu memperluas operasional menjadi agensi buzzer.

Aktivitas akun menghasilkan pendapatan secara otomatis selama game terbuka. Besarnya pendapatan dipengaruhi oleh jumlah followers dan performa akun. Pemain dapat meningkatkan hasil tersebut melalui upgrade dan sistem otomasi, termasuk peningkatan operasional dan perekrutan staf pada fase perkembangan yang sesuai.

Selain pendapatan pasif, pemain dapat mengambil kontrak kampanye. Kampanye menawarkan pembayaran dan bonus yang lebih besar, tetapi membawa risiko kegagalan. Pemain menentukan strategi dan tingkat agresivitas, lalu dapat menjalankan aktivitas interaktif atau mini-game untuk memengaruhi hasil. Keputusan pemain memengaruhi risiko, sementara hasil akhir tetap memiliki unsur probabilitas.

Kegagalan kampanye dapat menyebabkan denda, penurunan reputasi, serta risiko pembatasan akun. Pemain harus menyeimbangkan pertumbuhan bisnis, keuntungan, reputasi, dan keamanan jaringan akunnya.

Penghasilan juga menjadi sarana untuk mengembangkan kehidupan virtual: membeli pakaian, aksesori, kendaraan, properti, melakukan investasi, serta menjelajahi berbagai lokasi. Fitur-fitur lifestyle tersebut merupakan bagian dari visi jangka panjang dan tidak seluruhnya masuk MVP.

## 1.2 Konsep Utama

1. **Semi Idle Business:** Akun menghasilkan pendapatan otomatis ketika game berjalan.
2. **Active Campaigns:** Kontrak kampanye memberi peluang pendapatan tambahan dengan risiko lebih tinggi.
3. **Risk & Reward:** Strategi, intensitas, kondisi akun, dan peluang sistem menentukan hasil.
4. **Progressive Business Growth:** Individu berkembang menjadi jaringan akun dan agensi.
5. **Life & Wealth Simulation:** Uang digunakan untuk mengembangkan bisnis dan kehidupan virtual.

## 1.3 Game Design Pillars

- **Earn:** Pemain membangun aliran pendapatan dari akun dan kontrak kampanye.
- **Optimize:** Pemain meningkatkan akun, kualitas aktivitas, otomasi, dan kapasitas operasional.
- **Risk:** Keuntungan besar datang bersama risiko yang harus dipertimbangkan.
- **Expand:** Pemain berkembang dari individu menjadi jaringan akun dan agensi.
- **Lifestyle:** Kemajuan ekonomi membuka akses ke aset, koleksi, dan pengalaman virtual.

---

# 2. GAMEPLAY DESIGN

## 2.1 Core Gameplay Loop

1. Pemain membuka game dan melihat kondisi bisnis serta saldo.
2. Akun yang dimiliki menghasilkan pendapatan otomatis selama game berjalan.
3. Pemain mengumpulkan pendapatan dan memutuskan penggunaannya.
4. Pemain meningkatkan akun, performa, dan otomasi untuk memperbesar pendapatan.
5. Pemain memeriksa kontrak kampanye yang tersedia.
6. Pemain memilih kontrak berdasarkan pembayaran, kesulitan, dan risiko.
7. Pemain menentukan strategi dan intensitas aktivitas.
8. Pemain menjalankan aktivitas interaktif/mini-game jika ingin mengejar hasil yang lebih tinggi atau jika kontrak mensyaratkannya.
9. Sistem menghitung performa, peluang keberhasilan, reward, dan konsekuensi.
10. Pemain menggunakan hasilnya untuk memperkuat bisnis dan membuka fase perkembangan berikutnya.
11. Siklus berulang dengan skala operasional, pilihan, dan risiko yang meningkat.

## 2.2 Dua Jalur Gameplay

**Passive Management Loop:** Account Activity → Followers & Performance → Passive Income → Upgrade & Automation → Higher Passive Income.

**Active Campaign Loop:** Campaign Offer → Risk Assessment → Strategy → Optional/Required Interactive Activity → Probability Resolution → Reward or Penalty.

Kedua jalur saling mendukung. Pendapatan pasif menyediakan fondasi ekonomi yang lebih stabil, sedangkan kampanye menjadi aktivitas berisiko dengan potensi keuntungan tambahan.

## 2.3 Karakter Pemain

Pemain memiliki satu karakter utama sebagai representasi avatar di dunia game. Karakter dapat dikustomisasi melalui pakaian, sepatu, rambut, dan aksesori. Karakter juga dapat ditampilkan pada ruang kerja, tempat tinggal, kendaraan, atau lokasi perjalanan sesuai fitur yang dibuka.

Sistem karakter dan kosmetik bukan sumber pendapatan inti dan tidak boleh menghambat implementasi core idle loop.

---

# 3. GAME SYSTEMS OVERVIEW

## 3.1 Account & Social Media System

Pemain memulai dengan satu akun media sosial fiktif. Setiap akun memiliki followers, performa/engagement, level, reputasi, suspicion, status, serta kontribusi terhadap pendapatan pasif.

Pendapatan pasif menggunakan kombinasi **jumlah followers dan performa akun**. Followers menjadi basis potensi audiens, sedangkan performa menentukan seberapa efektif akun menghasilkan aktivitas dan pendapatan.

## 3.2 Automation & Operations System

Pemain dapat meningkatkan pendapatan melalui otomasi. Pada fase awal, otomasi dapat berupa upgrade operasional akun. Pada fase lanjutan, pemain dapat membuka staf atau anggota tim yang membantu menjalankan aktivitas rutin dan mengelola kapasitas jaringan akun.

Otomasi berfungsi meningkatkan efisiensi atau output, bukan menghapus seluruh keputusan pemain. Pemain tetap menentukan investasi, ekspansi, dan kontrak yang diambil.

## 3.3 Campaign Contract System

Kontrak kampanye merupakan sumber pendapatan tambahan. Setiap kontrak memiliki klien fiktif, tujuan, target, durasi atau tahapan, pembayaran dasar, bonus potensial, kesulitan, dan risiko.

Pemain dapat memilih kontrak dengan mempertimbangkan potensi reward dan konsekuensinya. Kampanye tertentu dapat diselesaikan melalui simulasi otomatis, sementara kampanye penting atau berisiko tinggi dapat menawarkan aktivitas interaktif/mini-game.

## 3.4 Mini-game & Interactive Activity System

Mini-game tetap menjadi bagian penting, tetapi tidak harus dimainkan terus-menerus. Aktivitas interaktif dipakai pada momen yang memiliki dampak bermakna, terutama kampanye tertentu atau kesempatan mengejar bonus.

Hasil mini-game memengaruhi kualitas eksekusi dan peluang keberhasilan. Aktivitas interaktif dapat memberi potensi hasil lebih besar, tetapi tidak menjamin keberhasilan.

## 3.5 Risk, Suspicion & Penalty System

Risiko berasal dari tingkat dasar kontrak, keputusan strategi/intensitas pemain, kondisi akun, dan unsur peluang sistem. Kegagalan dapat memicu kombinasi:

- Denda finansial.
- Penurunan reputasi.
- Peningkatan suspicion.
- Pembatasan akun sementara atau penurunan jangkauan.
- Investigasi atau konsekuensi karier untuk kasus berat.

Kegagalan kampanye tidak otomatis berarti akun terkena hukuman berat. Konsekuensi harus sesuai penyebab dan tingkat pelanggaran yang disimulasikan.

## 3.6 Economy & Lifestyle

Sumber pendapatan inti:

- Pendapatan pasif akun (followers + performa).
- Pembayaran kontrak kampanye.
- Bonus performa kampanye.

Pengeluaran utama:

- Upgrade akun dan otomasi.
- Pembukaan akun tambahan dan ekspansi operasional.
- Perekrutan staf pada fase lanjutan.
- Pembelian kosmetik dan aset lifestyle.
- Pembayaran denda.
- Investasi dan aktivitas ekonomi lanjutan.

---

# 4. CAREER & BUSINESS PROGRESSION

## 4.1 Fase 1 — Individual Buzzer

- Satu karakter dan satu akun.
- Pemain memahami pendapatan pasif dasar.
- Upgrade akun dan peningkatan performa.
- Mengambil kontrak kampanye sederhana.
- Menangani risiko pada skala individual.

## 4.2 Fase 2 — Account Network

- Membuka akun tambahan secara bertahap.
- Mengelola performa dan kondisi beberapa akun.
- Meningkatkan otomasi operasional.
- Mengelola risiko yang dapat berbeda pada setiap akun.
- Mengakses kontrak dengan skala lebih besar.

## 4.3 Fase 3 — Buzzer Agency

- Membentuk agensi.
- Merekrut staf atau anggota tim.
- Meningkatkan kapasitas operasional.
- Mengelola jaringan akun dan kampanye lebih besar.
- Menghadapi risiko bisnis dan reputasi pada skala agensi.

Persyaratan unlock, biaya, jumlah akun maksimum, serta struktur staf belum ditetapkan dan harus diuji melalui balancing.

---

# 5. TIME & OFFLINE POLICY

Untuk MVP, pendapatan pasif hanya terakumulasi ketika game sedang terbuka dan berjalan. **Offline Earnings bukan kebutuhan MVP.**

Desain sistem waktu dan kalkulasi pendapatan sebaiknya dibuat terpusat agar Offline Earnings dapat ditambahkan kemudian tanpa merombak keseluruhan sistem ekonomi. Tidak perlu mengimplementasikan simulasi offline sebelum core loop terbukti menyenangkan.

---

# 6. GAME INTERFACE & NAVIGATION — HIGH LEVEL

Menu dan layar utama yang direncanakan:

- **Home / Business Hub:** Ringkasan karakter, saldo, pendapatan berjalan, dan kondisi bisnis.
- **Accounts:** Daftar akun, followers, performa, level, suspicion, dan upgrade.
- **Campaigns / Contracts:** Daftar kontrak, brief, strategi, aktivitas interaktif, dan hasil.
- **Automation / Staff:** Upgrade otomasi dan pengelolaan staf ketika terbuka.
- **Finance:** Saldo, pendapatan, pengeluaran, denda, dan riwayat transaksi.
- **Lifestyle / Shop:** Kosmetik dan aset kehidupan virtual.
- **Smartphone:** Dapat dipertahankan sebagai representasi perangkat/aplikasi fiktif, tetapi tidak wajib menjadi satu-satunya pusat navigasi.

Struktur layar final mengikuti UX flow dan referensi visual.

---

# 7. UI / VISUAL / ART STYLE REFERENCE

**Lokasi referensi utama: `/ui-reference`**

Seluruh screenshot di dalam folder tersebut merupakan acuan utama untuk UI, visual, art style, layout, komponen, dan pola interaksi. Agent wajib mempelajari referensi sebelum mengimplementasikan UI.

Referensi tersebut digunakan untuk memahami bahasa visual dan pola antarmuka, bukan untuk menyalin aset atau identitas game lain secara langsung. Menjadi Buzzer tetap harus memiliki identitas visual orisinal.

---

# 8. TECHNICAL DESIGN CONSIDERATIONS

- Target awal adalah browser game single-player.
- Save/load lokal diperlukan untuk menyimpan progres.
- Passive income selama game terbuka harus memakai perhitungan waktu yang konsisten dan tidak bergantung pada jumlah frame.
- Kalkulasi pendapatan, upgrade, probabilitas risiko, dan reward harus berada pada modul/fungsi terpusat yang mudah di-balance.
- Offline Earnings, backend, akun online, dan sinkronisasi cloud bukan prioritas MVP.
- Detail framework dan arsitektur final ditentukan pada dokumen teknis, bukan dipaksakan oleh GDD ini.

---

# 9. MVP SCOPE — HIGH LEVEL

MVP harus membuktikan bahwa dua jalur gameplay saling melengkapi.

**Termasuk:**
1. Satu karakter.
2. Satu akun media sosial.
3. Pendapatan pasif saat game terbuka.
4. Followers dan performa sebagai faktor pendapatan.
5. Upgrade akun dasar.
6. Setidaknya satu upgrade otomasi.
7. Kontrak kampanye.
8. Pemilihan strategi dan tingkat intensitas.
9. Aktivitas interaktif/mini-game pada kampanye terpilih.
10. Kalkulasi keberhasilan berbasis keputusan dan probabilitas.
11. Reward, denda, reputasi, dan suspicion dasar.
12. Save/load lokal.

**Di luar MVP:** multi-account penuh, perekrutan staf kompleks, manajemen agensi, Offline Earnings, saham, kendaraan, properti, perjalanan, multiplayer, dan fitur sosial online.

---

# 10. DESIGN PRINCIPLES

1. Pendapatan pasif harus memberi rasa perkembangan meskipun pemain tidak terus menekan tombol.
2. Upgrade dan otomasi harus menghasilkan perubahan yang terasa dan dapat dipahami.
3. Kampanye harus menjadi pilihan aktif, bukan kewajiban berulang yang melelahkan.
4. Potensi reward yang tinggi harus memiliki trade-off yang jelas.
5. Keputusan pemain memengaruhi risiko, tetapi hasil tidak boleh sepenuhnya deterministik.
6. Kegagalan harus berdampak, tetapi masih memberi ruang pemulihan.
7. Ekspansi dari individu ke jaringan dan agensi harus terasa bertahap.
8. Fitur lifestyle mendukung fantasi perkembangan, bukan mengalihkan fokus dari core loop.

---

# 11. DEVELOPMENT ROADMAP — CONCEPTUAL

- **Phase 1:** Passive income, account upgrade, satu campaign, risk-reward dasar.
- **Phase 2:** Variasi campaign, mini-game, reputation dan penalty.
- **Phase 3:** Multi-account dan automation lanjutan.
- **Phase 4:** Agensi dan staf.
- **Phase 5:** Shop, aset, investasi, dan lifestyle.
- **Phase 6:** Eksplorasi dunia dan fitur sosial jika dibutuhkan.

---

# 12. STATUS KEPUTUSAN DESAIN

| Area | Keputusan |
|---|---|
| Gameplay | Semi Idle |
| Aktivitas pasif | Akun menghasilkan uang ketika game terbuka |
| Faktor passive income | Followers + performa akun |
| Peningkatan passive income | Upgrade otomasi; staf pada fase lanjutan |
| Sumber pendapatan tambahan | Kontrak kampanye |
| Mini-game | Penting, tetapi tidak dimainkan terus-menerus |
| Risk model | Keputusan pemain + probabilitas sistem |
| Kegagalan | Denda + reputasi turun + risiko pembatasan akun |
| Progression | Individu → jaringan akun → agensi |
| Offline Earnings | Ditunda; arsitektur disiapkan untuk kemungkinan penambahan |
| Brainstorm | Dokumen ide awal immutable, tidak diubah |
| UI reference | `/ui-reference` |

---

**END OF DOCUMENT — MENJADI BUZZER GDD v1.0 IDLE REVISION**

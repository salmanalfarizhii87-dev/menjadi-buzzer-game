# GAME DESIGN DOCUMENT (GDD)
# MENJADI BUZZER — v1.2 (Core Idle Gameplay Mechanics)

**Status:** Draft Mekanisme Gameplay  
**Berdasarkan:** GDD v1.0 dan v1.1 Idle Revision  
**Fokus:** Passive income, automation, campaign, mini-game, risk-reward, progression  
**Platform:** Browser Game  
**Offline Earnings:** Tidak termasuk MVP

---

# 1. TUJUAN DOKUMEN

GDD v1.2 mengubah konsep Semi Idle menjadi aturan gameplay yang dapat diuji. Dokumen ini menjelaskan hubungan antara statistik akun, pendapatan pasif, upgrade otomasi, kontrak kampanye, aktivitas interaktif, dan resolusi risiko.

Seluruh angka, formula, probabilitas, dan nilai contoh pada dokumen ini bersifat **placeholder desain**, bukan balancing final.

# 2. CORE GAMEPLAY LOOP

## 2.1 Passive Loop

1. Game berjalan dan menghitung elapsed time.
2. Setiap akun aktif menghasilkan pendapatan berdasarkan followers dan performance.
3. Pendapatan terakumulasi pada saldo atau pending income sesuai pilihan UX.
4. Pemain menginvestasikan uang pada account upgrade dan automation.
5. Upgrade meningkatkan output pendapatan atau efisiensi akun.
6. Pemain mengulangi siklus untuk memperbesar pendapatan dan membuka sistem berikutnya.

## 2.2 Active Campaign Loop

1. Pemain membuka daftar kontrak.
2. Pemain membaca brief, pembayaran, bonus, difficulty, dan risk.
3. Pemain memilih akun yang memenuhi syarat.
4. Pemain memilih strategi dan intensitas.
5. Pemain memilih/menjalankan aktivitas interaktif jika kontrak mendukung atau mensyaratkannya.
6. Sistem menghitung performance score dan success probability.
7. Sistem melakukan satu resolusi hasil.
8. Sistem menerapkan pembayaran, bonus, followers/performance impact, suspicion, reputasi, dan penalty.
9. Pemain kembali ke pengelolaan bisnis.

## 2.3 Relationship Between Loops

Passive income memberi pendapatan dasar dan mendukung upgrade. Kampanye memberi peluang akselerasi pendapatan dan perkembangan, tetapi dapat menimbulkan kerugian. Pemain tidak boleh dipaksa mengerjakan kampanye terus-menerus agar bisnis tetap bertahan.

---

# 3. ACCOUNT STATISTICS

## 3.1 Data Utama Akun

| Field | Fungsi |
|---|---|
| accountLevel | Level perkembangan akun |
| followers | Ukuran audiens |
| performance | Efektivitas akun |
| reputation | Kepercayaan/kualitas akun |
| suspicion | Tingkat kecurigaan akun |
| status | Kondisi operasional akun |
| automationLevel | Tingkat otomasi |
| passiveIncomeRate | Pendapatan per satuan waktu game aktif |

## 3.2 Followers

Followers menjadi faktor basis potensi pendapatan. Followers dapat bertambah melalui perkembangan akun, hasil campaign, dan sistem lain yang ditetapkan.

## 3.3 Performance

Performance menggambarkan efektivitas akun. Performance dipengaruhi oleh kualitas aktivitas, upgrade, kondisi akun, dan konsekuensi. Performance bukan sinonim followers.

## 3.4 Account Status

Status akun dapat memodifikasi output pendapatan atau ketersediaan kontrak. Contoh status: Normal, Warning, Restricted, Temporarily Suspended. Daftar final belum ditetapkan.

---

# 4. PASSIVE INCOME CALCULATION

## 4.1 Design Formula

Kerangka formula:

`IncomePerSecond = BaseRate × FollowersFactor × PerformanceFactor × AutomationMultiplier × StatusModifier`

`IncomeEarned = IncomePerSecond × ElapsedSeconds`

Formula ini harus diimplementasikan secara terpusat dan menggunakan elapsed time. Jangan mengakumulasi uang berdasarkan jumlah frame karena hasilnya dapat berbeda pada perangkat dengan frame rate berbeda.

## 4.2 Income Factors

- **BaseRate:** nilai dasar pendapatan untuk akun.
- **FollowersFactor:** kontribusi jumlah followers.
- **PerformanceFactor:** kontribusi kualitas performa.
- **AutomationMultiplier:** peningkatan output dari upgrade otomasi.
- **StatusModifier:** pengaruh kondisi akun, termasuk pembatasan.

Faktor dan kurva pertumbuhan belum ditentukan. Hindari pertumbuhan linear tanpa batas sebelum diuji karena dapat merusak ekonomi.

## 4.3 Income Collection UX

Mekanisme apakah pendapatan masuk langsung atau dikumpulkan melalui tombol claim masih merupakan keputusan UX. Apapun pilihannya:

- Pemain harus dapat melihat jumlah pendapatan yang sedang dihasilkan.
- Pendapatan tidak boleh hilang tanpa feedback.
- Perpindahan layar tidak boleh menggandakan atau menghapus akumulasi.
- Refresh browser harus memulihkan state secara konsisten.

## 4.4 Active Time Only

Untuk MVP, elapsed time dihitung hanya selama game aktif/terbuka. Ketika game ditutup, passive income berhenti. Offline Earnings tidak dibuat pada tahap ini.

---

# 5. UPGRADE & AUTOMATION MECHANICS

## 5.1 Upgrade Model

Setiap upgrade memiliki:

- ID.
- Nama dan deskripsi.
- Level saat ini dan maksimum (jika ada).
- Biaya.
- Prasyarat.
- Efek numerik atau unlock.
- Dampak terhadap passive income atau kapasitas.

## 5.2 Automation

Automation adalah jalur utama peningkatan passive income. Pada tahap awal, automation dapat berupa tools/workflow upgrade yang meningkatkan multiplier pendapatan atau konsistensi operasional. Pada fase lanjutan, otomasi dapat dikembangkan menjadi staf dan manajemen tim.

Automation tidak boleh otomatis mengerjakan kontrak berisiko tinggi tanpa persetujuan pemain. Kontrak tetap memerlukan keputusan eksplisit.

## 5.3 Upgrade Feedback

Setelah membeli upgrade, UI harus menunjukkan:
- Biaya yang dibayarkan.
- Level baru.
- Perubahan income rate sebelum dan sesudah.
- Efek atau unlock yang diperoleh.

## 5.4 Balancing Notes

Upgrade harus memiliki diminishing returns atau kurva biaya/efek yang terkontrol jika dibutuhkan. Nilai dan kurva final ditentukan melalui playtesting.

---

# 6. CAMPAIGN CONTRACT MECHANICS

## 6.1 Campaign Data

Setiap kontrak setidaknya memiliki:

| Parameter | Deskripsi |
|---|---|
| id | ID unik |
| client | Klien fiktif |
| campaignName | Nama kontrak |
| objective | Tujuan |
| eligibleAccount | Kriteria akun |
| difficulty | Kesulitan |
| basePayment | Pembayaran dasar |
| bonusPayment | Bonus potensial |
| baseRisk | Risiko awal |
| strategyTags | Strategi yang cocok |
| interactionType | Auto, Interactive, atau Hybrid |
| status | Available, Accepted, In Progress, Completed, Failed |

## 6.2 Contract Choice

Pemain harus dapat membandingkan reward dan risk sebelum menerima kontrak. Informasi risiko ditampilkan secara jelas, tetapi formula internal boleh disembunyikan.

## 6.3 Campaign Types by Interaction

- **Auto:** hasil dihitung otomatis dari statistik akun, strategi default, dan peluang.
- **Interactive:** pemain menjalankan mini-game atau aktivitas interaktif.
- **Hybrid:** sebagian tahap otomatis, sebagian membutuhkan input pemain.

Jenis interaksi ditentukan oleh desain kontrak, bukan dipaksakan sama untuk semua kontrak.

## 6.4 Contract Lifecycle

Available → Accepted → In Progress → Resolved → Completed/Failed.

Setiap kontrak hanya boleh di-resolve dan memberikan reward satu kali.

---

# 7. STRATEGY SYSTEM

## 7.1 Strategy Parameters

Parameter strategi dari desain sebelumnya dapat dipertahankan sebagai opsi:

- **Content Approach:** Informative, Emotional, Humorous, Provocative, atau kategori lain yang sesuai brief.
- **Communication Style:** Casual, Persuasive, Aggressive, Satirical, Formal.
- **Publication Timing:** Quiet, Normal, Peak.
- **Activity Intensity:** Low, Normal, High.

Tidak semua kontrak perlu menggunakan seluruh parameter. Parameter yang tidak relevan tidak ditampilkan.

## 7.2 Risk-Reward Choice

Pemain dapat memilih pendekatan:

- **Conservative:** potensi reward/bonus lebih rendah, exposure risiko lebih terkendali.
- **Balanced:** kompromi antara potensi hasil dan risiko.
- **Aggressive:** potensi reward/bonus lebih tinggi, tetapi meningkatkan risiko atau memperbesar konsekuensi jika gagal.

Ini adalah kerangka opsi. Detail dampak dan angka belum final.

## 7.3 Preview

Sebelum konfirmasi, tampilkan indikator ringkas:
- Estimated reward range.
- Risk level.
- Potential bonus.
- Account condition warning.

Hindari menampilkan angka probabilitas presisi jika desain ingin mempertahankan ketidakpastian; tetapi indikator risiko harus tetap informatif.

---

# 8. MINI-GAME & INTERACTIVE ACTIVITY SYSTEM

## 8.1 Role of Mini-games

Mini-game adalah aktivitas penting untuk meningkatkan kualitas eksekusi atau membuka bonus kampanye, tetapi tidak dimainkan pada setiap siklus passive income dan tidak wajib ada pada semua kontrak.

## 8.2 Candidate Mini-games

1. **Caption Challenge:** memilih caption yang paling sesuai dengan tujuan dan audiens kampanye.
2. **Engagement Challenge:** aktivitas timing atau interaksi untuk meningkatkan execution score.
3. **Timing Challenge:** menentukan waktu yang tepat berdasarkan indikator atau kondisi audiens.
4. **Content Selection:** memilih konten yang paling sesuai dengan brief.

MVP dapat menggunakan satu atau dua mini-game untuk menguji variasi interaksi tanpa memperbesar scope.

## 8.3 Mini-game Scoring

Hasil mini-game menghasilkan nilai kualitas, misalnya Content Quality atau Execution Quality. Nilai tersebut menjadi salah satu input kalkulasi kampanye, bukan penentu tunggal hasil akhir.

## 8.4 Skip / Auto Resolution

Kontrak yang mengizinkan auto resolution dapat dilewati tanpa mini-game. Hasil otomatis dihitung dari statistik akun dan strategi yang dipilih. Trade-off reward atau kualitas hasil auto versus interactive perlu diuji dan tidak ditetapkan sebagai angka final pada dokumen ini.

---

# 9. CAMPAIGN RESULT & PROBABILITY

## 9.1 Separate Performance and Success

Sistem harus memisahkan:

- **Performance Score:** kualitas eksekusi/kecocokan strategi.
- **Success Probability:** peluang kontrak berhasil berdasarkan seluruh faktor.
- **Outcome:** hasil resolusi akhir (Success, Partial Success, Failure, atau variasi yang ditentukan).

Performance tinggi tidak otomatis menjamin Success. Unsur peluang tetap ada.

## 9.2 Probability Inputs

Success probability dipengaruhi oleh:

- Base risk kontrak.
- Kesesuaian strategi.
- Activity intensity.
- Account performance dan reputation.
- Account suspicion dan status.
- Hasil mini-game jika dimainkan.
- Modifier khusus dari kontrak.

Pemain dapat mengubah sebagian input melalui keputusan. Sistem mengaplikasikan random roll pada satu titik resolusi yang konsisten.

## 9.3 Resolution Order

1. Validasi kontrak dan akun.
2. Ambil snapshot kondisi akun.
3. Hitung strategy/performance modifiers.
4. Hitung success probability dan risk exposure.
5. Jalankan satu random resolution.
6. Tentukan outcome.
7. Hitung pembayaran/bonus.
8. Hitung perubahan followers/performance/reputation/suspicion.
9. Tentukan penalty jika ada.
10. Simpan hasil dan transaction record.

Random resolution harus terjadi satu kali per kontrak. Refresh atau membuka ulang layar hasil tidak boleh mengulang random roll.

## 9.4 Outcome Categories

Kategori konseptual:

- **Success:** tujuan utama terpenuhi dan pembayaran diberikan.
- **Partial Success:** sebagian tujuan terpenuhi atau bonus berkurang.
- **Failure:** kontrak gagal; pembayaran dapat berkurang atau tidak diberikan dan konsekuensi dapat diterapkan.

Apakah partial success diperlukan pada MVP ditentukan saat penyusunan prototype.

---

# 10. PENALTY & RECOVERY MECHANICS

## 10.1 Hybrid Failure Consequences

Kegagalan dapat mengombinasikan:

- Financial fine.
- Reputation decrease.
- Suspicion increase.
- Account reach restriction.
- Temporary account suspension untuk kasus lebih berat.

Tidak setiap kegagalan harus memicu seluruh konsekuensi sekaligus. Sistem memilih konsekuensi berdasarkan severity dan penyebab.

## 10.2 Severity Factors

- Base risk kontrak.
- Tingkat agresivitas keputusan.
- Kondisi awal akun.
- Besar selisih hasil dari target.
- Akumulasi suspicion.
- Jenis kegagalan yang ditentukan data kontrak.

## 10.3 Recovery

Pemain harus memiliki cara untuk pulih, misalnya menunggu restriction selesai, membayar denda, melakukan aktivitas pemulihan, atau menurunkan intensitas aktivitas. Detail final belum ditetapkan.

## 10.4 Career-wide Consequence

Game Over dapat dipertahankan sebagai kemungkinan pada fase lanjutan jika terjadi kegagalan karier yang berat. Tidak termasuk MVP.

---

# 11. BUSINESS PROGRESSION

| Stage | Kapabilitas utama |
|---|---|
| Individual Buzzer | Satu akun, passive income, upgrade awal, campaign dasar |
| Account Network | Multi-account, otomasi lebih tinggi, campaign bervariasi |
| Buzzer Agency | Staf, kapasitas tim, kontrak skala besar, career-wide risk |

Progression harus membuka kompleksitas secara bertahap. Jangan menampilkan seluruh sistem lanjutan sebagai kewajiban pada awal permainan.

---

# 12. SMARTPHONE & NAVIGATION

Smartphone dapat menjadi elemen dunia game dan wadah aplikasi fiktif, tetapi gameplay utama harus tetap mudah diakses. Home/Business Hub perlu memberi akses langsung ke pendapatan, akun, upgrade, kontrak, dan finance. Jangan memaksa pemain membuka banyak lapisan menu untuk melakukan tindakan idle yang rutin.

---

# 13. CONTOH SIMULASI SATU SIKLUS

1. Pemain membuka game dan melihat akun menghasilkan pendapatan.
2. Pemain mengumpulkan pendapatan yang terakumulasi.
3. Pemain membeli upgrade otomasi; income rate meningkat.
4. Pemain melihat kontrak kampanye dengan reward tinggi dan risk tinggi.
5. Pemain memilih akun dan strategi Balanced atau Aggressive.
6. Kontrak menyediakan mini-game. Pemain memainkannya untuk meningkatkan execution quality.
7. Sistem menghitung performance score dan success probability.
8. Random resolution menentukan Success, Partial Success, atau Failure.
9. Jika berhasil, pemain menerima pembayaran dan bonus yang sesuai.
10. Jika gagal, pemain dapat terkena denda, penurunan reputasi, serta peningkatan suspicion atau pembatasan akun sesuai severity.
11. Pemain kembali mengelola passive income dan memutuskan langkah selanjutnya.

---

# 14. GAMEPLAY DESIGN RULES

1. Passive income harus berjalan tanpa input berulang.
2. Passive income MVP berhenti ketika game ditutup.
3. Followers dan performance sama-sama memengaruhi passive income.
4. Automation merupakan jalur utama untuk meningkatkan passive income.
5. Campaign merupakan pendapatan tambahan dengan risk-reward yang nyata.
6. Keputusan pemain mengubah risiko/peluang, tetapi tidak menghapus randomness.
7. Mini-game berpengaruh tetapi tidak harus dimainkan terus-menerus.
8. Auto resolution tersedia untuk kontrak/aktivitas yang memang dirancang mendukungnya.
9. Satu kontrak hanya boleh di-resolve sekali.
10. Kegagalan memiliki konsekuensi yang proporsional dan opsi recovery.
11. Nilai balancing harus terpusat dalam konfigurasi, bukan tersebar di kode.

---

# 15. IMPLEMENTATION PRIORITY

## Phase 1 — Idle Foundation
- Account state.
- Active-time income calculation.
- Followers/performance factors.
- Finance display and persistence.

## Phase 2 — Upgrade & Automation
- Upgrade data model.
- Automation multiplier.
- Purchase validation and feedback.

## Phase 3 — Campaign Foundation
- Contract list and brief.
- Accept/resolve state.
- Strategy choices.
- Basic outcome and reward.

## Phase 4 — Interactive Campaign
- One or two mini-games.
- Performance scoring.
- Risk probability.
- Hybrid failure consequences.

## Phase 5 — Progression & Polish
- Reputation/suspicion/restrictions.
- Account unlock preparation.
- UI feedback and balancing.

---

# 16. OPEN DESIGN DECISIONS

- Exact passive income curve and tick interval.
- Whether income is auto-credited or manually claimed.
- Initial automation upgrade set and costs.
- Exact campaign categories and refresh rules.
- Which contracts are Auto, Interactive, or Hybrid.
- Whether MVP includes Partial Success.
- Exact success probability formula and random range.
- Exact penalty severity mapping.
- Whether a failed contract can affect account status immediately.
- Mini-game selection and replay rules.
- Exact progression unlock requirements.

---

**END OF DOCUMENT — MENJADI BUZZER GDD v1.2 IDLE CORE MECHANICS**

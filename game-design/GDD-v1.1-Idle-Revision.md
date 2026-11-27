# GAME DESIGN DOCUMENT (GDD)
# MENJADI BUZZER — v1.1 (Idle Systems Revision)

**Status:** Draft Revisi Sistem Game  
**Berdasarkan:** GDD v1.0 Idle Revision  
**Genre:** Semi Idle Management Simulation  
**Platform:** Browser Game  
**Mode:** Single Player  
**Visual Reference:** `/ui-reference`  
**Brainstorm:** Dokumen sumber ide awal; tidak boleh diubah

---

# 1. TUJUAN DOKUMEN

GDD v1.1 menjabarkan sistem utama yang membentuk pengalaman Semi Idle Menjadi Buzzer. Dokumen ini menjelaskan hubungan antara akun, passive income, otomasi, kontrak kampanye, mini-game, risiko, ekonomi, dan perkembangan bisnis.

Dokumen ini belum menetapkan angka balancing final. Nilai uang, interval pendapatan, probabilitas, biaya upgrade, dan threshold harus ditentukan melalui pengujian.

# 2. GAMEPLAY MODEL

## 2.1 Core Loop

1. Akun menghasilkan pendapatan otomatis selama game terbuka.
2. Pemain mengumpulkan pendapatan dan melihat perubahan followers/performa.
3. Pemain menginvestasikan uang pada upgrade akun atau otomasi.
4. Pemain memilih apakah akan mengambil kontrak kampanye.
5. Pemain memeriksa potensi reward, kesulitan, dan risiko.
6. Pemain menentukan strategi serta intensitas.
7. Kampanye diproses melalui simulasi atau aktivitas interaktif sesuai jenis kontrak.
8. Sistem menentukan hasil, reward, dan konsekuensi.
9. Pemain memperkuat bisnis dan membuka peluang yang lebih besar.

## 2.2 Gameplay Modes

### A. Passive Management

Aktivitas rutin akun berjalan otomatis selama game terbuka. Pemain tidak perlu mengulang tindakan manual untuk setiap unit pendapatan. Pemain tetap dapat mengambil keputusan tentang upgrade, prioritas pengembangan, dan penggunaan uang.

### B. Active Campaign

Pemain memilih dan menjalankan kontrak. Aktivitas ini memiliki tujuan dan hasil spesifik, serta dapat memberikan reward tambahan yang lebih besar daripada pendapatan pasif dalam periode yang sebanding. Reward tinggi disertai risiko yang sesuai.

### C. Management & Expansion

Pemain mengatur akun, otomasi, dan kapasitas operasional. Pada tahap lanjut, pemain mengelola beberapa akun dan staf.

---

# 3. ACCOUNT MANAGEMENT SYSTEM

## 3.1 Starting Account

Pemain memulai dengan satu akun media sosial fiktif. Nama akun dan platform contoh dari dokumen sebelumnya dapat dipertahankan sebagai placeholder sampai identitas final ditentukan.

Setiap akun memiliki data konseptual:

| Parameter | Fungsi |
|---|---|
| Account Level | Menentukan perkembangan dasar akun dan akses upgrade |
| Followers | Menggambarkan ukuran audiens dan potensi jangkauan |
| Performance | Menggambarkan efektivitas akun menghasilkan engagement |
| Reputation | Menggambarkan kepercayaan/kualitas akun |
| Suspicion | Menggambarkan tingkat perhatian atau kecurigaan terhadap akun |
| Status | Normal, Warning, Restricted, Suspended, atau status lain yang ditetapkan |
| Automation Level | Tingkat otomasi operasional akun |
| Passive Income Rate | Nilai pendapatan akun per satuan waktu game aktif |

## 3.2 Followers & Performance

Followers dan performance memiliki fungsi berbeda dan sama-sama berkontribusi terhadap passive income.

- **Followers** menentukan basis potensi audiens.
- **Performance** menentukan efektivitas akun dalam menghasilkan hasil dari basis audiens tersebut.

Followers dapat bertambah melalui perkembangan akun, hasil kampanye, dan mekanisme game lain yang disetujui. Performance dapat berubah berdasarkan kualitas aktivitas, upgrade, kondisi akun, dan konsekuensi risiko.

## 3.3 Progressive Multi-Account

Pemain tidak memulai dengan banyak akun. Akun tambahan dibuka secara bertahap melalui persyaratan progresi, biaya, atau pencapaian yang nantinya ditetapkan.

Setiap akun dikelola secara individual, tetapi pemain dapat melihat ringkasan jaringan akun secara keseluruhan.

## 3.4 Account Status & Consequences

Akun dapat mengalami warning, penurunan jangkauan, restriction, suspension sementara, atau konsekuensi lebih berat. Satu akun yang dibatasi tidak otomatis mengakhiri seluruh permainan. Dampak terhadap keseluruhan karier bergantung pada skala dan akumulasi masalah.

---

# 4. PASSIVE INCOME SYSTEM

## 4.1 Prinsip

Setiap akun aktif menghasilkan pendapatan secara otomatis selama game terbuka. Untuk MVP, pendapatan tidak bertambah ketika game ditutup.

Pendapatan akun menggunakan kombinasi followers dan performance. Model konseptual:

`Passive Income Rate = Base Rate × Followers Factor × Performance Factor × Account Modifiers`

Formula ini hanya kerangka desain. Nilai faktor, skala, interval tick, dan batas pendapatan belum final.

## 4.2 Pendapatan Berjalan

- Pendapatan dihitung berdasarkan elapsed time, bukan jumlah frame.
- UI menampilkan pendapatan berjalan atau akumulasi yang mudah dipahami.
- Pemain dapat mengumpulkan/claim pendapatan jika pola UI yang dipilih membutuhkan tindakan tersebut; mekanisme claim tidak boleh membuat pendapatan hilang tanpa penjelasan.
- Sistem harus mencegah pendapatan dihitung ganda ketika layar berpindah atau browser melakukan refresh.

## 4.3 Offline Earnings

Offline Earnings tidak termasuk MVP. Arsitektur perhitungan waktu sebaiknya tidak mengunci sistem pada loop frame sehingga perhitungan offline dapat ditambahkan kelak. Jangan mengimplementasikan offline accumulation pada tahap awal.

---

# 5. UPGRADE & AUTOMATION SYSTEM

## 5.1 Prinsip Upgrade

Peningkatan passive income dilakukan terutama melalui otomasi. Upgrade harus memiliki efek yang dapat dipahami, biaya, level, dan prasyarat.

Contoh kategori upgrade yang dapat dieksplorasi:

- **Account Operations:** meningkatkan efisiensi operasional akun.
- **Content Workflow:** meningkatkan konsistensi atau kualitas aktivitas.
- **Automation Tools:** mengurangi ketergantungan pada tindakan rutin manual dan meningkatkan output.
- **Staff / Team:** dibuka pada fase jaringan akun atau agensi untuk menambah kapasitas operasional.

Nama, jumlah level, biaya, dan efek upgrade belum final.

## 5.2 Automation Trade-off

Otomasi memperbesar output dan menghemat interaksi berulang, tetapi tidak membuat seluruh keputusan bisnis berjalan tanpa pemain. Pemain tetap menentukan investasi, ekspansi, pemilihan kontrak, dan penanganan risiko.

## 5.3 Staff Progression

Perekrutan staf merupakan fitur fase lanjutan, bukan keharusan MVP. Staf dapat berfungsi sebagai peningkat kapasitas, pengelola aktivitas rutin, atau spesialisasi tertentu. Peran spesifik harus ditentukan sebelum implementasi.

---

# 6. CAMPAIGN CONTRACT SYSTEM

## 6.1 Campaign Contract

Kontrak kampanye adalah sumber pendapatan aktif tambahan. Setiap kontrak memiliki:

- ID dan nama kampanye.
- Klien fiktif.
- Tujuan kampanye.
- Akun yang memenuhi syarat.
- Target atau kriteria hasil.
- Base Payment.
- Bonus potensial.
- Difficulty.
- Base Risk.
- Pilihan strategi yang relevan.
- Kebutuhan mini-game atau resolusi otomatis.
- Status kontrak.

## 6.2 Campaign Categories

Kategori kampanye dapat meliputi awareness, engagement, content promotion, atau kategori lain sesuai dunia game. Kategori final dan variasinya akan ditentukan melalui desain konten.

## 6.3 Contract Selection

Sebelum menerima kontrak, pemain harus dapat memahami:

- Potensi pembayaran.
- Bonus yang mungkin diperoleh.
- Tingkat kesulitan.
- Risiko dasar.
- Kondisi akun yang disarankan/diperlukan.
- Konsekuensi yang mungkin terjadi.

Kontrak tidak boleh menyembunyikan risiko penting. Informasi dapat disajikan secara ringkas dengan indikator risiko.

## 6.4 Campaign Resolution Modes

Tidak semua kontrak harus selalu memaksa pemain memainkan mini-game.

- **Auto Resolution:** kontrak atau aktivitas rutin tertentu diselesaikan melalui simulasi berdasarkan statistik akun, strategi, dan peluang.
- **Interactive Resolution:** kampanye tertentu menyediakan mini-game/aktivitas langsung untuk memengaruhi kualitas eksekusi dan hasil.

Aktivitas interaktif harus terasa bernilai dan muncul pada momen yang tepat, bukan menjadi pekerjaan repetitif untuk setiap siklus pendapatan.

---

# 7. STRATEGY & MINI-GAME SYSTEM

## 7.1 Strategic Decisions

Pilihan strategi dapat mencakup:

- Content Approach.
- Communication Style.
- Publication Timing.
- Activity Intensity.

Tidak semua kontrak harus menggunakan seluruh parameter. Kontrak menentukan parameter yang relevan.

## 7.2 Risk-Reward Choices

Pemain dapat memilih pendekatan konservatif, seimbang, atau agresif. Pilihan yang lebih agresif dapat meningkatkan potensi reward atau peluang mencapai target tertentu, tetapi juga meningkatkan exposure/suspicion atau memperburuk konsekuensi jika gagal.

## 7.3 Mini-games

Mini-game yang sudah direncanakan dalam dokumen sebelumnya dapat dipertahankan sebagai kandidat:

- Caption Challenge.
- Engagement Challenge.
- Timing Challenge.
- Content Selection.

Pemilihan mini-game bergantung pada tipe kampanye. Satu kampanye tidak wajib menggunakan seluruh mini-game.

## 7.4 Mini-game Effect

Hasil mini-game memengaruhi Execution Quality atau Content Quality. Hasil yang baik meningkatkan kualitas hasil kampanye, tetapi tidak menjamin sukses karena peluang sistem dan kondisi akun tetap berpengaruh.

Mini-game dapat menjadi opsional untuk beberapa kontrak. Jika pemain melewati aktivitas interaktif, sistem menggunakan resolusi otomatis dengan hasil berdasarkan statistik dan strategi; detail trade-off hasil otomatis perlu diuji.

---

# 8. RISK, SUSPICION & PENALTY SYSTEM

## 8.1 Risk Model

Risiko kampanye dibentuk oleh dua kelompok:

1. **Player-controlled factors:** pilihan kontrak, strategi, pendekatan konten, intensitas, akun yang digunakan, serta keputusan interaktif.
2. **System probability:** unsur peluang yang tetap menentukan hasil akhir berdasarkan parameter kampanye dan kondisi saat resolusi.

Keputusan pemain memengaruhi probabilitas, tetapi tidak menghapus unsur ketidakpastian.

## 8.2 Risk vs Performance

Performance dan risk adalah dua keluaran yang berhubungan tetapi tidak identik. Pemain dapat memperoleh performa tinggi namun tetap terekspos risiko; pemain juga dapat berhasil memenuhi target tanpa memaksimalkan bonus.

## 8.3 Failure Consequences — Hybrid

Kegagalan kampanye dapat menghasilkan kombinasi konsekuensi:

- Denda uang.
- Penurunan reputasi akun atau karier.
- Peningkatan suspicion.
- Pembatasan jangkauan atau fitur akun.
- Suspension sementara untuk kasus tertentu.

Tingkat konsekuensi ditentukan oleh tingkat kegagalan, penyebab, base risk, keputusan pemain, dan kondisi akun. Kegagalan biasa tidak otomatis menyebabkan ban permanen atau Game Over.

## 8.4 Suspicion Scope

- **Account Suspicion:** risiko/kecurigaan pada akun individual.
- **Career Suspicion:** akumulasi risiko pada keseluruhan operasi pemain, diperkenalkan ketika skala jaringan/agensi relevan.

Hubungan matematis dan threshold keduanya belum final.

## 8.5 Recovery

Pemulihan dapat melibatkan waktu, biaya, tindakan pemulihan, atau penyelesaian konsekuensi. Mekanisme final harus menjaga agar penalti berarti tetapi tidak membuat pemain terjebak tanpa opsi.

## 8.6 Severe Consequences & Game Over

Game Over tetap dapat menjadi konsekuensi jangka panjang untuk kegagalan sistemik atau akumulasi pelanggaran berat. Syarat pasti dan implementasinya bukan bagian MVP.

---

# 9. ECONOMY SYSTEM

## 9.1 Income Sources

- Passive income dari followers dan performance akun.
- Pembayaran dasar kontrak kampanye.
- Bonus performa atau pencapaian target kampanye.

## 9.2 Expenses

- Account upgrades.
- Automation upgrades.
- Unlock akun tambahan.
- Staff/team pada fase lanjutan.
- Lifestyle assets.
- Penalty/fines.

## 9.3 Economy Principles

- Passive income memberi stabilitas dan rasa progres.
- Campaign income menjadi akselerator, bukan satu-satunya sumber uang.
- Upgrade harus memiliki biaya dan manfaat yang terukur.
- Risiko tidak boleh menjadi pajak acak yang tidak dapat dipahami.
- Pemain harus memiliki jalur pemulihan setelah kerugian.

---

# 10. BUSINESS PROGRESSION

| Fase | Fokus | Sistem yang dibuka |
|---|---|---|
| Individual Buzzer | Belajar mengelola satu akun | Passive income, upgrade, kontrak sederhana |
| Account Network | Mengelola banyak akun | Multi-account, otomasi lanjutan, kontrak lebih besar |
| Buzzer Agency | Mengelola organisasi | Staf, kapasitas tim, kontrak agensi, career-wide risk |

Unlock conditions dan balancing belum ditentukan.

---

# 11. UI / VISUAL / ART STYLE REFERENCE

**Lokasi referensi utama: `/ui-reference`**

Seluruh screenshot di folder tersebut merupakan acuan utama UI, visual, art style, layout, komponen, dan pola interaksi. Agent wajib mempelajari referensi sebelum implementasi UI. Referensi digunakan untuk memahami pola dan bahasa visual; aset dan identitas Menjadi Buzzer harus tetap orisinal.

---

# 12. MVP SCOPE

**Masuk MVP:**

1. Satu karakter dan satu akun.
2. Passive income aktif hanya ketika game terbuka.
3. Followers + performance memengaruhi pendapatan.
4. Upgrade akun dan minimal satu jalur otomasi.
5. Satu atau beberapa kontrak kampanye contoh.
6. Pilihan strategi/intensitas yang bermakna.
7. Minimal satu mini-game; mini-game kedua dapat ditambahkan jika mendukung pengujian.
8. Auto resolution sederhana untuk aktivitas/kontrak yang tidak memerlukan interaksi.
9. Probabilitas hasil yang dipengaruhi keputusan pemain.
10. Denda, reputasi, suspicion, dan pembatasan akun dasar.
11. Finance/transaction history sederhana.
12. Local save/load.

**Tidak masuk MVP:** Offline Earnings, multi-account penuh, staf kompleks, manajemen agensi, saham, properti, kendaraan, travel, online features, dan Game Over lengkap.

---

# 13. OPEN DESIGN ITEMS

- Formula passive income dan interval perhitungan.
- Detail efek tiap automation upgrade.
- Apakah pendapatan perlu di-claim atau langsung masuk saldo.
- Daftar jenis kontrak dan parameter masing-masing.
- Kapan kontrak menggunakan auto resolution atau mini-game.
- Formula probabilitas keberhasilan dan kegagalan.
- Bobot hasil mini-game terhadap campaign outcome.
- Threshold reputasi, suspicion, dan restriction.
- Biaya serta persyaratan unlock multi-account.
- Struktur staf dan spesialisasi agensi.
- Kondisi Game Over dan recovery tingkat lanjut.

---

**END OF DOCUMENT — MENJADI BUZZER GDD v1.1 IDLE SYSTEMS REVISION**

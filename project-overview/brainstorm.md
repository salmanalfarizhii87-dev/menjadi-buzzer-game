# Rancangan Game “Menjadi Buzzer” (Ideas & Documentation)

## 1.Riset awal
Saya mencoba browser game bernama https://tapakrun.appcademy.app/ kemudian saya coba eksplorasi dan bedah terkait arsitektur dari game tersebut terkait framework,bahasa yang digunakan,frontend,backend,UI dll menggunakan rea https://github.com/morluto/rea yang saya install di opencode saya sebagai skills hasil analisis nya saya suruh buat file .md yang berisi detail arsitektur dari tapakrun,berikut ini isinya:

#### 1.1 tapakrun-arsitektur.md
# Arsitektur TapakRun — referensi untuk membangun game browser serupa

Target analisa: `https://tapakrun.appcademy.app/`
Tanggal analisa: 2026-11-25
Metode: Chromium headless via CDP + REA (`inspect_web_page`, `analyze_web_bundle`), verifikasi HTTP langsung, grep statik terhadap 51 file bundle.

Semua angka di bawah hasil observasi langsung, bukan tafsiran. Yang berupa inferensi ditandai **[inferensi]** beserta keyakinan.

---

## 1. Ringkasan stack

| Lapisan | Isi | Keyakinan |
|---|---|---|
| Bahasa | JavaScript modern (ES2022), dikompilasi Vite; proyek memakai TypeScript (config `vite.tapak.config.ts`) | 99% JS bundle / 85% TS source |
| UI framework | **Tidak ada** — vanilla JS, elemen dibuat manual | 97% |
| Renderer | **DOM + inline SVG + CSS**, bukan Canvas/WebGL | 98% |
| Build tool | Vite, output `dist-tapak/`, nama file content-hash | 99% |
| Router | Hand-rolled: atribut `data-screen` + dynamic `import()` per layar | 95% |
| State | `localStorage` bernamespace + pola *outbox* untuk sinkronisasi offline | 90% |
| i18n | Literal Melayu jadi key, tabel Inggris dimuat lazy (2.1 MB) | 95% |
| PWA | `tapak.webmanifest` + service worker `tapak-sw.js` (183 entri precache) | 99% |
| Backend | PHP (`.php`) di `/api/`, LiteSpeed/OpenLiteSpeed + CyberPanel, di depan Cloudflare | 95% PHP / 80% server stack |
| Database | Tidak terlihat dari klien **[inferensi]** MySQL/MariaDB (pola umum CyberPanel+PHP) | 40% |
| Hosting FE | Static hosting, aset dari origin yang sama | 95% |

Skala bundle: entry `assets/index-DJ7bmzLH.js` = **203.619 byte**, total 145 chunk JS + 24 chunk CSS di precache, CSS utama 369.744 byte + 17.646 byte, tabel terjemahan `en-*.js` = 2.187.042 byte.

---

## 2. Bukti kunci (yang bisa kamu reproduksi)

### 2.1 Tanpa framework UI

Grep ke seluruh bundle untuk penanda runtime framework → **nol**:

```
react.transitional.element, react.element, __reactContainer, react-dom   → 0
__k, __vnode, __PREACT                                                    → 0
__vue__, __v_isRef, createElementBlock, _createElementVNode               → 0
__svelte, $$invalidate                                                    → 0
createSignal, _$createComponent, _$template, delegateEvents, solid-js     → 0
useState, useEffect, vdom                                                 → 0
```

CSS juga bersih: tiada `.svelte-*`, `[data-v-*]`, `_ngcontent`, `data-reactroot`.
Satu-satunya kemunculan kata "react" adalah data domain game: `{kind:\`react\`, label:\`Yard besi\`}` (bangunan yang bereaksi) di `screen-CPPPu9be.js`.

Sebagai ganti framework, ada factory elemen buatan sendiri di `index-DJ7bmzLH.js`:

```js
function S(e,t={},n=[]){let r=document.createElement(e);
for(let[e,n]of Object.entries(t))n!==void 0&&n!==!1&&(e.startsWith(`on`)&&typeof n==`function`
  ?r.addEventListener(e.slice(2).toLowerCase(),n)
  :e===`class`?r.className=String(n):e===`html`?r.innerHTML=String(n)
  :e===`text`?r.textContent=String(n):r.setAttribute(e,n===!0?``:String(n)));
for(let e of n)e!=null&&e!==!1&&r.append(e);return r}
```

Pola: `el(tag, props, children)`. Props `class`/`html`/`text`/`on*` punya arti khusus. Tiada diffing, tiada VDOM — mount langsung ke node nyata.

### 2.2 Renderer DOM, bukan Canvas

- DOM snapshot CDP: 1.407 node, `DIV: 37`, `svg: 13`, `path: 393`, `g: 150`, `rect: 300`, `circle: 79`, `linearGradient: 11`, `clipPath: 32` — karakter dan properti digambar sebagai **inline SVG**.
- **`CANVAS: 0`** — bukan "sedikit", memang tidak ada elemen canvas.
- Grep seluruh JS untuk `getContext(`, `CanvasRenderingContext2D`, `OffscreenCanvas`, `webgl`, `Path2D` → **0**.
- Animasi: `requestAnimationFrame` 15×, `getBoundingClientRect` 14×, `innerHTML` 13×, `replaceChildren` 12× di `screen-CPPPu9be.js` (433.287 byte).
- CSS utama: `@keyframes` 233×, `transform:` 536× → animasi CSS-driven, khas game berbasis DOM.
- Tiada Web Components: `customElements` 0, `attachShadow` 0.

Konsekuensi desain: world/screen adalah `<div>` bertumpuk dengan `transform: translate3d()` dan `z-index`; layout dipakai sebagai sumber kebenaran posisi (`getBoundingClientRect`), bukan hit-testing manual.

### 2.3 Build tool Vite

- `<script type="module" crossorigin src="./assets/index-DJ7bmzLH.js">`
- Artefak khas Vite: `__vite__mapDeps`, `import.meta.url`, polyfill *modulepreload* manual, nama file `[name]-[hash8].js`.
- Output dir `dist-tapak/` dan plugin kustom `tapak-sw` terungkap di komentar SW: *"Built into dist-tapak/tapak-sw.js by the `tapak-sw` plugin in vite.tapak.config.ts, which fills in the `__TAPAK_SW_*__` placeholders."*

### 2.4 Code splitting per layar / per fitur

`index-DJ7bmzLH.js` hanya meng-import satu helper (`./chibi-ZhK2wRP4.js`) lalu memuat layar secara dinamis. Precache SW memuat 183 entri: 145 JS, 24 CSS, 8 woff2, 2 webp, 2 png, manifest, shell.

Contoh chunk (nama = fitur, bukan nomor):

```
title, setup, brief, screen, ending, ending-art, leaderboard, explore, daily, daily-ronda,
act3, act4, act5, act12, buildings, contractors, cosmetics, budget, calendar, career,
chat, collide, door-state, fx, hud-icons, keepsake-store, lot-layout, majlis-audio,
minimap, occlude, office, outbox, paint, panel, pool-art, project, registry, resolve,
rules, sheet, overlay-sheet, store, bus, api, avatar, brand
```

Ukuran terbesar: `registry-*.js` 610.228 B (katalog konten), `screen-*.js` 433.287 B (renderer syif), `minimap-*.js` 340.640 B.
`act3/4/5/12` punya pasangan `.js` + `.css` terpisah → tiap bab game punya bundel sendiri.

### 2.5 Backend PHP + envelope JSON

Tiga endpoint ditemukan di bundle dan diverifikasi live:

| Endpoint | Method | Perilaku |
|---|---|---|
| `/api/leaderboard.php` | GET | `200`, `{"success":true,"data":[{runId,name,kind,role,score,grade,lateDays,title,tier,at,look,streak,gelaran}]}`, filter `board`/`tier`, `cache-control: no-store` |
| `/api/news.php` | GET | `200`, `{"success":true,"data":null}`, `access-control-allow-origin: *`, `cache-control: public, max-age=60` |
| `/api/stats.php` | POST | `405` untuk GET; POST tanpa `Origin` sah → `403 {"success":false,"error":"Asal permintaan tak dibenarkan."}` |

Base URL dibangun di klien:

```js
function pe(e=!1,t=!1){return e||t?`${fe}api/`:`./api/`}   // fe = https://tapakrun.appcademy.app/
var g=`${c()}leaderboard.php`, ee=8e3;                     // timeout 8 detik
var bt=`${pe()}stats.php`, xt=1e4;                          // timeout 10 detik
```

Header server: `x-powered-by: CyberPanel-OLS/2.4.4`, `x-turbo-charged-by: LiteSpeed`, `server: cloudflare`.
Kontrak telemetri: `POST` JSON `{v:1, device, batch:{id,start,last,…}}`, dikirim lewat `navigator.sendBeacon` bila tersedia, dengan antrean lokal `tapak.leaderboard.outbox.v1` / `tapak.career.outbox.v1`.

**[inferensi]** Validasi `Origin` di server + `runId` berformat `n` + 40 hex → ada lapisan anti-abuse ringan; skor dihitung/di-*clamp* di klien lalu divalidasi ulang server (fungsi `T()`, `h()` membatasi 0–10000).

### 2.6 State lokal, bukan IndexedDB

`localStorage` key (namespace `sampaiGaji.tapak.*`, semua berversi `.v1`):

```
sampaiGaji.tapak.project.v1   sampaiGaji.tapak.career.v1    sampaiGaji.tapak.onboard.v1
sampaiGaji.tapak.daily.v1     sampaiGaji.tapak.daily.streak.v1
sampaiGaji.tapak.daily.run.v1 sampaiGaji.tapak.explore.v1
sampaiGaji.tapak.settings     sampaiGaji.tapak.reviews.prompt.v1
tapak.leaderboard.outbox.v1   tapak.career.outbox.v1        tapak.myRuns
```

`indexed_db_names: []` → sengaja tanpa IndexedDB. Save game = JSON di localStorage. Cache aset ditangani Cache Storage lewat SW (`cache_names: ["tapakrun:/:ff6f7e910df3"]`).

### 2.7 i18n: literal sebagai key

Bahasa utama Melayu ada langsung di dalam kode sebagai string, lalu bahasa lain menimpanya:

```js
function Xs(e){return e===`ms`?Promise.resolve():(qs??(qs=T(()=>import(`./en-BfPlI3rv.js`)...)))}
```

`en-BfPlI3rv.js` (2.187.042 B) berisi `{ "Tutup pengumuman": "Close announcement", … }` — key = teks Melayu asli, value = terjemahan. Konsekuensi: chunk ini hanya diunduh bila `navigator.language !== "ms"`, tapi ukurannya besar karena berisi seluruh teks game + label DOM + string CSS.

### 2.8 PWA: service worker kecil dan konservatif

`navigator.serviceWorker.register('./tapak-sw.js', { scope:'./' })`, plus storage persist request.

Strategi (dari kode SW):

- `install`: precache 183 entri (shell, JS/CSS ber-hash, font, ikon, manifest).
- `navigate`: **network-first, timeout 3.000 ms**, fallback shell dari cache.
- `/assets/`: **cache-first** (nama sudah content-hash, jadi aman).
- `/api/` dan lintas origin: **tidak pernah diintersep/dicache** (leaderboard selalu live).
- `activate`: hapus cache TapakRun versi lama se-scope, lalu `clients.claim()`.
- Update: versi baru menunggu sampai halaman kirim `{type:'SKIP_WAITING'}` (tombol "Muat semula"), lalu `controllerchange`.

Manifest: `display: standalone`, `orientation: portrait`, 4 ikon (termasuk maskable + monochrome), 2 screenshot `780x1688`, shortcut `?go=leaderboard` dan `?go=explore`, `start_url: "./?src=pwa"`.

### 2.9 Detail lain yang ikut membentuk arsitektur

- Splash + fallback: `#boot` inline di HTML dengan CSS animasi; `window.__tapakBootFail` menampilkan pesan bila modul gagal dimuat; `<noscript>` disediakan; `nomodule` memicu pesan gagal.
- Aksesibilitas/motion: kelas `reduce-motion` di `<html>`, cek `prefers-reduced-motion` sebelum animasi rAF (`function re()`), tombol/menu pakai `aria-label`.
- Font self-hosted: Baloo 2 (600/700/800) `woff2`.
- Suara: modul `majlis-audio`, `*-sfx` (Web Audio, dimuat lazy).
- Layout game: `lot-layout`, `occlude`, `collide`, `minimap` → penataan dunia berbasis grid + occlusion manual, bukan engine fisika.

---

## 3. Struktur proyek yang bisa kamu pakai untuk meniru

```
game/
├─ index.html                 # splash #boot inline, #app, #overlay-root, error hooks
├─ tapak.webmanifest          # PWA: standalone, portrait, shortcuts, screenshots
├─ tapak-sw.js               # template SW + placeholder __TAPAK_SW_*__
├─ vite.config.ts            # + plugin sw yang menulis dist/game-sw.js
├─ public/                   # ikon, og-image, screenshot PWA, font
└─ src/
   ├─ main.ts                # mount, router data-screen, SW register, error hook
   ├─ dom.ts                 # factory el(tag, props, children)  ← pengganti framework
   ├─ screen.ts              # kontrak layar: { render(), mount(root), unmount() }
   ├─ state/
   │  ├─ store.ts            # get/set localStorage, namespace + versi
   │  └─ outbox.ts           # antrean offline: { v, device, batch }
   ├─ i18n/
   │  ├─ index.ts            # deteksi bahasa, lazy import tabel non-default
   │  └─ en.ts               # { "teks melayu": "english text" }
   ├─ ui/                    # overlay-sheet, sheet, panel, toasts, hud-icons, icons
   ├─ world/                 # lot-layout, collide, occlude, minimap, paint, door-state
   ├─ art/                   # chibi (SVG builder), buildings, ending-art, pool-art
   ├─ audio/                 # sfx + musik
   └─ screens/
      ├─ title.ts  setup.ts  brief.ts  daily.ts  explore.ts  ending.ts  leaderboard.ts
      └─ acts/act3.ts act4.ts act5.ts act12.ts (+ .css per act)
```

Kontrak layar yang cocok dengan pola ini:

```ts
export type Screen = {
  id: string;                              // dipakai di <div data-screen="...">
  mount(root: HTMLElement, ctx: Ctx): void;
  unmount?(): void;
};
// router: dynamic import per id
const mod = await import(`./screens/${id}.ts`);
mod.default.mount(root, ctx);
```

---

## 4. Resep implementasi (urutan yang masuk akal)

1. Scaffold Vite + TypeScript, `build.outDir = "dist-tapak"`, `build.rollupOptions.input = index.html`.
2. Tulis `src/dom.ts` berisi `el()` seperti pada §2.1. Jangan tambahkan framework; konsistensi cara membuat node lebih penting daripada abstraksi.
3. Buat `<div id="app">` + `<div id="overlay-root">`. Semua layar render ke `#app`; modal/sheet ke `#overlay-root`, supaya layar bisa di-`replaceChildren` tanpa membunuh overlay.
4. Router: `data-screen` + `import()` per layar. Pecah per bab (`acts/act3`, `act4`, …) supaya tiap bab punya `.js` + `.css` sendiri.
5. Renderer: DOM + inline SVG. Sediakan helper SVG (`path`, `g`, `defs`, `linearGradient`) yang mengembalikan elemen nyata. Animasi lewat CSS `@keyframes` + `transform`; pakai `requestAnimationFrame` hanya untuk yang butuh state (timer, parallax, hit-test).
6. State: satu modul `store` dengan key bernamespace `app.<domain>.<field>.v1`. Tulis migrasi versi dari awal.
7. Offline: pola outbox — tulis ke localStorage dulu, kirim batch saat `online`/`visibilitychange`, hapus hanya setelah server balas `success`.
8. i18n: bahasa default *inline* di kode; bahasa lain satu file tabel lazy. Terima bahwa chunk tabel bisa >2 MB, atau ganti ke key pendek + `Intl` bila ingin lebih kecil.
9. Backend minimal: 3 endpoint PHP (`news.php`, `stats.php`, `leaderboard.php`) dengan envelope `{success,data,error}`, validasi `Origin`, rate-limit, dan `no-store` untuk leaderboard.
10. SW: precache shell + aset ber-hash, `navigate` network-first 3 s, `/api/` jangan disentuh, update via pesan `SKIP_WAITING`.
11. Ukur: entry <250 KB, layar pertama <400 KB, total per-bab <600 KB. Rujukan: entry 203 KB, renderer syif 433 KB, katalog konten 610 KB.

---

## 5. Jebakan yang terlihat dari kode mereka

- **Tabel terjemahan 2 MB** dimuat penuh untuk semua non-Melayu. Kalau game-mu multibahasa serius, pakai key pendek per-namespace dan pecah per layar.
- **`getBoundingClientRect` di loop** (`14×` di renderer) memaksa layout sinkron; mereka menambal dengan rAF + reduced-motion. Alternatif: simpan posisi di model, bukan baca dari DOM.
- **`innerHTML` 13×** di renderer — pastikan semua interpolasi di-escape; jangan meniru pola ini untuk konten dari server (`news.php` mengembalikan data dinamis).
- **Skor dari klien**: leaderboard menerima skor hasil kalkulasi browser. Tanpa validasi server-side yang kuat, gampang dicurangi. Kalau targetmu kompetitif, hitung ulang di server.
- **localStorage 8,8 MB terpakai** di profil uji — dekat batas praktis; jangan menaruh aset/base64 di sana.
- **Precache 183 entri** berarti kunjungan pertama mengunduh hampir seluruh game. Itu wajar untuk PWA game, tapi bedakan mana yang precache dan mana yang on-demand.

---

## 6. Batasan analisis

- Semua kesimpulan frontend dari artefak terkirim (minified) + snapshot DOM pasif. REA tidak mengeksekusi JS.
- Tidak ada source map (`source_maps.status = not_requested`, tidak ada `//# sourceMappingURL` yang bisa diambil) → nama modul asli, struktur folder asli, dan pemakaian TypeScript hanya bisa diinferensi.
- Struktur tabel database, framework PHP (Laravel/native), dan mekanisme anti-cheat server **tidak teramati** dari klien.
- Analisa hanya pada origin `tapakrun.appcademy.app`; perilaku di kedalaman gameplay (mis. setelah klik "Mula") tidak diuji di sini — klaim renderer diverifikasi pada snapshot DOM yang memuat 1.407 node termasuk seluruh SVG art.

## 7. Perintah verifikasi ulang

```bash
# entry + chunk
curl -s https://tapakrun.appcademy.app/ | grep -E "script|modulepreload"
curl -s https://tapakrun.appcademy.app/assets/index-DJ7bmzLH.js -o idx.js
grep -o -E "react\.element|__vnode|__svelte|__vue__|createSignal" idx.js   # kosong
grep -o -E "getContext\(|OffscreenCanvas" assets/*.js                       # kosong
grep -o -E "function S\(e,t=\{\},n=\[\]\)" idx.js                           # factory DOM

# backend
curl -si https://tapakrun.appcademy.app/api/leaderboard.php | head -12
curl -si https://tapakrun.appcademy.app/api/stats.php                      # 405
curl -si -X POST https://tapakrun.appcademy.app/api/stats.php \           # 403 tanpa Origin
  -H 'Content-Type: application/json' -d '{"v":1}'

# PWA
curl -s https://tapakrun.appcademy.app/tapak.webmanifest
curl -s https://tapakrun.appcademy.app/tapak-sw.js | head -30
```

## 2. Ide awal Game
nah jadi saya rencana nya mau membuat game browser dengan nama "Menjadi Buzzer" dimana intinya berupa simulasi menjadi buzzer social media dan menghasilkan uang untuk membeli kustomisasi pakaian branded,asset properti seperti rumah,asset kendaraan mewah,atau saham,dan kita juga bisa keliling luar negeri dalam konteks di game nya keliling luar negeri maksud nya kita bisa nanti berarti kita bisa berfoto di icon" dunia untuk dibagikan ke user lain bahwa kita sudah achive bisa keliling luar negeri,namun dalam proses menjadi buzzer ini juga ada resiko nya kita juga dapat tertangkap atau ketauan sehingga ada hukuman penalti ataupun denda yang harus dibayar .untuk grafis nya kurang lebih sama seperti tapak.run.appacademy.app tadi,nah ini masih sketsa kasar ya yaitu:
1.menu pertama menampilkan karakter kita beserta sistem kustomisasi pakaian yang telah dibeli di shop beserta juga ada menu/button task di sisi atas nya ada juga menu/button untuk memilih negara di dunia mana yang akan kita terbang (tentunya harus sudah membeli tiket nya di menu shop sesuai negara nya misal mau terbang ke belanda ya berarti harus beli tiket belanda)
2.menu kedua menampilkan detail task yang harus dikerjakan kemudian didalam juga ada tab menu pelanggaran/penalti yang berisi sistem dari resiko menjadi buzzer terkait denda dan penalti apabila kita berlebihan dalam membuat postingan buzzer
3.menu ketiga berupa tampilan hanpdhone yang berisi aplikasi" social media yang bisa dibuka untuk proses menjadi buzzer nya seperti instagram,x,threads maupun youtube atau tiktok (ini contoh nyata untuk nama app di dalam game nya belum ada).
4.menu keempat berupa shop yang berisi toko untuk membeli pakaian,asset properti,asset kendaraan,tiket keliling dunia.
5.menu kelima berupa pasar saham disini kita bisa beli dan jual saham.

#### 2.2 Kembangan Ide oleh Claude AI
Idenya menarik karena punya tarikan klasik "serakah vs risiko" yang bikin pemain ketagihan. Ini pendapat saya, mulai dari yang paling penting.

**1. Inti gameplay ada di menu ketiga (handphone)**

Menu lain (shop, saham, kustomisasi, tiket) adalah *hadiah* dari bermain. Kalau bagian handphone membosankan, game ini jadi spreadsheet belanja. Jadi tanyakan dulu: apa yang sebenarnya dilakukan pemain di dalam app medsos? Beberapa opsi:
- Memilih caption, hashtag, dan jam posting dari beberapa pilihan, dengan hasil engagement yang dihitung dari aturan tersembunyi.
- Mini-game singkat, misalnya mengetik cepat atau menyusun urutan kata.
- Mengelola beberapa akun: lebih banyak akun berarti lebih banyak uang, tapi risiko ketahuan ikut naik.

**2. Beri risiko satu meter yang jelas**

Sekarang risikonya baru "bisa tertangkap". Lebih seru kalau ada meter terlihat (misalnya "Panas" atau "Dicurigai") yang naik setiap posting berlebihan, dan turun kalau pemain istirahat atau membayar sesuatu. Penaltinya sebaiknya bertingkat:
- Peringatan dan shadowban (penghasilan turun sementara).
- Denda uang.
- Akun diblokir.
- Kasus besar: aset disita dan tamat.

Dengan begitu pemain selalu menghitung "satu posting lagi atau berhenti?".

**3. Tentukan nada: satir, bukan panduan**

Tema buzzer cukup sensitif. Saya sarankan nada satir seperti *Papers, Please*, dengan konsekuensi nyata di dalam game. Beberapa pegangan praktis:
- Klien dan topik dibuat fiktif (produk, selebritas, calon fiktif), bukan partai, tokoh, atau kasus nyata.
- Nama app medsos dan merek "branded" memakai parodi, bukan nama asli (Instagram, X, Gucci, dan sejenisnya), supaya aman dari sisi merek dagang. Ini juga cocok dengan catatan Anda bahwa nama app belum ada.
- Karena ada tab pelanggaran dan penalti, game ini sudah punya dasar untuk pesan "kamu bisa kaya, tapi ada harganya". Akhir cerita yang beragam akan menguatkan itu (kaya raya, tertangkap, atau tobat).

**4. Fitur foto keliling dunia dibagi dua tahap**

Berbagi ke user lain butuh backend (database, akun, moderasi), dan itu bagian termahal dari proyek ini. Saran saya:
- **Tahap awal:** pemain berfoto dengan karakter di depan ikon landmark SVG, lalu hasilnya diunduh sebagai gambar atau dibagikan lewat share bawaan HP. Tanpa server.
- **Tahap lanjut:** galeri bersama atau leaderboard kalau game-nya sudah ramai.

**5. Pasar saham perlu dibatasi**

Saham simulasi cukup dibuat dengan harga naik-turun acak berbenih (seeded), beberapa emiten fiktif, grafik garis sederhana, dan event kecil (misalnya berita yang menggerakkan harga). Jangan dibuat serumit bursa asli di versi pertama.

**6. Urutan pembuatan (MVP)**

Dengan lima menu, risiko terbesarnya adalah scope yang kebesaran. Urutan yang aman:
1. Karakter + handphone + satu app + task + meter risiko.
2. Shop (pakaian dan satu kategori aset).
3. Penalti dan tab pelanggaran.
4. Saham.
5. Tiket dan foto keliling dunia.

Bagian 1 dan 3 itulah yang menentukan apakah game-nya seru. Kalau itu sudah enak dimainkan, sisanya tinggal menambah.

**7. Soal teknologi**

Pola TapakRun (UI berbasis DOM + SVG, tanpa Canvas) cocok untuk game ini karena isinya layar, daftar, dan tombol. Kustomisasi karakter bisa dibuat dari layer SVG yang ditumpuk (badan, baju, aksesori). Soal framework, vanilla maupun React sama-sama layak. Bedanya, banyak layar dengan state bersama (uang, inventori, saham, risiko) agak lebih mudah dikelola dengan komponen dan state yang rapi, jadi React + Vite tidak salah dipilih di sini. Save data cukup di localStorage dengan key berversi.

Dari semua poin di atas, bagian mana yang ingin dibahas dulu? Menurut saya yang paling menentukan adalah apa yang dilakukan pemain di dalam handphone, karena dari situ turunan menu lain akan lebih jelas.

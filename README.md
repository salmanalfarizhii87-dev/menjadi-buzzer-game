# Menjadi Buzzer

Browser game semi idle management simulation. Pemain mengelola akun media sosial fiktif yang
menghasilkan pendapatan pasif, meningkatkan output lewat automation, lalu mengambil kontrak
kampanye berisiko.

Status: **MVP playable prototype** — sedang dibangun bertahap. Lihat `development/plan-task-mvp.md`.

---

## Stack

| Lapisan | Teknologi |
|---|---|
| Bahasa | TypeScript (strict) |
| Build | Vite |
| UI | Vanilla DOM + inline SVG + CSS. **Tanpa framework UI** |
| State | Game store terpusat (typed) |
| Persistence | `localStorage` via satu persistence layer |
| Test | Vitest (unit/integration), Playwright (E2E) |

Tidak ada backend, login, cloud save, atau leaderboard di MVP.

---

## Perintah

```bash
npm install
npm run dev        # dev server
npm run build      # tsc -b && vite build
npm run preview    # preview hasil build
npm test           # unit + integration
npm run test:watch
npm run test:e2e   # Playwright
```

---

## Struktur

```text
index.html
public/                 favicon, aset statis
src/
  main.ts               entry point
  app/                  bootstrap, router, screen registry, error boundary
  core/                 dom, svg, ids, clock, money, result
  state/                types, store, selectors, actions, initial state
  domain/               income, upgrades, campaigns, risk, penalties, finance, minigames
  application/          use case (accrue income, purchase, accept, resolve)
  data/                 config balancing, seed campaign, upgrade, strategi, string
  persistence/          storage adapter, save schema, migration, backup
  screens/              satu folder per layar
  components/           layout, navigation, cards, buttons, modal, toast, indicators, icons
  art/                  SVG builder karakter dan ilustrasi
  styles/               tokens, reset, global, layout, motion
  tests/                helper test (fake clock, seeded rng, fixture)
```

### Aturan lapisan

- `domain/` tidak mengimpor DOM, CSS, atau screen.
- `application/` mengorkestrasi use case dan memanggil domain.
- `screens/` boleh mengimpor component, action, dan selector — tidak boleh menghitung formula.
- `components/` tidak memiliki aturan bisnis.
- `data/` menyimpan definisi statis, bukan state pemain.
- `persistence/` satu-satunya lapisan yang menyentuh `localStorage`.

---

## Aturan untuk agent

1. Baca `development/plan-task-mvp.md` sebelum mengerjakan task apa pun.
2. Jangan menambahkan React/Vue/Svelte/Angular/Solid atau state library eksternal.
3. Jangan memakai Canvas/WebGL untuk dashboard, karakter, atau mini-game MVP.
4. Jangan menaruh formula ekonomi/probabilitas di screen.
5. Jangan menulis `localStorage` dari luar `src/persistence/`.
6. Jangan memakai `innerHTML` untuk data dinamis.
7. Jangan mengarang angka balancing final — semua nilai di `src/data/config/`.
8. Jangan menyalin aset, logo, nama, atau identitas dari `ui-reference/`.
9. Jangan membangun fitur di luar scope MVP.
10. Setiap file domain yang berisi formula wajib punya unit test.

---

## Dokumen acuan

- `project-overview/brainstorm.md` — immutable
- `game-design/GDD-v1.0..v1.3`
- `project-requirements/PRD-Menjadi-Buzzer-v2.0.md` — **aktif**
- `project-requirements/PRD-Menjadi-Buzzer-v1.0.md` — arsip
- `technical-spec/Tech-Spec-Menjadi-Buzzer-v2.0.md` — **aktif**
- `technical-spec/Tech-Spec-Menjadi-Buzzer-v1.0.md` — arsip
- `ui-ux-design/` — design system, screen spec, ui flow
- `game-assets/assets-inventory.md`
- `development/plan-task-mvp.md` — plan eksekusi
- `development/ui-reference-audit.md` — hasil audit visual

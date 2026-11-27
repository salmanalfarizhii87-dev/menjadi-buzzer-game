---
name: "Menjadi Buzzer — Tactile Casual Idle"
description: "Warm, tactile 2D Indonesian casual idle-simulation design system combining wood-panelled HUD chrome, cream parchment cards, and glossy 3D pill buttons."
---

## Overview

Menjadi Buzzer is a semi-idle social media management and strategy game set in Indonesia. The interface adapts the warm, approachable **Tactile / Skeuomorphic Casual 2D** visual grammar of the reference UI: dark wood-grained HUD headers and bottom navigation bars, warm golden-amber canvas backdrops, crisp cream-parchment cards with warm brown borders, and chunky 3D-bevelled glossy action buttons.

All visual assets, icons, and copy are original to **Menjadi Buzzer**—depicting a cozy-chaotic Indonesian buzzer desk, Chirper social feeds, automation rigs, and campaign dossiers—while preserving the reference's high-legibility hierarchy, glanceable currency/rate pills, and low-friction 5-tab navigation.

## Colors

The palette pairs a vibrant **Emerald Action Green** (`primary`) for primary CTAs and positive income/success states with a rich **Nusantara Wood Brown** (`secondary`) for HUD bars, card borders, and structural framing, and **Warm Amber Gold** (`tertiary` / `amber-gold`) for coins, followers, and progression highlights.

- **Primary:** Glossy action green for "Upgrade", "Accept Contract", and "Claim/Start" CTAs.
- **Secondary:** Rich wood and leather tones for top HUD bars, bottom navigation, and card outlines.
- **Tertiary / Amber Gold:** Coins, income-per-second pills, level badges, and progress bars.
- **Semantic Status:** Green (`success`) for Normal/Success, Amber (`warning`) for Warning/Medium Risk, Red (`error`) for Restricted/High Risk/Failure.

```yaml
colors:
  wood-bar: "#5C341A"
  wood-light: "#6E3F21"
  wood-mid: "#4A2812"
  wood-dark: "#3A2010"
  wood-shadow: "#241005"
  cork-board: "#C88A4B"
  amber-canvas: "#F7CE7D"
  amber-gold: "#F5A623"
  gold-bright: "#FDE047"
  gold-deep: "#D97706"
  parchment: "#FFFBF2"
  parchment-border: "#C0835A"
  success: "#1F7A26"
  on-success: "#FFFFFF"
  warning: "#B56100"
  on-warning: "#060606"
  info: "#1D6FA5"
  on-info: "#FFFFFF"
  hud-cyan: "#28B8E8"
  hud-cyan-dark: "#0E7DB0"
  hud-purple: "#6B3FA0"
  hud-purple-dark: "#452273"
  dock-bg: "#EDF2F7"
  ink-dark: "#1E1B2E"
  btn-red: "#E53935"
  btn-red-dark: "#B71C1C"
  btn-orange: "#FB8C00"
  btn-orange-dark: "#D85000"
  btn-blue: "#039BE5"
  btn-blue-dark: "#01579B"
  btn-yellow: "#FDD835"
  btn-yellow-dark: "#F59E0B"
  btn-purple: "#8E24AA"
  btn-purple-dark: "#4A148C"
  btn-green: "#2EAD39"
  btn-green-dark: "#16681D"
  light:
    primary: "#006013"
    on-primary: "#FFFFFF"
    primary-container: "#1F7A26"
    on-primary-container: "#ADFFA2"
    secondary: "#86522D"
    on-secondary: "#FFFFFF"
    secondary-container: "#FFBA8E"
    on-secondary-container: "#4F2504"
    tertiary: "#7D4200"
    on-tertiary: "#FFFFFF"
    tertiary-container: "#FFE6D5"
    on-tertiary-container: "#4D2600"
    error: "#BA1A1A"
    on-error: "#FFFFFF"
    error-container: "#FFDAD6"
    on-error-container: "#93000A"
    background: "#F7CE7D"
    on-background: "#2F1502"
    surface: "#FFFBF2"
    surface-dim: "#FFE3D2"
    surface-bright: "#FFFFFF"
    surface-container-lowest: "#FFFFFF"
    surface-container-low: "#FFF8F0"
    surface-container: "#FFF1EA"
    surface-container-high: "#FFEADE"
    surface-container-highest: "#FFDCC6"
    on-surface: "#2F1502"
    surface-variant: "#DBE6D4"
    on-surface-variant: "#40493D"
    outline: "#707A6B"
    outline-variant: "#C0835A"
    inverse-surface: "#482911"
    inverse-on-surface: "#FFEDE4"
    inverse-primary: "#81DB7A"
    shadow: "#000000"
    scrim: "#000000"
  dark:
    primary: "#81DB7A"
    on-primary: "#003908"
    primary-container: "#1F7A26"
    on-primary-container: "#ADFFA2"
    secondary: "#FCB78A"
    on-secondary: "#4F2504"
    secondary-container: "#6D3D1A"
    on-secondary-container: "#EDAA7E"
    tertiary: "#FFB77D"
    on-tertiary: "#4D2600"
    tertiary-container: "#A15600"
    on-tertiary-container: "#FFE6D5"
    error: "#FFB4AB"
    on-error: "#690005"
    error-container: "#93000A"
    on-error-container: "#FFDAD6"
    background: "#240D00"
    on-background: "#FFDCC6"
    surface: "#2F1502"
    surface-dim: "#240D00"
    surface-bright: "#523119"
    surface-container-lowest: "#1C0900"
    surface-container-low: "#2F1502"
    surface-container: "#341904"
    surface-container-high: "#40230B"
    surface-container-highest: "#4D2D15"
    on-surface: "#FFDCC6"
    surface-variant: "#40493D"
    on-surface-variant: "#BFCAB9"
    outline: "#899484"
    outline-variant: "#623F25"
    inverse-surface: "#FFDCC6"
    inverse-on-surface: "#482911"
    inverse-primary: "#0C6E1B"
    shadow: "#000000"
    scrim: "#000000"
```

## Typography

**Fredoka** delivers rounded, friendly, bold game display headers and button labels. **Spline Sans** handles all functional body copy, descriptions, and stat labels with high legibility on mobile screens. **DM Mono** formats currency tickers, income rates (`+Rp 120/dtk`), and probabilities with `tabular-nums`.

```yaml
typography:
  display-lg:
    fontFamily: "Fredoka"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 42px
    letterSpacing: -0.25px
  display-lg-mobile:
    fontFamily: "Fredoka"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 34px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: "Fredoka"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 30px
    letterSpacing: 0px
  headline-md:
    fontFamily: "Fredoka"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: 0px
  title-md:
    fontFamily: "Fredoka"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: 0px
  body-md:
    fontFamily: "Spline Sans"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
  body-sm:
    fontFamily: "Spline Sans"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.1px
  label-lg:
    fontFamily: "Fredoka"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.1px
  label-sm:
    fontFamily: "Spline Sans"
    fontSize: 11px
    fontWeight: 700
    lineHeight: 14px
    letterSpacing: 0.2px
  mono-md:
    fontFamily: "DM Mono"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 0px
```

## Layout & Spacing

Mobile-first portrait game frame (`390px` width) with a persistent wood-toned top HUD bar (`Home` shows avatar, handle, balance pill, and rate; sub-screens show back button, screen title, and balance pill) and a persistent 5-tab bottom navigation bar (`Home`, `Akun`, `Upgrade`, `Kampanye`, `Keuangan`). Uses a strict `4px` / `8px` spacing scale so cards, badges, and buttons align cleanly without overflow.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 12px
  gutter-lg: 16px
  gutter-xl: 24px
  section: 20px
  page-margin: 14px
```

## Elevation & Depth

Tactile 2D depth achieved through **crisp 2px warm-brown borders** (`border-light-outline-variant`) paired with **solid bottom-lip drop shadows** (`shadow-[0_3px_0_#7A4824]` on parchment cards, `shadow-[0_4px_0_#003908]` on primary green buttons) rather than soft diffused SaaS blurs. No glassmorphism or backdrop-blur.

## Shapes

Generous rounded corners for friendly casual-game ergonomics: `16px` (`lg`) for main parchment cards, `14px` (`md`) for chunky action buttons and HUD pills, and `9999px` (`full`) for stat badges, progress bars, and avatar frames.

```yaml
rounded:
  sm: 6px
  DEFAULT: 10px
  md: 14px
  lg: 18px
  xl: 24px
  full: 9999px
```

## Motion & Micro-interaction

Snappy, springy tactile feedback: buttons depress `2px` on active press (`active:translate-y-[2px]`) and snap back in `100ms`. Progress bars and coin counters update smoothly without layout shifts. Honour `prefers-reduced-motion`.

```yaml
motion:
  button-press:
    duration: 100ms
    delay: 0ms
    timingFunction: ease-out
  card-enter:
    duration: 220ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
```

## Voice & Content Strategy

- **Tone of voice:** Casual, witty, Indonesian-first ("kamu", "akun kamu", "cuan"), clear and direct about risks and rewards. No corporate jargon.
- **Capitalisation:** Title Case for screen headers, card titles, and primary button labels; Sentence case for descriptions, tips, and status explanations.
- **Terminology:** Consistent terms from the PRD: `Saldo`, `Income/dtk`, `Followers`, `Performance`, `Suspicion`, `Reputation`, `Automation`, `Kampanye`, `Risiko`.
- **Numbers:** Indonesian Rupiah formatting (`Rp 500`, `Rp 1,2rb`, `Rp 25/dtk`) with `tabular-nums`.

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Badge** → `@components/badge.html` — `badge-numeric`, `badge-dot`
- **Button** → `@components/button.html` — `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html` — `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
- **Tabs** → `@components/tabs.html` — `tabs-horizontal`, `tabs-with-icon`

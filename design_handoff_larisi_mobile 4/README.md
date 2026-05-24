# Handoff — Larisi Mobile Dashboard

> 📋 **Mau cepat mulai?** Buka `PROMPTS.md` di folder ini — sudah ada prompt siap copy-paste untuk tiap tahap (audit, setup tokens, build per screen, troubleshooting).

## Overview

Mobile **web** version of the **Larisi** web dashboard (an Indonesian hyperlocal advertising tool for small businesses). This handoff covers the mobile redesign of three core sections plus alternative flows for the main "Dapur Konten" creation flow.

**Target:** responsive mobile web (not a native app). The same Larisi web app rendered for phone-sized viewports (mobile breakpoint of the existing web stack — Next.js / React / Vue / etc.). No app-store distribution.

Key sections:
- **Dapur Konten** (Content Kitchen) — create an ad: assets, audience, map, AI message, preview
- **Kelola Iklan** (Manage Ads) — list of running ads with engagement metrics + SiLaris AI chat
- **Performa Iklan** (Ad Performance) — analytics + local pulse insights + tools/competitor analysis

Total: **13 mobile screens** organized into 4 sections in the design canvas.

---

## About the Design Files

The files in this bundle (`.html`, `.jsx`) are **design references created in HTML/React for in-browser preview only**. They are NOT production code — they use unpinned CDN React + Babel-standalone, a custom layout-canvas component, and inline SVG/styles purely to visualize the design.

**Your task:** recreate these designs as the **mobile breakpoint** of the existing Larisi web app, using the codebase's current stack (likely Next.js / React or Vue based on what's already there). Apply the codebase's existing component library, design tokens, and routing patterns. The HTML files are the **visual contract**, not the implementation.

These are **not** native iOS/Android designs — the iPhone status bar at the top of each artboard is just a presentation device for the mockup. In production this is a regular responsive web page rendered in a mobile browser; the actual status bar is the device's own browser chrome.

---

## Fidelity

**High-fidelity.** All screens have final colors, typography, spacing, iconography, and interaction states defined. Recreate pixel-perfectly using exact tokens listed below. The only placeholders are:
- Photo content in cards (use real uploads in production — striped gradient placeholders mark spots labelled `product photo`)
- Map tiles (use Mapbox / Google Maps / Leaflet in production — the SVG is illustrative only)
- Indonesian copy is final and should ship as-is unless localized

---

## Design Tokens

All colors, type, radii, and spacing used across screens. Use these as the foundation of the mobile design system.

### Colors

```
// Brand
BRAND          #6B5BFF   // primary purple (logo, links, focus states, primary CTA in chat)
BRAND_SOFT     #EFECFF   // tinted purple background for active chips/badges
BRAND_GRAD     linear-gradient(135deg, #6B5BFF 0%, #8C7BFF 100%)  // logo tile
BRAND_DEEP     linear-gradient(135deg, #6B5BFF 0%, #4A3FCC 100%)  // hero card, floating AI button

// Ink (text & primary CTAs)
INK            #0E0E12   // primary text, primary CTA background
INK_SUB        #6B6B73   // secondary text, icons-default

// Surface
BG             #F5F5F7   // app canvas background
CARD           #FFFFFF   // card background
LINE           #ECECF1   // hairline borders, dividers

// Semantic
GREEN          #1A8F4F   // status "Berjalan", positive deltas, GRATIS badge
GREEN_SOFT     #E3FCEC   // background for green pills
ORANGE         #E89B3C   // stat-card accent "Performa Konten"
BLUE           #3B82F6   // stat-card accent "Iklan Berbayar"
WARN_BG        #FFF9EC   // "Artinya untuk bisnismu" box bg
WARN_BORDER    #FCE9B8
WARN_TEXT      #A8761A
DANGER_BG      #FEEFEF   // "Yang bisa dilakukan sekarang" box bg
DANGER_BORDER  #F6CFCF
DANGER_TEXT    #A8341A

// Brand 3rd-party (used in platform pills only)
INSTAGRAM      linear-gradient(135deg,#E1306C,#F77737)
FACEBOOK       #1877F2
TIKTOK         #0E0E12
```

### Typography

**Font family:** Inter (Google Fonts) — weights 400 / 500 / 600 / 700 / 800.

```
Display XL (page hero)      32px / 700 / -0.025em   line-height 1.1
Display L  (page title)     28px / 700 / -0.02em    line-height 1.15
H1         (page header)    26px / 700 / -0.02em
H2         (section title)  18px / 700
H3         (card title)     15px / 700
Body L                      14px / 500
Body M                      13px / 500   (default body)
Body S                      12px / 500
Caption                     11px / 500   (subtext, descriptions)
Micro                       10px / 600   (metadata, timestamps)
Eyebrow                     9–10px / 700 / letter-spacing 0.06–0.08em (UPPERCASE labels)
Big stat                    22–30px / 700 / -0.02em
```

All text uses `-webkit-font-smoothing: antialiased`. Numerals use Inter's default proportional figures.

### Spacing

8-point base scale. Common values:
```
4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 28, 32
```
- Screen edge padding: **20px**
- Card padding: **14–18px**
- Stack gap between cards: **10–14px**
- Form row vertical padding: **12–14px**

### Radii

```
Circle  9999    avatars, pills, toggles, status dots
Large    20     primary card, hero
Medium   16–18  secondary cards
Small    10–14  inputs, chips, list items
XS        6–8   stat-card top accent
```

### Shadows

```
Card (rest)        none — rely on border only
Card (elevated)    0 4px 14px -6px rgba(107,91,255,.25)
Floating action    0 14px 30px -8px rgba(107,91,255,.55)
Sticky bar         0 10px 30px -10px rgba(15,15,30,.15)
Logo tile          0 6px 18px -8px rgba(107,91,255,.6)
```

### Borders

Default border: `1px solid #ECECF1`.
Selected state: `2px solid #6B5BFF`.
Dashed (upload zones): `1.5px dashed #D7D7DE`.

---

## Iconography

All icons are **inline SVG, 1.6 stroke, round caps & joins**, no fill (unless marked solid). Standard sizes: 14 / 16 / 18 / 20 / 22 px. In production, use **Lucide** or **Heroicons (outline)** — they match this style exactly.

Icon→Lucide mapping:
| Used as | Lucide name |
|---|---|
| bell | `Bell` |
| search | `Search` |
| plus | `Plus` |
| upload | `Upload` |
| user | `User` |
| pin | `MapPin` |
| sparkle | `Sparkles` |
| chevron | `ChevronRight` |
| chevDown | `ChevronDown` |
| play | `Play` (filled) |
| home | `Home` |
| grid | `LayoutGrid` |
| chat | `MessageSquare` |
| chart / bars | `BarChart3` |
| ig | `Instagram` |
| trash | `Trash2` |
| more | `MoreHorizontal` |
| filter | `SlidersHorizontal` |
| cog | `Settings` |
| info | `Info` |
| refresh | `RefreshCw` |
| send | `Send` (filled) |
| close | `X` |
| heart | `Heart` |
| image | `Image` |
| camera | `Camera` |
| clock | `Clock` |
| cal | `Calendar` |
| film | `Film` |
| rocket | (custom — Lucide `Rocket` is fine) |
| zoom | `ZoomIn` or `SearchPlus` |
| bolt | `Zap` |
| bookmark | `Bookmark` |
| target | `Target` |

---

## Logo

The "L" tile is a square (`28%` corner radius) with `BRAND_GRAD`, white bold "L" letter at ~50% of tile height, weight 800, letter-spacing `-0.04em`. Standard sizes: 32, 34, 36 px. Always paired with the `boxShadow` listed above.

---

## Bottom navigation

Mobile uses a **3-tab bottom nav** (78px tall, 22px bottom-safe padding). Tabs:

| Index | Label    | Icon (Lucide)     | Route             |
|-------|----------|-------------------|-------------------|
| 0     | Dapur    | `LayoutGrid`      | `/dapur-konten`   |
| 1     | Kelola   | (list icon)       | `/kelola-iklan`   |
| 2     | Performa | `BarChart3`       | `/performa-iklan` |

Active tab: text + icon in `BRAND`. Inactive: `INK_SUB`. No Beranda tab in production.

### Which screens show the bottom nav?

| Screen | Bottom nav | Notes |
|---|---|---|
| 01 Beranda *(optional)* | Yes (no tab active) | Hub-style landing |
| **02 Dapur Konten** | **Yes** (tab 0 active) | Landing of Dapur tab; **CTABar floats above nav** |
| **03 AI + Preview** | **Yes** (tab 0 active) | Same Dapur flow page; CTABar above nav |
| 04 Kelola Iklan | Yes (tab 1 active) | Landing of Kelola tab |
| 05 Detail Iklan | **No** — sub-page | Back button + sticky action bar |
| 06 Chat SiLaris | **No** — sub-page | Back button + input bar |
| **07 Performa Insight** | **Yes** (tab 2 active) | Landing of Performa tab |
| **08 Performa Local Pulse** | **Yes** (tab 2 active) | Top-tabs inside Performa |
| **09 Performa Tools** | **Yes** (tab 2 active) | Top-tabs inside Performa |
| ⛔ Wizard A1/A2/A3, Compact B | n/a | **NOT shipping** — design exploration only |

### CTABar stacking pattern (Dapur Konten flow)

Screens 02 and 03 have a **primary action card (CTABar)** that needs to stay visible while user fills out the form. The bottom nav also needs to stay visible. They stack:

```
┌───────────────────────────┐
│                           │
│       SCROLL AREA         │  ← padding-bottom 200px
│                           │
├───────────────────────────┤
│ 💡 Estimasi  [▶ Tayangkan]│  ← CTABar, floating, bottom: 78px
├───────────────────────────┤
│  📦 Dapur  📋 Kelola  📊 Performa │  ← Bottom nav, bottom: 0
└───────────────────────────┘
```

- **CTABar** sits absolutely at `bottom: 78px` (above the nav), with `pointer-events: none` on the wrapper and `pointer-events: auto` on the card itself so the gradient-fade above doesn't block scrolling.
- **Bottom nav** sits absolutely at `bottom: 0`.
- **Scroll area** padding-bottom = 200px (clears both layers + breathing room).

When user changes tab, the form draft auto-saves so they can return without losing progress.

## Layout Foundation

Every phone artboard is **390 × 844** (iPhone 14 base). Status bar (`9:41 + signal/wifi/battery`) is 50px tall, status icons in solid black `#0E0E12`. App content starts at y=50.

Bottom safe-area: **28px** below the last interactive element on screens that don't have a bottom nav. Bottom nav itself is 78px tall with 22px bottom padding for the home-indicator safe zone.

---

## Screens

### Section 1 — Dapur Konten (main flow)

> ⚠️ **Note on Beranda (01)**: This screen is **mobile-only — the desktop app has no equivalent**. Sidebar navigation plays that role on desktop. For initial mobile parity, **skip Beranda**; land users directly on whatever the desktop's default route is (likely Dapur Konten or Kelola Iklan). Add Beranda later if user-research shows the need for a mobile hub.

#### 01 · Beranda (`ScreenHome`) — OPTIONAL / mobile-only
Purpose: app home — quick stats + recent ads list + CTA into the create flow.
- **AppHeader**: logo + "Halo, Nila PRO" + bell with red dot + black avatar.
- **Hero card** (gradient `BRAND_DEEP`, radius 22, padding 22, white text, 2 decorative blurred circles): eyebrow "Mulai iklan baru" / title "Buka Dapur Konten buat iklan dalam menit" / white pill button "+ Iklan Baru".
- **Stats grid 2×2** — 4 cards (radius 16, border): `Iklan Aktif 3` (purple), `Jangkauan 12.4k` (ink), `Klik 892 ↑18%` (green), `Aset 24` (ink). Sub-line caption.
- **"Iklan Terakhir"** header + "Semua →" link.
- **Recent ads list** — 3 rows, each: 44×44 thumbnail tile (BRAND_SOFT bg with image icon) + title + dot+status+reach + chevron.
- **Bottom nav** (active: "Dapur"): Beranda / Dapur / Pesan / Insight.

#### 02 · Dapur Konten (`ScreenDapur`)
Purpose: assemble assets, pick audience, set radius.
- **AppHeader** + **PageTitle** ("Dapur Konten" + subtitle).
- **StepRow** (horizontal scroll, 4 pills): `Aset` / `Audiens` (active, INK pill) / `AI` / `Preview`. Each pill has a small number-badge circle that turns green-check for completed, BRAND for active.
- **AsetCard**: icon-tile + title "Aset Kreatif" + subtitle. Dashed upload zone with striped diagonal pattern (`repeating-linear-gradient(135deg, #FAFAFC 0 8px, #F4F4F7 8px 16px)`) — center: 44×44 white tile w/ upload icon + label "Unggah Foto/Video" + caption. Below: row of 5 square thumbnails (first is "+" button in BRAND_SOFT).
- **AudiensCard**: title + sub + 2 rows separated by hairline. Each row: 32px icon-tile + title + 2-line description + iOS-style toggle (BRAND when on, #E2E2E8 when off).
- **MapCard**: header row (pin icon-tile + "Titik Target Iklan" + "Sumbersari, Bantul · 1.0 km" + cog button), 180px map illustration (custom SVG roads + blocks + greens + purple radius circle), zoom +/− pill top-right of map. Below map: radius slider with current value in BRAND.
- **CTABar** (absolutely positioned bottom, gradient fade): white card with shadow, left: "Estimasi Jangkauan / 0 warga · Sumbersari", right: black "▶ Tayangkan" button.

#### 03 · AI + Preview (`ScreenAI`)
- Same header + title + step row (active=AI/2).
- **AICard**: title + sub + "Posting ke" row with Instagram pill dropdown + 2 sliders (Terang-Gelap, Ketajaman Warna — full INK fill at 100%) + "Pesan dioptimalkan AI" + "📷 INSTAGRAM" purple eyebrow + grey readonly textarea + black "Generate ulang" button.
- **Social accounts card**: 52px avatar pill with IG gradient ring, small white IG-badge bottom-right; dashed "+" circle to add account; helper text.
- **PreviewCard**: title + IG Story label + segmented `Post / Reel / Story` (active = INK fill). Black phone mockup 280px tall: thin progress bar (35%), header (gradient circle avatar + "tesakuniarisi" + "2m" + close), 170px image placeholder, bottom input "Kirim pesan" with heart + send icons.
- Budget hint: BRAND_SOFT card with sparkle icon + "Atur Budget Lebih Pintar" + caption.
- **CTABar** same as screen 02.

### Section 2 — Dapur Konten · Alternatif Sederhana

> ⛔ **REMOVED — not shipping.** During design exploration two alternative flows (Alt A wizard, Alt B compact list) were prototyped but rejected. The shipping Dapur Konten flow is **Section 1** only (screens 02 and 03). The alternative source files and screenshots have been removed from this handoff to avoid confusion.

### Section 3 — Kelola Iklan

#### 04 · Kelola Iklan (`ScreenKelola`)
- **KHeader**: logo + search/bell/avatar + 24px title "Kelola Iklan" + subtitle.
- **KFilterBar**: segmented pill bar (`Semua` active=BRAND fill, `Berjalan`, `Diarsipkan`) + filter icon button.
- **KAdCard** list (3 cards, gap 14). Each card:
  - Top row: 36px IG-ring avatar with small IG badge, title (with optional `REEL` tag pill), handle, **green "● Berjalan" pill**, more-dots button.
  - Date in BRAND 11/600.
  - **KThumb** — 180px gradient placeholder (3 tone variants: amber, indigo, sage) with diagonal stripe pattern + decorative shapes + small `product photo` monospace label bottom-left.
  - "ENGAGEMENTS" eyebrow (purple) + total count (18/700 purple).
  - 4 metric rows: Reactions / Comments / Shares / Views — label left, count right.
  - "Reach" row with green up-triangle and 3px BRAND progress bar.
  - Black full-width "🚀 Boost" button.
- **KFloatingAI**: 56px circular gradient button bottom-right with sparkle icon and white badge dot.
- **KBottomNav** (active: "Kelola").

#### 05 · Detail Iklan (`ScreenDetail`)
- Top bar: back + center title "Detail Iklan" + more.
- Hero card (radius 18): avatar + title with REEL tag + handle/date + green "Berjalan" pill → KThumb (indigo).
- **Metric tiles grid 2×2** (6 tiles total): `Engagements 223` (big, BRAND) + `Reach 109 ↑18%` (big, BRAND) → `Views 114`, `Reactions 0`, `Comments 0`, `Shares 0`. Tile = card with eyebrow + 18–22px value + caption.
- **Mini chart card**: title + "+62%" purple delta + 80px area chart (purple gradient fill + 2px stroke + circle endpoint) + 7-day labels.
- **SiLaris insight card** (`linear-gradient(135deg, #EFECFF 0%, #F6F2FF 100%)` bg, BRAND-tinted border): white tile w/ sparkle + "INSIGHT SiLARIS" eyebrow + paragraph "Coba **Boost +5km** untuk gandakan jangkauan" + purple pill button "Tanya SiLaris →".
- Sticky bottom: 2 buttons side-by-side — white outline "⏸ Jeda" (flex 1) + INK "🚀 Boost Iklan" (flex 2).

#### 06 · Chat SiLaris (`ScreenSiLaris`)
- Header bar with hairline: back + 38px purple-soft tile with sparkle + "SiLaris" name with green online dot + "Asisten cerdas · online" + more.
- Messages list, gap 14:
  - AI bubble: 28px avatar at end + white card border with asymmetric radius `16 16 16 4` (rounded except bottom-left).
  - Attached-ad chip (also from AI): 38px gradient tile + ad title + reach stats + small purple "Pilih" pill.
  - User bubble: aligned right, BRAND fill, white text, radius `16 16 4 16`, timestamp below right-aligned.
  - AI long answer with 3 numbered tips (numbers in BRAND_SOFT 18px circles).
  - Suggestion chips: 7×12 padding, 99 radius, white bg, 1px BRAND border, BRAND text.
- Input bar (sticky bottom, white): 38px outline "+" button + grey pill input "Ketik pesan ke SiLaris…" + 38px BRAND send button.

### Section 4 — Performa Iklan

#### 07 · Insight (`ScreenPerforma`)
- **PHeader**: standard + "Diperbarui baru saja" status row (green dot + "Refresh" link in BRAND).
- **PTabs** (top tabs, INK fill on active): `Insight` / `Local Pulse` / `Tools`.
- **Stat cards grid 2×2**, each card has a 3px coloured top border accent: TOTAL REACH (BRAND), IKLAN BERJALAN (GREEN), PERFORMA KONTEN (ORANGE), IKLAN BERBAYAR (BLUE). Body: eyebrow + info icon, big number, caption.
- **SiLarisCard**: standard card layout with header tile, long analysis paragraph, then 2 inline insight boxes (`WARN` bg "ARTINYA UNTUK BISNISMU", `DANGER` bg "YANG BISA DILAKUKAN SEKARANG"), dashed grey tip card, black CTA "🚀 Buat Iklan Baru Sekarang".
- **MoodCard**: title row → grid 2×2 emoji cards (BG bg + LINE border, 28px emoji, em-dash for empty data, label below). Italic note at bottom in BRAND_SOFT.
- **PlatformCard**: 3 platform rows. Used (Instagram = full opacity, BRAND count "2 iklan"). Unused (FB/TikTok = opacity 0.55, "belum dipakai"). 32px square brand tile with letter.
- **Iklan Terbaik card**: gold trophy tile + title + body text mentioning "Kelola Iklan" in BRAND.

#### 08 · Local Pulse (`ScreenLocalPulse`)
- Header + tabs (active: "Local Pulse").
- **Local Pulse card**: title + LOKAL purple pill. Rows of `PulseRow` components — 36px white-on-grey icon tile + 9px eyebrow label + 15px value (highlighted variant wraps value in quotes with BRAND colour for "Sugeng rawuh") + sub text. Special yellow tip card between sapaan and format rows.
- Stitching Text section (separated by top hairline): eyebrow + body + italic note in grey card.
- **EmptyRecState card**: title + 48px centered tile + "Butuh minimal 5 iklan" + 5 checkbox dots showing progress 2/5.
- Two CTAs stacked: INK "🚀 Buat Iklan Sekarang →" + outline "Lihat Iklan Aktif →".

#### 09 · Tools & Competitor (`ScreenTools`)
- Header + tabs (active: "Tools").
- **Competitor Analysis card**: title + GREEN GRATIS pill → platform segmented tabs (white pill on active in BG track) → input row (grey BG with placeholder + BRAND "Analisa →" button) → BRAND_SOFT upgrade hint with zap icon + "Lihat paket →" link → footer disclaimer micro-text.
- **Strategi Tersimpan accordion**: 32px tile + title + BRAND count badge "1" + chevron (rotates when open). When open: BG card with 4px vertical BRAND accent bar + eyebrow "BANTUL · MINGGU" + title + body + 2 buttons "Terapkan" (BRAND) / "Edit" (outline).
- INK CTA at bottom.

---

## Interactions & Behavior

### Navigation
- **Bottom nav** is persistent on the 3 top-level screens (Dapur / Kelola / Performa). Sub-pages (wizard, detail, chat) hide it and use a back arrow instead.
- **Tabs** (Insight / Local Pulse / Tools) switch top-tabs in place, no animation — content is independent per tab.
- **Detail screens** push from list views; back arrow pops.

### State that must be wired up

For each screen with form-like behavior:

**Dapur Konten flow:**
- `assets: File[]` (max 5 photos OR 1 video)
- `audience: { type: 'warga' | 'pengunjung'; on: boolean }[]`
- `location: { lat, lng, label, radiusKm }` — radius slider 0.1–10 km
- `imageTuning: { brightness: 0–100, saturation: 0–100 }` (default 100 each)
- `aiMessage: string` (loading | ready | edited)
- `platform: 'instagram' | 'facebook' | 'tiktok'`
- `previewMode: 'post' | 'reel' | 'story'`
- `estimatedReach: number` (computed from audience × location × radius)

**Kelola Iklan:**
- `filter: 'semua' | 'berjalan' | 'diarsipkan'`
- `ads: Ad[]` with `{ id, title, handle, status, postedAt, thumbnail, metrics: { reactions, comments, shares, views, reach } }`

**Chat SiLaris:**
- `messages: Message[]` with role ai/user, content, attachments (ad chip), tips array
- Suggestion chips fire pre-fab queries.

**Performa Iklan:**
- `stats: { totalReach, runningAds, contentPerformance, paidAds }` polled every 15 min.
- `mood: { love, like, haha, wow }` (numbers, can be null for "—").
- `platforms: { instagram, facebook, tiktok }` with `{ count, used, engagementRate }`.
- `localPulse: { bestHourRange, bestDay, bestGreeting, bestFormat }`.

### Animations & transitions
- Toggle: 200ms ease, dot slides 14px.
- Tab switch: instant (no animation per spec).
- Accordion (Strategi Tersimpan): chevron rotates 180° in 200ms.
- Sticky CTA bar: rises from bottom with backdrop gradient fade — already part of layout, no entry animation needed.
- Floating AI button: subtle 4-second pulse loop (scale 1 → 1.05) acceptable.
- Loading states: skeleton bars in card shape, 1.5s shimmer.

### Responsive behavior
Designs target **390×844** baseline (iPhone 14 viewport in mobile browser). Implement as the **mobile breakpoint** (max-width ~480px) of the responsive web app.
- 320–360px (small Android): reduce screen padding from 20→ 16px; bottom nav height stays 78px; stat-cards may need to shrink number from 26→22px; ensure all 44px tap targets still fit.
- 360–430px (typical mobile): designs render as-is, full-width.
- 430px (iPhone Pro Max): cap content width at 430px and center; backgrounds extend full-bleed.
- ≥768px tablet / desktop: switch to existing desktop layout. The mobile bottom nav should hide; sidebar / top-nav of the desktop layout takes over.

### Accessibility
- Minimum tap target: 44×44 px. All buttons meet this; icon-only buttons use 36×36 visual + invisible 44×44 hit area.
- Text contrast: INK on BG = 16:1, INK_SUB on BG ≈ 5:1 — passes WCAG AA for body text.
- Focus rings: 2px BRAND outline at 2px offset on keyboard focus.
- Screen-reader labels: bell button = "Notifikasi", search = "Cari", more-dots = "Opsi lainnya", floating AI = "Buka SiLaris asisten".
- All emoji that convey state (mood card, status icons) need `aria-label` companions ("Love", "Like", etc.).

---

## Assets

- **Fonts**: Inter from Google Fonts.
- **Icons**: Lucide React (or platform equivalent).
- **Maps**: replace SVG placeholder with Mapbox GL, Google Maps, or Leaflet.
- **Photos**: striped placeholders are stand-ins — production uses user-uploaded photos. Show a similar dashed-zone for empty states.
- **Logo**: rebuild the "L" tile in code — it's just CSS + a letter, no asset file needed.

---

## Files in this bundle

- `Mobile Dashboard.html` — the design-canvas host (open in a browser to see all screens side-by-side).
- `design-canvas.jsx` — pan/zoom canvas host (development-only; not for production).
- `screens/dapur-konten.jsx` — Section 1 screens 01–03.
- `screens/dapur-alt.jsx` — ⛔ Section 2 alternatives (NOT shipping, reference only).
- `screens/kelola-iklan.jsx` — Section 3 screens 04–06.
- `screens/performa-iklan.jsx` — Section 4 screens 07–09.
- `screenshots/` — PNG screenshot of every screen, named to match the screen ID. Use with vision-enabled LLMs (Claude Code with image inputs) for pixel reference.
  - `01-beranda.png`, `02-dapur-konten.png`, `03-ai-preview.png` — Section 1 (main flow)
  - `04-kelola-iklan.png`, `05-detail-iklan.png`, `06-chat-silaris.png` — Section 3
  - `07-performa-insight.png`, `08-performa-local-pulse.png`, `09-performa-tools.png` — Section 4

---

## Implementation order (recommended)

1. Set up design tokens (colors, type, spacing) in your codebase's theme system.
2. Build atom components: `Logo`, `Card`, `Pill`, `IconButton`, `Toggle`, `StatCard`, `MetricRow`, `AdCard`.
3. Build layout shells: `Phone` (status bar + safe areas), `AppHeader`, `BottomNav`, `StickyCTA`.
4. Build the **Beranda (01)** screen first — it exercises most atoms.
5. Build **Kelola Iklan (04)** — proves the ad-card metric layout that's reused in Detail (05).
6. Build **Performa Iklan (07)** — exercises the stat-card and analysis-card patterns.
7. Build **Dapur Konten (02 + 03)** — main creation flow. Ignore Section 2 alternatives, they are not shipping.

---

## Open questions for product

- Map provider preference (Mapbox vs Google vs Leaflet) — affects bundle size and pricing.
- Are AI message generations rate-limited per user/day? Need a "limit reached" state design if so.
- Is Boost a paid action? Need a payment confirmation screen if so.
- Dark-mode required at launch? Tokens are designed light-mode-first; dark requires palette inversion + adjustment of all soft-tinted backgrounds.

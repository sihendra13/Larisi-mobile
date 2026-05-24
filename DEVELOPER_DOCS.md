# RADAR — Developer Documentation
> Dokumentasi teknis lengkap untuk developer yang melanjutkan atau maintain proyek ini.
> Dibuat: Mei 2026 | Versi: 3.0

---

## Daftar Isi

1. [Overview & Tech Stack](#1-overview--tech-stack)
2. [Arsitektur & Keputusan Desain](#2-arsitektur--keputusan-desain)
3. [Struktur Folder](#3-struktur-folder)
4. [Design Tokens & CSS System](#4-design-tokens--css-system)
5. [Data Flow — Menu 1: Command Center](#5-data-flow--menu-1-command-center)
6. [Data Flow — Menu 2: Live Monitor](#6-data-flow--menu-2-live-monitor)
7. [Data Flow — Menu 3: Analytics Hub](#7-data-flow--menu-3-analytics-hub)
8. [Backend — Supabase Edge Functions](#8-backend--supabase-edge-functions)
9. [Integrasi Eksternal](#9-integrasi-eksternal)
10. [Environment Setup](#10-environment-setup)
11. [Aturan Penting & Gotchas](#11-aturan-penting--gotchas)

---

## 1. Overview & Tech Stack

### Apa itu RADAR?
RADAR adalah dashboard social media campaign untuk **UMKM Indonesia**. Produk Larisi. App terdiri dari tiga menu utama:

| Menu | Nama | Fungsi |
|------|------|--------|
| 1 | **Command Center** | Buat & launch campaign baru |
| 2 | **Live Monitor** | Pantau campaign yang sedang berjalan + SiLaris AI chat |
| 3 | **Analytics Hub** | Analitik agregat + narasi AI + insight tren |

### Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Frontend | Vanilla JS + HTML + CSS | Tidak perlu build step, langsung deploy ke Vercel |
| Database | Supabase (PostgreSQL) | RLS per session, anon auth, edge functions gratis |
| AI — Analytics | Groq `llama-3.3-70b-versatile` | Murah, cepat, cocok untuk JSON output |
| AI — Monitor Chat | Groq `llama-3.3-70b-versatile` | Sama, via edge function `silaris-chat` |
| Social Publish | PostForMe.dev API | Menangani OAuth Instagram/Facebook/TikTok |
| Deploy | Vercel | Auto-deploy dari GitHub, free tier cukup |
| Maps | Leaflet.js | Lightweight, tidak butuh billing account |

---

## 2. Arsitektur & Keputusan Desain

### Kenapa Vanilla JS (bukan React/Vue)?

1. **Zero build step** — file langsung dibuka di browser atau di-deploy ke Vercel tanpa webpack/vite
2. **Satu `index.html`** — semua menu ada dalam satu file HTML, navigasi pakai `display:none/block`
3. **Mudah di-debug** — bisa buka DevTools langsung tanpa source maps
4. **Scope proyek** — UMKM tool, bukan SPA enterprise; vanilla JS cukup dan lebih maintainable untuk tim kecil

> **Konsekuensi:** Semua state global, semua fungsi di-expose ke `window`. Ini disengaja, bukan bug.

### Single Page Architecture

```
index.html
  ├── #section-command   (Menu 1 — Command Center)
  ├── #section-monitor   (Menu 2 — Live Monitor)
  └── #section-analytics (Menu 3 — Analytics Hub)
```

Navigasi antar menu dilakukan lewat `showSection(id)` yang mengatur `display` masing-masing section. Tidak ada routing URL.

### Session Identity (Pre-Auth)

Sebelum user auth diimplementasi, identitas user dibagi dua:

| Mekanisme | Dipakai untuk | Disimpan di |
|-----------|---------------|-------------|
| `radar_session_id` (UUID random) | Campaign ownership di tabel `campaigns` | `localStorage` |
| Supabase Anon User (`auth.signInAnonymously()`) | Cache di tabel `analytics_cache` | Supabase `auth.users` |

Ketika user auth ditambahkan nanti: anon user bisa di-merge ke real user via Supabase `linkIdentity()`. `radar_session_id` tinggal diasosiasikan ke `user_id` yang baru.

### Keamanan API Key

| Key | Lokasi | Alasan |
|-----|--------|--------|
| `SUPABASE_ANON_KEY` | `config.js` (public) | Aman — RLS membatasi akses |
| `POSTFORME_API_KEY` | Supabase env secret | Tidak pernah ke browser |
| `GROQ_API_KEY` | Supabase env secret | Tidak pernah ke browser |
| `ANTHROPIC_API_KEY` | `config.js` (kosong, belum dipakai) | Dipakai kalau `ai-insight` edge function diaktifkan |

> **Aturan besi:** API key yang bisa melakukan write/publish TIDAK BOLEH ada di `config.js`.

---

## 3. Struktur Folder

```
radar-larisi/
├── index.html                    # Satu-satunya HTML file. Semua UI di sini.
├── postforme-callback.html       # Halaman redirect setelah OAuth PostForMe
├── postforme-callback/
│   └── index.html                # Versi clean URL untuk Vercel routing
│
├── Assets/
│   ├── logo larisi.svg           # Logo Larisi
│   └── demo/                     # Gambar demo untuk preview kosong
│       ├── automotive.png
│       ├── culinary.png
│       ├── fashion.png
│       └── ramadan.png
│
├── src/
│   ├── css/
│   │   ├── tokens.css            # CSS custom properties (design tokens)
│   │   ├── layout.css            # Grid, section wrapper, bottom nav
│   │   ├── phone.css             # Phone frame preview (Menu 1)
│   │   ├── chips.css             # Format selector chips (IG Story, Reels, dll)
│   │   ├── caption.css           # Caption editor & AI writer panel
│   │   ├── panel.css             # SiLaris AI chat panel (Menu 2)
│   │   ├── monitor.css           # Campaign cards & live monitor UI
│   │   ├── analytics.css         # Semua UI Menu 3 Analytics Hub
│   │   ├── stitch.css            # Stitch text overlay pada phone preview
│   │   ├── map.css               # Leaflet map + radius picker
│   │   ├── persona.css           # Persona selector cards
│   │   ├── upload.css            # Image upload zone
│   │   └── bottom-bar.css        # Bottom navigation bar
│   │
│   ├── js/
│   │   ├── config.js             # RADAR_CONFIG — semua konstanta & feature flags
│   │   ├── state.js              # State global, PLATFORMS config, PLAT_ICONS_SVG
│   │   ├── main.js               # DOMContentLoaded bootstrap
│   │   ├── supabase.js           # Supabase client, saveCampaign, getCampaigns
│   │   ├── analytics.js          # Menu 3: seluruh Analytics Hub
│   │   ├── monitor.js            # Menu 2: Live Monitor + SiLaris AI chat
│   │   ├── map.js                # Leaflet map, geocoding, radius calculation
│   │   ├── reach.js              # Estimasi reach berdasarkan radius + populasi
│   │   ├── caption.js            # AI caption writer (groq via edge function)
│   │   ├── persona.js            # Persona selector & management
│   │   ├── phone-preview.js      # Phone frame renderer
│   │   ├── stitch.js             # Stitch text overlay logic
│   │   ├── launch.js             # Launch campaign flow
│   │   ├── upload.js             # Image upload & manipulation
│   │   ├── boost.js              # Boost/promote campaign actions
│   │   ├── buffer.js             # PostForMe scheduling buffer
│   │   └── export.js             # Export PDF / creative
│   │
│   └── data/
│       ├── locations.js          # Daftar kota & kecamatan Indonesia (BPS)
│       ├── personas.js           # Data persona (usia, interest, gaya hidup)
│       ├── caption-templates.js  # Template caption per kategori bisnis
│       └── region-dialek.js      # Dialek & greeting per region (REGION_DIALEK)
│
├── supabase/
│   ├── analytics_cache.sql       # DDL untuk tabel analytics_cache (jalankan 1x)
│   └── functions/
│       ├── ai-insight/           # Edge function lama (Claude API) — deprecated
│       │   └── index.ts
│       ├── postforme-auth/       # Generate OAuth URL untuk PostForMe
│       │   └── index.ts
│       ├── postforme-proxy/      # Proxy semua PostForMe API call
│       │   └── index.ts
│       └── silaris-chat/         # AI chat untuk Monitor (Groq)
│           └── index.ts
│
├── config.js → lihat src/js/config.js
├── CONTEXT_BRIEF.md              # Brief awal proyek (April 2026, sebagian outdated)
├── SILARIS_AI_BRIEF.md           # Design brief SiLaris AI untuk Menu 2
└── DEVELOPER_DOCS.md             # File ini
```

---

## 4. Design Tokens & CSS System

Semua token didefinisikan di `src/css/tokens.css` dan dipakai di seluruh CSS.

### Warna Utama

```css
--rausch:      #791ADB;   /* Brand purple — CTA, accent, icon tinted */
--near-black:  #222222;   /* Heading, label utama */
--secondary:   #6a6a6a;   /* Deskripsi, sublabel, metadata */
--border:      #e8e8e8;   /* Semua border card */
--bg-soft:     #f9f9f9;   /* Background section ringan */
--white:       #ffffff;
```

### Typography Rules

| Ukuran | Dipakai untuk |
|--------|---------------|
| `14px` | Body text, label utama |
| `13px` | Label sekunder |
| `12.5px` | **Semua deskripsi/sublabel** (grey `var(--secondary)`) |
| `12px` | Timestamp, badge kecil |
| `11px` | Chip label, metadata terkecil |

> **Aturan:** Semua teks deskriptif (`.kpi-sub`, `.an-card-sub`, `.an-camp-meta`, dll) pakai `12.5px` + `var(--secondary)`. Jangan pakai `var(--near-black)` untuk teks deskripsi.

### Class Deskripsi 12.5px (Analytics)

```
.kpi-sub          .an-card-sub       .an-camp-meta
.an-camp-note     .an-mood-cell-label .an-mood-insight
.an-pulse-note    .an-stitch-er      .an-stitch-insight
.an-plat-insight  .an-step-reason    .an-comp-metric-key
.an-comp-bar-label .an-er-explainer
```

### CSS File Loading Order (di `index.html`)

```html
tokens.css → layout.css → phone.css → chips.css →
caption.css → panel.css → monitor.css → analytics.css →
stitch.css → map.css → persona.css → upload.css → bottom-bar.css
```

Urutan penting karena ada cascade dependency (misal `analytics.css` override beberapa token dari `layout.css`).

---

## 5. Data Flow — Menu 1: Command Center

### Overview Flow

```
User buka app
  → main.js: DOMContentLoaded
  → map.js: init Leaflet map di #map-container
  → reach.js: updateReach() kalkulasi estimasi reach
  → User pilih format → state.js: activePlatform
  → User upload foto → upload.js → phone-preview.js render frame
  → User tulis/generate caption → caption.js
  → User klik Launch → launch.js → saveCampaign() → PostForMe publish
```

### File-file Kunci

**`config.js`** — dibaca pertama, menyediakan `RADAR_CONFIG` global.

**`state.js`** — global state:
- `State` object (modern)
- Individual `var` (backward compat, dipakai modul lama)
- `PLATFORMS` — config semua format (aspek rasio, ukuran frame, chrome style)
- `PLATFORM_PENETRATION_RATES` — rate penetrasi platform Indonesia (We Are Social 2024)
- `POPULATION_PROVIDER` — abstraksi sumber data populasi (sekarang BPS, nanti Google Maps API)

**`map.js`** — Leaflet integration:
- Geocoding via Nominatim (OpenStreetMap, free, rate-limit 1 req/detik)
- `currentRegion` di-set berdasarkan reverse geocoding
- `REGION_DIALEK` dari `data/region-dialek.js` dipakai untuk greeting di SiLaris

**`reach.js`** — kalkulasi estimasi reach:
- Input: radius (km) + `currentLocPop` (populasi kecamatan dari BPS)
- Formula: `populasi × penetration_rate × engagement_factor`
- Output: range min-max yang tampil di UI

**`launch.js`** — flow launch campaign:
1. Kumpulkan data dari semua input form
2. Validasi via `validateCampaignData()` di `supabase.js`
3. `saveCampaign()` → INSERT ke tabel `campaigns`
4. Kirim ke PostForMe via `postforme-proxy` edge function
5. Update `post_id` dan `post_url` hasil publish via `updateCampaignPostId()`

### Tabel `campaigns` (Supabase)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | uuid | PK auto |
| `session_id` | text | `radarSessionId` dari localStorage |
| `nama_campaign` | text | Nama campaign |
| `kecamatan` | text | Lokasi target |
| `radius_km` | numeric | Radius targeting |
| `kategori` | text | Kategori bisnis user |
| `platforms` | text[] | Array platform dipilih |
| `caption` | text | Caption final |
| `stitch_text` | text | Overlay text |
| `format` | text | Format konten (reel/post/story) |
| `post_id` | text | PostForMe post ID |
| `post_url` | text | URL postingan live |
| `platform_post_id` | text | ID post di platform (IG/FB/dll) |
| `thumb_url` | text | URL thumbnail |
| `status` | text | `active` / `running` / `completed` |
| `estimated_reach_min/max` | int | Estimasi reach saat launch |
| `budget_idr` | numeric | Budget iklan (optional) |
| `created_at` | timestamptz | Auto |

---

## 6. Data Flow — Menu 2: Live Monitor

### Overview Flow

```
User pindah ke Menu 2
  → monitor.js: loadCampaigns() → getCampaigns() dari Supabase
  → Render campaign cards (format, platform, engagement)
  → Auto-refresh engagement tiap 5 menit via postforme-proxy
  → User klik campaign card
    → resetSilarisSession() jika campaign berbeda
    → Kumpulkan engagement data dari card
    → openSilarisPanel() tampil di kanan
    → generateAutoInsight() → silaris-chat edge function
    → User bisa chat lebih dalam (scoped conversation)
```

### SiLaris AI — Scoped Conversation Memory

```javascript
var silarisSession = {
  campaign_id:    null,   // ID campaign aktif
  campaign_data:  null,   // Engagement data campaign
  chat_history:   [],     // Max 6 pesan terakhir
  is_initialized: false   // Sudah auto-insight atau belum
};
```

**Prinsip penting:**
- Session di-reset setiap user klik campaign berbeda
- AI hanya boleh membahas campaign yang sedang dibuka
- History max 6 pesan (hemat token Groq)
- `campaignData` di-inject ulang di SETIAP request (model stateless)

### Data Engagement (3 Level)

| Level | Sumber | Tampil di Card | Dikirim ke AI |
|-------|--------|----------------|---------------|
| 1 | PostForMe API | ✅ | ✅ |
| 2 | PostForMe API (extended) | ❌ | ✅ |
| 3 | Kalkulasi otomatis | ❌ | ✅ |

Level 2 fields: `saved`, `follows`, `profile_visits`, `profile_activity`, `navigation`, `replies`, `total_interactions`, `ig_reels_avg_watch_time`, `ig_reels_video_view_total_time`

Level 3: Engagement Rate = `(reactions + comments + shares) / reach × 100`

### Campaign Card — Timestamp & post_url

Setiap campaign card punya chip timestamp. Kalau `post_url` tersedia, chip menjadi link ke postingan live di platform. `post_url` diisi oleh `updateCampaignPostId()` setelah PostForMe berhasil publish.

```javascript
// Di monitor.js
function _openCampaignPost(campId) {
  var chip = cardEl.querySelector('.cc-ts-chip');
  var href = chip ? chip.getAttribute('href') : null;
  if (href && href !== '#') window.open(href, '_blank', 'noopener');
}
```

### User Context untuk SiLaris

`buildSilarisContext()` di `monitor.js` membangun context bisnis dengan prioritas:

1. **PRIORITY 1:** `silaris_user_profile` dari localStorage (kalau sudah ada dari form registrasi)
2. **PRIORITY 2:** Region dari GPS (`currentRegion` + `REGION_DIALEK`)
3. **PRIORITY 3:** Fallback default

---

## 7. Data Flow — Menu 3: Analytics Hub

### Overview Flow

```
User pindah ke Menu 3
  → initAnalytics()
  → Render skeleton loading state
  → waitForCampaigns(async callback)
    → _anAggregate(campaigns) → agg object
    → Render semua section UI (stat cards, mood, platform, dll)
    → _anEnsureAnonUser() → Supabase anon auth
    → _anGetCache(userId, 'narasi') → cek cache
    → Kalau cache valid & data belum berubah >20%:
        _anPopulateAI(cache.payload, cache.created_at)
    → Kalau cache expired atau data berubah signifikan:
        _callSilarisAnalytics(agg) → silaris-chat edge function
        _anPopulateAI(result, now)
        _anSetCache(userId, 'narasi', result, aggSnap, 60 menit)
```

### Objek `agg` (Output `_anAggregate`)

```javascript
{
  total:         number,    // Total campaign
  totalReach:    number,    // Total reach semua campaign
  totalPaidReach: number,
  activeCount:   number,    // Campaign dengan status 'running'
  avgER:         number,    // Rata-rata engagement rate (%)
  bestCamp:      object,    // Campaign dengan ER tertinggi
  platList:      array,     // Platform diurutkan by avgER
  moodData:      array,     // Distribusi reaksi (love/like/haha/wow)
  hourBuckets:   array[24], // Post count per jam
  dayBuckets:    array[7],  // Post count per hari
  bestHour:      number,    // Jam dengan post terbanyak
  bestDay:       string,    // Nama hari dengan post terbanyak
  topFmt:        string,    // Format paling sering dipakai
  stitchCandidates: array,  // Caption+ER terbaik (untuk seksi Stitch)
  formatCount:   object     // Count per format
}
```

### Sistem Cache Narasi

**Tabel:** `analytics_cache` (Supabase)

```
id          — uuid PK
user_id     — FK ke auth.users (anon user)
cache_type  — 'narasi' (bisa dikembangkan untuk tipe lain)
payload     — JSONB (hasil AI: narasi_p1, narasi_p2, campaign_terbaik, dll)
agg_snapshot — JSONB (snapshot agg saat cache dibuat: totalReach, avgER)
created_at  — auto
expires_at  — created_at + TTL (default 60 menit)
```

**Trigger Regenerasi:**

Cache dianggap tidak valid jika SALAH SATU terpenuhi:
- `|newReach - cachedReach| / cachedReach > 20%` **AND** `selisih > 500`
- `|newER - cachedER| / cachedER > 20%` **AND** `selisih > 5 percentage points`

Ini mencegah regenerasi percuma saat data hanya berubah sedikit.

**Manual Refresh:** Tombol refresh di freshness bar → `refreshAnalyticsData()` → invalidate cache → `initAnalytics()`.

### Narasi AI — Dua Paragraf Terpisah

**Masalah:** Groq tidak reliabel memasukkan newline (`\n`) di dalam JSON string value.

**Solusi:** Dua field JSON terpisah, bukan satu field dengan `\n\n`:

```json
{
  "narasi_p1": "Kalimat pembuka + angka + interpretasi ER + closing",
  "narasi_p2": "Gap terbesar sebagai peluang + 1 aksi konkret"
}
```

Frontend merender keduanya sebagai dua `<p>` tag dengan gap 10px.

```javascript
// _anPopulateAI()
narasiWrap.innerHTML =
  '<p>' + narasi_p1 + '</p>' +
  '<div style="height:10px;"></div>' +
  '<p>' + narasi_p2 + '</p>';
```

**Jangan pernah kembali ke single `narasi` field** — Groq tidak akan memasukkan newline yang konsisten.

### Section Analytics Hub (urutan render)

1. **Freshness bar** — timestamp data + tombol refresh
2. **SiLaris Narasi** — narasi AI 2 paragraf + clue row + timestamp + ER explainer + CTA
3. **Stat Cards** — Total Reach, Avg ER, Active Campaign, Top Platform
4. **Campaign Terbaik** — Card dengan logo platform + nama + timestamp link
5. **Mood Analytics** — Distribusi reaksi emosi
6. **Local Pulse** — Jam & hari terbaik posting
7. **Platform Performance** — Bar chart per platform
8. **Top Stitch** — Caption terbaik dari campaign
9. **Rekomendasi** — Step-by-step action items
10. **Competitor Benchmark** — Perbandingan dengan rata-rata industri
11. **Upgrade Card** — CTA fitur premium

### Campaign Terbaik Card — Layout

```
[logo platform]  [nama campaign]
                 [format + waktu posting — link ke post ↗]
[Engagement Rate badge]  [reach label]
```

`post_url` dari kolom `campaigns.post_url` → jika ada, timestamp menjadi `<a>` link. Jika `null`, tampil sebagai teks biasa.

---

## 8. Backend — Supabase Edge Functions

Semua edge function di-deploy ke project `mojzmlrdihenvfhrwopd`.

### `silaris-chat` — AI Chat & Analytics Narasi

**Endpoint:** `POST /functions/v1/silaris-chat`

**Dipakai oleh:** Menu 2 (SiLaris chat) + Menu 3 (narasi analytics)

**Model:** Groq `llama-3.3-70b-versatile`

**Request body:**
```typescript
{
  messages:      Array<{ role: string; content: string }>;
  systemPrompt:  string;
  campaignData?: Record<string, unknown>;
  autoInsight?:  boolean;
}
```

**Response:** `{ reply: string }` atau `{ reply: null, error: string }`

**Catatan penting:**
- `systemPrompt` + `campaignData` digabung menjadi satu system message (Groq/OpenAI compat hanya support 1 system role per request)
- Jika `autoInsight: true` dan tidak ada messages, AI trigger sendiri dengan "Analisa campaign ini..."
- Secret yang dibutuhkan: `GROQ_API_KEY`

**Deploy:**
```bash
supabase functions deploy silaris-chat --no-verify-jwt
supabase secrets set GROQ_API_KEY=gsk_xxx
```

---

### `postforme-proxy` — Proxy PostForMe API

**Endpoint:** `POST /functions/v1/postforme-proxy`

**Dipakai oleh:** Launch campaign, polling engagement, scheduling

**Request body:**
```typescript
{
  endpoint: string;  // PostForMe API path, misal "/v1/posts"
  method?:  string;  // "GET" | "POST" | "PUT" | "DELETE"
  body?:    unknown; // Request body untuk non-GET
}
```

**CORS:** Hanya allow origin dari `localhost:8080`, `localhost:3000`, `https://larisi.vercel.app`

**Secret yang dibutuhkan:** `POSTFORME_API_KEY`

**Deploy:**
```bash
supabase functions deploy postforme-proxy --no-verify-jwt
supabase secrets set POSTFORME_API_KEY=pfm_live_xxx
```

---

### `postforme-auth` — Generate OAuth URL

**Endpoint:** `POST /functions/v1/postforme-auth`

**Dipakai oleh:** Flow koneksi akun sosial (Instagram/Facebook/TikTok)

**Request body:**
```typescript
{
  platform:     string; // "instagram" | "facebook" | "tiktok"
  redirect_uri: string; // URL callback setelah OAuth
  external_id?: string; // ID user eksternal untuk mapping
}
```

**Response:** `{ auth_url: string }` — URL redirect ke halaman login platform

**Secret yang dibutuhkan:** `POSTFORME_API_KEY`

---

### `ai-insight` — (Deprecated / Standby)

Edge function lama menggunakan Claude API (Anthropic). Sekarang tidak aktif karena `ANTHROPIC_API_KEY` kosong di `config.js`. Fungsi analytics narasi sudah dipindah ke `silaris-chat` dengan Groq.

Simpan sebagai referensi jika nanti mau migrasi kembali ke Claude.

---

## 9. Integrasi Eksternal

### PostForMe.dev

PostForMe menangani seluruh OAuth flow dan publish ke social platform. RADAR tidak perlu handle token Instagram/Facebook langsung.

**Flow publish:**
1. User klik "Connect Instagram" → `postforme-auth` generate auth URL
2. User login di platform → redirect ke `postforme-callback.html`
3. Callback halaman kirim token ke PostForMe server
4. RADAR pakai `postforme-proxy` untuk semua API call selanjutnya

**Engagement polling:**
```javascript
// Di monitor.js
// Auto-refresh setiap 5 menit
var ANALYTICS_AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;
```

Engagement data (likes, comments, reach, dll) di-poll lewat `postforme-proxy` dan di-cache di-memory selama 2 menit (`ANALYTICS_CACHE_TTL = 120000`).

**`post_url` field:**
- Diisi setelah PostForMe berhasil publish
- Di-update via `updateCampaignPostId(supabaseId, postId, postUrl, platformPostId)`
- Dipakai di campaign card (timestamp link) dan analytics (Campaign Terbaik link)

---

### Groq API

Diakses **hanya** lewat Supabase edge function `silaris-chat`. Browser tidak pernah memanggil Groq langsung.

**Model:** `llama-3.3-70b-versatile`
- Temperature: `0.3` (fokus tapi tetap natural)
- Max tokens: `1000`

**Format output yang diharapkan dari Analytics:**
```json
{
  "narasi_p1": "string",
  "narasi_p2": "string",
  "campaign_terbaik": "string",
  "platform_terkuat": "string",
  "rekomendasi": ["string", "string"]
}
```

> AI tidak selalu mengikuti format JSON dengan sempurna. Selalu ada `_buildAnalyticsFallback(agg)` sebagai fallback kalau parsing gagal.

---

### Supabase

**Project ref:** `mojzmlrdihenvfhrwopd`

**Tabel yang ada:**

| Tabel | Fungsi |
|-------|--------|
| `campaigns` | Semua campaign user (RLS per `session_id`) |
| `analytics_cache` | Cache narasi AI (RLS per `user_id` anon auth) |

**RLS Policies:**
- `campaigns`: `session_id = current_setting('app.session_id')` (atau diset via client)
- `analytics_cache`: `auth.uid() = user_id`

**Anon Auth:**
```javascript
// _anEnsureAnonUser() di analytics.js
var sb = getSupabaseClient();
var sessionRes = await sb.auth.getSession();
if (sessionRes.data?.session) return sessionRes.data.session.user.id;
var signInRes = await sb.auth.signInAnonymously();
return signInRes.data?.user?.id || null;
```

Session anon persisten selama browser tidak clear storage.

---

### Leaflet.js + OpenStreetMap

- Peta di Menu 1 Command Center
- Geocoding via Nominatim (OpenStreetMap) — free, no API key
- **Rate limit Nominatim: 1 request/detik** — jangan spam geocoding
- Populasi kecamatan dari BPS Sensus 2020 (hardcoded di `data/locations.js`)
- `POPULATION_PROVIDER` di `state.js` siap di-swap ke Google Maps API kapanpun

---

## 10. Environment Setup

### Prerequisites

- Node.js (untuk Supabase CLI)
- Supabase CLI: `brew install supabase/tap/supabase`
- Git
- Vercel account (untuk deploy)

### Langkah Setup Lokal

```bash
# 1. Clone repo
git clone <repo-url>
cd radar-larisi

# 2. Isi config.js
# Edit src/js/config.js:
# - SUPABASE_URL & SUPABASE_ANON_KEY (dari supabase.com → Settings → API)

# 3. Buka langsung di browser (tanpa build step)
open index.html
# Atau pakai live server:
npx serve . -p 8080
```

### Setup Supabase

```bash
# Login & link ke project
supabase login
supabase link --project-ref mojzmlrdihenvfhrwopd

# Jalankan SQL untuk buat tabel analytics_cache
# (buka supabase/analytics_cache.sql → paste di SQL Editor Supabase)

# Set secrets
supabase secrets set GROQ_API_KEY=gsk_xxx
supabase secrets set POSTFORME_API_KEY=pfm_live_xxx

# Deploy semua edge functions
supabase functions deploy silaris-chat --no-verify-jwt
supabase functions deploy postforme-proxy --no-verify-jwt
supabase functions deploy postforme-auth --no-verify-jwt
```

### Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (auto-detect static project)
vercel

# Atau: push ke GitHub, connect repo di vercel.com
# Vercel auto-deploy setiap push ke main
```

**Tidak perlu environment variable di Vercel** — semua config ada di `config.js` dan Supabase secrets.

### `config.js` — Semua Nilai yang Perlu Diisi

```javascript
var RADAR_CONFIG = {
  SUPABASE_URL:      'https://xxx.supabase.co',       // ← dari Supabase dashboard
  SUPABASE_ANON_KEY: 'eyJhbGciOi...',                  // ← dari Supabase dashboard

  ANTHROPIC_API_KEY: '',                               // ← kosong (ai-insight deprecated)

  LAUNCH_COOLDOWN_MS:  30000,   // 30 detik antar launch (jangan kurang)
  INSIGHT_COOLDOWN_MS: 10000,   // 10 detik antar AI request
  MAX_CAPTION_LENGTH:  2000,
  MAX_STITCH_LENGTH:   200,

  FEATURES: {
    social_publish:  true,
    ai_insight:      true,
    export_pdf:      true,
    export_creative: true
  }
};
```

---

## 11. Aturan Penting & Gotchas

### ❌ JANGAN PERNAH

1. **Jangan pindah narasi kembali ke satu field** — Groq tidak konsisten memasukkan `\n\n` dalam JSON string. Tetap pakai `narasi_p1` + `narasi_p2`.

2. **Jangan taruh GROQ_API_KEY atau POSTFORME_API_KEY di `config.js`** — semua API key yang bisa write/publish harus di Supabase secrets.

3. **Jangan hapus fallback `_buildAnalyticsFallback(agg)`** — AI Groq kadang return non-JSON atau response yang tidak bisa di-parse. Fallback ini yang menjaga UI tetap isi.

4. **Jangan ubah struktur tabel `campaigns` tanpa update `saveCampaign()`** — field mapping di `supabase.js` harus sinkron dengan schema.

5. **Jangan spam Nominatim geocoding** — rate limit 1 req/detik. Sudah ada debounce di `map.js`, jangan dihapus.

---

### ⚠️ GOTCHAS PENTING

**Global scope by design:**
Semua fungsi di-expose ke `window`. Ini disengaja agar bisa dipanggil dari `onclick` di HTML. Contoh: `onclick="refreshAnalyticsData()"`. Jangan "bersihkan" global scope ini.

**`radarSessionId` vs Supabase `user_id`:**
- `radarSessionId` → dipakai sebagai filter di tabel `campaigns`
- Supabase anon `user_id` → dipakai sebagai owner di tabel `analytics_cache`
- Keduanya berbeda! Jangan disamakan.

**Anon auth timing:**
`_anEnsureAnonUser()` bersifat async. Pastikan selalu `await` sebelum memanggil `_anGetCache` atau `_anSetCache`. Kalau tidak, `userId` bisa `null` dan cache tidak akan bekerja.

**CORS di `postforme-proxy`:**
Origins di-whitelist manual di edge function. Kalau deploy ke domain baru, tambahkan ke `allowedOrigins` array di `postforme-proxy/index.ts` lalu redeploy.

**`post_url` bisa null:**
Saat campaign baru di-launch, `post_url` belum ada (PostForMe butuh beberapa detik). UI harus selalu handle `null` — lihat pattern di `_renderCampaignBest()` di `analytics.js`.

**CSS loading order:**
Jangan ubah urutan `<link>` CSS di `index.html`. Ada beberapa cascade dependency yang akan rusak jika urutan berubah.

**Demo campaigns:**
Campaign dengan `isDemo: true` di-filter keluar di `_anAggregate()`. Jangan lupa set flag ini kalau tambah data demo.

**Groq JSON parsing:**
AI kadang return JSON dengan trailing comma atau komentar. Selalu wrap `JSON.parse()` dalam try-catch dan fallback ke `_buildAnalyticsFallback()`.

---

### 🔜 Yang Belum Diimplementasi (Next Steps)

| Fitur | Status | Catatan |
|-------|--------|---------|
| User Authentication | Belum | Anon auth sudah siap untuk di-upgrade |
| Level 2 Engagement Data | Parsial | `postforme-proxy` sudah ada, perlu polling per-campaign |
| Populasi real-time | Belum | `POPULATION_PROVIDER` sudah siap untuk Google Maps API |
| Export PDF | Feature flag ada | `export.js` perlu dilengkapi |
| Competitor real data | Belum | Sekarang pakai benchmark hardcoded |
| Push notification campaign | Belum | Perlu service worker |

---

### 📞 Kontak & Referensi

- **Supabase Project:** `mojzmlrdihenvfhrwopd` — supabase.com
- **PostForMe docs:** https://docs.postforme.dev
- **Groq API docs:** https://console.groq.com/docs
- **Deploy target:** https://larisi.vercel.app

---

*Dokumentasi ini mencakup state proyek per Mei 2026.*
*Untuk konteks awal proyek, lihat `CONTEXT_BRIEF.md` dan `SILARIS_AI_BRIEF.md`.*

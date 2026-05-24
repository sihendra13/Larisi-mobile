# Brief Fitur Add Competitor — LaRas Analytics (Menu 3)
_Dibuat: 3 Mei 2026 — berdasarkan diskusi panjang product & engineering_

---

## 1. Konteks & Struktur Menu

| Menu | Nama | Fungsi |
|---|---|---|
| Menu 1 | Creative Command Center | Upload asset → detect persona → generate caption → launch campaign |
| Menu 2 | Campaign Live Monitor | Monitor campaign berjalan + SiLaris chat per campaign |
| Menu 3 | Analytics | Dashboard analitik + Competitor Analysis (sedang dibangun) |

**Catatan penting:**
- Menu 1 tidak punya SiLaris chat
- SiLaris chat hanya ada di Menu 2 (per campaign)
- Generate caption di Menu 1 sekarang masih hardcoded template — rencana hybrid AI nanti
- Login auth belum ada — sekarang pakai `session_id`

---

## 2. Keputusan Produk

### Plan Tier
| Plan | Jumlah Competitor | Tampilan |
|---|---|---|
| Free / Starter | 1 competitor | Head-to-head 1 vs 1 |
| Pro | Maksimal 3 competitor | Landscape view semua competitor dalam 1 tabel |

### Data Source
- **MVP sekarang:** Scraping data publik (likes + komentar + followers = estimated ER)
- **Bukan** dari Postforme API (tidak ada endpoint competitor di Postforme)
- **Bukan** dari Phyllo/Modash dulu — terlalu mahal untuk MVP
- Selalu tampilkan label: _"Estimasi berdasarkan data publik · bukan angka dashboard pesaing"_

### Storage Strategi
- **Sekarang:** localStorage (sementara, hilang kalau browser di-clear)
- **Setelah login auth selesai:** migrasi ke Supabase dengan `user_id` — permanen
- Tidak perlu rebuild dari nol saat migrasi

---

## 3. Flow Lengkap

### Flow Free Plan (1 Competitor)
```
User buka Menu 3 Analytics
        ↓
Section Competitor Analysis
        ↓
User pilih platform tab (Instagram / Facebook / TikTok)
        ↓
User paste link atau @handle competitor
(tanpa autocomplete — user harus tahu handle sendiri)
        ↓
Klik "Analisa →"
        ↓
Loading state: "Mengambil data publik pesaing..."
        ↓
Backend (Supabase Edge Function: competitor-scraper)
ambil data publik: followers, avg likes, avg komen,
frekuensi posting, format dominan
        ↓
Hitung estimated ER = (avg likes + komentar) / followers × 100
        ↓
Tampilkan head-to-head comparison (kamu vs 1 pesaing)
        ↓
Groq generate 3 insight otomatis (hijau/merah/ungu)
        ↓
Tombol "Generate strategi lengkap →"
        ↓
Modal SiLaris muncul — strategi di-generate dengan
context competitor pre-loaded
        ↓
Strategi tersimpan otomatis di localStorage
        ↓
2 tombol muncul di bawah strategi:
  [Simpan Strategi] — konfirmasi tersimpan
  [Buat Campaign Berdasarkan Ini →]
        ↓
Klik "Buat Campaign" → redirect ke Menu 1
+ strategi terbawa sebagai context (via localStorage)
        ↓
Di Menu 1, saat generate caption:
caption mempertimbangkan strategi competitor
(implementasi setelah hybrid AI caption selesai)
```

### Flow Pro Plan (hingga 3 Competitor)
```
Semua flow Free Plan berlaku untuk competitor pertama
        ↓
User bisa tambah competitor ke-2 dan ke-3
        ↓
Tampilan berubah ke Landscape View:
tabel semua competitor dengan kolom:
- Handle
- ER (label kualitatif)
- Posting/minggu
- Followers
- Badge posisi terbaik (misal: #1 ER, #1 Aktif, #1 Reach)
        ↓
User klik → di setiap baris
untuk buka detail head-to-head per competitor
        ↓
Generate strategi bisa per competitor
atau gabungan semua competitor
```

---

## 4. UI/UX Design

### Head-to-Head (Free Plan)
```
[Platform tabs: Instagram | Facebook | TikTok]

[Input: paste link atau @handle...]  [Analisa →]

┌─────────────────┬────┬─────────────────┐
│ KAMU            │ VS │ PESAING         │
│ @VespaKita      │    │ @VespaJogja     │
│                 │    │                 │
│ ER: Luar biasa  │    │ ER: Sangat bagus│
│ Posting: 2x/mgg │    │ Posting: 5x/mgg │
│ Followers: 1.2K │    │ Followers: 8.4K │
│ Format: Foto    │    │ Format: Reel    │
└─────────────────┴────┴─────────────────┘

● ER kamu lebih tinggi — kontenmu lebih disukai  [hijau]
● Pesaing posting 5x seminggu, kamu baru 2x      [merah]
● Coba 1 Reel minggu ini berdasarkan gap ini     [ungu]

[Generate strategi lengkap untuk kalahkan pesaing ini →]

─────────────────────────────────────────
Estimasi berdasarkan data publik
```

### Landscape View (Pro Plan)
```
[+ Tambah pesaing]  [Platform tabs]

┌──────────────┬──────────────┬────────┬──────────┬────────┬──┐
│ Akun         │ Eng. Rate    │Posting │Followers │Posisi  │  │
├──────────────┼──────────────┼────────┼──────────┼────────┼──┤
│ @VespaKita   │ ████ Luar    │  2x    │   1.2K   │#1 ER   │  │
│ (Kamu)       │      biasa   │        │          │        │  │
├──────────────┼──────────────┼────────┼──────────┼────────┼──┤
│ @VespaJogja  │ ███ Sangat   │  5x    │   8.4K   │#1 Aktif│→ │
│              │     bagus    │        │          │        │  │
├──────────────┼──────────────┼────────┼──────────┼────────┼──┤
│ @VespaIndo   │ ██ Bagus     │  3x    │  42K     │#1 Reach│→ │
└──────────────┴──────────────┴────────┴──────────┴────────┴──┘

Kamu unggul di engagement rate — tapi frekuensi
dan followers masih jauh di bawah.

[Generate strategi gabungan →]
```

### Modal Strategi
```
┌────────────────────────────────────────┐
│ SiLaris — Strategi vs @VespaJogja      │
│                                        │
│ [Narasi strategi dari Groq...]         │
│                                        │
│ [Simpan Strategi]  [Buat Campaign →]   │
│                                        │
│ Dibuat: 3 Mei 2026                     │
└────────────────────────────────────────┘
```

### Strategi Tersimpan (bawah section competitor)
```
┌────────────────────────────────────────┐
│ ▼ Strategi vs @VespaJogja              │
│   Disimpan 2 jam lalu                  │
│                                        │
│ [isi strategi...]                      │
│                                        │
│ [Generate Ulang]  [Buat Campaign →]    │
└────────────────────────────────────────┘
```

---

## 5. Backend — Supabase Edge Function

### Endpoint baru: `competitor-scraper`
```typescript
// Input
{
  handle: string,    // "@vespajogjaid" atau URL
  platform: string   // "instagram" | "facebook" | "tiktok"
}

// Output
{
  handle: string,
  platform: string,
  followers: number,
  avg_likes: number,
  avg_comments: number,
  posts_per_week: number,
  dominant_format: string,  // "Foto" | "Video" | "Reel" | "Carousel"
  estimated_er: number,     // (avg_likes + avg_comments) / followers * 100
  scraped_at: string
}
```

**Catatan implementasi:**
- Kalau scraping tidak feasible dari Edge Function (platform block), gunakan dummy data realistis dulu untuk MVP
- Swap ke scraping real nanti tanpa ubah interface

---

## 6. Groq Prompt — Generate 3 Insight

```
Data user (real dari Postforme):
- Platform: {platform}
- ER label: {user_er_label}  // "Luar biasa" / "Sangat bagus" / dll
- Posting/minggu: {user_frequency}
- Followers: {user_followers}
- Format dominan: {user_format}

Data competitor (estimasi publik):
- Handle: {competitor_handle}
- ER label: {comp_er_label}
- Posting/minggu: {comp_frequency}
- Followers: {comp_followers}
- Format dominan: {comp_format}

Berikan TEPAT 3 insight dalam format JSON:
[
  { "type": "win",  "text": "..." },
  { "type": "warn", "text": "..." },
  { "type": "tip",  "text": "..." }
]

ATURAN:
- Bahasa Indonesia santai, bukan marketing-speak
- Jangan sebut angka ER — pakai label kualitatif
- win = keunggulan user vs competitor
- warn = kelemahan user yang perlu diperbaiki
- tip = saran konkret 1 aksi yang bisa dilakukan minggu ini
- Gunakan dialek region dari context yang sudah ada
- Maksimal 2 kalimat per insight
```

---

## 7. Groq Prompt — Generate Strategi Lengkap

```
Kamu adalah SiLaris, campaign coach untuk bisnis lokal Indonesia.

Context competitor:
- User: @{user_handle}, platform {platform}
- Pesaing: @{competitor_handle}
- Keunggulan user: {win_insight}
- Kelemahan user: {warn_insight}
- Gap utama: {tip_insight}

Buatkan strategi konkret untuk minggu ini dalam format:
1. Satu hal yang harus DIPERTAHANKAN (keunggulan)
2. Satu hal yang harus DIPERBAIKI (kelemahan terbesar)
3. Satu aksi KONKRET yang bisa dilakukan hari ini

Bahasa santai, tone coach yang semangat.
Gunakan dialek region: {region_greeting}
Maksimal 150 kata total.
```

---

## 8. localStorage Schema (Sementara)

```javascript
// Key: 'laras_competitor_strategies'
// Value: array of strategy objects

[
  {
    id: 'strategy_timestamp',
    competitor_handle: '@vespajogjaid',
    platform: 'instagram',
    strategy_text: '...',
    insights: [
      { type: 'win', text: '...' },
      { type: 'warn', text: '...' },
      { type: 'tip', text: '...' }
    ],
    competitor_data: {
      followers: 8400,
      estimated_er: 128,
      posts_per_week: 5,
      dominant_format: 'Reel'
    },
    created_at: '2026-05-03T08:00:00Z'
  }
]
```

---

## 9. Upgrade Pro Banner (Free Plan)

Tampilkan di bawah head-to-head hasil analisis:
```
┌──────────────────────────────────────────────┐
│ Pantau hingga 3 pesaing sekaligus +          │
│ landscape view semua pesaing dalam 1 tabel   │
│                              [Coba Pro →]    │
└──────────────────────────────────────────────┘
```

---

## 10. Roadmap Implementasi

| Fase | Scope | Catatan |
|---|---|---|
| **Sekarang** | UI competitor analysis + scraping MVP + insight Groq + modal strategi + localStorage | Gas sekarang |
| **Setelah Login Auth** | Migrasi localStorage → Supabase dengan user_id | Tidak perlu rebuild |
| **Setelah Hybrid Caption** | Inject strategi competitor ke generate caption Menu 1 | Tunggu AI caption siap |
| **Setelah keduanya** | Flow end-to-end: competitor → strategi → buat campaign → launch | Full continuity |

---

## 11. Brief untuk Claude Code (Copy Paste)

> "Implementasikan fitur Competitor Analysis di Menu 3 Analytics dengan spesifikasi berikut:
>
> **Backend — Supabase Edge Function baru `competitor-scraper`:**
> Terima `{ handle, platform }`, return `{ followers, avg_likes, avg_comments, posts_per_week, dominant_format, estimated_er }`. Kalau scraping tidak feasible, gunakan dummy data realistis dulu.
>
> **Frontend:**
>
> Free Plan (1 competitor):
> - Platform tabs: Instagram / Facebook / TikTok
> - Input paste link atau @handle (tanpa autocomplete)
> - Loading state saat analisa
> - Head-to-head comparison dengan bar visual
> - ER ditampilkan sebagai label kualitatif (Luar biasa / Sangat bagus / Bagus / Berkembang) — bukan angka
> - 3 insight card dari Groq: hijau (win), merah (warn), ungu (tip) — bahasa UMKM bukan marketing-speak
> - Tombol 'Generate strategi lengkap →' → buka modal SiLaris
> - Label: 'Estimasi berdasarkan data publik'
> - Upgrade Pro banner di bawah hasil
>
> Pro Plan (hingga 3 competitor):
> - Landscape view: tabel semua competitor dengan kolom ER label, posting/minggu, followers, badge posisi terbaik
> - Tombol → per baris untuk buka detail head-to-head
> - Input tambah competitor ke-2 dan ke-3
>
> Modal Strategi:
> - SiLaris generate strategi dengan context competitor pre-loaded
> - Strategi tersimpan otomatis di localStorage dengan schema: `laras_competitor_strategies` (array of objects dengan id, handle, platform, strategy_text, insights, competitor_data, created_at)
> - 2 tombol: [Simpan] dan [Buat Campaign →] yang redirect ke Menu 1
> - Timestamp: 'Dibuat X menit lalu'
>
> Strategi tersimpan:
> - Tampilkan card collapsible 'Strategi Tersimpan' di bawah section competitor kalau localStorage sudah ada data
> - Judul: 'Strategi vs @handle · disimpan X waktu lalu'
> - Tombol: [Generate Ulang] dan [Buat Campaign →]
>
> Design: konsisten dengan Menu 1 dan Menu 2 — ikuti design system yang sudah ada. Layout desktop, lebar penuh."

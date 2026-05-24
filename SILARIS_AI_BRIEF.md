# SILARIS AI — Brief untuk Claude Code
> Rangkuman diskusi desain & implementasi SiLaris AI
> Dibuat: 30 April 2026

---

## 1. APA ITU SILARIS AI?

SiLaris adalah fitur AI Co-Pilot yang sudah ada panel-nya di kanan layar
pada Menu 2 (Campaign Live Monitor). Tujuannya: menjadi **Senior Social
Media Analyst** yang memberikan insight tajam dan actionable kepada
pemilik UMKM Indonesia, berdasarkan data engagement campaign mereka.

---

## 2. KONDISI SEKARANG

- Panel SiLaris AI sudah ada di UI (kanan layar Monitor)
- Tapi belum terkoneksi ke AI manapun (ANTHROPIC_API_KEY kosong di config.js)
- Model yang dipakai: **Groq — llama-3.1-8b-instant**
- Groq API key perlu ditambahkan ke `config.js`
- Data engagement di card sekarang masih sebagian estimasi

---

## 3. KONSEP UTAMA — "Scoped Conversation Memory"

Ketika user klik satu campaign card:
- SiLaris AI hanya membahas campaign yang dipilih itu saja
- AI tidak boleh menjawab pertanyaan di luar scope campaign tersebut
- Kalau user pindah ke campaign lain → session di-reset
- History chat disimpan max 6 pesan (hemat token)

---

## 4. ARSITEKTUR SISTEM

```
User klik Campaign Card
        ↓
Ambil semua data engagement dari card
        ↓
Hitung Engagement Rate otomatis:
(reactions + comments + shares) / reach * 100
        ↓
Inject ke Groq sebagai context
        ↓
SiLaris kasih Auto-Insight langsung
(tanpa user perlu tanya dulu)
        ↓
User bisa chat lebih dalam
(scoped hanya campaign yang diklik)
```

---

## 5. DATA YANG DIKIRIM KE SILARIS AI

### Level 1 — Tampil di Card (sudah ada)
- reactions / likes
- comments
- shares
- views
- reach

### Level 2 — Dari PostForMe API (belum tampil di card, tapi dikirim ke AI)
- saved
- follows
- profile_visits
- profile_activity
- navigation
- replies
- total_interactions
- ig_reels_avg_watch_time (khusus Reels, dalam milliseconds)
- ig_reels_video_view_total_time (khusus Reels)

### Level 3 — Hanya untuk SiLaris AI (tidak tampil di card)
- Engagement Rate (dihitung otomatis dari Level 1)
- Business context dari profil user (kategori bisnis, platform)

**Prinsip:** Card tetap simpel & bersih (Level 1 saja).
SiLaris AI punya semua data (Level 1 + 2 + 3) untuk analisa mendalam.

---

## 6. STRUKTUR DATA YANG DIKIRIM KE GROQ

```javascript
// Inject di setiap request (wajib, model stateless)
{
  "business_context": {
    "category": "Fashion Lokal",   // dari form registrasi user
    "platform": "META",            // platform campaign
    "business_name": "Vespakita"   // nama bisnis user
  },
  "campaign_data": {
    "name": "TEs FB",
    "type": "FB Post",
    "post_time": "08:20",
    // Level 1
    "reactions": 1,
    "comments": 1,
    "shares": 0,
    "views": null,
    "reach": 1,
    // Level 2
    "saved": 0,
    "follows": 0,
    "profile_visits": 0,
    "ig_reels_avg_watch_time": null,
    // Level 3 (dihitung otomatis)
    "engagement_rate": "200%"
  }
}
```

---

## 7. KONFIGURASI GROQ API

Tambahkan ke `src/js/config.js` dalam object RADAR_CONFIG:

```javascript
// ── SiLaris AI (Groq) ─────────────────────────
GROQ_API_KEY: 'gsk_xxxxxxxxxxxxxxxx',   // ← isi dengan Groq API key
GROQ_MODEL: 'llama-3.1-8b-instant',
GROQ_TEMPERATURE: 0.3,
SILARIS_MAX_HISTORY: 6,
```

**Catatan:** Ganti key `ANTHROPIC_API_KEY` yang sekarang kosong
dengan `GROQ_API_KEY`.

---

## 8. SYSTEM PROMPT SILARIS AI

```
Kamu adalah SiLaris, seorang Senior Social Media Analyst
dan Strategist berpengalaman yang bekerja khusus untuk
UMKM Indonesia.

KARAKTER:
- Bicara santai, pakai bahasa Indonesia yang mudah dimengerti
- Langsung ke poin, tidak bertele-tele
- Kasih saran yang praktis dan bisa langsung dilakukan
- Gunakan analogi sederhana kalau perlu
- Jangan pakai istilah teknis yang membingungkan

ATURAN KETAT:
- HANYA analisa campaign yang sedang dibuka user
- HANYA gunakan data engagement yang tersedia di context
- JANGAN berasumsi data yang tidak ada
- JANGAN bandingkan dengan campaign lain
- JANGAN jawab pertanyaan di luar topik campaign ini
- Kalau user tanya di luar topik, jawab:
  "Hei, saya hanya bisa bantu analisa campaign yang
  lagi kamu buka ya! Ada yang mau ditanyain soal
  campaign ini?"

CARA ANALISA:
- Fokus pada engagement rate, bukan angka mentah
- Perhatikan metrik yang paling timpang (terlalu tinggi/rendah)
- Kasih saran yang spesifik dan actionable
- Sesuaikan saran dengan kategori bisnis user

BUSINESS CONTEXT:
{business_context}

CAMPAIGN YANG SEDANG DIANALISA:
{campaign_data}
```

---

## 9. AUTO-INSIGHT (Saat Card Pertama Diklik)

AI langsung generate insight ini tanpa user perlu tanya:

```
Format output auto-insight:

"Hei! Saya udah cek data campaign "[nama]" kamu nih 👋

📊 PERFORMA SEKARANG
• Engagement Rate: X% — [Bagus! / Perlu ditingkatkan]
• Paling kuat: [metric tertinggi & artinya]
• Perlu diperhatiin: [metric terendah & artinya]

💡 INSIGHT UTAMA
[1-2 insight spesifik berdasarkan data, bahasa santai]

🎯 SARAN LANGSUNG
[1-2 action konkret yang bisa langsung dilakukan]

Ada yang mau kamu tanyain lebih dalam?"
```

---

## 10. STRUKTUR MESSAGES KE GROQ API

```javascript
const messages = [
  // System prompt permanen (karakter + aturan)
  {
    role: "system",
    content: SILARIS_SYSTEM_PROMPT
  },
  // Campaign context — SELALU inject ulang tiap request
  {
    role: "system",
    content: `Data Campaign Aktif:\n${JSON.stringify(campaignData, null, 2)}`
  },
  // History chat (max 6 pesan terakhir)
  ...chatHistory.slice(-6),
  // Pesan baru dari user
  {
    role: "user",
    content: userMessage
  }
]
```

---

## 11. GROQ API CALL

```javascript
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${RADAR_CONFIG.GROQ_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: RADAR_CONFIG.GROQ_MODEL,           // llama-3.1-8b-instant
    temperature: RADAR_CONFIG.GROQ_TEMPERATURE, // 0.3
    max_tokens: 1000,
    messages: messages
  })
});

const data = await response.json();
const reply = data.choices[0].message.content;
```

---

## 12. SESSION MANAGEMENT

```javascript
// State per campaign session
let silarisSession = {
  campaign_id: null,       // ID campaign yang aktif
  campaign_data: null,     // Data engagement campaign
  chat_history: [],        // Max 6 pesan terakhir
  is_initialized: false    // Sudah auto-insight atau belum
};

// Reset session kalau user klik campaign berbeda
function resetSilarisSession(newCampaignId) {
  silarisSession = {
    campaign_id: newCampaignId,
    campaign_data: null,
    chat_history: [],
    is_initialized: false
  };
}

// Tambah ke history (jaga max 6)
function addToHistory(role, content) {
  silarisSession.chat_history.push({ role, content });
  if (silarisSession.chat_history.length > 6) {
    silarisSession.chat_history =
      silarisSession.chat_history.slice(-6);
  }
}
```

---

## 13. FLOW LENGKAP SAAT CARD DIKLIK

```javascript
async function onCampaignCardClick(campaign) {

  // 1. Reset session kalau campaign berbeda
  if (silarisSession.campaign_id !== campaign.id) {
    resetSilarisSession(campaign.id);
  }

  // 2. Kumpulkan data dari card
  const campaignData = {
    name: campaign.name,
    platform: campaign.platform,
    post_time: campaign.launchTime,
    reactions: campaign.reactions || 0,
    comments: campaign.comments || 0,
    shares: campaign.shares || 0,
    views: campaign.views || null,
    reach: campaign.reach || 0,
    saved: campaign.saved || 0,
    follows: campaign.follows || 0,
    profile_visits: campaign.profile_visits || 0,
    ig_reels_avg_watch_time: campaign.ig_reels_avg_watch_time || null,
    // Hitung engagement rate otomatis
    engagement_rate: campaign.reach > 0
      ? (((campaign.reactions || 0) +
          (campaign.comments || 0) +
          (campaign.shares || 0)) / campaign.reach * 100).toFixed(1) + '%'
      : 'Data tidak cukup'
  };

  silarisSession.campaign_data = campaignData;

  // 3. Tampilkan panel SiLaris
  openSilarisPanel(campaign.name);

  // 4. Auto-insight kalau belum pernah
  if (!silarisSession.is_initialized) {
    silarisSession.is_initialized = true;
    await generateAutoInsight();
  }
}
```

---

## 14. TEMPERATURE — PENJELASAN SINGKAT

Temperature adalah seberapa "kreatif" vs "fokus" si AI:
- `0.0` → Sangat kaku, jawaban selalu sama
- `0.3` → Fokus tapi tetap natural ✅ (dipakai SiLaris)
- `0.7` → Lebih kreatif, variatif
- `1.0` → Bebas, bisa tidak konsisten

**SiLaris pakai 0.3** — cukup natural bahasanya tapi
tidak ngawur saat kasih insight data.

---

## 15. CATATAN PENTING UNTUK IMPLEMENTASI

1. **File utama yang diedit:** `src/js/monitor.js`
2. **Config:** tambah GROQ_API_KEY, GROQ_MODEL, GROQ_TEMPERATURE,
   SILARIS_MAX_HISTORY ke `src/js/config.js`
3. **Semua fungsi SiLaris** harus di-export ke `window` di bagian
   bawah `monitor.js` (sesuai pola yang sudah ada)
4. **Reach saat ini masih estimasi** — SiLaris tetap bisa analisa
   tapi perlu label "estimasi" di insight supaya tidak misleading
5. **Level 2 data** (saved, follows, dll) baru bisa real setelah
   PostForMe proxy di-deploy ke Supabase — untuk sekarang kirim
   nilai 0 atau null, AI akan skip metrik yang tidak tersedia
6. **Business context** (kategori bisnis user) akan datang dari
   form registrasi — untuk sementara bisa hardcode atau ambil
   dari Supabase user profile

---

## 16. REFERENSI DATA INSTAGRAM (InstagramPostMetricsDto)

Field yang tersedia dari PostForMe API untuk Instagram:
- `comments` — jumlah komentar
- `follows` — followers baru dari post ini
- `ig_reels_avg_watch_time` — rata-rata nonton Reels (ms)
- `ig_reels_video_view_total_time` — total waktu nonton Reels (ms)
- `likes` — jumlah likes
- `navigation` — navigasi di media
- `profile_activity` — aktivitas profil dari post
- `profile_visits` — kunjungan profil dari post
- `reach` — akun unik yang lihat
- `replies` — balasan (story only)
- `saved` — yang save post
- `shares` — jumlah share
- `total_interactions` — total semua interaksi
- `views` — total tayangan

---

*Rangkuman dibuat dari sesi diskusi 30 April 2026*
*File ini adalah lanjutan dari CONTEXT_BRIEF.md*

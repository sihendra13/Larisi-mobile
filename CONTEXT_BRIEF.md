# CONTEXT_BRIEF — radar-larisi (Larisi Dashboard)
> Dokumen ini dibuat untuk onboarding AI tools baru (Jules, Cursor, dll)
> atau melanjutkan development di chat/session baru.
> Last updated: 25 April 2026

---

## 1. IDENTITAS PROYEK

| Field | Detail |
|---|---|
| **Nama Produk** | Larisi (sebelumnya: LaRas / RADAR) |
| **Jenis** | Social Media Publishing Dashboard untuk UMKM Indonesia |
| **Target User** | Pemilik bisnis UMKM lokal Indonesia |
| **Stack** | Vanilla JS, HTML, CSS (modular), Supabase, PostForMe API |
| **Folder lokal** | `~/Desktop/Claude Code/Larisi/radar-larisi` |
| **Dev server** | `python3 -m http.server 8080` → `localhost:8080` |
| **GitHub** | Belum di-push (masih lokal) |

---

## 2. STRUKTUR FOLDER

```
radar-larisi/
├── index.html                  ← entry point utama
├── src/
│   ├── js/
│   │   ├── config.js           ← RADAR_CONFIG, Supabase URL/key
│   │   ├── supabase.js         ← Supabase client, getCampaigns, deleteCampaign
│   │   ├── buffer.js           ← publish logic, PostForMe API, connect channels
│   │   ├── state.js            ← global variables, PLATFORMS, CHANNEL_FORMAT_MAP
│   │   ├── monitor.js          ← Campaign Live Monitor (Menu 2) ← SERING DIEDIT
│   │   ├── main.js             ← DOMContentLoaded init, switchMenu
│   │   ├── launch.js           ← launch flow, campaign data collection
│   │   ├── upload.js           ← file upload, phone preview, uploadedDataURLs
│   │   ├── export.js           ← canvas capture (exportCreativeCanvas)
│   │   ├── phone-preview.js    ← platform mockup, selectFormat(), cycleChannel()
│   │   ├── caption.js          ← AI caption generate per platform
│   │   ├── stitch.js           ← geo-stitching text overlay
│   │   ├── map.js              ← Leaflet map, radius, reach estimasi
│   │   ├── reach.js            ← reach counter logic
│   │   ├── boost.js            ← boost campaign UI
│   │   ├── analytics.js        ← analytics Menu 3
│   │   └── persona.js          ← AI persona detection dari foto
│   ├── css/
│   │   ├── tokens.css          ← design tokens, CSS variables
│   │   ├── layout.css          ← grid, sidebar, main layout
│   │   ├── monitor.css         ← styles untuk Menu 2
│   │   ├── panel.css           ← left panel styles
│   │   ├── map.css             ← map styles
│   │   ├── upload.css          ← upload zone styles
│   │   ├── phone.css           ← phone preview styles
│   │   ├── caption.css         ← caption panel styles
│   │   ├── stitch.css          ← stitch overlay styles
│   │   ├── chips.css           ← platform chips styles
│   │   └── bottom-bar.css      ← bottom bar styles
│   └── data/
│       ├── locations.js        ← database kecamatan Indonesia
│       ├── region-dialek.js    ← mapping region → dialek
│       ├── personas.js         ← 25 master persona data
│       └── caption-templates.js ← caption templates per persona per platform
├── postforme-callback/
│   └── index.html              ← callback page setelah OAuth platform
└── CONTEXT_BRIEF.md            ← file ini
```

---

## 3. MENU STRUKTUR

| Menu | Ikon | Fungsi |
|---|---|---|
| **Menu 1** | Grid | Creative Studio — upload foto/video, map radar, caption AI, launch |
| **Menu 2** | Monitor | Campaign Live Monitor — lihat semua campaign running |
| **Menu 3** | Chart | Analytics (dalam pengembangan) |

---

## 4. INTEGRASI EKSTERNAL

### PostForMe API
- Dipakai untuk: publish post ke IG/TikTok/Facebook/YouTube
- Akses via Supabase Edge Function proxy
- Proxy endpoint: `/functions/v1/postforme-proxy`
- **PENTING:** Proxy hanya jalan di Supabase cloud, TIDAK di localhost
- Endpoints yang dipakai:
  - `POST /v1/media/create-upload-url` → upload media
  - `POST /v1/posts` → publish post
  - `GET /v1/posts/:id` → get post stats

### Supabase
- Dipakai untuk: database campaigns, auth, proxy PostForMe
- Config ada di `src/js/config.js` (RADAR_CONFIG)
- Tabel utama: `campaigns`
- Fields tabel campaigns:
  - `id` (uuid)
  - `session_id`
  - `post_id` (PostForMe post ID, format: `sp_xxxxx`)
  - `name` (nama campaign)
  - `status` (running/paused)
  - `platforms` (array: ["ig", "tiktok", dll])
  - `reach`, `reachTarget`
  - `thumbUrl` (base64 foto thumbnail, null untuk campaign lama)
  - `thumbColor` (warna fallback)
  - `launchTime`
  - `created_at`

### Platform OAuth
- Connect akun via PostForMe OAuth flow
- Callback URL: `localhost:8080/postforme-callback/`
- Supported: Instagram, TikTok, Facebook, YouTube
- Error "External Id already" = akun sudah pernah dikoneksikan

---

## 5. FITUR YANG SUDAH SELESAI

### Menu 1 (Creative Studio)
- [x] Upload foto (max 5) atau video (max 1)
- [x] Tidak bisa campur foto + video
- [x] Phone preview per platform
- [x] Map radar dengan Leaflet
- [x] Search kecamatan + tombol X clear
- [x] Radius slider
- [x] Estimasi reach
- [x] Label "Warga Sekitar" & "Pengunjung" (bukan Local Resident/Traveler)
- [x] Pin merah di bawah tombol minus map
- [x] AI Persona detection dari foto
- [x] Caption generation per platform
- [x] Geo-stitching text overlay
- [x] Launch campaign → simpan ke Supabase + publish via PostForMe

### Menu 2 (Campaign Live Monitor)
- [x] Card campaign dengan thumbnail foto
- [x] Avatar inisial (fallback kalau foto profil kosong/expired)
- [x] Platform badge (IG/TikTok/Facebook/YouTube) di pojok avatar
- [x] Nama campaign truncated dengan `...` kalau panjang
- [x] Status RUNNING badge
- [x] Ikon delete SVG clean (sama style dengan sidebar)
- [x] Modal konfirmasi delete dengan warning "post tidak terhapus di platform"
- [x] Delete campaign → hapus dari Supabase + hapus card dari DOM
- [x] Engagement rows: Reactions, Comments, Shares, Views, Reach
- [x] Views: tampil angka kalau ada, `—` kalau kosong
- [x] Reach: tampil angka + label `(estimasi)`
- [x] Thumbnail: 240px height, object-fit cover
- [x] Placeholder "Foto tidak tersedia" untuk campaign tanpa thumbUrl
- [x] Filter: All / Running / Paused
- [x] AI Co-Pilot panel di kanan
- [x] Boost Campaign button

---

## 6. YANG BELUM SELESAI / TODO

- [ ] Reach & Views real dari PostForMe API (butuh deploy ke Supabase)
- [ ] Foto profil akun dari Instagram API
- [ ] Analytics Menu 3
- [ ] Push ke GitHub
- [ ] Deploy ke Supabase / production
- [ ] Multi-user authentication
- [ ] Payment/subscription system

---

## 7. KNOWN ISSUES & CATATAN PENTING

### Data Reach
- Reach di Monitor sekarang = **estimasi radius** (bukan real dari API)
- Real reach hanya bisa di-fetch setelah deploy ke Supabase (proxy tidak jalan di localhost)
- Field `reach` di CAMPAIGNS object = estimasi, bukan dari PostForMe

### Data Views
- Views yang real (angka seperti 94, 193) hanya muncul untuk campaign yang sudah punya `post_id` valid DAN data sudah di-fetch dari PostForMe
- Di localhost, fetch PostForMe tidak bisa (proxy 501/404)

### Avatar
- `profile_photo_url` dari PostForMe selalu kosong (`""`) untuk akun yang ditest
- Solusi: fallback ke inisial nama campaign dengan warna `thumbColor`

### thumbUrl
- Campaign lama (sebelum fix) = `thumbUrl: null`
- Campaign baru = `thumbUrl` berisi base64 foto yang diupload saat launch
- Thumbnail hanya muncul untuk campaign baru

### window exports
- Semua fungsi di `monitor.js` harus di-export ke `window` di bagian bawah file
- Tanpa ini, fungsi tidak bisa dipanggil dari HTML onclick

### Port 8080
- Kalau error "Address already in use":
  `lsof -ti:8080 | xargs kill -9 && python3 -m http.server 8080`

---

## 8. CARA ONBOARDING AI TOOL BARU

Kalau melanjutkan di Jules, Cursor, atau chat baru:

1. Buka folder `radar-larisi`
2. Baca file ini dulu
3. File yang paling sering diedit: `src/js/monitor.js`, `src/js/map.js`, `index.html`
4. Jalankan server: `python3 -m http.server 8080`
5. Test di browser: `localhost:8080`

---

## 9. MASTER PROMPT LARISI (AI COPYWRITER)

Larisi menggunakan sistem AI Copywriter dengan 25 Master Persona berdasarkan dialek lokal Indonesia:

- **Medan/Sumut**: Paten, Ketua, Gas, Bukan kaleng-kaleng
- **Jakarta**: Literally, Worth it, Vibe, Jujurly, Bestie
- **Surabaya/Jatim**: Rek, Uenak Pol, Gak pakai suwe, Budal, Sikat
- **Bandung/Jabar**: Sampurasun, Raos, Merenah, Mangga, Geulis
- **Makassar**: Ewako, Mantap mentong, Sikat, Berani
- **Jogja/Solo**: Sampun caket, Pinarak, Mirah, Luwes
- **Bali**: Rahajeng, Becik, Bli/Gek, Suksma
- **Papua**: Pace/Mace, Kaka, Mantap terus, Mari jo

Output format:
- 1 Text Stitching (Visual Hook + CTA dialek)
- 3 Variasi Caption (Emosional / Logika / Urgensi)

---

*Dibuat otomatis dari session development 25 April 2026*

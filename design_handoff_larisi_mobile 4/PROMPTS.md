# Prompts untuk Claude Code

Cheat sheet siap copy-paste. Pakai berurutan dari atas ke bawah.

> Asumsi: folder ini sudah ada di `design/design_handoff_larisi_mobile/` di repo kamu. Kalau path-nya beda, ganti semua referensi path di prompt di bawah.

---

## 🚀 Step 0 — Audit awal (jalankan sekali aja)

```
Aku baru upload folder design/design_handoff_larisi_mobile/ ke repo ini.
Baca README.md di folder itu sampai habis sebelum mulai apapun.

Kemudian laporkan ke aku:
1. Stack apa yang dipakai di repo ini? (React / Next / Vue / dll)
2. Apakah design tokens (warna, type, spacing) sudah ada di theme system?
3. Komponen apa yang sudah ada di repo vs yang perlu dibuat dari nol untuk
   mengejar spec di README?
4. Library map apa yang sudah terpasang? (Mapbox / Google / Leaflet / belum ada)
5. Endpoint AI untuk generate caption sudah ada belum?

Jangan tulis kode apapun di step ini — laporkan dulu hasil audit.
```

---

## 🎨 Step 1 — Setup design tokens

```
Sesuai laporan audit, sekarang setup design tokens dari section "Design Tokens"
di design/design_handoff_larisi_mobile/README.md ke theme system yang sudah ada.

- Warna: pakai CSS variables / Tailwind config / theme provider yang sudah ada
- Font Inter dari Google Fonts (kalau belum di-load)
- Radii & spacing sebagai constants

Setelah selesai, kasih lihat ke aku diff config file-nya, sebelum lanjut bikin
komponen.
```

---

## 🧱 Step 2 — Atom components

```
Build atom components yang akan dipakai berkali-kali, simpan di folder
components/ui/ (atau sesuai konvensi repo):

- Card (white card with border)
- IconButton (round 36px button with border)
- Toggle (iOS-style switch)
- Pill (rounded chip)
- StatCard (with colored top accent)
- AvatarTile (gradient IG ring + letter)

Spec di README section "Design Tokens" + "Iconography". Untuk icon pakai
Lucide React (mapping ada di README).

Test masing-masing dengan storybook / playground sederhana.
```

---

## 📐 Step 3 — Layout shells

```
Build layout shells yang dipakai semua screen:

- AppHeader (logo + search + bell + avatar) — spec di section "01 · Beranda"
- BottomNav 3 tab (Dapur / Kelola / Performa) — spec di section "Bottom navigation"
- StickyCTABar (floating at bottom: 78px above bottom nav) — spec di section
  "CTABar stacking pattern"

Untuk routing pakai router yang sudah dipasang di repo. Klik tab "Dapur"
selalu navigate ke /dapur-konten, dst.
```

---

## 📱 Step 4 — Screen 02: Dapur Konten

```
Implement screen 02 Dapur Konten sebagai mobile breakpoint (max-width 480px)
dari halaman /dapur-konten di repo.

Referensi:
- Visual: design/design_handoff_larisi_mobile/screenshots/02-dapur-konten.png
- Spec lengkap: section "02 · Dapur Konten" di README
- Mockup source: design/design_handoff_larisi_mobile/screens/dapur-konten.jsx
  (referensi struktur DOM dan inline style — JANGAN dicopy mentah, pakai
  komponen yang sudah dibuat di step 2-3)

Yang harus ada di screen ini:
- AppHeader
- PageTitle "Dapur Konten" + subtitle
- StepRow 4 pills, "Audiens" active
- AsetCard (dashed upload zone striped pattern + 5 thumbnail slots)
- AudiensCard (2 toggle rows: Warga Sekitar / Pengunjung)
- MapCard:
  - Map asli kalau library sudah ada di repo
  - Kalau belum, pakai placeholder image dulu dengan note
  - Radius slider tetap dibuat
- CTABar floating di atas bottom nav ("Estimasi Jangkauan" + tombol "Tayangkan")
- BottomNav (Dapur active)

State management:
- File: assets (max 5 foto / 1 video)
- Form: audience[], location, radiusKm
- Auto-save draft kalau user pindah tab (lihat README "Navigation")

Setelah selesai, jalankan di mobile viewport (390px) dan compare dengan
screenshot. Tunjukkan ke aku kalau ada bagian yang nggak yakin.
```

---

## 📱 Step 5 — Screen 03: AI + Preview

```
Implement screen 03 di route /dapur-konten/ai.

Referensi:
- Visual: design/design_handoff_larisi_mobile/screenshots/03-ai-preview.png
- Spec: section "03 · AI + Preview" di README
- Mockup: design/design_handoff_larisi_mobile/screens/dapur-konten.jsx (ScreenAI)

Reuse semua komponen dari screen 02 (AppHeader, PageTitle, StepRow, CTABar,
BottomNav). Tambahan komponen baru:
- AICard (sliders + textarea AI + tombol Generate ulang)
- SocialAccountsCard (avatar IG + dashed + button)
- PreviewCard (segmented Post/Reel/Story + black phone mockup)

Untuk AI message, kalau endpoint backend sudah ada → wire up. Kalau belum →
pakai placeholder loading state dulu.

StepRow: "AI" active sekarang (index 2).
```

---

## 📱 Step 6 — Screen 04: Kelola Iklan

```
Implement screen 04 di route /kelola-iklan.

Referensi:
- Visual: design/design_handoff_larisi_mobile/screenshots/04-kelola-iklan.png
- Spec: section "04 · Kelola Iklan" di README
- Mockup: design/design_handoff_larisi_mobile/screens/kelola-iklan.jsx

Yang baru:
- KFilterBar (3 pill: Semua / Berjalan / Diarsipkan + filter icon)
- KAdCard (avatar + status + thumbnail + ENGAGEMENTS metrics + Reach bar + Boost)
- KFloatingAI (56px circular button bottom-right)

Data ads dari API. Kalau belum ada, mock 2-3 sample.
BottomNav: "Kelola" active.
```

---

## 📱 Step 7 — Screen 05: Detail Iklan (sub-page)

```
Implement screen 05 di route /kelola-iklan/[id].

Referensi:
- Visual: design/design_handoff_larisi_mobile/screenshots/05-detail-iklan.png
- Spec: section "05 · Detail Iklan" di README

Sub-page → TIDAK ADA bottom nav, ada top bar (back + Detail Iklan + more).
Sticky action bar: Jeda + Boost Iklan.

Komponen baru:
- MetricTile (small + big variants)
- MiniChart (area chart 7 hari)
- InsightCard (gradient bg + SiLaris suggestion)
```

---

## 📱 Step 8 — Screen 06: Chat SiLaris

```
Implement screen 06 di route /kelola-iklan/chat.

Referensi:
- Visual: design/design_handoff_larisi_mobile/screenshots/06-chat-silaris.png
- Spec: section "06 · Chat SiLaris" di README

Komponen baru:
- ChatHeader (back + sparkle avatar + name + online dot)
- ChatBubble AI (with avatar, asymmetric radius)
- ChatBubble User (purple, right-aligned)
- AttachedAdChip
- SuggestionChip
- ChatInput (plus + input + send)

Sub-page → no bottom nav. Wire up ke backend chat AI yang sudah ada
(atau mock dulu).
```

---

## 📱 Step 9 — Screen 07-09: Performa Iklan

```
Implement Performa Iklan dengan top-tabs:
- /performa-iklan       → tab Insight (screen 07)
- /performa-iklan/pulse → tab Local Pulse (screen 08)
- /performa-iklan/tools → tab Tools (screen 09)

Referensi:
- Visual: design/design_handoff_larisi_mobile/screenshots/07-09.png
- Spec: section "07-09 · Performa Iklan" di README
- Mockup: design/design_handoff_larisi_mobile/screens/performa-iklan.jsx

Semua 3 screen pakai BottomNav (Performa active) + PTabs (top tabs).

Komponen baru:
- StatCard with colored top accent (4 warna)
- SiLarisCard (analysis dengan 2 inline insight boxes)
- MoodCard (emoji grid 2x2)
- PlatformCard (3 platform rows)
- PulseRow (icon-tile + eyebrow + value + sub)
- EmptyRecState (progress checkboxes)
- CompetitorCard
- StrategiAccordion
```

---

## 🐛 Troubleshooting prompts

### Kalau hasilnya beda dari screenshot

```
Output kamu untuk screen [X] beda dari screenshots/[nama].png di bagian [...].
Cek lagi spec di README section "[nama]" dan design tokens. Tunjukkan diff
sebelum/sesudah perbaikan.
```

### Kalau ada elemen yang kamu nggak yakin

```
Screen [X] section [...] kayaknya bisa diimplement dengan 2-3 cara.
Jangan langsung pilih — kasih opsi ke aku dulu dengan plus-minus masing-masing,
baru aku pilih.
```

### Kalau Claude Code bikin tokens baru / komponen duplikat

```
Stop. Lihat lagi components/ui/ — apakah ada komponen existing yang fungsinya
sama? Jangan bikin duplikat. Kalau memang butuh, extend yang ada via props,
bukan bikin baru.
```

---

## 📋 Checklist sebelum merge tiap screen

Untuk dipakai sebelum merge PR setiap screen:

```
Review screen [X] yang baru kamu implement dengan checklist ini:

[ ] Pakai design tokens dari theme, BUKAN hex literal di komponen
[ ] Reuse atom components yang sudah ada, BUKAN duplikat baru
[ ] Mobile viewport 390px render persis seperti screenshots/[nama].png
[ ] Viewport 360px (Android kecil) masih readable
[ ] Viewport 430px (Pro Max) konten di-center
[ ] Bottom nav muncul di top-level page, hilang di sub-page
[ ] Sticky elements (CTABar / action bar) di posisi yang benar
[ ] Tap targets minimal 44x44 px
[ ] Loading & empty state sudah dipikirkan
[ ] Indonesian copy persis sama dengan README (jangan diparafrase)

Laporkan hasil checklist sebelum minta aku review.
```

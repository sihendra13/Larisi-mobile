'use client';
import { useState, useEffect, useRef } from 'react';
import QuotaWarningBanner from './QuotaWarningBanner';

const PLATFORM_ICONS = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#1877F2"/>
      <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/>
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#000"/>
      <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#FF0000"/>
      <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
    </svg>
  ),
};

/* Smaller icon variant for inside the caption card header */
const PLATFORM_ICONS_SM = {
  instagram: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/>
    </svg>
  ),
  facebook: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#1877F2"/>
      <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/>
    </svg>
  ),
  tiktok: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#000"/>
      <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
    </svg>
  ),
  youtube: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#FF0000"/>
      <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
    </svg>
  ),
};

const PLATFORM_LABELS = { instagram:'Instagram', facebook:'Facebook', tiktok:'TikTok', youtube:'YouTube' };
const FORMAT_LABELS   = { post:'Post', reel:'Reel', story:'Story' };

/* ── Reach formula ── */
function computeReach(locPop, radius, localOn, travelerOn) {
  if (!localOn && !travelerOn) return 0;
  const areaFactor  = Math.PI * radius * radius;
  const densityBase = locPop / (Math.PI * 5 * 5);
  const areaPop     = Math.round(densityBase * areaFactor);
  return (localOn ? areaPop : 0) + (travelerOn ? Math.round(areaPop * 0.22) : 0);
}
function fmtReach(n) {
  if (!n) return '0';
  if (n >= 10000) return Math.round(n / 1000) + 'K';
  return n.toLocaleString('id-ID');
}

/* ── Progress bar ── */
const ProgressBar = ({ step, total }) => (
  <div style={{display:'flex', gap:'4px', padding:'0 16px', marginTop:'2px'}}>
    {Array.from({length:total}).map((_,i) => (
      <div key={i} style={{flex:1, height:'3px', borderRadius:'2px', background: i < step ? 'var(--m-brand)' : '#E4E4EB'}} />
    ))}
  </div>
);

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

/* ── PostForMe proxy helper ── */
async function pfmProxy(endpoint, method, body, accessToken) {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/postforme-proxy`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, method: method || 'GET', body }),
  });
  if (!resp.ok) { const t = await resp.text(); throw new Error('Proxy ' + resp.status + ': ' + t); }
  return resp.json();
}

/* ── Buat compressed thumbnail dari blob URL foto (max 600px, JPEG 90%) ── */
function createThumbFromUrl(blobUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxW = 600;
        const ratio = maxW / img.naturalWidth;
        const c = document.createElement('canvas');
        c.width  = maxW;
        c.height = Math.round(img.naturalHeight * ratio);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.9));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = blobUrl;
  });
}

/* ── Capture frame 0.5s dari video blob URL (480×270, JPEG 80%) ── */
function captureVideoThumb(blobUrl) {
  return new Promise(resolve => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted   = true;
    video.src     = blobUrl;
    video.addEventListener('loadeddata', () => {
      video.currentTime = Math.min(0.5, video.duration || 0.5);
    });
    video.addEventListener('seeked', () => {
      try {
        const c = document.createElement('canvas');
        c.width = 480; c.height = 270;
        c.getContext('2d').drawImage(video, 0, 0, 480, 270);
        resolve(c.toDataURL('image/jpeg', 0.8));
      } catch { resolve(null); }
    });
    video.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 8000); // timeout 8 detik
  });
}

/* ── Upload thumbnail ke Supabase Storage → return public URL ── */
async function uploadThumbToStorage(campaignId, dataUrl, accessToken) {
  if (!campaignId || !dataUrl?.startsWith('data:image')) return null;
  try {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const path = `${campaignId}.jpg`;
    const res  = await fetch(`${SUPABASE_URL}/storage/v1/object/thumbnails/${path}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
      body: blob,
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/thumbnails/${path}`;
  } catch { return null; }
}

/* ── USP fallback per kategori (identik dengan desktop caption.js) ── */
const USP_FALLBACKS = {
  fnb:                 'Cita rasa yang bikin balik lagi',
  kafe:                'Tempat ngopi paling nyaman',
  fashion_wanita:      'Koleksi fashion wanita terlengkap',
  fashion_pria:        'Outfit pria yang selalu on point',
  fashion_muslim:      'Koleksi muslimah syari dan stylish',
  fashion_muslim_pria: 'Koleksi koko dan gamis terbaik',
  kesehatan:           'Perawatan kulit yang terbukti',
  salon:               'Perawatan profesional terpercaya',
  barber:              'Cukur rapi dan stylish',
  elektronik:          'Gadget lengkap bergaransi resmi',
  otomotif:            'Servis terpercaya bersertifikat',
  properti:            'Hunian impian keluarga',
  pendidikan:          'Belajar lebih mudah dan menyenangkan',
  wisata:              'Pengalaman wisata tak terlupakan',
  kerajinan:           'Kerajinan tangan otentik lokal',
  retail:              'Kebutuhan sehari-hari lengkap',
  olahraga:            'Peralatan & komunitas olahraga terlengkap',
  laundry:             'Bersih sempurna, antar-jemput tersedia',
  fotografi:           'Foto profesional hasil berkualitas studio',
  catering:            'Masakan lezat, pelayanan bintang lima',
  jasa_profesional:    'Solusi profesional cepat dan terpercaya',
  jasa:                'Layanan profesional terpercaya',
  pet:                 'Perawatan hewan penuh kasih dan profesional',
  lainnya:             'Pilihan terbaik untuk kamu',
};

/* ── Deteksi dialek dari area target (keyword-based untuk mobile) ── */
function detectGreeting(locFull) {
  const l = (locFull || '').toLowerCase();
  if (/yogya|sleman|bantul|gunung.?kidul|kulon.?progo/.test(l)) return { greeting: 'Sugeng rawuh',      cta: 'Mampir yuk!' };
  if (/solo|surakarta|sukoharjo|klaten|boyolali|wonogiri|karanganyar|sragen/.test(l)) return { greeting: 'Sugeng rawuh', cta: 'Mampir yuk!' };
  if (/semarang|kendal|demak|salatiga/.test(l))      return { greeting: 'Sugeng rawuh',         cta: 'Mampir yuk!' };
  if (/jakarta|bekasi|depok|tangerang|bogor/.test(l)) return { greeting: 'Halo Bestie!',        cta: 'Sikat Sekarang!' };
  if (/surabaya|sidoarjo|gresik/.test(l))             return { greeting: 'Halo Rek!',           cta: 'Budal Saiki!' };
  if (/malang|batu|pasuruan|probolinggo/.test(l))     return { greeting: 'Halo Rek!',           cta: 'Budal Saiki!' };
  if (/bandung|cimahi|garut|sumedang/.test(l))        return { greeting: 'Sampurasun',          cta: 'Mangga Mampir!' };
  if (/makassar|gowa|maros/.test(l))                  return { greeting: 'Ewako, Daeng!',       cta: 'Sikat Mentong!' };
  if (/bali|denpasar|badung|gianyar|tabanan/.test(l)) return { greeting: 'Rahajeng semeton',    cta: 'Luungan Mai!' };
  if (/medan|deli|binjai/.test(l))                    return { greeting: 'Horas Ketua!',        cta: 'Gas Sekarang!' };
  if (/manado|minahasa/.test(l))                      return { greeting: 'Halo Kita Samua!',    cta: 'Ayo Coba!' };
  if (/palembang/.test(l))                            return { greeting: 'Apo Kabar Kawan!',    cta: 'Ayo Gaskeun!' };
  return { greeting: 'Halo Sahabat!', cta: 'Cek Sekarang!' };
}

/* ── Build system prompt untuk AI caption ──
   aiCallCount: naik tiap klik Generate → rotasi hook style per call, bukan per jam ── */
function buildSystemPrompt(profile, persona, platform, format, locName, locFull, aiCallCount) {
  const bizName    = profile?.business_name || '';
  const category   = profile?.category      || '';
  const uspRaw     = profile?.usp?.trim()   || '';
  const usp        = uspRaw || USP_FALLBACKS[category] || 'Pilihan terbaik untuk kamu';
  const bizKec     = profile?.kecamatan     || '';
  const bizKab     = profile?.kabupaten     || profile?.city || '';
  const bizLoc     = [bizKec, bizKab].filter(Boolean).join(', ') || locFull || '';
  const hasDelivery = profile?.delivery_service || false;
  const targetArea  = locName || '';

  /* ── Deteksi apakah target di luar region bisnis → tambah nama kota (sama seperti desktop) ── */
  const _regionMap = {
    jogja:       ['sleman','bantul','kulon progo','gunungkidul','gunung kidul','yogyakarta'],
    solo:        ['surakarta','solo','sukoharjo','karanganyar','klaten','wonogiri','boyolali','sragen'],
    semarang:    ['semarang','kendal','demak','kudus','jepara','pati'],
    jakarta:     ['jakarta','tangerang','bekasi','depok','bogor','kemayoran','tanjung priok','menteng','gambir'],
    bandung:     ['bandung','sumedang','garut','tasikmalaya','cimahi','cirebon'],
    surabaya:    ['surabaya','sidoarjo','gresik','mojokerto'],
    malang:      ['malang','pasuruan','probolinggo','lumajang'],
    medan:       ['medan','deli serdang','binjai','langkat'],
    makassar:    ['makassar','gowa','maros'],
    bali:        ['badung','gianyar','tabanan','denpasar','bali'],
  };
  const _cityLabel = { jogja:'Yogyakarta', solo:'Solo', semarang:'Semarang', jakarta:'Jakarta',
    bandung:'Bandung', surabaya:'Surabaya', malang:'Malang', medan:'Medan',
    makassar:'Makassar', bali:'Bali' };

  const _toRegion = (str) => {
    if (!str) return null;
    const s = str.toLowerCase();
    for (const [region, keywords] of Object.entries(_regionMap)) {
      if (keywords.some(k => s.includes(k))) return region;
    }
    return null;
  };

  const _bizRegion    = _toRegion(bizKab || bizKec);
  const _targetRegion = _toRegion(locFull || targetArea);
  const _isFarTarget  = _bizRegion && _targetRegion && _bizRegion !== _targetRegion;
  const bizLocDisplay = (_isFarTarget && _cityLabel[_bizRegion])
    ? `${bizLoc}, ${_cityLabel[_bizRegion]}`
    : bizLoc;

  const personaName   = persona?.name   || category || 'General';
  const personaTarget = persona?.target || '';
  const personaAge    = persona?.age    || '18–45';

  /* ── Dialek greeting dari area target ── */
  const dialek   = detectGreeting(locFull || targetArea);
  const greeting = dialek.greeting;

  /* ── Platform label ── */
  const platLabel = {
    instagram: format === 'reel'  ? 'Instagram Reel — hook kuat di baris pertama, energetik, maks 3 baris'
             : format === 'story' ? 'Instagram Story — sangat singkat, 1–2 kalimat + CTA'
             :                      'Instagram Post — caption bisa 3–5 baris, padat dan engaging',
    facebook:  'Facebook/Meta Ad — informatif, langsung ke poin, ada CTA jelas',
    tiktok:    'TikTok — casual, fun, relevan dengan tren, maks 3 baris',
    youtube:   'YouTube — deskripsi 2–3 kalimat + CTA',
  }[platform] || 'Instagram Post';

  /* ── Luxury/premium detection dari USP ── */
  const uspLower    = usp.toLowerCase();
  const luxuryWords  = ['luxury','mewah','eksklusif','high-end','high end','branded',
    'limited edition','premium leather','emas','berlian','platinum',
    'prestige','prestise','kelas atas','bespoke','artisan premium'];
  const premiumWords = ['premium','grade a','kualitas tinggi'];
  const isLuxury   = luxuryWords.some(w  => uspLower.includes(w));
  const isPremium  = !isLuxury && premiumWords.some(w => uspLower.includes(w));
  const positioningLine = isLuxury
    ? '- POSITIONING LUXURY: USP menunjukkan produk/layanan premium-luxury — gunakan tone aspirasional, sophisticated, dan eksklusif. Caption harus terasa prestige, bukan sekadar promosi biasa.'
    : isPremium
    ? '- POSITIONING PREMIUM: USP menunjukkan kualitas di atas rata-rata — caption sedikit lebih polished dan quality-focused, hindari kesan murahan.'
    : null;

  /* ── Hook rotation — per AI call count (bukan per jam) ── */
  const n    = (aiCallCount || 0) % 4;
  const biz  = bizName || 'kami';
  const loc  = bizLocDisplay || bizLoc || 'lokasi kami';
  const area = targetArea || 'sekitar';
  const u    = usp || 'kualitas terbaik';
  const hookInstructions = [
    /* 0 — Pertanyaan langsung */
    `Gunakan PERTANYAAN LANGSUNG ke audiens sebagai hook.\n` +
    `Contoh baris hook: "Warga ${area}, belum cobain ${biz} di ${loc}? Sayang banget kalau dilewatkan!"`,
    /* 1 — Pernyataan bold USP */
    `Mulai dengan PERNYATAAN BOLD tentang USP — sebut keunggulan dulu, baru nama bisnis dan lokasi.\n` +
    `Contoh baris hook: "${u} — itulah yang bikin ${biz} di ${loc} jadi pilihan warga ${area}."`,
    /* 2 — Cerita/situasi relatable */
    `Mulai dengan CERITA SINGKAT atau situasi yang relate — bayangkan kondisi audiens sebelum tahu bisnis ini.\n` +
    `Contoh baris hook: "Lagi cari yang beda dari biasanya, ${area}? ${biz} di ${loc} jawabannya."`,
    /* 3 — Social proof */
    `Mulai dengan SOCIAL PROOF atau fakta menarik — sebut pelanggan setia, reaksi nyata, atau keunikan bisnis.\n` +
    `Contoh baris hook: "Sudah ribuan orang buktikan — ${biz} di ${loc} memang beda. Warga ${area}, kapan giliranmu?"`,
  ];
  const hookStyle = hookInstructions[n];

  return [
    'Kamu adalah copywriter profesional spesialis UMKM lokal Indonesia.',
    'Buat 1 caption media sosial yang segar, autentik, dan efektif untuk bisnis berikut.',
    '',
    'DATA BISNIS:',
    `- Nama: ${bizName || 'UMKM'}`,
    `- Kategori: ${category}`,
    `- Keunggulan utama (USP): ${usp}`,
    `- Lokasi bisnis: ${bizLocDisplay || bizLoc || 'tidak disebutkan'}`,
    `- Area target iklan: ${targetArea || bizLocDisplay || bizLoc || 'sekitar lokasi bisnis'}`,
    `- Layanan antar: ${hasDelivery ? 'ada' : 'tidak ada'}`,
    '',
    'MASTER PERSONA (target audiens):',
    `- Persona: ${personaName}`,
    `- Target: ${personaTarget}`,
    `- Usia: ${personaAge}`,
    '',
    `PLATFORM: ${platLabel}`,
    '',
    'FORMAT SAPAAN:',
    `- Baris pertama: sapaan saja → "${greeting}"`,
    '- Baris kedua: kosong',
    '- Baris ketiga: langsung hook (JANGAN selalu mulai dengan "Warga [area]..." — sesuaikan dengan gaya hook di bawah)',
    '',
    'GAYA HOOK — WAJIB ikuti instruksi berikut:',
    hookStyle,
    '',
    'ATURAN WAJIB:',
    '- Bahasa Indonesia natural, tidak kaku, tidak terkesan iklan murahan',
    '- Sesuaikan gaya bahasa dengan persona — foodie/anak muda = santai & seru, profesional = informatif & hangat',
    positioningLine,
    '- USP harus jadi kekuatan utama caption, bukan sekadar disebut',
    `- KRITIS — Lokasi bisnis (${bizLocDisplay || bizLoc || 'tidak diketahui'}) dan area target iklan (${targetArea || 'sekitar lokasi'}) adalah DUA HAL BERBEDA.`,
    `- DILARANG KERAS: menulis seolah bisnis berada di area target. Bisnis SELALU di lokasi aslinya (${bizLocDisplay || bizLoc || 'lokasi bisnis'}).`,
    `- Yang benar: ajak audiens di area target (${targetArea || 'sekitar'}) untuk datang/memesan ke ${bizName || 'bisnis ini'} di ${bizLocDisplay || bizLoc || 'lokasi kami'}.`,
    `- Contoh hook yang SALAH: "Ada tempat makan baru di ${targetArea || 'area target'}!" — ini SALAH karena bisnis tidak ada di sana.`,
    '- Struktur: hook menarik → nilai/cerita → CTA',
    '- Akhiri dengan 3–5 hashtag (mix populer + lokal + niche, termasuk hashtag area target)',
    '- JANGAN mengarang fakta bisnis yang tidak ada di data',
    '- JANGAN gunakan simbol markdown (**bold**, *italic*, _underline_) — Instagram tidak render ini, tulis plain text saja',
    '- Output HANYA caption, tanpa penjelasan atau label tambahan',
  ].filter(l => l !== null && l !== undefined).join('\n');
}

const MAX_CHAR = { instagram:2200, facebook:63206, tiktok:2200, youtube:5000 };

export default function CaptionScreen({
  platform, format, files,
  locName, locFull, locPop, radius, localOn, travelerOn,
  persona, profile,
  caption, setCaption,
  accessToken, sessionId, userId,
  onBack, onUbahAset, onLaunchSuccess, triggerUpgrade,
}) {
  const [stitchOn,        setStitchOn]        = useState(true);
  const [generating,      setGenerating]      = useState(false);
  const [hasGenerated,    setHasGenerated]    = useState(false);
  const [posting,         setPosting]         = useState(false);
  const [launchPhase,     setLaunchPhase]     = useState(null); // null | 'loading' | 'success'
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [campName,        setCampName]        = useState('');

  /* ── AI call counter — naik tiap Generate, untuk rotasi hook style ── */
  const aiCallCountRef = useRef(0);

  /* ── Edit bottom sheet ── */
  const [showEditSheet,   setShowEditSheet]   = useState(false);
  const [animateEditSheet,setAnimateEditSheet]= useState(false);
  const [editDraft,       setEditDraft]       = useState('');
  const [sheetBottom,     setSheetBottom]     = useState(0);
  const [sheetExpanded,   setSheetExpanded]   = useState(false);
  const sheetSwipeRef = useRef(null);
  const textareaRef   = useRef(null);

  /* ── Warning banner states ── */
  const [warningBanner,   setWarningBanner]   = useState({ visible: false, type: 'warning', message: '' });

  const reach     = computeReach(locPop, radius, localOn, travelerOn);
  const reachText = fmtReach(reach);
  const maxChar   = MAX_CHAR[platform] || 2200;

  /* ── Real AI caption generation via Supabase Edge Function silaris-chat ── */
  const handleGenerate = async () => {
    if (files.length === 0) return;
    setGenerating(true);
    setCaption('');

    /* Naikkan counter setiap kali Generate diklik — hook style berganti tiap call */
    aiCallCountRef.current += 1;
    const systemPrompt = buildSystemPrompt(profile, persona, platform, format, locName, locFull, aiCallCountRef.current);

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/silaris-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          systemPrompt,
          messages: [{ role: 'user', content: 'Tulis captionnya sekarang. Pastikan gaya hook sesuai instruksi — jangan gunakan pola yang sama dengan caption sebelumnya.' }],
        }),
      });

      const data = await resp.json();
      if (data?.reply?.trim()) {
        /* Strip markdown kalau AI masih pakai */
        const clean = data.reply.trim()
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g,     '$1')
          .replace(/_(.*?)_/g,       '$1');

        /* Typewriter effect via React state */
        let i = 0;
        const speed = clean.length > 200 ? 12 : 18;
        const timer = setInterval(() => {
          i += 3;
          setCaption(clean.slice(0, i));
          if (i >= clean.length) {
            clearInterval(timer);
            setCaption(clean);
            setGenerating(false);
          }
        }, speed);
        return;
      }
    } catch (e) {
      console.warn('[caption] AI error, fallback:', e);
    }

    /* Fallback sederhana jika Edge Function gagal */
    const fallback = `Halo\n\n${profile?.business_name || 'Bisnis kami'} hadir untuk kamu di ${locName || 'area sekitar'}.\n${profile?.usp || 'Kualitas terbaik'} untuk pengalaman belanja yang tak terlupakan.\n\n#UMKM #${(profile?.business_name || 'bisnis').replace(/\s+/g, '')} #${locName || 'lokal'}`;
    setCaption(fallback);
    setGenerating(false);
  };

  /* ── Auto-generate on first mount only when files are present ── */
  if (!hasGenerated) {
    setHasGenerated(true);
    if (files.length > 0) setTimeout(handleGenerate, 400);
  }

  /* ── Clear caption when all assets are removed ── */
  useEffect(() => {
    if (files.length === 0) {
      setCaption('');
      setGenerating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length]);

  /* ── Initialize quota warning banner ── */
  useEffect(() => {
    if (!profile?.selected_plan) return;

    const plan = profile.selected_plan || 'freemium';
    const quota = profile?.ai_launch_count ?? 10;
    const paymentStatus = profile?.payment_status || 'trial';
    const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
    const trialStart = profile?.trial_start ? new Date(profile.trial_start) : createdAt;
    const trialDays = profile?.trial_days || 7;
    const now = new Date();
    const isResetDay = now.getDate() === 1;

    const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    const paidDays = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
    const remainingTrialDays = trialDays - diffDays;
    const remainingPaidDays = 30 - paidDays;

    let message = '';
    let type = 'warning';

    // ── A. ERROR (RED) ──
    if (plan === 'freemium') {
      if (quota <= 0 && !isResetDay) {
        message = `⚠️ Kuota iklan gratis Anda habis. Akan diisi kembali otomatis pada <b>1 bulan depan</b>. <button onclick="window._upgradeClick?.()" style="color:#A8341A;font-weight:700;text-decoration:underline;background:none;border:none;cursor:pointer;font-size:inherit;">Upgrade ke Pro Sekarang</button>`;
        type = 'danger';
      }
    } else if (plan === 'starter') {
      if (quota <= 0 && !isResetDay) {
        message = `⚠️ Jatah iklan paket <b>STARTER</b> Anda habis. <button onclick="window._upgradeClick?.()" style="color:#A8341A;font-weight:700;text-decoration:underline;background:none;border:none;cursor:pointer;font-size:inherit;">Isi Ulang / Upgrade ke Pro</button>`;
        type = 'danger';
      } else if (paymentStatus === 'paid' && paidDays >= 30 && !isResetDay) {
        message = `⚠️ Masa aktif paket <b>STARTER</b> Anda sudah habis. <button onclick="window._upgradeClick?.()" style="color:#A8341A;font-weight:700;text-decoration:underline;background:none;border:none;cursor:pointer;font-size:inherit;">Perpanjang Sekarang</button>`;
        type = 'danger';
      }
    } else if (plan === 'pro') {
      if (paymentStatus === 'paid' && paidDays >= 30 && !isResetDay) {
        message = `⚠️ Masa aktif paket <b>PRO</b> Anda sudah habis. <button onclick="window._upgradeClick?.()" style="color:#A8341A;font-weight:700;text-decoration:underline;background:none;border:none;cursor:pointer;font-size:inherit;">Perpanjang Sekarang</button>`;
        type = 'danger';
      }
    }

    // ── B. WARNING (YELLOW) — hanya jika belum ada error ──
    if (!message) {
      if (plan !== 'pro' && quota > 0 && quota <= 2) {
        message = `⚠️ Jatah iklan sisa <b>${quota}</b> lagi. <button onclick="window._upgradeClick?.()" style="color:#A8761A;font-weight:700;text-decoration:underline;background:none;border:none;cursor:pointer;font-size:inherit;">Upgrade ke Pro Sekarang</button>`;
        type = 'warning';
      } else if (plan !== 'freemium' && paymentStatus === 'trial' && remainingTrialDays > 0 && remainingTrialDays <= 2) {
        const timeText = remainingTrialDays === 1 ? '24 jam' : '2 hari';
        message = `⚠️ Masa trial berakhir dalam <b>${timeText}</b>. <button onclick="window._upgradeClick?.()" style="color:#A8761A;font-weight:700;text-decoration:underline;background:none;border:none;cursor:pointer;font-size:inherit;">Upgrade ke Pro Sekarang</button>`;
        type = 'warning';
      } else if (paymentStatus === 'paid' && remainingPaidDays > 0 && remainingPaidDays <= 3) {
        const label = plan === 'pro' ? 'Masa aktif' : 'Masa langganan';
        message = `⚠️ ${label} paket <b>${plan.toUpperCase()}</b> sisa <b>${remainingPaidDays} hari</b> lagi. <button onclick="window._upgradeClick?.()" style="color:#A8761A;font-weight:700;text-decoration:underline;background:none;border:none;cursor:pointer;font-size:inherit;">Perpanjang Sekarang</button>`;
        type = 'warning';
      }
    }

    // ── Auto-hide pada tanggal 1 (Jadwal Reset) ──
    if (isResetDay && quota <= 0) {
      message = '';
    }

    // ── Jika warning (yellow) sudah ditutup user di sesi ini, jangan tampilkan lagi ──
    // Tapi danger (red/quota habis) selalu tampil — tidak bisa ditutup
    if (message && type === 'warning' && localStorage.getItem('hide_quota_banner_session') === 'true') {
      message = '';
    }

    setWarningBanner({ visible: !!message, type, message });

    // ── Setup global function untuk upgrade button di warning banner ──
    window._upgradeClick = () => {
      if (triggerUpgrade) {
        triggerUpgrade('Upgrade Paket', 'Tingkatkan paket Anda untuk mendapatkan akses lebih banyak fitur dan kuota iklan tanpa batas.');
      }
    };

    return () => {
      delete window._upgradeClick;
    };
  }, [profile, triggerUpgrade]);

  /* ── Keyboard offset via visualViewport (iOS Safari fix) ── */
  useEffect(() => {
    if (!showEditSheet) { setSheetBottom(0); return; }
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      /* window.innerHeight stays constant on iOS when keyboard opens;
         vv.height shrinks by keyboard height → difference = keyboard height */
      setSheetBottom(Math.max(0, window.innerHeight - vv.height));
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [showEditSheet]);

  /* ── Toast helper (slide dari atas, sama seperti desktop) ── */
  const showToast = (message, type = 'success') => {
    const existing = document.getElementById('m-top-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'm-top-toast';
    const bg = type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#10B981';
    toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-80px);background:${bg};color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:700;font-family:var(--m-font,sans-serif);box-shadow:0 4px 20px rgba(0,0,0,0.25);z-index:99999;white-space:nowrap;transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),opacity 0.35s ease;opacity:0;pointer-events:none;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    }));
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(-80px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  };

  /* ── Buka confirm modal saat Tayangkan diklik ── */
  const handleTayangkan = () => {
    if (!caption || posting) return;

    const plan = profile?.selected_plan || 'freemium';
    const paymentStatus = profile?.payment_status || 'trial';
    const quotaDefaults = { freemium: 10, starter: 50, pro: 999999 };
    const quota = typeof profile?.ai_launch_count === 'number' ? profile.ai_launch_count : (quotaDefaults[plan] || 10);

    const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
    const trialStart = profile?.trial_start ? new Date(profile.trial_start) : createdAt;
    const trialDays = profile?.trial_days || 7;
    const now = new Date();
    const isResetDay = now.getDate() === 1;

    const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    const paidDays = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));

    const _triggerUpgrade = (title, desc) => { if (triggerUpgrade) triggerUpgrade(title, desc); };

    // ── A. Freemium ──
    if (plan === 'freemium' || (plan !== 'pro' && plan !== 'starter')) {
      if (quota <= 0 && !isResetDay) {
        _triggerUpgrade('Kuota Habis', 'Kuota iklan gratis Anda telah habis. Upgrade ke paket premium untuk tayang lebih banyak.');
        return;
      }
    }
    // ── B. Starter / Pro ──
    else if (plan === 'starter' || plan === 'pro') {
      // 1. Cek Kuota (Starter harus check quota)
      if (plan === 'starter' && quota <= 0 && !isResetDay) {
        _triggerUpgrade('Kuota Habis', 'Jatah iklan Starter Anda sudah habis. Isi ulang atau upgrade ke Pro untuk tayang lebih banyak.');
        return;
      }

      // 2. Cek Trial (7 hari pertama)
      if (paymentStatus === 'trial') {
        if (diffDays >= trialDays) {
          _triggerUpgrade('Trial Berakhir', 'Masa trial 7 hari Anda telah selesai. Pilih paket untuk terus menikmati akses penuh.');
          return;
        }
      }
      // 3. Cek Paid (30 hari)
      else if (paymentStatus === 'paid') {
        if (paidDays >= 30) {
          _triggerUpgrade('Langganan Expired', 'Periode langganan 30 hari Anda telah berakhir. Perpanjang untuk terus menggunakan.');
          return;
        }
      }
    }

    // ── Pre-fill nama campaign ──
    const personaName = persona?.name || profile?.category || 'Iklan Baru';
    const locShort    = locName ? locName.split(',')[0].trim() : '';
    setCampName(personaName + (locShort ? ' · ' + locShort : ''));
    setShowConfirm(true);
  };

  /* ── Actual posting setelah confirm ── */
  const handleDoLaunch = async (overrideName) => {
    setShowConfirm(false);

    const accounts = (() => {
      try { return JSON.parse(localStorage.getItem('radar_social_accounts') || '[]'); } catch { return []; }
    })();

    const platMap = { ig: 'instagram', tiktok: 'tiktok', meta: 'facebook', youtube: 'youtube' };
    const sp  = platMap[platform] || platform;
    const acc = accounts.find(a => a.platform === sp);

    const platLabels = { instagram:'Instagram', facebook:'Facebook', tiktok:'TikTok', youtube:'YouTube' };
    const fmtLabels  = { post:'Post', reel:'Reel', story:'Story', shorts:'Shorts' };
    const platName   = platLabels[sp]     || sp;
    const fmtName    = (sp === 'tiktok' || sp === 'youtube') ? '' : (fmtLabels[format] || '');

    if (!acc?.id) {
      showToast(`⚠ Akun ${platName} belum terhubung. Hubungkan di Platform.`, 'error');
      return;
    }

    setPosting(true);
    setLaunchPhase('loading');

    try {
      // Upload media — files berisi { url: 'blob:...', type: 'photo'|'video', name }
      const allMediaUrls = [];
      let thumbUrl = null; // URL thumbnail dari PostForMe CDN

      for (const file of files) {
        const blobResp = await fetch(file.url);
        if (!blobResp.ok) throw new Error('Gagal membaca file media');
        const blob = await blobResp.blob();

        // Konversi foto ke JPEG via canvas (sama seperti desktop yang selalu pakai JPEG)
        // Ini memastikan format konsisten dan media_url selalu dikembalikan PostForMe
        let uploadBlob = blob;
        if (file.type !== 'video') {
          const jpegDataUrl = await createThumbFromUrl(file.url);
          if (jpegDataUrl) {
            const arr = jpegDataUrl.split(',');
            const bstr = atob(arr[1]);
            const u8 = new Uint8Array(bstr.length);
            for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
            uploadBlob = new Blob([u8], { type: 'image/jpeg' });
          }
        }
        const mime = file.type === 'video' ? (blob.type || 'video/mp4') : 'image/jpeg';

        const uploadMeta = await pfmProxy('/v1/media/create-upload-url', 'POST', { content_type: mime }, accessToken);
        if (!uploadMeta?.upload_url) throw new Error('Gagal mendapatkan URL upload');
        const upResp = await fetch(uploadMeta.upload_url, { method: 'PUT', body: uploadBlob, headers: { 'Content-Type': mime } });
        if (!upResp.ok) throw new Error('Upload media gagal: ' + upResp.status);

        // Coba semua kemungkinan field nama URL dari PostForMe response
        const mediaUrl = uploadMeta.media_url || uploadMeta.url || uploadMeta.file_url
          || uploadMeta.public_url || uploadMeta.cdn_url
          || (uploadMeta.media && (uploadMeta.media.url || uploadMeta.media.media_url))
          || null;

        allMediaUrls.push(mediaUrl);

        // Thumbnail = media pertama (foto). Video: generate dari frame canvas
        if (!thumbUrl) {
          if (file.type === 'video') {
            // Capture frame video sebagai thumbnail JPEG — upload terpisah ke PostForMe
            const frameDataUrl = await captureVideoThumb(file.url);
            if (frameDataUrl) {
              const arr2 = frameDataUrl.split(',');
              const bstr2 = atob(arr2[1]);
              const u82 = new Uint8Array(bstr2.length);
              for (let i = 0; i < bstr2.length; i++) u82[i] = bstr2.charCodeAt(i);
              const frameBlob = new Blob([u82], { type: 'image/jpeg' });
              try {
                const thumbMeta = await pfmProxy('/v1/media/create-upload-url', 'POST', { content_type: 'image/jpeg' }, accessToken);
                if (thumbMeta?.upload_url) {
                  const tResp = await fetch(thumbMeta.upload_url, { method: 'PUT', body: frameBlob, headers: { 'Content-Type': 'image/jpeg' } });
                  if (tResp.ok) {
                    thumbUrl = thumbMeta.media_url || thumbMeta.url || thumbMeta.file_url || thumbMeta.public_url || null;
                  }
                }
              } catch {}
            }
          } else {
            thumbUrl = mediaUrl; // Foto: gunakan URL yang sama
          }
        }
      }

      const placementMap = { post: 'timeline', reel: 'reels', story: 'stories' };
      const payload = {
        caption,
        social_accounts: [acc.id],
        platform_configurations: { [sp]: { placement: placementMap[format] || 'timeline' } },
      };
      if (allMediaUrls.length) payload.media = allMediaUrls.map(u => ({ url: u }));

      const data = await pfmProxy('/v1/social-posts', 'POST', payload, accessToken);

      const postId  = data?.id || data?.post_id || data?.posts?.[0]?.id || null;
      const postUrl = data?.post_url || data?.platform_url || data?.permalink || data?.posts?.[0]?.post_url || null;

      // Simpan campaign ke Supabase
      // thumb_url = allMediaUrls[0] (URL PostForMe CDN) — sama seperti desktop
      const effectiveSessionId = sessionId || localStorage.getItem('radar_session_id');
      const effectiveUserId    = userId    || (() => {
        try { return JSON.parse(atob((accessToken||'').split('.')[1]))?.sub || null; } catch { return null; }
      })();

      if (effectiveSessionId && accessToken) {
        const reachVal  = computeReach(locPop, radius, localOn, travelerOn);
        const finalName = (overrideName && overrideName.trim()) ? overrideName.trim() : campName;
        const dbResp = await fetch(`${SUPABASE_URL}/rest/v1/campaigns`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id:             effectiveUserId,
            session_id:          effectiveSessionId,
            nama_campaign:       finalName || caption.slice(0, 60),
            platforms:           [sp],
            format:              format || 'post',
            status:              'active',
            estimated_reach_min: reachVal,
            estimated_reach_max: Math.round(reachVal * 1.5),
            post_id:             postId          || null,
            post_url:            postUrl         || null,
            thumb_url:           thumbUrl || null,
            has_video:           files[0]?.type === 'video',
            caption,
          }),
        });
        if (!dbResp.ok) {
          const errTxt = await dbResp.text();
          throw new Error(`Gagal menyimpan kampanye: ${errTxt}`);
        }
      }

      // Toast sukses spesifik platform+format
      const toastLabel = fmtName ? `${fmtName} ${platName}` : platName;
      showToast(`✓ ${toastLabel} berhasil diluncurkan!`, 'success');

      // Kurangi kuota jika bukan pro
      const plan = profile?.selected_plan || 'freemium';
      if (plan !== 'pro' && profile?.id) {
        // 🔒 SECURITY FIX: Always use Supabase as single source of truth
        // Remove localStorage dependency completely
        const quotaDefaults = { freemium: 10, starter: 50 };
        const currentQuota = typeof profile?.ai_launch_count === 'number' ? profile.ai_launch_count : (quotaDefaults[plan] || 10);

        const newQuota = Math.max(0, currentQuota - 1);
        profile.ai_launch_count = newQuota;

        // 🔒 Update ONLY to Supabase (don't trust client localStorage)
        fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${profile.id}`, {
          method: 'PATCH',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ai_launch_count: newQuota })
        }).catch(() => {});
      }

      // Polling background: ambil thumb_url dari /v1/social-posts/{postId} — sama seperti desktop monitor.js
      // Dijalankan SETELAH modal success, tidak blocking UX
      if (postId && effectiveSessionId && accessToken) {
        (async () => {
          const maxTry = 10;
          const delay  = 5000;
          for (let t = 0; t < maxTry; t++) {
            await new Promise(r => setTimeout(r, delay));
            try {
              const statusData = await pfmProxy(`/v1/social-posts/${postId}`, 'GET', null, accessToken);
              // Sama persis dengan desktop monitor.js line 576-579
              let mediaUrl = null;
              if (statusData?.media?.length) {
                mediaUrl = statusData.media[0].thumb_url || statusData.media[0].media_url || statusData.media[0].url || null;
              }
              if (!mediaUrl) mediaUrl = statusData?.media_url || statusData?.thumb_url || null;

              const resolvedUrl = statusData?.post_url || statusData?.platform_url || statusData?.permalink
                || statusData?.social_accounts?.[0]?.post_url || null;
              const platformPostId = statusData?.social_accounts?.[0]?.platform_post_id || null;

              if (mediaUrl || resolvedUrl || platformPostId) {
                // Update thumb_url + post_url + platform_post_id di DB
                const updates = {};
                if (mediaUrl)       updates.thumb_url          = mediaUrl;
                if (resolvedUrl)    updates.post_url           = resolvedUrl;
                if (platformPostId) updates.platform_post_id   = platformPostId;
                fetch(
                  `${SUPABASE_URL}/rest/v1/campaigns?session_id=eq.${effectiveSessionId}&post_id=eq.${postId}`,
                  {
                    method: 'PATCH',
                    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                  }
                ).catch(() => {});
                break; // Berhasil, stop polling
              }
            } catch {}
          }
        })();
      }

      // Phase 2: success state (setelah 1.6 detik, sama seperti desktop)
      setTimeout(() => {
        setLaunchPhase('success');
        // Redirect ke Kelola setelah 2 detik
        setTimeout(() => {
          setLaunchPhase(null);
          setPosting(false);
          if (onLaunchSuccess) onLaunchSuccess();
        }, 2000);
      }, 1600);

    } catch (e) {
      setLaunchPhase(null);
      setPosting(false);
      showToast(`⚠ Posting gagal: ${e.message}`, 'error');
    }
  };

  /* ── Edit sheet helpers ── */
  const openEditSheet = () => {
    setEditDraft(caption);
    setShowEditSheet(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimateEditSheet(true)));
  };
  const closeEditSheet = () => {
    setAnimateEditSheet(false);
    setSheetExpanded(false);
    setTimeout(() => setShowEditSheet(false), 350);
  };
  const saveEditCaption = () => {
    setCaption(editDraft);
    closeEditSheet();
  };

  /* ── Derived display values ── */
  const thumb     = files[0] || null;
  const fmtLabel  = FORMAT_LABELS[format]   || 'Reel';
  const platLabel = PLATFORM_LABELS[platform] || 'Instagram';
  const assetInfo = `${files.length > 0 ? files.length + ' foto' : 'Belum ada foto'} · ${locFull || locName}`;

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, minHeight:0, overflow:'hidden', background:'var(--m-bg)'}}>
      {/* Warning Banner */}
      <QuotaWarningBanner
        isVisible={warningBanner.visible}
        type={warningBanner.type}
        message={warningBanner.message}
        onClose={() => {
          localStorage.setItem('hide_quota_banner_session', 'true');
          setWarningBanner(prev => ({ ...prev, visible: false }));
        }}
        onUpgradeClick={() => {
          if (triggerUpgrade) {
            triggerUpgrade('Upgrade Paket', 'Tingkatkan paket Anda untuk mendapatkan akses lebih banyak fitur dan kuota iklan tanpa batas.');
          }
        }}
      />

      {/* ── Screen header ── */}
      <div style={{background:'var(--m-bg)', paddingTop:'12px', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px 10px'}}>
          <button onClick={onBack} style={{
            width:'36px', height:'36px', borderRadius:'50%',
            background:'#fff', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 1px 4px rgba(0,0,0,0.10)', flexShrink:0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            {PLATFORM_ICONS[platform]}
            <span style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'700', color:'var(--m-ink)'}}>
              Caption & Tayang
            </span>
          </div>

          <span style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'600', color:'var(--m-ink-sub)'}}>2/2</span>
        </div>
        <ProgressBar step={2} total={2} />
      </div>

      {/* ── Scrollable content ── */}
      <main style={{
        flex:1, minHeight:0, overflowY:'auto',
        padding:'14px 16px 16px',
        display:'flex', flexDirection:'column', gap:'12px',
      }}>

        {/* ── Mini preview card ── */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px', flexShrink:0}}>
          <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
            {/* Small phone thumb */}
            <div style={{
              width:'64px', flexShrink:0,
              aspectRatio:'9/16',
              background:'#111', borderRadius:'10px',
              overflow:'hidden', border:'1.5px solid #E4E4EB',
              boxShadow:'none',
            }}>
              {thumb ? (
                thumb.type === 'video' ? (
                  <video src={thumb.url} muted style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                  <img src={thumb.url} alt="preview" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                )
              ) : (
                /* No asset — light grey with image icon */
                <div style={{
                  width:'100%', height:'100%',
                  background:'#ECECF1',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0B0BC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Meta info */}
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700', color:'var(--m-ink-sub)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'4px'}}>
                PREVIEW
              </div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)', marginBottom:'3px'}}>
                {platLabel}{(platform !== 'tiktok' && platform !== 'youtube') ? ' · ' + fmtLabel : ''}
              </div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'10px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                {assetInfo}
              </div>
              <button onClick={onUbahAset} style={{
                display:'flex', alignItems:'center', gap:'5px',
                padding:'6px 12px', borderRadius:'8px',
                border:'1.5px solid #E4E4EB', background:'transparent',
                cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'12px',
                fontWeight:'600', color:'var(--m-ink)',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Ubah aset
              </button>
            </div>
          </div>
        </div>

        {/* ── Master Persona card — shown below preview, styled like other cards ── */}
        {persona && (
          <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px', flexShrink:0}}>
            {/* Top row */}
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
              <div style={{
                width:'22px', height:'22px', borderRadius:'50%',
                background:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{width:'11px', height:'11px'}}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:'var(--m-ink-sub)', letterSpacing:'0.4px', textTransform:'uppercase'}}>
                Master Persona Terdeteksi
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'13px', height:'13px', marginLeft:'auto', flexShrink:0}}>
                <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
              </svg>
            </div>
            {/* Persona name */}
            <div style={{fontFamily:'var(--m-font)', fontSize:'17px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'8px', letterSpacing:'-0.02em'}}>
              {persona.name}
            </div>
            {/* Target & age chips */}
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
              <span style={{
                fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'600', color:'var(--m-ink)',
                background:'#F0F0F5', padding:'3px 10px', borderRadius:'99px',
                border:'1px solid #E4E4EB',
              }}>
                {persona.target}
              </span>
              <span style={{
                fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'600', color:'var(--m-ink-sub)',
                background:'#F7F7FA', padding:'3px 10px', borderRadius:'99px',
                border:'1px solid #E4E4EB',
              }}>
                {persona.age || '18–45'} · {persona.gender || 'Mixed'}
              </span>
            </div>
            {/* Footer note */}
            <div style={{marginTop:'10px', paddingTop:'10px', borderTop:'1px solid #F0F0F5'}}>
              <span style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>
                Digunakan untuk mengoptimalkan targeting iklanmu
              </span>
            </div>
          </div>
        )}

        {/* ── Caption card ── */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px', flexShrink:0}}>
          {/* Header row */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              {/* Platform icon box */}
              <div style={{
                width:'30px', height:'30px', borderRadius:'8px',
                background:'#F4F4F7', display:'flex',
                alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                {PLATFORM_ICONS_SM[platform]}
              </div>
              {/* Title */}
              <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>
                Caption {platLabel}
              </span>
            </div>
            <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:'var(--m-brand)', background:'var(--m-brand-soft)', padding:'3px 8px', borderRadius:'6px', flexShrink:0}}>
              AI · ID
            </span>
          </div>

          {/* Caption display area */}
          <div style={{
            background:'#F5F5F7', borderRadius:'10px', padding:'12px',
            marginBottom:'10px',
          }}>
            {caption ? (
              <p style={{
                margin:0, fontFamily:'var(--m-font)', fontSize:'13px',
                color:'var(--m-ink)', lineHeight:'1.6',
                whiteSpace:'pre-wrap', wordBreak:'break-word',
              }}>
                {caption}
              </p>
            ) : (
              <p style={{
                margin:0, fontFamily:'var(--m-font)', fontSize:'13px',
                color:'var(--m-ink-sub)', lineHeight:'1.6', fontStyle:'italic',
              }}>
                {files.length > 0
                  ? 'AI akan menuliskan caption untukmu…'
                  : 'Upload foto atau video terlebih dahulu untuk menghasilkan caption.'}
              </p>
            )}
            <div style={{
              textAlign:'right', fontFamily:'var(--m-font)', fontSize:'11px', marginTop:'6px',
              color: caption.length > maxChar * 0.9 ? '#E53E3E' : 'var(--m-ink-sub)',
            }}>
              {caption.length}/{maxChar}
            </div>
          </div>

          {/* Action buttons: Generate + Edit side by side */}
          <div style={{display:'flex', gap:'8px'}}>
            {/* Generate ulang */}
            <button
              onClick={handleGenerate}
              disabled={generating || files.length === 0}
              style={{
                flex:1, padding:'13px 10px', borderRadius:'12px',
                background: (generating || files.length === 0) ? '#E4E4EB' : 'var(--m-ink)',
                color: (generating || files.length === 0) ? 'var(--m-ink-sub)' : '#fff',
                border:'none', cursor: (generating || files.length === 0) ? 'not-allowed' : 'pointer',
                fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                transition:'background .2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                style={{animation: generating ? 'spin 1s linear infinite' : 'none', flexShrink:0}}>
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              {generating ? 'Menulis…' : 'Generate ulang'}
            </button>

            {/* Edit */}
            <button
              onClick={openEditSheet}
              disabled={!caption}
              style={{
                flex:1, padding:'13px 10px', borderRadius:'12px',
                background: !caption ? '#F5F5F7' : '#fff',
                color: !caption ? 'var(--m-ink-sub)' : 'var(--m-ink)',
                border:`1.5px solid ${!caption ? '#E4E4EB' : 'var(--m-ink)'}`,
                cursor: !caption ? 'not-allowed' : 'pointer',
                fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                transition:'all .2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
        </div>

        {/* ── Smart Geo Stitching card ── */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', padding:'14px', flexShrink:0}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
            <div style={{
              width:'36px', height:'36px', borderRadius:'10px',
              background:'var(--m-brand-soft)', display:'flex',
              alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:'7px'}}>
                <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>Smart Geo Stitching</span>
                <span style={{
                  fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700', color:'var(--m-brand)',
                  background:'var(--m-brand-soft)', padding:'2px 7px', borderRadius:'6px', flexShrink:0,
                }}>BETA</span>
              </div>
            </div>
            {/* Toggle */}
            <button onClick={() => setStitchOn(v => !v)} style={{
              width:'44px', height:'24px', borderRadius:'99px', border:'none',
              background: stitchOn ? 'var(--m-brand)' : '#D7D7DE',
              cursor:'pointer', position:'relative', flexShrink:0, padding:0,
              transition:'background .2s',
            }}>
              <div style={{
                position:'absolute', top:'3px',
                left: stitchOn ? 'calc(100% - 21px)' : '3px',
                width:'18px', height:'18px', borderRadius:'50%', background:'#fff',
                transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          <p style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.6', marginBottom: stitchOn ? '10px' : '0'}}>
            Sambungkan caption dengan dialek &amp; sapaan khas{' '}
            <span style={{color:'var(--m-brand)', fontWeight:'700'}}>{locName}</span>{' '}
            agar iklanmu terasa lebih lokal.
          </p>

          {stitchOn && (
            <div style={{
              background:'#FAFAFA', borderRadius:'8px', padding:'10px 12px',
              border:'1px solid #F0F0F5', display:'flex', alignItems:'flex-start', gap:'8px',
            }}>
              <span style={{fontSize:'14px', flexShrink:0}}>💡</span>
              <span style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.5'}}>
                Sapaan{' '}
                <strong style={{color:'var(--m-ink)', fontWeight:'700'}}>&ldquo;Sugeng rawuh&rdquo;</strong>{' '}
                akan otomatis ditambahkan di caption.
              </span>
            </div>
          )}
        </div>
      </main>

      {/* ── Bottom bar: Estimasi + Tayangkan
           Flush against BottomNav via paddingBottom that absorbs nav height ── */}
      <div style={{
        flexShrink:0,
        background:'#fff',
        borderTop:'1px solid #ECECF1',
        padding:'12px 16px',
        paddingBottom:'calc(12px + 78px + env(safe-area-inset-bottom))',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        {/* Left: Info */}
        <div style={{display:'flex', flexDirection:'column', flex:1, paddingRight:'8px', minWidth:0}}>
          <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700', color:'var(--m-ink-sub)', textTransform:'uppercase', letterSpacing:'0.5px'}}>
            Estimasi Jangkauan <span style={{margin:'0 2px'}}>•</span> Radius {radius.toFixed(1)} KM
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'4px', marginTop:'2px', minWidth:0}}>
            <span style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-brand)', flexShrink:0}}>
              {reach > 0 ? `~${reachText}` : '0'}
            </span>
            <span style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'500', color:'var(--m-ink-sub)', display:'flex', alignItems:'center', flex:1, minWidth:0}}>
              {reach > 0 ? (
                <>
                  {localOn && <span style={{whiteSpace:'nowrap', flexShrink:0}}>warga&nbsp;</span>}
                  {localOn && (
                    <span style={{
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                      flexShrink:1, minWidth:0
                    }}>
                      {locName || 'sekitar'}
                    </span>
                  )}
                  {localOn && travelerOn && <span style={{margin:'0 4px', whiteSpace:'nowrap', flexShrink:0}}>·</span>}
                  {travelerOn && <span style={{whiteSpace:'nowrap', flexShrink:0}}>pengunjung</span>}
                </>
              ) : (
                <span>orang</span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          {(() => {
            const plan = profile?.selected_plan || 'freemium';
            const quotaDefaults = { freemium: 10, starter: 50 };
            // Pro tidak tampil quota counter — unlimited
            let currentQuota = null;
            if (plan === 'freemium' || plan === 'starter') {
              currentQuota = typeof profile?.ai_launch_count === 'number' ? profile.ai_launch_count : quotaDefaults[plan];
            }
            const isOutOfQuota = currentQuota !== null && currentQuota <= 0;
            const quotaMax = plan === 'starter' ? 50 : 10;

            return (
              <>
                {currentQuota !== null && (
                  <div style={{ fontFamily: 'var(--m-font)', fontSize: '10px', fontWeight: '800', color: isOutOfQuota ? '#EF4444' : 'var(--m-ink-sub)' }}>
                    SISA KUOTA: {currentQuota}/{quotaMax}
                  </div>
                )}
                <button
                  onClick={handleTayangkan}
                  disabled={!caption || posting}
                  style={{
                    padding:'10px 16px', borderRadius:'12px', flexShrink:0,
                    background: (!caption || posting) ? '#9CA3AF' : (isOutOfQuota ? '#EF4444' : '#1A1A1A'),
                    color:'#fff', border:'none', cursor: (!caption || posting) ? 'not-allowed' : 'pointer',
                    fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700',
                    display:'flex', alignItems:'center', gap:'6px',
                    transition:'background 0.2s',
                  }}
                >
                  {posting ? (
                    <div style={{width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite'}} />
                  ) : (
                    !isOutOfQuota && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    )
                  )}
                  {posting ? 'Memposting…' : (isOutOfQuota ? 'Upgrade Tayang' : 'Tayangkan')}
                </button>
              </>
            );
          })()}
        </div>
      </div>

      {/* ── Confirm Modal sebelum posting (sama seperti desktop launchConfirmModal) ── */}
      {showConfirm && (() => {
        const platLabels = { instagram:'Instagram', facebook:'Facebook', tiktok:'TikTok', youtube:'YouTube' };
        const platColors = { instagram:'#E1306C', facebook:'#1877F2', tiktok:'#010101', youtube:'#FF0000' };
        const fmtLabels  = { post:'Post', reel:'Reel', story:'Story' };
        const sp       = { ig:'instagram', tiktok:'tiktok', meta:'facebook', youtube:'youtube' }[platform] || platform;
        const platName = platLabels[sp] || sp;
        const platColor= platColors[sp] || 'var(--m-brand)';
        const fmtName  = (sp === 'tiktok' || sp === 'youtube') ? '' : (fmtLabels[format] || format || '');
        return (
          <div style={{position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end', justifyContent:'center'}}>
            <div style={{background:'#fff', borderRadius:'24px 24px 0 0', padding:'24px 20px', width:'100%', maxWidth:'480px', paddingBottom:'calc(24px + env(safe-area-inset-bottom))'}}>
              {/* Handle */}
              <div style={{width:'40px', height:'4px', borderRadius:'2px', background:'#E4E4EB', margin:'0 auto 20px'}} />

              <div style={{fontFamily:'var(--m-font)', fontSize:'17px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>Tayangkan Iklan</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)', marginBottom:'20px'}}>Pastikan detail iklanmu sudah benar</div>

              {/* Platform + Format chips */}
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px', flexWrap:'wrap'}}>
                <div style={{background:`${platColor}15`, border:`1.5px solid ${platColor}40`, borderRadius:'999px', padding:'6px 14px', display:'flex', alignItems:'center', gap:'6px'}}>
                  {PLATFORM_ICONS[sp]}
                  <span style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:platColor}}>{platName}</span>
                </div>
                {fmtName && (
                  <div style={{background:'#F3F4F6', border:'1.5px solid #E4E4EB', borderRadius:'999px', padding:'6px 14px', display:'flex', alignItems:'center', gap:'4px'}}>
                    <span style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-ink)'}}>{fmtName}</span>
                  </div>
                )}
              </div>

              {/* Nama iklan editable */}
              <div style={{marginBottom:'24px'}}>
                <label style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-ink-sub)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Nama Iklan</label>
                <input
                  type="text"
                  value={campName}
                  onChange={e => setCampName(e.target.value)}
                  style={{width:'100%', padding:'12px 14px', borderRadius:'12px', border:'1.5px solid #E4E4EB', fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'600', color:'var(--m-ink)', outline:'none', background:'#F9F9FA', boxSizing:'border-box'}}
                  onFocus={e => { e.target.style.borderColor='var(--m-brand)'; e.target.style.background='#fff'; }}
                  onBlur={e => { e.target.style.borderColor='#E4E4EB'; e.target.style.background='#F9F9FA'; }}
                />
              </div>

              {/* Tombol */}
              <button
                onClick={() => handleDoLaunch(campName)}
                style={{width:'100%', padding:'15px', borderRadius:'14px', background:'#1A1A1A', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'10px'}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Launch Sekarang
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{width:'100%', padding:'13px', borderRadius:'14px', background:'transparent', color:'var(--m-ink-sub)', border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600'}}
              >
                Batal
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Launching Modal (2 phase: loading → success → redirect ke Kelola) ── */}
      {launchPhase && (
        <div style={{position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px'}}>
          <div style={{background:'#fff', borderRadius:'24px', padding:'40px 28px', textAlign:'center', maxWidth:'300px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>

            {/* Phase 1: Loading */}
            {launchPhase === 'loading' && (
              <>
                <div style={{position:'relative', width:'64px', height:'64px', margin:'0 auto 20px'}}>
                  {/* Spinner ring */}
                  <svg width="64" height="64" style={{position:'absolute', inset:0, animation:'spin 1s linear infinite'}}>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#E4E4EB" strokeWidth="4"/>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--m-brand)" strokeWidth="4" strokeDasharray="44 132" strokeLinecap="round"/>
                  </svg>
                  {/* Play icon di tengah */}
                  <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--m-brand)"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'17px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'6px'}}>Meluncurkan Iklan…</div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)', lineHeight:'1.5'}}>Sedang mengupload dan memposting kontenmu</div>
                {/* Dots animation */}
                <div style={{display:'flex', justifyContent:'center', gap:'6px', marginTop:'20px'}}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{width:'6px', height:'6px', borderRadius:'50%', background:'var(--m-brand)', opacity:0.4, animation:`pulse 1.2s ease-in-out ${i * 0.4}s infinite`}}/>
                  ))}
                </div>
              </>
            )}

            {/* Phase 2: Success */}
            {launchPhase === 'success' && (
              <>
                {/* Animated checkmark ring */}
                <div style={{width:'72px', height:'72px', margin:'0 auto 20px'}}>
                  <svg viewBox="0 0 52 52" width="72" height="72">
                    <circle cx="26" cy="26" r="23" fill="none" stroke="#10B981" strokeWidth="3"
                      style={{strokeDasharray:'145', strokeDashoffset:'0', transition:'stroke-dashoffset 0.6s ease'}}/>
                    <polyline points="14,26 22,34 38,18" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      style={{strokeDasharray:'30', strokeDashoffset:'0', transition:'stroke-dashoffset 0.4s ease 0.3s'}}/>
                  </svg>
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'17px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'6px'}}>Iklan berhasil diluncurkan!</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Caption Bottom Sheet ── */}
      {/* Backdrop — terpisah agar tidak wrap sheet, iOS Safari lebih stabil */}
      {showEditSheet && (
        <div
          onClick={closeEditSheet}
          style={{
            position:'fixed', inset:0, zIndex:1000,
            background: animateEditSheet ? 'rgba(0,0,0,0.50)' : 'rgba(0,0,0,0)',
            transition:'background 0.35s ease',
          }}
        />
      )}

      {/* Sheet — position:fixed, bottom=keyboard height via visualViewport */}
      {showEditSheet && (
        <div style={{
          position:'fixed',
          bottom: sheetBottom,
          left:0, right:0,
          zIndex:1001,
          background:'#fff',
          borderRadius:'20px 20px 0 0',
          paddingBottom:'calc(env(safe-area-inset-bottom) + 12px)',
          transform: animateEditSheet ? 'translateY(0)' : 'translateY(100%)',
          transition:'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          /* Batas atas sheet: tidak boleh melewati atas layar saat keyboard buka */
          maxHeight: `min(${sheetExpanded ? '82' : '62'}vh, calc(100vh - ${sheetBottom}px - 44px))`,
          overflowY:'auto',
        }}>

          {/* Handle — tap untuk expand/collapse (no swipe agar tidak gantung) */}
          <div
            onClick={() => setSheetExpanded(p => !p)}
            style={{
              padding:'12px 0 4px', display:'flex', justifyContent:'center',
              cursor:'pointer', WebkitTapHighlightColor:'transparent',
              position:'sticky', top:0, background:'#fff', zIndex:1,
            }}
          >
            <div style={{width:'36px', height:'4px', borderRadius:'2px', background:'#E4E4EB'}} />
          </div>

          {/* Header */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'4px 16px 12px',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              {PLATFORM_ICONS_SM[platform]}
              <span style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'700', color:'var(--m-ink)'}}>
                Edit Caption {platLabel}
              </span>
            </div>
            <button
              onClick={closeEditSheet}
              style={{
                width:'30px', height:'30px', borderRadius:'50%',
                background:'#F0F0F5', border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Textarea — auto-grow ikut panjang teks */}
          <div style={{padding:'0 16px 8px'}}>
            <textarea
              ref={textareaRef}
              value={editDraft}
              onChange={e => {
                setEditDraft(e.target.value);
                /* Auto-grow: reset ke auto dulu, lalu set ke scrollHeight */
                const ta = e.target;
                ta.style.height = 'auto';
                ta.style.height = ta.scrollHeight + 'px';
              }}
              autoFocus
              rows={1}
              style={{
                display:'block', width:'100%', boxSizing:'border-box',
                minHeight: sheetExpanded ? '220px' : '140px',
                height:'auto',
                background:'#F5F5F7', border:'1.5px solid #E4E4EB',
                borderRadius:'12px', padding:'12px',
                fontFamily:'var(--m-font)', fontSize:'16px', /* 16px: cegah iOS auto-zoom saat focus */
                color:'var(--m-ink)', lineHeight:'1.55',
                resize:'none', outline:'none',
                overflowY:'hidden',
                transition:'border-color .15s, min-height .3s ease',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--m-brand)';
                /* trigger auto-grow on focus juga */
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onBlur={e => e.target.style.borderColor = '#E4E4EB'}
            />
            <div style={{
              textAlign:'right', fontFamily:'var(--m-font)', fontSize:'11px', marginTop:'4px',
              color: editDraft.length > maxChar * 0.9 ? '#E53E3E' : 'var(--m-ink-sub)',
            }}>
              {editDraft.length}/{maxChar}
            </div>
          </div>

          {/* Save button */}
          <div style={{padding:'0 16px 4px'}}>
            <button
              onClick={saveEditCaption}
              style={{
                width:'100%', padding:'15px', borderRadius:'14px',
                background:'var(--m-ink)', color:'#fff',
                border:'none', cursor:'pointer',
                fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                boxShadow:'0 4px 14px rgba(14,14,18,0.20)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Simpan Caption
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

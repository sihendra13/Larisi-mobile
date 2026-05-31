'use client';
import { useState, useEffect, useRef } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';
import { connectSocial, getStoredAccounts, syncSocialAccountsToSupabase } from '@/lib/connectSocial';

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */
const CATEGORIES = [
  { value: 'fnb',                label: 'Kuliner (F&B)' },
  { value: 'kafe',               label: 'Kafe & Coffee Shop' },
  { value: 'fashion_wanita',     label: 'Fashion Wanita' },
  { value: 'fashion_pria',       label: 'Fashion Pria' },
  { value: 'fashion_muslim',     label: 'Fashion Muslim (Hijab & Gamis Wanita)' },
  { value: 'fashion_muslim_pria',label: 'Busana Muslim Pria (Koko & Gamis)' },
  { value: 'jasa',               label: 'Layanan / Jasa' },
  { value: 'retail',             label: 'Retail / Toko Kelontong' },
  { value: 'kesehatan',          label: 'Skincare & Produk Kecantikan' },
  { value: 'salon',              label: 'Salon & Perawatan Wajah' },
  { value: 'barber',             label: 'Barber Shop & Grooming' },
  { value: 'elektronik',         label: 'Elektronik & Gadget' },
  { value: 'otomotif',           label: 'Otomotif & Bengkel' },
  { value: 'properti',           label: 'Properti & Konstruksi' },
  { value: 'pendidikan',         label: 'Pendidikan & Kursus' },
  { value: 'wisata',             label: 'Pariwisata & Travel' },
  { value: 'kerajinan',          label: 'Kerajinan & Handmade' },
  { value: 'olahraga',           label: 'Olahraga & Fitness' },
  { value: 'laundry',            label: 'Laundry & Kebersihan' },
  { value: 'fotografi',          label: 'Studio Foto & Fotografi' },
  { value: 'catering',           label: 'Katering & Event' },
  { value: 'jasa_profesional',   label: 'Jasa Profesional (Dokter, Notaris, dll.)' },
  { value: 'pet',                label: 'Toko & Perawatan Hewan Peliharaan' },
  { value: 'lainnya',            label: 'Lainnya...' },
];

const USP_PLACEHOLDERS = {
  fnb:                'Contoh: Ayam geprek level 1–10, open 24 jam, langganan ojol terbanyak',
  kafe:               'Contoh: Kopi single origin Flores, diseduh manual, WiFi kenceng buka sampai malam',
  fashion_wanita:     'Contoh: 200+ model, update tiap minggu, bisa custom ukuran',
  fashion_pria:       'Contoh: Outfit kasual-formal, brand lokal premium, size XS–5XL tersedia',
  fashion_muslim:     'Contoh: Gamis syar\'i tapi modis, bahan adem, jahitan rapi bergaransi',
  fashion_muslim_pria:'Contoh: Koko premium bahan toyobo, size M–4XL, bisa seragam pesantren',
  jasa:               'Contoh: Servis AC on-site, garansi 30 hari, teknisi bersertifikat',
  retail:             'Contoh: 5000+ produk, pengiriman same day, harga grosir untuk pelanggan tetap',
  kesehatan:          'Contoh: Skincare herbal lokal, dermatologi tested, cocok untuk kulit sensitif',
  salon:              'Contoh: Spesialis smoothing rambut rusak, hasil tahan 6 bulan, tanpa antrian lama',
  barber:             'Contoh: Spesialis fade & undercut, hasil rapi dijamin, teknisi bersertifikat',
  elektronik:         'Contoh: Gadget garansi resmi 1 tahun, harga termurah sekota, konsultasi gratis',
  otomotif:           'Contoh: Teknisi bersertifikat AHM, spare part original, garansi pengerjaan 30 hari',
  properti:           'Contoh: Lokasi 5 menit dari tol, KPR dibantu, siap huni tanpa DP besar',
  pendidikan:         'Contoh: Kelas maks 8 siswa, pengajar lulusan UI, hasil dijamin atau uang kembali',
  wisata:             'Contoh: Paket all-inclusive, pemandu lokal bersertifikat, itinerary fleksibel',
  kerajinan:          'Contoh: Handmade 100%, motif eksklusif, bisa custom nama & ukuran',
  olahraga:           'Contoh: Spesialis beladiri & fitness, peralatan lengkap, instruktur bersertifikat',
  laundry:            'Contoh: Cuci bersih dalam 6 jam, antar-jemput gratis radius 3 km',
  fotografi:          'Contoh: Foto produk hasil studio, background & lighting profesional, revisi bebas',
  catering:           'Contoh: Masakan rumahan otentik, min. 50 porsi, tersedia menu halal & vegan',
  jasa_profesional:   'Contoh: Konsultasi gratis, berpengalaman 10+ tahun, respons dalam 2 jam',
  pet:                'Contoh: Grooming lengkap, dokter hewan on-call, antar-jemput tersedia',
  lainnya:            'Contoh: Apa yang paling sering dipuji pelanggan kamu?',
};

const SOCIAL_PLATFORMS = [
  {
    id: 'instagram', label: 'Instagram',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig-icon" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#f09433"/>
            <stop offset="55%"  stopColor="#dc2743"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="url(#ig-icon)" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="4" stroke="url(#ig-icon)" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'facebook', label: 'Facebook',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="#1877F2"/>
      </svg>
    ),
  },
  {
    id: 'tiktok', label: 'TikTok',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="#0E0E12"/>
      </svg>
    ),
  },
  {
    id: 'youtube', label: 'YouTube',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z" fill="#FF0000"/>
        <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
      </svg>
    ),
  },
];

/* Platform brand colors (untuk outline button) */
const PLATFORM_COLORS = {
  instagram: '#E1306C',  /* Pink */
  facebook:  '#1877F2',  /* Blue */
  tiktok:    '#000000',  /* Black */
  youtube:   '#FF0000',  /* Red */
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function parseLocation(n) {
  const parts = n.split(', ').map(s => s.trim());
  /* Format data: "Kecamatan, Kabupaten/Kota, Provinsi" (3 part)
     atau "Kecamatan, Kota" (2 part untuk kota besar seperti Jakarta)
     → kabupaten selalu parts[1], BUKAN parts[last] yang adalah provinsi */
  return {
    kecamatan: parts[0] || '',
    kabupaten: parts[1] || '',
  };
}

/* ─────────────────────────────────────────
   Stepper dots
───────────────────────────────────────── */
function Stepper({ current, total }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: '6px',
          width: i === current ? '22px' : '6px',
          borderRadius: '3px',
          background: i <= current ? '#111827' : '#E4E4EB',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function OnboardingScreen({
  accessToken,    /* token dari login/register (mungkin null kalau email confirmation ON) */
  userId,
  email,          /* email yg baru register, untuk OTP */
  needsOtp,       /* true → tampilkan step OTP */
  onComplete,     /* callback(profile) saat onboarding selesai */
  onTokenReceived /* callback(token) saat OTP berhasil diverifikasi */
}) {
  /* Step: 0=OTP (opsional), 1=Profil, 2=Social */
  const startStep  = needsOtp ? 0 : 1;
  const totalSteps = needsOtp ? 3 : 2;

  const [step,       setStep]       = useState(startStep);
  const [token,      setToken]      = useState(accessToken || null);

  /* ── OTP State ── */
  const [otp,           setOtp]           = useState('');
  const [otpLoading,    setOtpLoading]    = useState(false);
  const [otpError,      setOtpError]      = useState('');
  const [countdown,     setCountdown]     = useState(60);
  const [resendLoading, setResendLoading] = useState(false);

  /* ── Profil State ── */
  const [ownerName,    setOwnerName]    = useState('');
  const [whatsapp,     setWhatsapp]     = useState('');
  const [bizName,      setBizName]      = useState('');
  const [category,     setCategory]     = useState('');
  const [kecQuery,     setKecQuery]     = useState('');
  const [kecamatan,    setKecamatan]    = useState('');
  const [kabupaten,    setKabupaten]    = useState('');
  const [provinsi,     setProvinsi]     = useState('');
  const [kecResults,   setKecResults]   = useState([]);  /* { kec, kabDisplay, kab, prov }[] | [{error}] */
  const [kecLoading,   setKecLoading]   = useState(false);
  const [delivery,     setDelivery]     = useState('');
  const [usp,          setUsp]          = useState('');
  const [profLoading,  setProfLoading]  = useState(false);
  const [profError,    setProfError]    = useState('');
  const [uspWarning,   setUspWarning]   = useState(false);
  const [showDrop,     setShowDrop]     = useState(false);

  /* ── Social State ── */
  const [accounts,     setAccounts]     = useState(() => getStoredAccounts());
  const [socialBusy,   setSocialBusy]  = useState('');
  const [debugLogs,    setDebugLogs]    = useState([]); /* Debug logs untuk iOS testing */

  /* ── Refs ── */
  const uspInputRef  = useRef(null);
  const kecTimerRef  = useRef(null);

  /* ── Helper: add debug log ── */
  const addDebugLog = (msg) => {
    console.log(msg);
    setDebugLogs(prev => [...prev.slice(-20), msg]); /* Keep last 20 logs */
  };

  /* ── Countdown OTP ── */
  useEffect(() => {
    if (step !== 0) return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  /* ─────────────────
     STEP 0 — OTP
  ───────────────── */
  const handleVerifyOtp = async () => {
    const code = otp.replace(/\D/g, '');
    if (code.length < 8) { setOtpError('Masukkan 8 digit kode OTP.'); return; }
    setOtpLoading(true);
    setOtpError('');

    try {
      const resp = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'signup', email, token: code }),
      });
      const data = await resp.json();

      if (!resp.ok || data.error) {
        setOtpError('Kode OTP salah atau sudah kadaluarsa. Minta kirim ulang.');
        setOtpLoading(false);
        return;
      }

      /* Simpan session */
      const tok = data.access_token;
      const session = {
        access_token:  tok,
        token_type:    'bearer',
        expires_in:    data.expires_in || 3600,
        expires_at:    Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
        refresh_token: data.refresh_token || '',
        user:          data.user,
      };
      localStorage.setItem('sb-mojzmlrdihenvfhrwopd-auth-token', JSON.stringify(session));
      setToken(tok);
      onTokenReceived?.(tok);
      setStep(1);
    } catch {
      setOtpError('Gagal verifikasi. Periksa koneksi kamu.');
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/resend`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'signup', email }),
      });
    } catch {}
    setCountdown(60);
    setResendLoading(false);
  };

  /* ─────────────────
     STEP 1 — PROFIL
  ───────────────── */

  /* Nominatim search — identik dengan desktop onboarding.html */
  const searchKecamatan = (val) => {
    setKecamatan(''); setKabupaten('');
    if (kecTimerRef.current) clearTimeout(kecTimerRef.current);
    if (!val || val.length < 2) { setKecResults([]); setKecLoading(false); setShowDrop(false); return; }

    setKecLoading(true);
    setShowDrop(true);

    kecTimerRef.current = setTimeout(async () => {
      try {
        /* User-Agent adalah forbidden header di browser — hapus, cukup Accept */
        const resp = await fetch(
          'https://nominatim.openstreetmap.org/search?q=' +
          encodeURIComponent(val + ' Indonesia') +
          '&format=json&addressdetails=1&limit=7&accept-language=id&countrycodes=ID',
          { headers: { 'Accept': 'application/json' } }
        );
        const data = await resp.json();

        const seen    = {};
        const results = [];
        (data || []).forEach(r => {
          const addr       = r.address || {};
          const kec        = addr.suburb || addr.village || addr.quarter || addr.town || addr.hamlet
                             || r.display_name.split(',')[0].trim();
          /* Prioritas kabupaten/kota:
             county → municipality → city_district → city → state_district
             Untuk DKI Jakarta: county kadang kembali kecamatan (Tanjung Priok),
             sementara city atau municipality lebih tepat (Jakarta Utara) */
          const rawKab = addr.county || addr.municipality || addr.city_district || addr.city || addr.state_district || '';
          /* Bila rawKab sama persis dengan kec (artinya county = kecamatan), coba city */
          const kab = (rawKab.toLowerCase() === kec.toLowerCase() && (addr.city || addr.municipality))
                      ? (addr.city || addr.municipality || rawKab)
                      : rawKab;
          const kabDisplay = kab
            .replace(/^Kabupaten\s+/i, '')
            .replace(/^Kota\s+Administrasi\s+/i, '')
            .replace(/^Regency\s+/i, '');
          const prov       = addr.state || '';

          const key = (kec + '|' + kabDisplay).toLowerCase();
          if (seen[key]) return;
          seen[key] = true;

          results.push({ kec, kabDisplay, kab, prov });
        });

        setKecResults(results.length ? results : [{ empty: true }]);
      } catch {
        setKecResults([{ error: true }]);
      } finally {
        setKecLoading(false);
      }
    }, 450);
  };

  const selectKec = (result) => {
    setKecamatan(result.kec);
    setKabupaten(result.kabDisplay || result.kab || result.kec);
    setProvinsi(result.prov || '');
    setKecQuery(result.kec);
    setKecResults([]);
    setShowDrop(false);
    setProfError('');
  };

  /* Fungsi yang benar-benar menyimpan (dipanggil langsung atau via "Lewati" di USP warning) */
  const doSaveProfile = async () => {
    setProfLoading(true);
    setProfError('');
    setUspWarning(false);

    const tok  = token || accessToken;
    const plan = localStorage.getItem('larisi_selected_plan') || 'freemium';
    const quotaMap = { pro: 999, starter: 50, freemium: 10 };

    const profileData = {
      full_name:        ownerName.trim() || undefined,
      whatsapp:         whatsapp.trim()  || undefined,
      business_name:    bizName.trim(),
      category,
      kecamatan,
      kabupaten,
      provinsi,
      city:             kabupaten || kecamatan,  /* backward compat user lama — identik desktop */
      delivery_service: delivery === 'yes',
      usp:              usp.trim(),
      selected_plan:    plan,
      ai_launch_count:  quotaMap[plan] ?? 10,
    };

    try {
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method:  'PATCH',
          headers: {
            'apikey':        SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${tok}`,
            'Content-Type':  'application/json',
            'Prefer':        'return=representation',
          },
          body: JSON.stringify(profileData),
        }
      );
      if (!resp.ok) throw new Error('Gagal');
      const updated    = await resp.json();
      const newProfile = (Array.isArray(updated) ? updated[0] : updated) || profileData;
      localStorage.setItem('radar_user_profile', JSON.stringify({ ...newProfile, ...profileData }));
      setProfLoading(false);
      setStep(2);
    } catch {
      setProfError('Gagal menyimpan. Coba lagi.');
      setProfLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!ownerName.trim()) { setProfError('Nama pemilik wajib diisi.');        return; }
    if (!whatsapp.trim())  { setProfError('Nomor WhatsApp wajib diisi.');       return; }
    if (!bizName.trim())   { setProfError('Nama bisnis wajib diisi.');          return; }
    if (!category)         { setProfError('Pilih kategori bisnis.');            return; }
    if (!kecamatan)        { setProfError('Pilih kecamatan dari dropdown.');    return; }

    /* USP semi-wajib: tampilkan warning, user bisa pilih Tambahkan atau Lewati */
    if (!usp.trim()) {
      setUspWarning(true);
      uspInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    await doSaveProfile();
  };

  /* ─────────────────
     STEP 2 — SOCIAL
  ───────────────── */
  const handleConnectSocial = (platform) => {
    addDebugLog(`=== Connecting ${platform} ===`);
    connectSocial({
      platform,
      accessToken: token || accessToken,
      userId,
      onStart:  (plt) => {
        setSocialBusy(plt);
        addDebugLog(`[START] ${plt} connection starting`);
      },
      onDone:   async (plt, accData) => {
        addDebugLog(`[DONE] ${plt} connected: @${accData.username}`);
        // Update local state
        setAccounts(getStoredAccounts());
        setSocialBusy('');

        // Sync to Supabase untuk persistent storage
        const tok = token || accessToken;
        if (userId && tok) {
          await syncSocialAccountsToSupabase(userId, tok);
        }
      },
      onCancel: () => {
        addDebugLog(`[CANCEL] ${platform} connection cancelled`);
        setSocialBusy('');
      },
      onLog: addDebugLog, /* ← Pass callback untuk logging */
    });
  };

  const handleFinish = async () => {
    const tok  = token || accessToken;
    const plan = localStorage.getItem('larisi_selected_plan') || 'freemium';

    /* Save ALL profile fields to database */
    const updates = {
      email:                   email.trim(), /* ← Copy email dari register ke profiles */
      full_name:               ownerName.trim(),
      business_name:           bizName.trim(),
      phone_number:            whatsapp.replace(/\D/g, ''),
      kategori:                category || null,
      kecamatan:               kecamatan.trim(),
      kabupaten:               kabupaten.trim(),
      city:                    kabupaten.trim(), /* alias untuk compatibility */
      provinsi:                provinsi.trim(),
      delivery:                delivery === 'ya' ? true : false,
      business_description:    usp.trim(),
      onboarding_completed:    true,
      ...(plan !== 'freemium' ? { trial_start: new Date().toISOString() } : {}),
    };

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
        method:  'PATCH',
        headers: {
          'apikey':        SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${tok}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('[onboarding] save profile error:', err);
    }

    const profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
    const final   = { ...profile, ...updates };
    localStorage.setItem('radar_user_profile', JSON.stringify(final));
    onComplete(final);
  };

  /* ─────────────────
     Shared Styles
  ───────────────── */
  const inputStyle = {
    width: '100%', padding: '12px 14px', fontSize: '15px',
    borderRadius: '10px', border: '1.5px solid #E4E4EB',
    outline: 'none', background: '#fff', boxSizing: 'border-box',
    fontFamily: 'inherit', color: '#111827', transition: 'border-color 0.15s',
  };
  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '600',
    color: '#374151', marginBottom: '6px',
  };

  /* Indeks stepper yang ditampilkan */
  const stepperIdx = needsOtp ? step : step - 1;

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <div className="bg-animated" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '24px', position: 'relative', overflowY: 'auto', fontFamily: '-apple-system, sans-serif'
    }}>
      
      {/* Background Blobs for extra energy */}
      <div style={{
        position: 'fixed', top: '5%', left: '-5%', width: '300px', height: '300px',
        background: 'var(--m-brand)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite', zIndex: 0, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', bottom: '5%', right: '-5%', width: '250px', height: '250px',
        background: '#FF007A', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite reverse', zIndex: 0, pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10, paddingBottom: '40px' }}>
        <div className="glass-card stagger-1" style={{
          borderRadius: '32px', padding: '40px 32px',
          display: 'flex', flexDirection: 'column', gap: '0',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src="/logo_larisi.svg" alt="Larisi" style={{ height: '32px', width: 'auto' }} />
          </div>

          {/* Stepper */}
          <Stepper current={stepperIdx} total={totalSteps} />

          {/* ══════════════ STEP 0: OTP ══════════════ */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px' }}>
                  Verifikasi Email
                </h1>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                  Kode OTP 8 digit telah dikirim ke{' '}
                  <strong style={{ color: '#111827' }}>{email}</strong>.<br />
                  Cek inbox atau folder spam kamu.
                </p>
              </div>

              {/* OTP Input */}
              <div>
                <label style={labelStyle}>Kode OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  placeholder="00000000"
                  style={{
                    ...inputStyle,
                    fontSize: '24px', fontWeight: '700',
                    letterSpacing: '0.25em', textAlign: 'center',
                  }}
                  autoFocus
                />
              </div>

              {/* Error */}
              {otpError && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px',
                  padding: '10px 12px', fontSize: '13px', color: '#DC2626',
                }}>
                  {otpError}
                </div>
              )}

              {/* Verify button */}
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.length < 8}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: otpLoading || otp.length < 8 ? '#E4E4EB' : '#111827',
                  color:      otpLoading || otp.length < 8 ? '#9ca3af' : '#fff',
                  border: 'none', fontSize: '15px', fontWeight: '700',
                  cursor: otpLoading || otp.length < 8 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {otpLoading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>

              {/* Resend */}
              <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                Tidak menerima kode?{' '}
                {countdown > 0 ? (
                  <span style={{ color: '#9ca3af' }}>Kirim ulang ({countdown}s)</span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: '#7C3AED', fontWeight: '700', fontSize: '13px',
                      cursor: resendLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {resendLoading ? 'Mengirim...' : 'Kirim Ulang'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ══════════════ STEP 1: PROFIL BISNIS ══════════════ */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px' }}>
                  Profil Bisnis
                </h1>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                  Isi info bisnis kamu agar SiLaris bisa buat konten yang tepat sasaran.
                </p>
              </div>

              {/* Nama Pemilik */}
              <div>
                <label style={labelStyle}>Nama Pemilik <span style={{ color: '#DC2626' }}>*</span></label>
                <input
                  type="text" value={ownerName} onChange={e => { setOwnerName(e.target.value); setProfError(''); }}
                  placeholder="Budi Santoso"
                  style={inputStyle}
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label style={labelStyle}>Nomor WhatsApp <span style={{ color: '#DC2626' }}>*</span></label>
                <input
                  type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  style={inputStyle}
                />
              </div>

              {/* Nama Bisnis */}
              <div>
                <label style={labelStyle}>Nama Bisnis <span style={{ color: '#DC2626' }}>*</span></label>
                <input
                  type="text" value={bizName} onChange={e => { setBizName(e.target.value); setProfError(''); }}
                  placeholder="Warung Makan Berkah"
                  style={inputStyle}
                />
              </div>

              {/* Kategori */}
              <div>
                <label style={labelStyle}>Kategori Bisnis <span style={{ color: '#DC2626' }}>*</span></label>
                <select
                  value={category}
                  onChange={e => { setCategory(e.target.value); setProfError(''); }}
                  style={{
                    ...inputStyle, appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236b7280\' strokeWidth=\'1.5\' fill=\'none\' strokeLinecap=\'round\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                    paddingRight: '36px',
                    color: category ? '#111827' : '#9ca3af',
                  }}
                >
                  <option value="">Pilih Kategori...</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Kecamatan */}
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Kecamatan Lokasi Bisnis <span style={{ color: '#DC2626' }}>*</span></label>
                <input
                  type="text" value={kecQuery}
                  onChange={e => { setKecQuery(e.target.value); searchKecamatan(e.target.value); }}
                  onFocus={() => { if (kecQuery.length >= 2 && kecResults.length) setShowDrop(true); }}
                  onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                  placeholder="Ketik nama kecamatan atau daerah..."
                  autoComplete="off"
                  style={inputStyle}
                />
                {showDrop && (kecLoading || kecResults.length > 0) && (
                  <div style={{
                    position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)',
                    background: '#fff', border: '1px solid #E4E4EB', borderRadius: '10px',
                    zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    maxHeight: '220px', overflowY: 'auto',
                  }}>
                    {/* Loading */}
                    {kecLoading && (
                      <div style={{ padding: '10px 14px', fontSize: '12px', color: '#6b7280' }}>
                        Mencari...
                      </div>
                    )}
                    {/* Results */}
                    {!kecLoading && kecResults.map((r, i) => {
                      if (r.error) return (
                        <div key="err" style={{ padding: '10px 14px', fontSize: '12px', color: '#DC2626' }}>
                          Gagal memuat. Periksa koneksi internet.
                        </div>
                      );
                      if (r.empty) return (
                        <div key="empty" style={{ padding: '10px 14px', fontSize: '12px', color: '#6b7280' }}>
                          Tidak ditemukan, coba kata lain
                        </div>
                      );
                      const sub = [r.kabDisplay, r.prov].filter(Boolean).join(' — ');
                      return (
                        <div
                          key={i}
                          onMouseDown={() => selectKec(r)}
                          style={{
                            padding: '10px 14px', cursor: 'pointer',
                            borderBottom: i < kecResults.length - 1 ? '1px solid #F3F4F6' : 'none',
                            display: 'flex', flexDirection: 'column', gap: '2px',
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{r.kec}</span>
                          {sub && <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{sub}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Kabupaten/Kota — readonly, auto-fill setelah pilih kecamatan (identik desktop) */}
              <input
                type="text"
                readOnly
                value={kabupaten}
                placeholder="Kabupaten/Kota (terisi otomatis setelah pilih kecamatan)"
                style={{
                  ...inputStyle,
                  background: '#F9F9FA',
                  color: '#374151',
                  cursor: 'default',
                }}
              />

              {/* Delivery */}
              <div>
                <label style={labelStyle}>Apakah bisnis kamu melayani pengiriman?</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { value: 'yes', label: 'Ya, melayani pengiriman' },
                    { value: 'no',  label: 'Tidak (Hanya di tempat)' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        flex: 1, padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                        border: `1.5px solid ${delivery === opt.value ? '#7C3AED' : '#E4E4EB'}`,
                        background: delivery === opt.value ? '#F5F3FF' : '#fff',
                        fontSize: '12px', fontWeight: '600',
                        color: delivery === opt.value ? '#7C3AED' : '#6b7280',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="radio" name="delivery" value={opt.value}
                        checked={delivery === opt.value}
                        onChange={() => setDelivery(opt.value)}
                        style={{ display: 'none' }}
                      />
                      {delivery === opt.value ? '✓ ' : ''}{opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* USP */}
              <div>
                <label style={labelStyle}>Apa yang bikin bisnis kamu spesial?</label>
                <input
                  ref={uspInputRef}
                  type="text" value={usp} onChange={e => { setUsp(e.target.value); setUspWarning(false); }}
                  placeholder={USP_PLACEHOLDERS[category] || 'Contoh: Apa yang paling sering dipuji pelanggan kamu?'}
                  maxLength={80}
                  style={inputStyle}
                />
                <div style={{ textAlign: 'right', fontSize: '11px', color: usp.length > 70 ? '#DC2626' : '#9ca3af', marginTop: '4px' }}>
                  {usp.length}/80
                </div>
              </div>

              {/* USP warning semi-wajib — identik dengan desktop */}
              {uspWarning && (
                <div style={{
                  background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '10px',
                  padding: '12px 14px',
                }}>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#92400E', lineHeight: '1.5' }}>
                    💡 Bisnis dengan USP yang jelas menghasilkan caption jauh lebih tepat sasaran. Yuk isi dulu!
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => { setUspWarning(false); uspInputRef.current?.focus(); }}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '8px',
                        border: '1.5px solid #92400E', background: '#fff',
                        color: '#92400E', fontSize: '13px', fontWeight: '600',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Tambahkan
                    </button>
                    <button
                      onClick={doSaveProfile}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '8px',
                        border: '1.5px solid #D1D5DB', background: '#fff',
                        color: '#6b7280', fontSize: '13px',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Lewati
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {profError && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px',
                  padding: '10px 12px', fontSize: '13px', color: '#DC2626',
                }}>
                  {profError}
                </div>
              )}

              {/* Next */}
              <button
                onClick={handleSaveProfile}
                disabled={profLoading}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: profLoading ? '#E4E4EB' : '#111827',
                  color: profLoading ? '#9ca3af' : '#fff',
                  border: 'none', fontSize: '15px', fontWeight: '700',
                  cursor: profLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {profLoading ? 'Menyimpan...' : 'Lanjutkan'}
              </button>
            </div>
          )}

          {/* ══════════════ STEP 2: CONNECT SOCIAL ══════════════ */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px' }}>
                  Hubungkan Akun
                </h1>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                  Hubungkan minimal 1 akun sosial media bisnismu untuk mulai membuat konten.
                </p>
              </div>

              {/* Platform tiles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SOCIAL_PLATFORMS.map(p => {
                  const acc         = accounts.find(a => a.platform === p.id);
                  const isConn      = !!acc;
                  const isBusy      = socialBusy === p.id;
                  const platformColor = PLATFORM_COLORS[p.id] || '#000';
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px 16px', borderRadius: '12px',
                        border: `1.5px solid ${isConn ? '#10B981' : '#E4E4EB'}`,
                        background: isConn ? '#F0FDF4' : '#fff',
                        transition: 'all 0.2s',
                      }}
                    >
                      {/* Avatar: profile photo jika connected, icon jika belum */}
                      {isConn ? (
                        acc.avatar_url ? (
                          <img src={acc.avatar_url} alt={acc.username || p.label}
                            style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
                        )
                      ) : (
                        <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{p.label}</div>
                        {isConn && (
                          <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>
                            {acc.username ? `@${acc.username} · Terhubung ✓` : 'Terhubung ✓'}
                          </div>
                        )}
                      </div>
                      {!isConn && (
                        <button
                          onClick={() => handleConnectSocial(p.id)}
                          disabled={!!socialBusy}
                          style={{
                            padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                            border: `1.5px solid ${isBusy ? '#E4E4EB' : platformColor}`,
                            background: '#fff',
                            color: isBusy ? '#9ca3af' : platformColor,
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            flexShrink: 0, fontFamily: 'inherit',
                          }}
                        >
                          {isBusy ? 'Menghubungkan...' : 'Hubungkan'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Finish Button (disabled sampai 1 akun terhubung) */}
              <button
                onClick={handleFinish}
                disabled={accounts.length === 0}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: accounts.length > 0 ? '#111827' : '#E4E4EB',
                  color: accounts.length > 0 ? '#fff' : '#9ca3af',
                  border: 'none', fontSize: '15px', fontWeight: '700',
                  cursor: accounts.length > 0 ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                Mulai Gunakan Larisi
              </button>

              {/* Skip link - hanya tampil jika belum ada akun */}
              {accounts.length === 0 && (
                <button
                  onClick={handleFinish}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px',
                    background: 'transparent', color: '#7C3AED',
                    border: 'none', fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer', fontFamily: 'inherit',
                    textDecoration: 'underline', marginTop: '-4px',
                  }}
                >
                  Hubungkan Nanti
                </button>
              )}

              {/* DEBUG BOX: Floating logs untuk iPhone testing */}
              {debugLogs.length > 0 && (
                <div style={{
                  position: 'fixed', bottom: '100px', left: '12px', right: '12px', zIndex: 9999,
                  background: 'rgba(0, 0, 0, 0.85)', color: '#0f0', fontSize: '11px',
                  padding: '12px', borderRadius: '8px', maxHeight: '180px', overflow: 'auto',
                  fontFamily: 'monospace', lineHeight: '1.4', border: '1px solid #0f0'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#0ff' }}>DEBUG LOG:</div>
                  {debugLogs.map((log, i) => (
                    <div key={i} style={{ marginBottom: '2px' }}>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

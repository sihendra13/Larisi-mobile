'use client';
import { useState, useRef, useEffect } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';
import { ID_LOCATIONS } from '@/data/locations';

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

/** Parse kecamatan & kabupaten dari ID_LOCATIONS entry */
function parseLocation(n) {
  const parts = n.split(', ').map(s => s.trim());
  return {
    kecamatan: parts[0]                    || '',
    kabupaten: parts[parts.length - 1]     || '',
    display:   n,
  };
}

export default function OnboardingScreen({ accessToken, userId, onComplete }) {
  const [bizName,   setBizName]   = useState('');
  const [category,  setCategory]  = useState('');
  const [kecQuery,  setKecQuery]  = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [kabupaten, setKabupaten] = useState('');
  const [delivery,  setDelivery]  = useState('');
  const [usp,       setUsp]       = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [showDrop,  setShowDrop]  = useState(false);

  const kecResults = kecQuery.length >= 2
    ? ID_LOCATIONS.filter(l => l.n.toLowerCase().includes(kecQuery.toLowerCase())).slice(0, 8)
    : [];

  const selectKec = (loc) => {
    const parsed = parseLocation(loc.n);
    setKecamatan(parsed.kecamatan);
    setKabupaten(parsed.kabupaten);
    setKecQuery(loc.n);
    setShowDrop(false);
  };

  const handleSave = async () => {
    if (!bizName.trim()) { setError('Nama bisnis wajib diisi.'); return; }
    if (!category)       { setError('Pilih kategori bisnis.'); return; }
    if (!kecamatan)      { setError('Pilih kecamatan dari dropdown.'); return; }

    setLoading(true);
    setError('');

    const profileData = {
      business_name:    bizName.trim(),
      category,
      kecamatan,
      kabupaten,
      delivery_service: delivery === 'yes',
      usp:              usp.trim(),
    };

    try {
      /* Update profiles table */
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey':        SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type':  'application/json',
            'Prefer':        'return=representation',
          },
          body: JSON.stringify(profileData),
        }
      );

      if (!resp.ok) {
        const e = await resp.json();
        throw new Error(e.message || 'Gagal menyimpan profil');
      }

      const updated = await resp.json();
      const newProfile = (Array.isArray(updated) ? updated[0] : updated) || profileData;

      /* Simpan ke localStorage */
      localStorage.setItem('radar_user_profile', JSON.stringify({ ...newProfile, ...profileData }));

      onComplete(newProfile);

    } catch (err) {
      console.error('[onboarding] save error:', err);
      setError('Gagal menyimpan. Coba lagi.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', fontSize: '16px',
    borderRadius: '10px', border: '1.5px solid #E4E4EB',
    outline: 'none', background: '#fff', boxSizing: 'border-box',
    fontFamily: 'inherit', color: '#111827',
  };
  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '600',
    color: '#374151', marginBottom: '6px',
  };

  return (
    <div style={{
      minHeight: '100dvh', background: '#F9F9FA',
      fontFamily: 'var(--m-font, -apple-system, sans-serif)',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>
            Profil Bisnis
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
            Lengkapi info bisnis kamu agar SiLaris bisa buat konten yang tepat sasaran.
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '24px',
          border: '1px solid #E4E4EB', boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>

          {/* Nama Bisnis */}
          <div>
            <label style={labelStyle}>Nama Bisnis <span style={{ color: '#DC2626' }}>*</span></label>
            <input
              type="text" value={bizName} onChange={e => setBizName(e.target.value)}
              placeholder="Warung Makan Berkah"
              style={inputStyle}
            />
          </div>

          {/* Kategori */}
          <div>
            <label style={labelStyle}>Kategori Bisnis <span style={{ color: '#DC2626' }}>*</span></label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ ...inputStyle, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236b7280\' strokeWidth=\'1.5\' fill=\'none\' strokeLinecap=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px', color: category ? '#111827' : '#9ca3af' }}
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
              onChange={e => { setKecQuery(e.target.value); setKecamatan(''); setKabupaten(''); setShowDrop(true); }}
              onFocus={() => setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 200)}
              placeholder="Ketik nama kecamatan..."
              autoComplete="off"
              style={inputStyle}
            />
            {showDrop && kecResults.length > 0 && (
              <div style={{
                position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)',
                background: '#fff', border: '1px solid #E4E4EB', borderRadius: '10px',
                zIndex: 200, boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                maxHeight: '200px', overflowY: 'auto',
              }}>
                {kecResults.map((loc, i) => (
                  <div
                    key={i}
                    onMouseDown={() => selectKec(loc)}
                    style={{
                      padding: '10px 14px', fontSize: '13px', color: '#111827',
                      cursor: 'pointer', borderBottom: i < kecResults.length - 1 ? '1px solid #F3F4F6' : 'none',
                    }}
                  >
                    {loc.n}
                  </div>
                ))}
              </div>
            )}
            {kabupaten && (
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
                📍 {kabupaten}
              </div>
            )}
          </div>

          {/* Delivery */}
          <div>
            <label style={labelStyle}>Apakah bisnis kamu melayani pengiriman?</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { value: 'yes', label: 'Ya, melayani pengiriman' },
                { value: 'no',  label: 'Tidak (hanya di tempat)' },
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
              type="text" value={usp} onChange={e => setUsp(e.target.value)}
              placeholder={USP_PLACEHOLDERS[category] || 'Contoh: Bakso jumbo kuah kaldu sapi asli, buka sampai tengah malam'}
              maxLength={80}
              style={inputStyle}
            />
            <div style={{ textAlign: 'right', fontSize: '11px', color: usp.length > 70 ? '#DC2626' : '#9ca3af', marginTop: '4px' }}>
              {usp.length}/80
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px',
              padding: '10px 12px', fontSize: '13px', color: '#DC2626',
            }}>
              {error}
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              background: loading ? '#E4E4EB' : '#111827',
              color: loading ? '#9ca3af' : '#fff',
              border: 'none', fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan & Mulai'}
          </button>
        </div>
      </div>
    </div>
  );
}

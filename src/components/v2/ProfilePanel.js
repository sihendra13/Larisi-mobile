'use client';
import { useState, useEffect, useRef } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

const APP_VERSION = 'v2.1.0';

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

export default function ProfilePanel({
  open,
  onClose,
  onLogout,
  onSaved,
  onCancelSubscription,
  profile,
  accessToken,
  userId,
}) {
  /* ── Form state (pre-filled dari profile) ── */
  const [ownerName,  setOwnerName]  = useState('');
  const [whatsapp,   setWhatsapp]   = useState('');
  const [bizName,    setBizName]    = useState('');
  const [category,   setCategory]   = useState('');
  const [kecQuery,   setKecQuery]   = useState('');
  const [kecamatan,  setKecamatan]  = useState('');
  const [kabupaten,  setKabupaten]  = useState('');
  const [provinsi,   setProvinsi]   = useState('');
  const [delivery,   setDelivery]   = useState('');
  const [usp,        setUsp]        = useState('');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [saved,      setSaved]      = useState(false);

  /* Nominatim */
  const [kecResults, setKecResults] = useState([]);
  const [kecLoading, setKecLoading] = useState(false);
  const [showDrop,   setShowDrop]   = useState(false);
  const kecTimerRef = useRef(null);
  const uspRef      = useRef(null);

  /* Pre-fill saat panel dibuka */
  useEffect(() => {
    if (!open || !profile) return;
    setOwnerName(profile.full_name   || '');
    setWhatsapp(profile.whatsapp     || '');
    setBizName(profile.business_name || '');
    setCategory(profile.category     || '');
    setKecamatan(profile.kecamatan   || '');
    setKecQuery(profile.kecamatan    || '');
    setKabupaten(profile.kabupaten   || profile.city || '');
    setProvinsi(profile.provinsi     || '');
    setDelivery(profile.delivery_service ? 'yes' : profile.delivery_service === false ? 'no' : '');
    setUsp(profile.usp               || '');
    setError('');
    setSaved(false);
  }, [open, profile]);

  /* Lock body scroll saat panel terbuka */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* Nominatim search */
  const searchKecamatan = (val) => {
    setKecamatan(''); setKabupaten(''); setProvinsi('');
    if (kecTimerRef.current) clearTimeout(kecTimerRef.current);
    if (!val || val.length < 2) { setKecResults([]); setKecLoading(false); setShowDrop(false); return; }
    setKecLoading(true); setShowDrop(true);
    kecTimerRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(
          'https://nominatim.openstreetmap.org/search?q=' +
          encodeURIComponent(val + ' Indonesia') +
          '&format=json&addressdetails=1&limit=7&accept-language=id&countrycodes=ID',
          { headers: { 'Accept': 'application/json' } }
        );
        const data = await resp.json();
        const seen = {}, results = [];
        (data || []).forEach(r => {
          const addr    = r.address || {};
          const kec     = addr.suburb || addr.village || addr.quarter || addr.town || addr.hamlet
                          || r.display_name.split(',')[0].trim();
          const rawKab  = addr.county || addr.municipality || addr.city_district || addr.city || addr.state_district || '';
          const kab     = (rawKab.toLowerCase() === kec.toLowerCase() && (addr.city || addr.municipality))
                          ? (addr.city || addr.municipality || rawKab) : rawKab;
          const kabDisplay = kab
            .replace(/^Kabupaten\s+/i, '')
            .replace(/^Kota\s+Administrasi\s+/i, '')
            .replace(/^Regency\s+/i, '');
          const prov    = addr.state || '';
          const key     = (kec + '|' + kabDisplay).toLowerCase();
          if (seen[key]) return;
          seen[key] = true;
          results.push({ kec, kabDisplay, kab, prov });
        });
        setKecResults(results.length ? results : [{ empty: true }]);
      } catch { setKecResults([{ error: true }]); }
      finally { setKecLoading(false); }
    }, 450);
  };

  const selectKec = (r) => {
    setKecamatan(r.kec);
    setKabupaten(r.kabDisplay || r.kab || r.kec);
    setProvinsi(r.prov || '');
    setKecQuery(r.kec);
    setKecResults([]); setShowDrop(false); setError('');
  };

  /* Save */
  const handleSave = async () => {
    if (!ownerName.trim()) { setError('Nama pemilik wajib diisi.');     return; }
    if (!whatsapp.trim())  { setError('Nomor WhatsApp wajib diisi.');   return; }
    if (!bizName.trim())   { setError('Nama bisnis wajib diisi.');      return; }
    if (!category)         { setError('Pilih kategori bisnis.');        return; }
    if (!kecamatan)        { setError('Pilih kecamatan dari dropdown.'); return; }

    setSaving(true); setError('');
    let tok = accessToken;
    if (!tok) {
      try {
        const raw = localStorage.getItem('sb-mojzmlrdihenvfhrwopd-auth-token');
        if (raw) tok = JSON.parse(raw).access_token;
      } catch (e) {}
    }
    const uid = userId || profile?.id;
    if (!uid || !tok) {
      setError('Sesi tidak valid, silakan muat ulang halaman.');
      setSaving(false);
      return;
    }

    const profileData = {
      full_name:        ownerName.trim(),
      whatsapp:         whatsapp.trim(),
      business_name:    bizName.trim(),
      category,
      kecamatan,
      kabupaten,
      provinsi,
      city:             kabupaten || kecamatan,
      delivery_service: delivery === 'yes',
      usp:              usp.trim(),
    };

    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}`, {
        method:  'PATCH',
        headers: {
          'apikey':        SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${tok}`,
          'Content-Type':  'application/json',
          'Prefer':        'return=minimal',
        },
        body: JSON.stringify(profileData),
      });
      if (!resp.ok) throw new Error('Network or server error');
      // Karena return=minimal, tidak perlu resp.json()
      const newProfile = profileData;
      const merged     = { ...(profile || {}), ...newProfile, ...profileData };
      localStorage.setItem('radar_user_profile', JSON.stringify(merged));
      
      setSaved(true);
      setSaving(false);
      // Wait a moment so user can see "Tersimpan!" before closing
      setTimeout(() => {
        onSaved?.(merged);
        setSaved(false);
      }, 1000);
    } catch (e) {
      setError(`Gagal menyimpan: ${e.message || 'Coba lagi.'}`);
      setSaving(false);
    }
  };

  /* Logout */
  const handleLogout = () => {
    localStorage.removeItem('sb-mojzmlrdihenvfhrwopd-auth-token');
    localStorage.removeItem('radar_user_profile');
    localStorage.removeItem('radar_session_id');
    onLogout?.();
  };

  /* Helpers */
  const initials = (ownerName || profile?.full_name || 'P')
    .trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const plan     = profile?.selected_plan || 'freemium';
  const planLabel= { pro: 'PRO', starter: 'STARTER', freemium: 'FREEMIUM' }[plan] || 'FREEMIUM';

  const inputStyle = {
    width: '100%', padding: '11px 13px', fontSize: '14px',
    borderRadius: '10px', border: '1.5px solid #E4E4EB',
    outline: 'none', background: '#fff', boxSizing: 'border-box',
    fontFamily: 'inherit', color: '#111827', transition: 'border-color 0.15s',
  };
  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '600',
    color: '#374151', marginBottom: '5px',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
        width: 'min(360px, 92vw)',
        background: '#F9F9FA',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.18)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        fontFamily: 'var(--m-font, -apple-system, sans-serif)',
      }}>

        {/* ── Toast Notification ── */}
        {saved && (
          <div style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: '#10B981', color: '#fff', padding: '12px 20px', borderRadius: '12px',
            fontSize: '14px', fontWeight: '700', fontFamily: 'var(--m-font,sans-serif)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)', zIndex: 99999, whiteSpace: 'nowrap',
            animation: 'slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1)'
          }}>
            ✓ Profil berhasil disimpan!
          </div>
        )}

        {/* ── Panel header ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: '#fff', borderBottom: '1px solid #E4E4EB',
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Profil Saya</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280', fontSize: '20px', lineHeight: 1 }}
          >✕</button>
        </div>

        {/* ── User info card ── */}
        <div style={{
          background: '#fff', margin: '12px 12px 0',
          borderRadius: '14px', border: '1px solid #E4E4EB',
          padding: '16px',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'var(--m-ink, #111827)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>{initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ownerName || profile?.full_name || 'Pengguna'}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.business_name || '—'}
            </div>
          </div>
          <div style={{
            background: plan === 'pro' ? '#791ADB' : plan === 'starter' ? '#10b981' : '#f3f4f6',
            color: (plan === 'pro' || plan === 'starter') ? '#fff' : '#6b7280',
            border: (plan === 'pro' || plan === 'starter') ? 'none' : '1px solid #E4E4EB',
            fontSize: '10px', fontWeight: '700',
            padding: '3px 8px', borderRadius: '999px', flexShrink: 0,
          }}>
            {planLabel}
          </div>
        </div>

        {/* ── Edit profil form ── */}
        <div style={{ padding: '12px 12px 0' }}>
          <div style={{
            background: '#fff', borderRadius: '14px', border: '1px solid #E4E4EB',
            padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '-4px' }}>
              Edit Profil Bisnis
            </div>

            {/* Nama Pemilik */}
            <div>
              <label style={labelStyle}>Nama Pemilik <span style={{ color: '#DC2626' }}>*</span></label>
              <input type="text" value={ownerName}
                onChange={e => { setOwnerName(e.target.value); setError(''); }}
                placeholder="Budi Santoso" style={inputStyle} />
            </div>

            {/* WhatsApp */}
            <div>
              <label style={labelStyle}>Nomor WhatsApp <span style={{ color: '#DC2626' }}>*</span></label>
              <input type="tel" value={whatsapp}
                onChange={e => { setWhatsapp(e.target.value); setError(''); }}
                placeholder="08xxxxxxxxxx" style={inputStyle} />
            </div>

            {/* Nama Bisnis */}
            <div>
              <label style={labelStyle}>Nama Bisnis <span style={{ color: '#DC2626' }}>*</span></label>
              <input type="text" value={bizName}
                onChange={e => { setBizName(e.target.value); setError(''); }}
                placeholder="Warung Makan Berkah" style={inputStyle} />
            </div>

            {/* Kategori */}
            <div>
              <label style={labelStyle}>Kategori Bisnis <span style={{ color: '#DC2626' }}>*</span></label>
              <select value={category}
                onChange={e => { setCategory(e.target.value); setError(''); }}
                style={{
                  ...inputStyle, appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236b7280\' strokeWidth=\'1.5\' fill=\'none\' strokeLinecap=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center', paddingRight: '34px',
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
              <input type="text" value={kecQuery}
                onChange={e => { setKecQuery(e.target.value); searchKecamatan(e.target.value); }}
                onFocus={() => { if (kecQuery.length >= 2 && kecResults.length) setShowDrop(true); }}
                onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                placeholder="Ketik nama kecamatan atau daerah..."
                autoComplete="off" style={inputStyle} />
              {showDrop && (kecLoading || kecResults.length > 0) && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)',
                  background: '#fff', border: '1px solid #E4E4EB', borderRadius: '10px',
                  zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  maxHeight: '200px', overflowY: 'auto',
                }}>
                  {kecLoading && (
                    <div style={{ padding: '10px 14px', fontSize: '12px', color: '#6b7280' }}>Mencari...</div>
                  )}
                  {!kecLoading && kecResults.map((r, i) => {
                    if (r.error) return <div key="err" style={{ padding: '10px 14px', fontSize: '12px', color: '#DC2626' }}>Gagal memuat. Periksa koneksi.</div>;
                    if (r.empty) return <div key="emp" style={{ padding: '10px 14px', fontSize: '12px', color: '#6b7280' }}>Tidak ditemukan, coba kata lain</div>;
                    const sub = [r.kabDisplay, r.prov].filter(Boolean).join(' — ');
                    return (
                      <div key={i} onMouseDown={() => selectKec(r)} style={{
                        padding: '10px 14px', cursor: 'pointer',
                        borderBottom: i < kecResults.length - 1 ? '1px solid #F3F4F6' : 'none',
                        display: 'flex', flexDirection: 'column', gap: '2px',
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{r.kec}</span>
                        {sub && <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{sub}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Kabupaten readonly */}
            <input type="text" readOnly value={kabupaten}
              placeholder="Kabupaten/Kota (terisi otomatis)"
              style={{ ...inputStyle, background: '#F9F9FA', color: '#374151', cursor: 'default' }} />

            {/* Delivery */}
            <div>
              <label style={labelStyle}>Melayani pengiriman?</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[{ value: 'yes', label: 'Ya' }, { value: 'no', label: 'Tidak' }].map(opt => (
                  <label key={opt.value} style={{
                    flex: 1, padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                    border: `1.5px solid ${delivery === opt.value ? '#7C3AED' : '#E4E4EB'}`,
                    background: delivery === opt.value ? '#F5F3FF' : '#fff',
                    fontSize: '13px', fontWeight: '600',
                    color: delivery === opt.value ? '#7C3AED' : '#6b7280',
                    display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s',
                  }}>
                    <input type="radio" name="pp-delivery" value={opt.value}
                      checked={delivery === opt.value} onChange={() => setDelivery(opt.value)}
                      style={{ display: 'none' }} />
                    {delivery === opt.value ? '✓ ' : ''}{opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* USP */}
            <div>
              <label style={labelStyle}>Apa yang bikin bisnis kamu spesial?</label>
              <input ref={uspRef} type="text" value={usp}
                onChange={e => setUsp(e.target.value)}
                placeholder={USP_PLACEHOLDERS[category] || 'Contoh: Apa yang paling dipuji pelanggan kamu?'}
                maxLength={80} style={inputStyle} />
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

            {/* Save button */}
            <button onClick={handleSave} disabled={saving}
              style={{
                width: '100%', padding: '13px', borderRadius: '12px',
                background: saved ? '#10B981' : saving ? '#E4E4EB' : '#111827',
                color: saving ? '#9ca3af' : '#fff',
                border: 'none', fontSize: '14px', fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {saving && <div style={{width:'14px', height:'14px', border:'2px solid rgba(156,163,175,0.4)', borderTopColor:'#9ca3af', borderRadius:'50%', animation:'spin 0.7s linear infinite'}} />}
              {saved ? '✓ Tersimpan!' : saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>

        {/* ── Paket Aktif + Cancel Subscription (hanya untuk starter/pro) ── */}
        {(plan === 'starter' || plan === 'pro') && (
          <div style={{ padding: '0 12px' }}>
            <div style={{
              background: '#fff', borderRadius: '14px', border: '1px solid #E4E4EB',
              padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Paket Aktif</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                    {plan === 'pro' ? 'Pro' : 'Starter'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {plan === 'pro' ? 'Rp 199.000 / bulan' : 'Rp 99.000 / bulan'}
                  </div>
                </div>
                <div style={{
                  background: plan === 'pro' ? '#7C3AED' : '#2563EB',
                  color: '#fff', fontSize: '10px', fontWeight: '700',
                  padding: '3px 8px', borderRadius: '999px',
                }}>
                  {plan === 'pro' ? 'PRO' : 'STARTER'}
                </div>
              </div>
              <button
                onClick={onCancelSubscription}
                style={{
                  width: '100%', padding: '11px', borderRadius: '10px',
                  background: 'transparent', color: '#DC2626',
                  border: '1px solid #FCA5A5', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = '#FEF2F2'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                Batalkan Subscription
              </button>
            </div>
          </div>
        )}

        {/* ── Footer: version + logout ── */}
        <div style={{ padding: '12px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Logout */}
          <button onClick={handleLogout}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              background: '#FEF2F2', color: '#DC2626',
              border: '1.5px solid #FCA5A5', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Keluar
          </button>

          {/* Version */}
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', padding: '4px 0 8px' }}>
            {APP_VERSION} · mobile.larisi.id
          </div>
        </div>

      </div>
    </>
  );
}

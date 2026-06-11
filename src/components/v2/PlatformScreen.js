'use client';
import { useState, useEffect, useRef } from 'react';
import MobileHeader from '@/components/layout/MobileHeader';
import { connectSocial, getStoredAccounts, syncSocialAccountsToSupabase, prefetchAuthUrl, refreshConnectedAccounts } from '@/lib/connectSocial';

/* ── Platform config ── */
const PLATFORMS = [
  {
    id: 'instagram', label: 'Instagram',
    bg: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
    softBg: '#FFF0F3', softBorder: '#FFD6E0',
    /* icon berwarna — grid selector */
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#f09433"/>
            <stop offset="30%"  stopColor="#e6683c"/>
            <stop offset="55%"  stopColor="#dc2743"/>
            <stop offset="80%"  stopColor="#cc2366"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="url(#ig-g)" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" stroke="url(#ig-g)" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1" fill="#bc1888"/>
      </svg>
    ),
    /* icon kecil untuk soft card & badge */
    iconSoft: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig-s" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#f09433"/>
            <stop offset="55%"  stopColor="#dc2743"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="url(#ig-s)" strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="4" stroke="url(#ig-s)" strokeWidth="1.8"/>
        <circle cx="17.5" cy="6.5" r="0.9" fill="#bc1888"/>
      </svg>
    ),
    /* icon putih kecil — badge overlay */
    iconBadge: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    ),
    badgeBg: 'linear-gradient(135deg,#f09433,#bc1888)',
  },
  {
    id: 'facebook', label: 'Facebook',
    bg: '#1877F2',
    softBg: '#EEF4FF', softBorder: '#C9DDFF',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="#1877F2"/>
      </svg>
    ),
    iconSoft: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="#1877F2"/>
      </svg>
    ),
    iconBadge: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/>
      </svg>
    ),
    badgeBg: '#1877F2',
  },
  {
    id: 'tiktok', label: 'TikTok',
    bg: '#0E0E12',
    softBg: '#F5F5F5', softBorder: '#E0E0E0',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="#0E0E12"/>
      </svg>
    ),
    iconSoft: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="#0E0E12"/>
      </svg>
    ),
    iconBadge: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
      </svg>
    ),
    badgeBg: '#0E0E12',
  },
  {
    id: 'youtube', label: 'YouTube',
    bg: '#FF0000',
    softBg: '#FFF2F2', softBorder: '#FFD0D0',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z" fill="#FF0000"/>
        <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
      </svg>
    ),
    iconSoft: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z" fill="#FF0000"/>
        <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
      </svg>
    ),
    iconBadge: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z" fill="white"/>
        <path d="M9.5 8.5l4 2.5-4 2.5V8.5z" fill="#FF0000"/>
      </svg>
    ),
    badgeBg: '#FF0000',
  },
];

/* Label sub-akun per platform */
const PLATFORM_SUBS = {
  instagram: 'Instagram Business',
  facebook:  'Facebook Page',
  tiktok:    'TikTok Account',
  youtube:   'YouTube Channel',
};

/* ── Soft icon card (light bg + colored icon, gaya gambar 3) ── */
function SoftIcon({ platform, size = 44 }) {
  const r = size * 0.27;
  return (
    <div style={{
      width:`${size}px`, height:`${size}px`,
      borderRadius:`${r}px`,
      background: platform.softBg,
      border: `1px solid ${platform.softBorder}`,
      display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:0,
    }}>
      {platform.iconSoft}
    </div>
  );
}

export default function PlatformScreen({ platform, onSelectPlatform, onNext, onStartStoryMaker, profile, accessToken, userId, onAvatarClick, isGenZ }) {
  const [showManage,     setShowManage]     = useState(false);
  const [animateManage,  setAnimateManage]  = useState(false);
  const [accounts,       setAccounts]       = useState(() => getStoredAccounts());
  const [socialBusy,     setSocialBusy]     = useState('');
  const [pendingTool,    setPendingTool]    = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [showMediaSheet, setShowMediaSheet] = useState(false);
  const [animateMediaSheet, setAnimateMediaSheet] = useState(false);

  const lastScrollY = useRef(0);
  const [isFabExpanded, setIsFabExpanded] = useState(true);

  const handleScroll = (e) => {
    const y = e.target.scrollTop;
    if (y > lastScrollY.current && y > 30) setIsFabExpanded(false);
    else if (y < lastScrollY.current - 5) setIsFabExpanded(true);
    lastScrollY.current = y;
  };

  const handleToolClick = (tool) => {
    setPendingTool(tool);
    setShowMediaSheet(true);
    setTimeout(() => setAnimateMediaSheet(true), 50);
  };

  const closeMediaSheet = () => {
    setAnimateMediaSheet(false);
    setTimeout(() => {
      setShowMediaSheet(false);
      setPendingTool(null);
    }, 320);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newFile = { url, type: file.type.startsWith('video') ? 'video' : 'photo', name: file.name };
    closeMediaSheet();
    onStartStoryMaker(pendingTool, newFile);
  };
  /* Modal "belum terhubung" */
  const [warnPlatform,   setWarnPlatform]   = useState(''); /* platform yang diklik tapi belum connect */
  const [showWarn,       setShowWarn]       = useState(false);
  const [animateWarn,    setAnimateWarn]    = useState(false);
  /* Modal "konfirmasi disconnect" — matching desktop behavior */
  const [disconnectPlatform, setDisconnectPlatform] = useState('');
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [animateDisconnectConfirm, setAnimateDisconnectConfirm] = useState(false);
  /* Modal "Pilih Akun" */
  const [accountSelection, setAccountSelection] = useState({ show: false, platform: '', accounts: [] });
  const [animateAccountSelection, setAnimateAccountSelection] = useState(false);
  /* Toast notification */
  const [toast, setToast] = useState({ show: false, message: '' });
  const [preloadedUrls, setPreloadedUrls] = useState({});

  /* Refresh akun dari localStorage saat profile berubah atau layar aktif */
  useEffect(() => {
    (async () => {
      const externalId = localStorage.getItem('radar_session_id') || '';
      if (externalId && userId && accessToken) {
        const changed = await refreshConnectedAccounts(externalId, userId, accessToken);
        if (changed) {
          setAccounts(getStoredAccounts());
        }
      }
    })();
    setAccounts(getStoredAccounts());
    
    // Cek jika ada akun multiple yang tertunda dari redirect OAuth
    const pendingMultiple = localStorage.getItem('larisi_oauth_pending_multiple');
    if (pendingMultiple) {
      try {
        const parsed = JSON.parse(pendingMultiple);
        if (parsed && parsed.platform && parsed.matches && parsed.matches.length > 1) {
          setAccountSelection({ show: true, platform: parsed.platform, accounts: parsed.matches });
          setTimeout(() => setAnimateAccountSelection(true), 10);
        }
      } catch(e) {}
      localStorage.removeItem('larisi_oauth_pending_multiple');
    }

    const refresh = () => setAccounts(getStoredAccounts());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [profile]);

  /* iOS: pre-fetch OAuth URL untuk semua platform saat mount */
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;
    const externalId = localStorage.getItem('radar_session_id');
    if (!externalId) return;
    const unconnected = PLATFORMS.filter(p => !accounts.some(a => a.platform === p.id));
    unconnected.forEach(async (p) => {
      const url = await prefetchAuthUrl(p.id, externalId);
      if (url) setPreloadedUrls(prev => ({ ...prev, [p.id]: url }));
    });
  }, []);

  const openManage = () => { setShowManage(true);  setTimeout(() => setAnimateManage(true), 10); };
  const closeManage = () => { setAnimateManage(false); setTimeout(() => setShowManage(false), 300); };

  const openWarn = (plt) => { setWarnPlatform(plt); setShowWarn(true); setTimeout(() => setAnimateWarn(true), 10); };
  const closeWarn = () => { setAnimateWarn(false); setTimeout(() => { setShowWarn(false); setWarnPlatform(''); }, 300); };

  /* Disconnect confirmation — matching desktop behavior */
  const [disconnectConfirmText, setDisconnectConfirmText] = useState('');

  const openDisconnectConfirm = (plt) => {
    /* Close manage sheet dulu, baru buka confirmation modal */
    closeManage();
    setTimeout(() => {
      setDisconnectPlatform(plt);
      setDisconnectConfirmText('');
      setShowDisconnectConfirm(true);
      setTimeout(() => setAnimateDisconnectConfirm(true), 10);
    }, 300);
  };
  const closeDisconnectConfirm = () => {
    setAnimateDisconnectConfirm(false);
    setTimeout(() => {
      setShowDisconnectConfirm(false);
      setDisconnectPlatform('');
      setDisconnectConfirmText('');
    }, 300);
  };

  const confirmDisconnect = (plt) => {
    const updated = getStoredAccounts().filter(a => a.platform !== plt);
    localStorage.setItem('radar_social_accounts', JSON.stringify(updated));
    setAccounts(updated);

    /* Update juga profile di localStorage agar saat app dibuka kembali tidak restore akun lama */
    try {
      const profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
      profile.social_accounts = updated;
      localStorage.setItem('radar_user_profile', JSON.stringify(profile));
    } catch (e) {}

    closeDisconnectConfirm();

    /* Sync ke Supabase agar disconnect persist setelah logout/login */
    if (userId && accessToken) {
      syncSocialAccountsToSupabase(userId, accessToken);
    }

    /* Show toast notification */
    const platLabel = PLATFORMS.find(p => p.id === plt)?.label || plt;
    setToast({ show: true, message: `Akun ${platLabel}mu sudah tidak terhubung` });
    setTimeout(() => setToast({ show: false, message: '' }), 3500);
  };

  const handleSelectPlatform = (pid) => {
    const isConn = accounts.some(a => a.platform === pid);
    if (!isConn) { openWarn(pid); return; }
    onSelectPlatform(pid);
    onNext();
  };

  const handleConnect = (pid) => {
    connectSocial({
      platform: pid,
      accessToken: accessToken || '',
      userId: userId || '',
      preloadedUrl: preloadedUrls[pid] || null,
      onStart:  (p) => setSocialBusy(p),
      onMultipleAccounts: (matches) => {
        setSocialBusy('');
        setAccountSelection({ show: true, platform: pid, accounts: matches });
        setTimeout(() => setAnimateAccountSelection(true), 10);
      },
      onDone:   async (plt, accData) => {
        // Update local state
        setAccounts(getStoredAccounts());
        setSocialBusy('');

        // Sync to Supabase untuk persistent storage
        if (userId && accessToken) {
          await syncSocialAccountsToSupabase(userId, accessToken);
        }
      },
      onCancel: ()  => setSocialBusy(''),
    });
  };

  const closeAccountSelection = () => {
    setAnimateAccountSelection(false);
    setTimeout(() => {
      setAccountSelection({ show: false, platform: '', accounts: [] });
    }, 300);
  };

  const handleSelectSpecificAccount = async (accData) => {
    // Simpan akun yang dipilih ke localStorage
    const existing = JSON.parse(localStorage.getItem('radar_social_accounts') || '[]');
    const filtered = existing.filter(a => a.platform !== accountSelection.platform);
    filtered.push(accData);
    localStorage.setItem('radar_social_accounts', JSON.stringify(filtered));
    
    // Update local state
    setAccounts(getStoredAccounts());
    closeAccountSelection();

    // Sync to Supabase
    if (userId && accessToken) {
      await syncSocialAccountsToSupabase(userId, accessToken);
    }
  };

  const connectedPlatforms = PLATFORMS.filter(p => accounts.some(a => a.platform === p.id));

  return (
    <div style={{
      display:'flex', flexDirection:'column', flex:1, overflow:'hidden', 
      background: isGenZ ? '#0F172A' : 'var(--m-bg)'
    }}>

      {/* ── Header ── */}
      {isGenZ ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: '#0F172A', borderBottom: '1px solid #1E293B',
          flexShrink: 0
        }}>
          {/* Hamburger menu icon */}
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {/* Title */}
          <span style={{ fontFamily: 'var(--m-font, sans-serif)', fontSize: '18px', fontWeight: '800', color: '#fff' }}>
            Dapur Konten
          </span>
          {/* Avatar Profile */}
          <button onClick={onAvatarClick} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#1E293B', color: '#fff', fontWeight: 'bold', fontSize: '13px'
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (profile?.full_name || profile?.business_name || 'P').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
            )}
          </button>
        </div>
      ) : (
        <MobileHeader
          userName={profile?.full_name || profile?.business_name || 'Pengguna'}
          userInitials={(profile?.full_name || profile?.business_name || 'P').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
          isPro={profile?.selected_plan === 'pro'}
          onAvatarClick={onAvatarClick}
        />
      )}

      {isGenZ ? (
        <main onScroll={handleScroll} style={{flex:1,overflowY:'auto',padding:'0 16px',paddingBottom:'calc(80px + env(safe-area-inset-bottom))'}}>
          {/* Page title */}
          <div style={{padding:'24px 0 20px'}}>
            <h2 style={{fontFamily:'var(--m-font)',fontSize:'20px',fontWeight:'800',color:'#fff',marginBottom:'6px'}}>
              Dapur Kreasi
            </h2>
            <p style={{fontFamily:'var(--m-font)',fontSize:'13px',color:'#94A3B8',lineHeight:'1.5'}}>
              Hadirkan ide liarmu menjadi konten viral dalam sekejap.
            </p>
          </div>

          {/* Grid 2x2: Dapur Kreasi Gen Z */}
          <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px'}}>
            {/* Card 1: AI Meme Generator */}
            <button 
              onClick={() => {
                handleToolClick('meme');
              }}
              style={{
                background:'#1E293B', border:'1px solid #334155', borderRadius:'16px',
                padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center',
                gap:'12px', cursor:'pointer', textAlign:'center', transition:'all 0.2s', outline:'none'
              }}
            >
              {/* Squircle Icon Container with Custom Indigo-Tinted Dark BG */}
              <div style={{
                width:'52px', height:'52px', borderRadius:'12px',
                background:'#1E223D', display:'flex', alignItems:'center', justifyContent:'center',
                border:'1.5px solid rgba(165, 180, 252, 0.15)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{color: '#A5B4FC'}}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="9" cy="10.5" r="1.2" fill="currentColor" />
                  <circle cx="15" cy="10.5" r="1.2" fill="currentColor" />
                  <path d="M8.5 14.5C9.5 15.8 10.8 16.2 12 16.2C13.2 16.2 14.5 15.8 15.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'#fff'}}>
                AI Meme Generator
              </span>
            </button>
            
            {/* Card 2: Story Maker */}
            <button 
              onClick={() => {
                handleToolClick('story');
              }}
              style={{
                background:'#1E293B', border:'1px solid #334155', borderRadius:'16px',
                padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center',
                gap:'12px', cursor:'pointer', textAlign:'center', transition:'all 0.2s', outline:'none'
              }}
            >
              {/* Squircle Icon Container with Custom Teal-Tinted Dark BG */}
              <div style={{
                width:'52px', height:'52px', borderRadius:'12px',
                background:'#162E34', display:'flex', alignItems:'center', justifyContent:'center',
                border:'1.5px solid rgba(79, 209, 197, 0.15)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{color: '#4FD1C5'}}>
                  {/* Left big sparkle */}
                  <path d="M9.5 2C9.5 5.5 11.5 7.5 15 7.5C11.5 7.5 9.5 9.5 9.5 13C9.5 9.5 7.5 7.5 4 7.5C7.5 7.5 9.5 5.5 9.5 2Z" fill="currentColor" />
                  {/* Top-right small sparkle */}
                  <path d="M18.5 2.5C18.5 3.8 19.3 4.5 20.5 4.5C19.3 4.5 18.5 5.2 18.5 6.5C18.5 5.2 17.7 4.5 16.5 4.5C17.7 4.5 18.5 3.8 18.5 2.5Z" fill="currentColor" />
                  {/* Bottom-right small sparkle */}
                  <path d="M16.5 9C16.5 10.3 17.3 11 18.5 11C17.3 11 16.5 11.7 16.5 13C16.5 11.7 15.7 11 14.5 11C15.7 11 16.5 10.3 16.5 9Z" fill="currentColor" />
                </svg>
              </div>
              <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'#fff'}}>
                Story Maker
              </span>
            </button>

            {/* Card 3: Bento Collage */}
            <button 
              onClick={() => {
                handleToolClick('bento');
              }}
              style={{
                background:'#1E293B', border:'1px solid #334155', borderRadius:'16px',
                padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center',
                gap:'12px', cursor:'pointer', textAlign:'center', transition:'all 0.2s', outline:'none'
              }}
            >
              {/* Squircle Icon Container with Custom Gold-Tinted Dark BG */}
              <div style={{
                width:'52px', height:'52px', borderRadius:'12px',
                background:'#2E221E', display:'flex', alignItems:'center', justifyContent:'center',
                border:'1.5px solid rgba(253, 186, 116, 0.15)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{color: '#FDBA74'}}>
                  <rect x="3" y="3" width="7" height="18" rx="1.5" fill="currentColor" />
                  <rect x="12" y="3" width="9" height="8" rx="1.5" fill="currentColor" />
                  <rect x="12" y="13" width="9" height="8" rx="1.5" fill="currentColor" />
                </svg>
              </div>
              <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'#fff'}}>
                Bento Collage
              </span>
            </button>

            {/* Card 4: Video Motion */}
            <button 
              onClick={() => {
                handleToolClick('videomotion');
              }}
              style={{
                background:'#1E293B', border:'1px solid #334155', borderRadius:'16px',
                padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center',
                gap:'12px', cursor:'pointer', textAlign:'center', transition:'all 0.2s', outline:'none'
              }}
            >
              {/* Squircle Icon Container with Custom Pink-Tinted Dark BG */}
              <div style={{
                width:'52px', height:'52px', borderRadius:'12px',
                background:'#2F1B2B', display:'flex', alignItems:'center', justifyContent:'center',
                border:'1.5px solid rgba(252, 165, 165, 0.15)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{color: '#FCA5A5'}}>
                  <path d="M4 7H20V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V7Z" fill="currentColor" />
                  <path d="M4 7L6 4H9L7 7H10L12 4H15L13 7H16L18 4H20L18 7H4Z" fill="currentColor" opacity="0.85" />
                </svg>
              </div>
              <span style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'#fff'}}>
                Video Motion
              </span>
            </button>
          </div>

          {/* Akun Terhubung */}
          <div style={{
            background:'#1E293B', border:'1px solid #334155', borderRadius:'16px', padding:'20px 16px'
          }}>
            <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', color:'#fff', marginBottom:'16px'}}>
              Akun Terhubung
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {PLATFORMS.map(p => {
                const acc = accounts.find(a => a.platform === p.id);
                const isConn = !!acc;
                const isBusy = socialBusy === p.id;
                return (
                  <div key={p.id} style={{
                    display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px',
                    borderRadius:'12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)'
                  }}>
                    {/* Profile Avatar / Fallback */}
                    {isConn ? (
                      <div style={{position:'relative', width:'40px', height:'40px', flexShrink:0}}>
                        {acc.avatar_url ? (
                          <img src={acc.avatar_url} alt="" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} />
                        ) : (
                          <div style={{width:'100%', height:'100%', borderRadius:'50%', background:p.badgeBg, display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <span style={{color:'#fff', fontSize:'14px', fontWeight:'700'}}>
                              {(acc.username || p.label).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {/* Platform Indicator */}
                        <div style={{
                          position:'absolute', bottom:'-2px', right:'-2px', width:'16px', height:'16px', 
                          borderRadius:'50%', background:p.badgeBg, border:'1.5px solid #162238', 
                          display:'flex', alignItems:'center', justifyContent:'center'
                        }}>
                          {p.iconBadge}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        width:'40px', height:'40px', borderRadius:'50%', 
                        background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center'
                      }}>
                        {p.iconSoft}
                      </div>
                    )}

                    {/* Info */}
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                        {isConn && acc.username ? `@${acc.username}` : p.label}
                      </div>
                    </div>

                    {/* Action Button */}
                    {isConn ? (
                      <div style={{
                        background:'rgba(16, 185, 129, 0.15)', color:'#10B981', border:'1px solid rgba(16, 185, 129, 0.3)',
                        padding:'4px 10px', borderRadius:'99px', fontSize:'11px', fontWeight:'700'
                      }}>
                        Terhubung
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnect(p.id)}
                        disabled={!!socialBusy}
                        style={{
                          background:'transparent', color:'#8F9CAE', border:'1px solid #243552',
                          padding:'6px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:'700', cursor:'pointer'
                        }}
                      >
                        {isBusy ? '...' : 'Hubungkan'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      ) : (
        <main onScroll={handleScroll} style={{flex:1,overflowY:'auto',padding:'0 16px',paddingBottom:'calc(80px + env(safe-area-inset-bottom))'}}>

          {/* Page title */}
          <div style={{padding:'32px 0 20px'}}>
            <h1 style={{fontFamily:'var(--m-font)',fontSize:'28px',fontWeight:'800',color:'var(--m-ink)',lineHeight:'1.2',marginBottom:'6px'}}>
              Dapur Konten
            </h1>
            <p style={{fontFamily:'var(--m-font)',fontSize:'14px',color:'var(--m-ink-sub)'}}>
              Pilih platform untuk mulai membuat iklan
            </p>
          </div>

          {/* ── Card: Posting ke Platform ── */}
          <div style={{marginBottom:'12px',padding:'16px',background:'#fff',borderRadius:'16px',border:'1.5px solid #EBEBF0'}}>
            <div style={{fontFamily:'var(--m-font)',fontSize:'15px',fontWeight:'700',color:'var(--m-ink)',marginBottom:'14px'}}>
              Pilih Platform
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
              {PLATFORMS.map(p => {
                const isConn = accounts.some(a => a.platform === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPlatform(p.id)}
                    style={{
                      display:'flex', flexDirection:'column', alignItems:'center',
                      gap:'8px', padding:'14px 6px',
                      borderRadius:'12px', cursor:'pointer',
                      background:'#FAFAFA',
                      border:'1.5px solid #EBEBF0',
                      transition:'all .15s', position:'relative',
                    }}
                  >
                    {/* Indikator pojok kanan atas: centang hijau = terhubung, gembok = belum */}
                    <div style={{position:'absolute',top:'6px',right:'6px',
                      width:'16px',height:'16px',borderRadius:'50%',
                      background: isConn ? '#10B981' : '#F3F4F6',
                      border: `1px solid ${isConn ? '#10B981' : '#E4E4EB'}`,
                      display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {isConn ? (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      )}
                    </div>
                    {p.icon}
                    <span style={{fontFamily:'var(--m-font)',fontSize:'11px',fontWeight:'600',color:'var(--m-ink-sub)'}}>
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Card: Hubungkan Akun ── */}
          <div style={{padding:'16px',background:'#fff',borderRadius:'16px',border:'1.5px solid #EBEBF0'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
              <div style={{fontFamily:'var(--m-font)',fontSize:'15px',fontWeight:'700',color:'var(--m-ink)'}}>
                Hubungkan Akun
              </div>
              <button
                onClick={openManage}
                style={{width:'32px',height:'32px',borderRadius:'50%',background:'#F5F5F7',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
              </button>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {PLATFORMS.map(p => {
                const acc    = accounts.find(a => a.platform === p.id);
                const isConn = !!acc;
                const isBusy = socialBusy === p.id;
                return (
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',borderRadius:'12px',background:'#fff',border:`1.5px solid ${isConn ? '#D1FAE5' : '#EBEBF0'}`}}>

                    {/* Avatar */}
                    {isConn ? (
                      <div style={{position:'relative',width:'44px',height:'44px',flexShrink:0}}>
                        {acc.avatar_url ? (
                          <img src={acc.avatar_url} alt={acc.username || p.label}
                            style={{width:'44px',height:'44px',borderRadius:'12px',objectFit:'cover'}}
                            onError={e => { e.target.style.display='none'; }}
                          />
                        ) : (
                          <div style={{width:'44px',height:'44px',borderRadius:'12px',background:p.badgeBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <span style={{color:'#fff',fontFamily:'var(--m-font)',fontSize:'16px',fontWeight:'700'}}>
                              {(acc.username || p.label).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div style={{position:'absolute',bottom:'-3px',right:'-3px',width:'18px',height:'18px',borderRadius:'50%',background:p.badgeBg,border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {p.iconBadge}
                        </div>
                      </div>
                    ) : (
                      <SoftIcon platform={p} size={44} />
                    )}

                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:'var(--m-font)',fontSize:'13px',fontWeight:'700',color:'var(--m-ink)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                        {isConn && acc.username ? `@${acc.username}` : p.label}
                      </div>
                      <div style={{fontFamily:'var(--m-font)',fontSize:'11px',color:'var(--m-ink-sub)'}}>
                        {PLATFORM_SUBS[p.id]}
                      </div>
                    </div>

                    {/* Status / Action */}
                    {isConn ? (
                      <div style={{display:'flex',alignItems:'center',gap:'4px',flexShrink:0,background:'#DCFCE7',borderRadius:'999px',padding:'4px 10px 4px 7px'}}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span style={{fontFamily:'var(--m-font)',fontSize:'12px',fontWeight:'600',color:'#16A34A'}}>Terhubung</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnect(p.id)}
                        disabled={!!socialBusy}
                        style={{flexShrink:0,padding:'7px 14px',borderRadius:'8px',
                          border:`1.5px solid ${isBusy ? '#E4E4EB' : '#1A1A1A'}`,
                          background:'transparent',cursor: isBusy ? 'not-allowed' : 'pointer',
                          fontFamily:'var(--m-font)',fontSize:'12px',fontWeight:'700',
                          color: isBusy ? '#9ca3af' : '#1A1A1A',
                        }}
                      >
                        {isBusy ? '...' : 'Hubungkan'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* ── Modal: Kelola Akun Terhubung ── */}
      {showManage && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeManage}
            style={{
              position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,0.45)',
              opacity: animateManage ? 1 : 0, transition: 'opacity 0.3s ease-out'
            }}
          />
          {/* Sheet */}
          <div
            style={{
              position:'fixed', bottom:0, left:0, right:0, zIndex:9999,
              background:'#fff', borderRadius:'20px 20px 0 0',
              padding:'24px 16px calc(32px + env(safe-area-inset-bottom))',
              transform: animateManage ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.3s ease-out',
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'20px'}}>
              <div>
                <div style={{fontFamily:'var(--m-font)',fontSize:'18px',fontWeight:'800',color:'var(--m-ink)',marginBottom:'4px'}}>Kelola Akun Terhubung</div>
                <div style={{fontFamily:'var(--m-font)',fontSize:'13px',color:'var(--m-ink-sub)'}}>Pilih akun untuk diputuskan</div>
              </div>
              <button onClick={closeManage} style={{width:'32px',height:'32px',borderRadius:'50%',background:'#F5F5F7',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {connectedPlatforms.length === 0 ? (
                <p style={{fontFamily:'var(--m-font)',fontSize:'14px',color:'var(--m-ink-sub)',textAlign:'center',padding:'24px 0'}}>Belum ada akun terhubung</p>
              ) : connectedPlatforms.map(p => {
                const acc = accounts.find(a => a.platform === p.id);
                return (
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',borderRadius:'14px',background:'#F9F9FB',border:'1.5px solid #EBEBF0'}}>
                    {/* Avatar */}
                    <div style={{position:'relative',width:'48px',height:'48px',flexShrink:0}}>
                      {acc?.avatar_url ? (
                        <img src={acc.avatar_url} alt={acc.username || p.label}
                          style={{width:'48px',height:'48px',borderRadius:'12px',objectFit:'cover'}}
                          onError={e => { e.target.style.display='none'; }}
                        />
                      ) : (
                        <div style={{width:'48px',height:'48px',borderRadius:'12px',background:p.badgeBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <span style={{color:'#fff',fontFamily:'var(--m-font)',fontSize:'18px',fontWeight:'700'}}>
                            {(acc?.username || p.label).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div style={{position:'absolute',bottom:'-3px',right:'-3px',width:'20px',height:'20px',borderRadius:'50%',background:p.badgeBg,border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {p.iconBadge}
                      </div>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:'var(--m-font)',fontSize:'14px',fontWeight:'700',color:'var(--m-ink)'}}>{p.label}</div>
                      <div style={{fontFamily:'var(--m-font)',fontSize:'12px',color:'var(--m-ink-sub)'}}>
                        {acc?.username ? `@${acc.username}` : 'Terhubung'}
                      </div>
                    </div>
                    <button
                      onClick={() => openDisconnectConfirm(p.id)}
                      style={{flexShrink:0,padding:'7px 14px',borderRadius:'8px',border:'1.5px solid #EF4444',background:'transparent',cursor:'pointer',fontFamily:'var(--m-font)',fontSize:'12px',fontWeight:'700',color:'#EF4444'}}>
                      Putuskan
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Modal: Akun Belum Terhubung ── */}
      {showWarn && (
        <>
          <div onClick={closeWarn} style={{position:'fixed',inset:0,zIndex:9998,background:'rgba(0,0,0,0.45)',opacity:animateWarn?1:0,transition:'opacity 0.25s'}} />
          <div style={{
            position:'fixed',left:'50%',top:'50%',zIndex:9999,
            transform: animateWarn ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-48%) scale(0.97)',
            opacity: animateWarn ? 1 : 0,
            transition:'transform 0.25s cubic-bezier(0.34,1.56,0.64,1),opacity 0.25s',
            width:'min(320px,88vw)',
            background:'#fff',borderRadius:'20px',padding:'24px 20px 20px',
            boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
            fontFamily:'var(--m-font)',
          }}>
            <div style={{textAlign:'center',marginBottom:'12px',fontSize:'36px'}}>🔗</div>
            <div style={{fontSize:'17px',fontWeight:'800',color:'#111827',textAlign:'center',marginBottom:'8px'}}>
              Hubungkan akun dulu, yuk!
            </div>
            <div style={{fontSize:'13px',color:'#6b7280',textAlign:'center',lineHeight:'1.6',marginBottom:'18px'}}>
              Untuk posting ke <strong>{PLATFORMS.find(p=>p.id===warnPlatform)?.label}</strong>, kamu perlu hubungkan akun terlebih dahulu.
            </div>
            <button
              onClick={() => { closeWarn(); handleConnect(warnPlatform); }}
              style={{width:'100%',padding:'13px',borderRadius:'12px',background:'#111827',color:'#fff',border:'none',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',marginBottom:'8px'}}
            >
              Hubungkan Sekarang →
            </button>
            <button
              onClick={closeWarn}
              style={{width:'100%',padding:'11px',borderRadius:'12px',background:'none',color:'#9ca3af',border:'1.5px solid #E4E4EB',fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}
            >
              Nanti saja
            </button>
          </div>
        </>
      )}

      {/* ── Modal: Konfirmasi Disconnect ── matching desktop behavior */}
      {showDisconnectConfirm && (
        <>
          <div onClick={closeDisconnectConfirm} style={{position:'fixed',inset:0,zIndex:9998,background:'rgba(0,0,0,0.45)',opacity:animateDisconnectConfirm?1:0,transition:'opacity 0.25s'}} />
          <div style={{
            position:'fixed',left:'50%',top:'50%',zIndex:9999,
            transform: animateDisconnectConfirm ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-48%) scale(0.97)',
            opacity: animateDisconnectConfirm ? 1 : 0,
            transition:'transform 0.25s cubic-bezier(0.34,1.56,0.64,1),opacity 0.25s',
            width:'min(400px,88vw)',
            maxHeight:'80vh',overflowY:'auto',
            background:'#fff',borderRadius:'20px',padding:'28px 24px',
            boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
            fontFamily:'var(--m-font)',
          }}>
            {(() => {
              const disconnectAcc = accounts.find(a => a.platform === disconnectPlatform);
              const disconnectPlat = PLATFORMS.find(p => p.id === disconnectPlatform);
              const canDisconnect = disconnectConfirmText.toLowerCase() === 'putuskan';
              return (
                <>
                  <div style={{fontSize:'18px',fontWeight:'700',color:'#111827',marginBottom:'20px'}}>
                    Putuskan {disconnectAcc?.username ? `@${disconnectAcc.username}` : disconnectPlat?.label || disconnectPlatform}
                  </div>

                  {/* Account info card */}
                  <div style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 16px',marginBottom:'16px',border:'1.5px solid #e5e7eb',borderRadius:'12px',background:'#f9fafb'}}>
                    {disconnectPlat && (
                      <>
                        {/* Avatar */}
                        <div style={{position:'relative',width:'48px',height:'48px',flexShrink:0}}>
                          {disconnectAcc?.avatar_url ? (
                            <img src={disconnectAcc.avatar_url} alt={disconnectAcc.username || disconnectPlat.label}
                              style={{width:'48px',height:'48px',borderRadius:'12px',objectFit:'cover'}}
                              onError={e => { e.target.style.display='none'; }}
                            />
                          ) : (
                            <div style={{width:'48px',height:'48px',borderRadius:'12px',background:disconnectPlat.badgeBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                              <span style={{color:'#fff',fontFamily:'var(--m-font)',fontSize:'18px',fontWeight:'700'}}>
                                {(disconnectAcc?.username || disconnectPlat.label).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div style={{position:'absolute',bottom:'-3px',right:'-3px',width:'20px',height:'20px',borderRadius:'50%',background:disconnectPlat.badgeBg,border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            {disconnectPlat.iconBadge}
                          </div>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:'14px',fontWeight:'600',color:'#111827'}}>{disconnectPlat.label}</div>
                          <div style={{fontSize:'12px',color:'#6b7280'}}>
                            {disconnectAcc?.username ? `@${disconnectAcc.username}` : 'Terhubung'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Warning message */}
                  <div style={{fontSize:'13px',color:'#6b7280',lineHeight:'1.6',marginBottom:'16px'}}>
                    Kamu tidak akan bisa lagi memposting ke akun ini. Semua postingan, analitik, tag, dan data yang terkait akan dihapus secara permanen. <strong>Tindakan ini tidak bisa dibatalkan.</strong>
                  </div>

                  {/* Confirmation input */}
                  <div style={{marginBottom:'16px'}}>
                    <div style={{fontSize:'12px',fontWeight:'600',color:'#111827',marginBottom:'8px'}}>
                      Ketik "<strong>putuskan</strong>" untuk konfirmasi
                    </div>
                    <input
                      type="text"
                      value={disconnectConfirmText}
                      onChange={(e) => setDisconnectConfirmText(e.target.value)}
                      placeholder="putuskan"
                      style={{
                        width:'100%',
                        padding:'12px 14px',
                        borderRadius:'8px',
                        border:'1.5px solid #e5e7eb',
                        fontSize:'14px',
                        fontFamily:'inherit',
                        boxSizing:'border-box',
                      }}
                    />
                  </div>

                  {/* Buttons */}
                  <div style={{display:'flex',gap:'12px'}}>
                    <button
                      onClick={closeDisconnectConfirm}
                      style={{
                        flex:1,padding:'13px',borderRadius:'12px',
                        background:'none',color:'#111827',
                        border:'1.5px solid #E4E4EB',fontSize:'14px',fontWeight:'600',
                        cursor:'pointer',fontFamily:'inherit',
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => confirmDisconnect(disconnectPlatform)}
                      disabled={!canDisconnect}
                      style={{
                        flex:1,padding:'13px',borderRadius:'12px',
                        background: canDisconnect ? '#EF4444' : '#F3F4F6',
                        color: canDisconnect ? '#fff' : '#9ca3af',
                        border:'none',fontSize:'14px',fontWeight:'700',
                        cursor: canDisconnect ? 'pointer' : 'not-allowed',
                        fontFamily:'inherit',
                      }}
                    >
                      Putuskan Akun
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* ── Modal Account Selection (Jika multiple accounts ditemukan) ── */}
      {accountSelection.show && (
        <>
          <div
            onClick={closeAccountSelection}
            style={{
              position:'fixed',top:0,left:0,right:0,bottom:0,
              background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',
              zIndex:1000,
              opacity: animateAccountSelection ? 1 : 0,
              transition:'opacity 0.3s ease',
            }}
          />
          <div style={{
            position:'fixed',bottom: animateAccountSelection ? 0 : '-100%',
            left:0,right:0,
            background:'#fff',
            borderRadius:'24px 24px 0 0',
            padding:'24px',
            zIndex:1001,
            transition:'bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
            boxShadow:'0 -4px 24px rgba(0,0,0,0.1)',
            maxHeight:'80vh',
            display:'flex', flexDirection:'column'
          }}>
            <div style={{width:'40px',height:'4px',background:'#e5e7eb',borderRadius:'2px',margin:'0 auto 24px'}} />
            
            <h3 style={{margin:'0 0 8px',fontSize:'18px',fontWeight:'800',color:'#111827',fontFamily:'var(--m-font)'}}>
              Pilih Akun {PLATFORMS.find(p=>p.id===accountSelection.platform)?.label}
            </h3>
            <p style={{margin:'0 0 20px',fontSize:'14px',color:'#6b7280',fontFamily:'var(--m-font)',lineHeight:1.5}}>
              Ditemukan lebih dari satu akun. Silakan pilih akun mana yang ingin Anda hubungkan.
            </p>

            <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'12px', paddingBottom:'24px'}}>
              {accountSelection.accounts.map((acc, i) => (
                <div 
                  key={i}
                  onClick={() => handleSelectSpecificAccount(acc)}
                  style={{
                    display:'flex', alignItems:'center', gap:'16px',
                    padding:'16px', borderRadius:'16px',
                    background:'#f9fafb', border:'1px solid #e5e7eb',
                    cursor:'pointer', transition:'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width:'48px', height:'48px', borderRadius:'50%',
                    background:'#e5e7eb', overflow:'hidden', flexShrink:0
                  }}>
                    {acc.avatar_url ? (
                      <img src={acc.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    ) : (
                      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#9ca3af'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                    )}
                  </div>
                  <div style={{flex:1, overflow:'hidden'}}>
                    <div style={{fontSize:'16px',fontWeight:'700',color:'#111827',marginBottom:'2px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontFamily:'var(--m-font)'}}>
                      {acc.username || 'Akun Tanpa Nama'}
                    </div>
                  </div>
                  <div style={{color:'var(--m-primary)'}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={closeAccountSelection}
              style={{
                width:'100%',padding:'14px',borderRadius:'12px',
                background:'#f3f4f6',color:'#4b5563',border:'none',
                fontSize:'15px',fontWeight:'700',cursor:'pointer',
                fontFamily:'var(--m-font)', marginTop:'auto'
              }}
            >
              Batal
            </button>
          </div>
        </>
      )}



      {/* ── Bottom Sheet: Pilih Media (Gambar 1) ── */}
      {showMediaSheet && (
        <>
          <div onClick={closeMediaSheet} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9998,
            opacity: animateMediaSheet ? 1 : 0, transition: 'opacity 0.3s ease-out',
          }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
            background: '#0e0e12', borderRadius: '24px 24px 0 0',
            borderTop: '1px solid #1e1e24',
            display: 'flex', flexDirection: 'column',
            maxHeight: '80vh', overflow: 'hidden',
            transform: animateMediaSheet ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
            padding: '24px 20px calc(24px + env(safe-area-inset-bottom))'
          }}>
            {/* Drag handle */}
            <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#374151', margin: '0 auto 24px', flexShrink: 0 }} />

            {/* Header */}
            <h3 style={{ fontFamily: 'var(--m-font, sans-serif)', fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '8px', textAlign: 'left' }}>
              Pilih Media
            </h3>
            <p style={{ fontFamily: 'var(--m-font, sans-serif)', fontSize: '13px', color: '#94A3B8', marginBottom: '24px', textAlign: 'left', lineHeight: '1.5' }}>
              {pendingTool === 'meme' ? 'Pilih sumber foto untuk membuat meme AI Anda.' : 'Pilih sumber foto untuk membuat konten Anda.'}
            </p>

            {/* Options Row */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {/* Option 1: Ambil Foto */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
                  padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '12px', cursor: 'pointer', textAlign: 'center', outline: 'none'
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', background: '#1e223d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc',
                  border: '1.5px solid rgba(165, 180, 252, 0.15)'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                  Ambil Foto
                </span>
              </button>

              {/* Option 2: Pilih dari Galeri */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
                  padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '12px', cursor: 'pointer', textAlign: 'center', outline: 'none'
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', background: '#162e34',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4fd1c5',
                  border: '1.5px solid rgba(79, 209, 197, 0.15)'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                  Pilih dari Galeri
                </span>
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={closeMediaSheet}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: 'transparent', color: '#9ca3af', border: 'none',
                fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'var(--m-font)'
              }}
            >
              Batal
            </button>
          </div>
        </>
      )}

      {/* ── Toast Notification ── */}
      {toast.show && (
        <div style={{
          position:'fixed',bottom:'80px',left:'50%',transform:'translateX(-50%)',
          zIndex:10000,
          background:'#111827',color:'#fff',
          padding:'12px 16px',borderRadius:'12px',
          fontSize:'14px',fontWeight:'600',
          fontFamily:'var(--m-font)',
          boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
          opacity:1,
          animation:'slideUp 0.3s ease-out forwards',
          maxWidth:'80vw',whiteSpace:'nowrap',textOverflow:'ellipsis',overflow:'hidden',
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

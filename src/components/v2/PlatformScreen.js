'use client';
import { useState, useEffect } from 'react';
import MobileHeader from '@/components/layout/MobileHeader';
import { connectSocial, getStoredAccounts, syncSocialAccountsToSupabase } from '@/lib/connectSocial';

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

export default function PlatformScreen({ platform, onSelectPlatform, onNext, profile, accessToken, userId, onAvatarClick }) {
  const [showManage,     setShowManage]     = useState(false);
  const [animateManage,  setAnimateManage]  = useState(false);
  const [accounts,       setAccounts]       = useState(() => getStoredAccounts());
  const [socialBusy,     setSocialBusy]     = useState('');
  /* Modal "belum terhubung" */
  const [warnPlatform,   setWarnPlatform]   = useState(''); /* platform yang diklik tapi belum connect */
  const [showWarn,       setShowWarn]       = useState(false);
  const [animateWarn,    setAnimateWarn]    = useState(false);
  /* Modal "konfirmasi disconnect" — matching desktop behavior */
  const [disconnectPlatform, setDisconnectPlatform] = useState('');
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [animateDisconnectConfirm, setAnimateDisconnectConfirm] = useState(false);
  /* Toast notification */
  const [toast, setToast] = useState({ show: false, message: '' });

  /* Refresh akun dari localStorage setiap kali layar aktif */
  useEffect(() => {
    const refresh = () => setAccounts(getStoredAccounts());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
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
      onStart:  (p) => setSocialBusy(p),
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

  const connectedPlatforms = PLATFORMS.filter(p => accounts.some(a => a.platform === p.id));

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>

      {/* ── Header ── */}
      <MobileHeader
        userName={profile?.full_name || profile?.business_name || 'Pengguna'}
        userInitials={(profile?.full_name || profile?.business_name || 'P').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
        isPro={profile?.selected_plan === 'pro'}
        onAvatarClick={onAvatarClick}
      />

      <main style={{flex:1,overflowY:'auto',padding:'0 16px',paddingBottom:'calc(80px + env(safe-area-inset-bottom))'}}>

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
                    <SoftIcon platform={p} size={48} />
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
                        <SoftIcon platform={disconnectPlat} size={48} />
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

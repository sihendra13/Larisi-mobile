'use client';
import { useState } from 'react';

/* ── Platform config ── */
const PLATFORMS = [
  {
    id: 'instagram', label: 'Instagram',
    bg: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
    /* icon berwarna — untuk grid selector */
    icon: (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
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
    /* icon putih — untuk app-icon (kotak berwarna) */
    iconWhite: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.8" fill="#fff" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'facebook', label: 'Facebook',
    bg: '#1877F2',
    icon: (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="#1877F2"/>
      </svg>
    ),
    iconWhite: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'tiktok', label: 'TikTok',
    bg: '#0E0E12',
    icon: (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="#0E0E12"/>
      </svg>
    ),
    iconWhite: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'youtube', label: 'YouTube',
    bg: '#FF0000',
    icon: (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z" fill="#FF0000"/>
        <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
      </svg>
    ),
    iconWhite: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z" fill="white"/>
        <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="#FF0000"/>
      </svg>
    ),
  },
];

/* ── Mock akun ── */
const MOCK_ACCOUNTS = {
  instagram: { connected:true,  handle:'@dapurkonten_id', sub:'Instagram Business', initials:'N', avatarBg:'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' },
  facebook:  { connected:false, handle:'Facebook',        sub:'Facebook Page',      initials:null, avatarBg:null },
  tiktok:    { connected:false, handle:'TikTok',          sub:'TikTok Account',     initials:null, avatarBg:null },
  youtube:   { connected:false, handle:'YouTube',         sub:'YouTube Channel',    initials:null, avatarBg:null },
};

/* ── App-icon component (kotak berwarna + icon putih) ── */
function AppIcon({ platform, size = 44 }) {
  return (
    <div style={{
      width:`${size}px`, height:`${size}px`,
      borderRadius:`${size * 0.27}px`,
      background: platform.bg,
      display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:0,
    }}>
      {platform.iconWhite}
    </div>
  );
}

export default function PlatformScreen({ platform, onSelectPlatform, onNext }) {
  const [showManage, setShowManage] = useState(false);

  const connectedPlatforms = PLATFORMS.filter(p => MOCK_ACCOUNTS[p.id].connected);

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>

      {/* ── Header ── */}
      <header style={{
        position:'sticky', top:0, zIndex:200,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 16px', background:'#fff',
      }}>
        <img src="/logo_larisi.svg" alt="Larisi" style={{height:'22px', width:'auto'}} />
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <button style={{
            width:'38px', height:'38px', borderRadius:'50%',
            background:'#fff', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button style={{
            width:'38px', height:'38px', borderRadius:'50%',
            background:'#fff', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
          <div style={{
            display:'flex', alignItems:'center', gap:'8px',
            background:'#F4F4F7', borderRadius:'999px',
            padding:'4px 4px 4px 12px', cursor:'pointer',
          }}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
              <span style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-ink)', lineHeight:'1.2'}}>Nila Craft</span>
              <span style={{color:'var(--m-brand)', fontSize:'10px', fontWeight:'700', lineHeight:'1.2'}}>PRO</span>
            </div>
            <div style={{
              width:'32px', height:'32px', borderRadius:'50%',
              background:'var(--m-ink)', display:'flex',
              alignItems:'center', justifyContent:'center',
            }}>
              <span style={{color:'#fff', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700'}}>N</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{
        flex:1, overflowY:'auto', padding:'0 16px',
        paddingBottom:'calc(80px + env(safe-area-inset-bottom))',
      }}>
        {/* Page title */}
        <div style={{padding:'32px 0 20px'}}>
          <h1 style={{fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', lineHeight:'1.2', marginBottom:'6px'}}>
            Dapur Konten
          </h1>
          <p style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)'}}>
            Pilih platform untuk mulai membuat iklan
          </p>
        </div>

        {/* ── Card: Posting ke Platform ── */}
        <div style={{
          marginBottom:'12px', padding:'16px',
          background:'#fff', borderRadius:'16px',
          border:'1.5px solid #EBEBF0',
        }}>
          <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)', marginBottom:'14px'}}>
            Posting ke Platform
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px'}}>
            {PLATFORMS.map(p => {
              const active = platform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPlatform(p.id)}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center',
                    gap:'8px', padding:'14px 6px',
                    borderRadius:'12px', cursor:'pointer',
                    background: active ? 'var(--m-brand-soft)' : '#fff',
                    border: active ? '1px solid var(--m-brand)' : '1.5px solid #EBEBF0',
                    transition:'all .15s',
                  }}
                >
                  {p.icon}
                  <span style={{
                    fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'600',
                    color: active ? 'var(--m-brand)' : 'var(--m-ink-sub)',
                  }}>
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Card: Hubungkan Akun ── */}
        <div style={{
          padding:'16px',
          background:'#fff', borderRadius:'16px',
          border:'1.5px solid #EBEBF0',
        }}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px'}}>
            <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)'}}>
              Hubungkan Akun
            </div>
            {/* Gear icon — buka modal kelola */}
            <button
              onClick={() => setShowManage(true)}
              style={{
                width:'32px', height:'32px', borderRadius:'50%',
                background:'#F5F5F7', border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
            </button>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {PLATFORMS.map(p => {
              const acc = MOCK_ACCOUNTS[p.id];
              return (
                <div
                  key={p.id}
                  style={{
                    display:'flex', alignItems:'center', gap:'12px',
                    padding:'12px', borderRadius:'12px',
                    background:'#fff', border:'1.5px solid #EBEBF0',
                  }}
                >
                  {/* Avatar */}
                  {acc.connected ? (
                    /* Connected: kotak rounded + badge platform di pojok kanan bawah */
                    <div style={{position:'relative', width:'44px', height:'44px', flexShrink:0}}>
                      <div style={{
                        width:'44px', height:'44px', borderRadius:'12px',
                        background: acc.avatarBg,
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        <span style={{color:'#fff', fontFamily:'var(--m-font)', fontSize:'17px', fontWeight:'700'}}>{acc.initials}</span>
                      </div>
                      {/* Platform badge */}
                      <div style={{
                        position:'absolute', bottom:'-3px', right:'-3px',
                        width:'18px', height:'18px', borderRadius:'50%',
                        background: p.bg,
                        border:'2px solid #fff',
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        <div style={{transform:'scale(0.55)', display:'flex'}}>
                          {p.iconWhite}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Disconnected: app-icon style */
                    <AppIcon platform={p} size={44} />
                  )}

                  {/* Info */}
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                      {acc.connected ? acc.handle : p.label}
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>
                      {acc.sub}
                    </div>
                  </div>

                  {/* Status */}
                  {acc.connected ? (
                    <div style={{display:'flex', alignItems:'center', gap:'5px', flexShrink:0}}>
                      <div style={{width:'7px', height:'7px', borderRadius:'50%', background:'#22C55E'}} />
                      <span style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'600', color:'#22C55E'}}>Terhubung</span>
                    </div>
                  ) : (
                    <button style={{
                      flexShrink:0, padding:'7px 14px',
                      borderRadius:'8px', border:'1.5px solid #1A1A1A',
                      background:'transparent', cursor:'pointer',
                      fontFamily:'var(--m-font)', fontSize:'12px',
                      fontWeight:'700', color:'#1A1A1A',
                    }}>
                      Hubungkan
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
        <div
          onClick={() => setShowManage(false)}
          style={{
            position:'fixed', inset:0, zIndex:500,
            background:'rgba(0,0,0,0.45)',
            display:'flex', alignItems:'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width:'100%', background:'#fff',
              borderRadius:'20px 20px 0 0',
              padding:'24px 16px calc(32px + env(safe-area-inset-bottom))',
            }}
          >
            {/* Modal header */}
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px'}}>
              <div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>
                  Kelola Akun Terhubung
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>
                  Pilih akun untuk diputuskan
                </div>
              </div>
              <button
                onClick={() => setShowManage(false)}
                style={{
                  width:'32px', height:'32px', borderRadius:'50%',
                  background:'#F5F5F7', border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Connected list */}
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {connectedPlatforms.length === 0 ? (
                <p style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)', textAlign:'center', padding:'24px 0'}}>
                  Belum ada akun terhubung
                </p>
              ) : connectedPlatforms.map(p => {
                const acc = MOCK_ACCOUNTS[p.id];
                return (
                  <div key={p.id} style={{
                    display:'flex', alignItems:'center', gap:'12px',
                    padding:'12px', borderRadius:'14px',
                    background:'#F9F9FB', border:'1.5px solid #EBEBF0',
                  }}>
                    <AppIcon platform={p} size={48} />
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', color:'var(--m-ink)'}}>
                        {p.label}
                      </div>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>
                        {acc.handle}
                      </div>
                    </div>
                    <button style={{
                      flexShrink:0, padding:'7px 14px',
                      borderRadius:'8px', border:'1.5px solid #EF4444',
                      background:'transparent', cursor:'pointer',
                      fontFamily:'var(--m-font)', fontSize:'12px',
                      fontWeight:'700', color:'#EF4444',
                    }}>
                      Disconnect
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

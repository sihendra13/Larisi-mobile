'use client';
import { useState } from 'react';

/* ── Platform config ── */
const PLATFORMS = [
  {
    id: 'instagram', label: 'Instagram',
    bg: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'tiktok', label: 'TikTok',
    bg: '#0E0E12',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'youtube', label: 'YouTube',
    bg: '#FF0000',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
      </svg>
    ),
  },
];

/* ── Mock akun — nanti diganti dari API / Supabase ── */
const MOCK_ACCOUNTS = {
  instagram: { connected:true,  handle:'@dapurkonten_id', sub:'Instagram Business', initials:'N', avatarBg:'linear-gradient(135deg,#E1306C,#F77737)' },
  facebook:  { connected:false, handle:'Facebook',        sub:'Facebook Page',      initials:null, avatarBg:null },
  tiktok:    { connected:false, handle:'TikTok',          sub:'TikTok Account',     initials:null, avatarBg:null },
  youtube:   { connected:false, handle:'YouTube',         sub:'YouTube Channel',    initials:null, avatarBg:null },
};

export default function PlatformScreen({ platform, onSelectPlatform, onNext }) {

  /* ── Header ── */
  const Header = () => (
    <header style={{
      position:'sticky', top:0, zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'12px 16px', background:'var(--m-bg)',
    }}>
      {/* Logo */}
      <img src="/logo_larisi.svg" alt="Larisi" style={{height:'22px', width:'auto'}} />

      {/* Right: icon circles + user pill */}
      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
        {/* Search */}
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
        {/* Bell */}
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
        {/* User pill */}
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
  );

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>
      <Header />

      {/* Scrollable content */}
      <main style={{
        flex:1, overflowY:'auto', padding:'0 16px',
        paddingBottom:'calc(80px + env(safe-area-inset-bottom) + 60px)',
      }}>
        {/* Page title */}
        <div style={{padding:'8px 0 20px'}}>
          <h1 style={{fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', lineHeight:'1.2', marginBottom:'6px'}}>
            Dapur Konten
          </h1>
          <p style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)'}}>
            Pilih platform untuk mulai membuat iklan
          </p>
        </div>

        {/* ── Card: Posting ke Platform ── */}
        <div className="panel" style={{marginBottom:'12px', padding:'16px'}}>
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
                    borderRadius:'12px', border:'none', cursor:'pointer',
                    background: active ? 'var(--m-brand-soft)' : '#F5F5F7',
                    outline: active ? '2px solid var(--m-brand)' : '2px solid transparent',
                    transition:'all .15s',
                  }}
                >
                  {/* Platform icon circle */}
                  <div style={{
                    width:'44px', height:'44px', borderRadius:'12px',
                    background: p.bg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0,
                  }}>
                    {p.icon}
                  </div>
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
        <div className="panel" style={{padding:'16px'}}>
          <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)', marginBottom:'14px'}}>
            Hubungkan Akun
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
                    background:'#F5F5F7',
                  }}
                >
                  {/* Avatar / Logo */}
                  {acc.connected ? (
                    <div style={{
                      width:'40px', height:'40px', borderRadius:'50%',
                      background: acc.avatarBg,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0,
                    }}>
                      <span style={{color:'#fff', fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700'}}>{acc.initials}</span>
                    </div>
                  ) : (
                    <div style={{
                      width:'40px', height:'40px', borderRadius:'50%',
                      background: p.bg,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0,
                    }}>
                      {/* Smaller icon for avatar size */}
                      <div style={{transform:'scale(0.75)', display:'flex'}}>
                        {p.icon}
                      </div>
                    </div>
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
                      borderRadius:'8px', border:'1.5px solid var(--m-brand)',
                      background:'transparent', cursor:'pointer',
                      fontFamily:'var(--m-font)', fontSize:'12px',
                      fontWeight:'700', color:'var(--m-brand)',
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

      {/* ── Sticky CTA ── */}
      <div style={{
        position:'fixed',
        bottom:'calc(60px + env(safe-area-inset-bottom) + 12px)',
        left:'16px', right:'16px', zIndex:300,
      }}>
        <button
          onClick={onNext}
          style={{
            width:'100%', padding:'16px', borderRadius:'16px',
            background:'var(--m-brand)', color:'#fff', border:'none',
            fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700',
            cursor:'pointer', display:'flex', alignItems:'center',
            justifyContent:'center', gap:'8px',
            boxShadow:'0 4px 20px rgba(121,26,219,0.35)',
          }}
        >
          Lanjut ke Audiens
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

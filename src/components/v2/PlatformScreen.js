'use client';
import { useState } from 'react';

/* ── Platform config ── */
const PLATFORMS = [
  {
    id: 'instagram', label: 'Instagram',
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
  },
  {
    id: 'facebook', label: 'Facebook',
    icon: (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="#1877F2"/>
      </svg>
    ),
  },
  {
    id: 'tiktok', label: 'TikTok',
    icon: (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="#0E0E12"/>
      </svg>
    ),
  },
  {
    id: 'youtube', label: 'YouTube',
    icon: (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z" fill="#FF0000"/>
        <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
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

export default function PlatformScreen({ platform, onSelectPlatform, onNext }) {

  /* ── Header ── */
  const Header = () => (
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
  );

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>
      <Header />

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
            <button style={{
              display:'flex', alignItems:'center', gap:'4px',
              background:'none', border:'none', cursor:'pointer',
              fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-brand)',
              padding:0,
            }}>
              <span style={{fontSize:'18px', lineHeight:'1', marginTop:'-1px'}}>+</span> Add
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
                      border:'1.5px solid #EBEBF0',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0, background:'#F9F9FB',
                    }}>
                      <div style={{transform:'scale(0.72)', display:'flex'}}>
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
    </div>
  );
}

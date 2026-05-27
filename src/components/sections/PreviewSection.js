'use client';
import { useState } from 'react';

const PLATFORMS = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#1877F2"/>
        <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#000"/>
        <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#FF0000"/>
        <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
      </svg>
    ),
  },
];

export default function PreviewSection() {
  const [format, setFormat]                   = useState('reel');
  const [stitchEnabled, setStitchEnabled]     = useState(true);
  const [activePlatforms, setActivePlatforms] = useState(['instagram']);

  const togglePlatform = (id) => {
    setActivePlatforms(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(p => p !== id) : prev   // keep at least 1
        : [...prev, id]
    );
  };

  return (
    <div id="mobile-section-preview" style={{display:'flex',flexDirection:'column',gap:'14px'}}>

      {/* ── 4-Platform grid ── */}
      <div>
        <div style={{fontFamily:'var(--m-font)',fontSize:'13px',fontWeight:'700',color:'var(--m-ink)',marginBottom:'10px'}}>
          Pilih Platform
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
          {PLATFORMS.map(p => {
            const active = activePlatforms.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                style={{
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  gap:'6px',padding:'12px 4px',
                  borderRadius:'12px',border:'none',cursor:'pointer',
                  fontFamily:'var(--m-font)',fontSize:'10px',fontWeight:'600',
                  background: active ? 'var(--m-brand-soft)' : '#F5F5F7',
                  color: active ? 'var(--m-brand)' : 'var(--m-ink-sub)',
                  outline: active ? '1.5px solid var(--m-brand)' : '1.5px solid transparent',
                  outlineOffset: '0px',
                  transition:'background .15s,outline .15s,color .15s',
                }}
              >
                {p.icon}
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Format selector + Live Preview label ── */}
      <div style={{display:'flex',flexDirection:'column',gap:'8px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div className="section-label" style={{margin:0,fontSize:'13px',fontWeight:'700',color:'var(--m-ink)',textTransform:'none',letterSpacing:'0'}}>Live Preview</div>
        </div>
        <div className="fmt-selector-row">
          {['post','reel','story'].map(f => (
            <label key={f} className={`fmt-radio-label${format === f ? ' active' : ''}`} style={{cursor:'pointer'}}>
              <input
                type="radio"
                name="fmt"
                value={f}
                checked={format === f}
                onChange={() => setFormat(f)}
                style={{display:'none'}}
              />
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* ── Phone mockup ── */}
      <div className="preview-wrap">
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',flex:1,width:'100%'}}>
          <div className="phone-shell" id="phoneShell">
            <div id="phoneChrome"></div>
            <div className="phone-placeholder" id="phoneMedia">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Estimasi Jangkauan card ── */}
      <div style={{
        background:'var(--m-brand-soft)',
        borderRadius:'14px',
        padding:'14px 16px',
        display:'flex',alignItems:'center',gap:'12px',
      }}>
        <div style={{
          width:'36px',height:'36px',borderRadius:'10px',
          background:'var(--m-brand)',display:'flex',
          alignItems:'center',justifyContent:'center',flexShrink:0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--m-font)',fontSize:'11px',fontWeight:'600',color:'var(--m-brand)',marginBottom:'2px',textTransform:'uppercase',letterSpacing:'.5px'}}>
            Estimasi Jangkauan
          </div>
          <div style={{fontFamily:'var(--m-font)',fontSize:'15px',fontWeight:'700',color:'var(--m-ink)'}}>
            72K – 119K <span style={{fontWeight:'400',fontSize:'13px',color:'var(--m-ink-sub)'}}>warga</span>
          </div>
          <div style={{fontFamily:'var(--m-font)',fontSize:'12px',color:'var(--m-ink-sub)'}}>
            Sumbersari, Jember
          </div>
        </div>
      </div>

      {/* ── Smart Geo-Stitching ── */}
      <div className="stitch-card" id="stitchCard">
        <div className="stitch-top">
          <div className="stitch-icon">
            <svg viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="stitch-title">Smart Geo-Stitching</div>
          <button
            className={`m-toggle${stitchEnabled ? ' on' : ''}`}
            onClick={() => setStitchEnabled(v => !v)}
            style={{marginLeft:'auto',cursor:'pointer',background:'none',border:'none',padding:0}}
          >
            <div className="m-toggle__knob"></div>
          </button>
        </div>
        <div className="stitch-desc">
          Tag lokasi otomatis yang bikin orang berhenti scroll! Tingkatkan minat pembeli sampai{' '}
          <span className="stitch-highlight">40%.</span>
        </div>
      </div>
    </div>
  );
}

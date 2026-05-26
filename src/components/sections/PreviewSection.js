'use client';
import { useState } from 'react';

export default function PreviewSection() {
  const [format, setFormat] = useState('reel');
  const [stitchEnabled, setStitchEnabled] = useState(true);

  return (
    <div id="mobile-section-preview" style={{display:'flex',flexDirection:'column',gap:'14px'}}>

      {/* Format selector + Live Preview label */}
      <div style={{display:'flex',flexDirection:'column',gap:'8px',flexShrink:0}}>
        {/* Baris 1: Live Preview label */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div className="section-label" style={{margin:0,fontSize:'13px',fontWeight:'700',color:'var(--m-ink)',textTransform:'none',letterSpacing:'0'}}>Live Preview</div>
        </div>
        {/* Baris 2: Post / Reel / Story segmented control */}
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

      {/* Phone mockup */}
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

      {/* Smart Geo-Stitching */}
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

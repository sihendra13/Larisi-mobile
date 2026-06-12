'use client';
import React, { useState, useEffect, useRef } from 'react';

const MOTION_EFFECTS = [
  { id: 'zoom', label: 'Zoom In Motion', desc: 'Efek memperbesar halus' },
  { id: 'slide', label: 'Slide Transition', desc: 'Gerakan geser ke kanan/kiri' },
  { id: 'cut', label: 'Fast Cut Beats', desc: 'Potongan cepat ketukan musik' }
];

export default function VideoMotionEditorScreen({ file, onBack, onSave, isGenZ }) {
  const [effect, setEffect] = useState('zoom');
  const [speed, setSpeed] = useState('1.0');
  
  const [caption, setCaption] = useState('Biar video makin dramatis, tambahin efek motion ketukan lofi ini! Beneran bikin produk auto-estetik 😍');
  const [generatingCaption, setGeneratingCaption] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const mockCaptions = [
    "Biar video makin dramatis, tambahin efek motion ketukan lofi ini! Beneran bikin produk auto-estetik 😍",
    "Transisi motion yang bikin produk kamu keliatan 10x lebih mahal! Buruan order sekarang juga! 💸🛍️",
    "Gimana menurut kalian hasil motion editing-nya? Keren banget kan transisinya! Ready stock semua ya! ✨👚",
    "POV: Nyobain fitur video motion instan di Larisi dan langsung viral di Reels! Cobain yuk! 🚀🔥"
  ];

  const handleGenerateCaption = () => {
    setGeneratingCaption(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * mockCaptions.length);
      setCaption(mockCaptions[idx]);
      setGeneratingCaption(false);
    }, 700);
  };

  const handleSaveDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Video aspect ratio (720x1280)
    canvas.width = 720;
    canvas.height = 1280;

    // Fill background
    ctx.fillStyle = '#111115';
    ctx.fillRect(0, 0, 720, 1280);

    // Draw video frame placeholder
    ctx.fillStyle = '#1e1e24';
    ctx.fillRect(40, 100, 640, 1080);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`[ Video Motion: ${effect.toUpperCase()} ]`, 360, 600);
    ctx.fillText(`[ Speed: ${speed}x ]`, 360, 660);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onSave(dataUrl, caption);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', background: '#0e0e12',
      color: '#fff', overflow: 'hidden',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid #1e1e24', flexShrink: 0
      }}>
        <button onClick={onBack} style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: '#1e1e24', border: '1px solid #2d2d39',
          color: '#fff', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <span style={{ fontFamily: 'var(--m-font, sans-serif)', fontSize: '16px', fontWeight: '800' }}>
          Video Motion Editor 🎬
        </span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Scrollable editor workspace */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Visual Preview Card (simulated 9:16 portrait player) */}
        <div style={{
          width: '100%', maxWidth: '270px', aspectRatio: '9/16', alignSelf: 'center',
          position: 'relative', borderRadius: '16px', overflow: 'hidden',
          background: '#111115', border: '1px solid #1e1e24',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column'
        }}>
          {file?.url && file.type === 'video' ? (
            <video ref={videoRef} src={file.url} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : file?.url ? (
            <img src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: effect === 'zoom' ? 'scale(1.15)' : 'none', transition: 'transform 2s ease-in-out' }} />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
              No Media Selected
            </div>
          )}

          {/* Badge indicator */}
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px',
            fontWeight: '700', padding: '4px 8px', borderRadius: '6px',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            Motion: {effect} ({speed}x)
          </div>
        </div>

        {/* Transition Effects Selector */}
        <div style={{ background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pilih Efek Transisi
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {MOTION_EFFECTS.map(m => {
              const active = effect === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setEffect(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '12px',
                    background: active ? 'rgba(124,58,237,0.15)' : '#0e0e12',
                    border: active ? '1.5px solid #7c3aed' : '1px solid #2d2d39',
                    color: '#fff', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{m.label}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{m.desc}</div>
                  </div>
                  {active && <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Speed Selector */}
        <div style={{ background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Kecepatan Gerak (Speed)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['0.5', '1.0', '1.5', '2.0'].map(s => {
              const active = speed === s;
              return (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: '8px',
                    background: active ? '#7c3aed' : '#0e0e12',
                    border: active ? '1.5px solid #7c3aed' : '1px solid #2d2d39',
                    color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '13px'
                  }}
                >
                  {s}x
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Caption */}
        <div style={{ background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '20px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Caption Pendukung</span>
            <button
              onClick={handleGenerateCaption}
              disabled={generatingCaption}
              style={{
                background: 'rgba(124,58,237,0.15)', border: '1.5px dashed #7c3aed',
                color: '#a78bfa', padding: '6px 12px', borderRadius: '8px',
                fontSize: '11px', fontWeight: '700', cursor: 'pointer'
              }}
            >
              {generatingCaption ? 'Generating...' : '⚡ AI Caption'}
            </button>
          </div>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            style={{
              width: '100%', height: '80px', padding: '12px', borderRadius: '10px',
              background: '#0e0e12', border: '1px solid #2d2d39', color: '#fff',
              fontFamily: 'var(--m-font)', fontSize: '13px', outline: 'none', resize: 'none',
              lineHeight: '1.4'
            }}
          />
        </div>

      </div>

      {/* Save Button */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid #1e1e24', background: '#0e0e12',
        flexShrink: 0, paddingBottom: 'calc(12px + env(safe-area-inset-bottom))'
      }}>
        <button
          onClick={handleSaveDesign}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: 'var(--m-brand)', color: '#fff', fontFamily: 'var(--m-font)',
            fontSize: '15px', fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
        >
          Gunakan Desain Ini ➔
        </button>
      </div>
    </div>
  );
}

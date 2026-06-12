'use client';
import React, { useState, useEffect, useRef } from 'react';

const STORY_TEMPLATES = [
  { id: 'polaroid', label: 'Polaroid Style', desc: 'Foto di atas ulasan' },
  { id: 'classic', label: 'Classic Review', desc: 'Kartu ulasan semi-transparan' },
  { id: 'minimalist', label: 'Minimalist', desc: 'Teks ulasan bersih di bawah foto' }
];

const BACKGROUND_COLORS = [
  { id: 'peach', label: 'Peach', color: '#ffedd5', border: '#fed7aa' },
  { id: 'lavender', label: 'Lavender', color: '#f3e8ff', border: '#e9d5ff' },
  { id: 'teal', label: 'Soft Teal', color: '#ccfbf1', border: '#99f6e4' },
  { id: 'dark', label: 'Solid Dark', color: '#111115', border: '#2d2d39' }
];

export default function StoryEditorScreen({ file, onBack, onSave, isGenZ }) {
  const [template, setTemplate] = useState('polaroid');
  const [bgColor, setBgColor] = useState('peach');
  
  const [reviewAuthor, setReviewAuthor] = useState('Clara Clarissa');
  const [reviewText, setReviewText] = useState('Udah berkali-kali beli di sini gak pernah kecewa. Bahannya beneran premium, warnanya persis kayak di foto! Sukses terus kak! ⭐⭐⭐⭐⭐');
  
  const [caption, setCaption] = useState('Ulasan jujur dari pembeli tercinta! Kualitas premium emang gak pernah bohong yaa 🥰 Langsung swipe up untuk beli!');
  const [generatingCaption, setGeneratingCaption] = useState(false);

  const canvasRef = useRef(null);

  const mockCaptions = [
    "Ulasan jujur dari pembeli tercinta! Kualitas premium emang gak pernah bohong yaa 🥰 Langsung swipe up untuk beli!",
    "Bintang 5 berbicara! Seneng banget kalau customer puas sama produk kita. Yuk yang mau samaan langsung check out! ⭐🛒",
    "Gak perlu ragu lagi buat beli produk best seller satu ini. Review jujurnya udah se-estetik ini lho! ✨👇",
    "POV: Membaca review customer yang bikin owner semangat restock terus! Memang se-bagus itu kualitasnya. ❤️"
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
    
    // Portrait story aspect ratio (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    const currentBg = BACKGROUND_COLORS.find(c => c.id === bgColor) || BACKGROUND_COLORS[0];

    // 1. Draw Background Color
    ctx.fillStyle = currentBg.color;
    ctx.fillRect(0, 0, 1080, 1920);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 2. Draw Image based on templates
      if (template === 'polaroid') {
        // Polaroid container card
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;
        ctx.fillRect(90, 150, 900, 1100);
        ctx.shadowBlur = 0; // reset shadow

        // Draw photo inside white frame
        ctx.drawImage(img, 130, 190, 820, 820);

        // Draw Polaroid footer ulasan
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`@${reviewAuthor}`, 540, 1080);

        ctx.fillStyle = '#4b5563';
        ctx.font = '500 28px sans-serif';
        // Wrap review text
        wrapText(ctx, reviewText, 540, 1140, 780, 40);

      } else if (template === 'classic') {
        // Draw image fullscreen with lower opacity or tint
        ctx.drawImage(img, 0, 0, 1080, 1920);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, 1080, 1920);

        // Semi-transparent overlay card for review in center
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(120, 600, 840, 600);

        ctx.fillStyle = '#111827';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`@${reviewAuthor}`, 170, 700);

        ctx.fillStyle = '#eab308'; // star color
        ctx.font = '36px sans-serif';
        ctx.fillText('⭐⭐⭐⭐⭐', 170, 760);

        ctx.fillStyle = '#374151';
        ctx.font = '500 32px sans-serif';
        wrapText(ctx, reviewText, 170, 840, 740, 48, false);

      } else {
        // Minimalist template (Photo top half, text bottom half)
        ctx.drawImage(img, 90, 180, 900, 900);

        ctx.fillStyle = currentBg.id === 'dark' ? '#ffffff' : '#111827';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`@${reviewAuthor}`, 540, 1200);

        ctx.fillStyle = currentBg.id === 'dark' ? '#9ca3af' : '#4b5563';
        ctx.font = 'italic 500 32px sans-serif';
        wrapText(ctx, reviewText, 540, 1280, 840, 48);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onSave(dataUrl, caption);
    };
    img.src = file.url;
  };

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, center = true) {
    const words = text.split(' ');
    let line = '';
    let lineY = y;
    ctx.textAlign = center ? 'center' : 'left';

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, lineY);
        line = words[n] + ' ';
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, lineY);
  }

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
          Story Maker Editor ✨
        </span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Scrollable editor workspace */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Visual Live Preview Card (simulated 9:16 story frame) */}
        <div style={{
          width: '100%', maxWidth: '270px', aspectRatio: '9/16', alignSelf: 'center',
          position: 'relative', borderRadius: '16px', overflow: 'hidden',
          background: BACKGROUND_COLORS.find(c => c.id === bgColor)?.color || '#ffedd5',
          border: '1px solid #1e1e24', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column', padding: '12px'
        }}>
          {template === 'polaroid' ? (
            <div style={{
              background: '#fff', padding: '10px', borderRadius: '8px',
              display: 'flex', flexDirection: 'column', gap: '8px', flex: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ flex: 1, minHeight: '180px', borderRadius: '6px', overflow: 'hidden' }}>
                <img src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ textAlign: 'center', color: '#111827', padding: '4px 0' }}>
                <div style={{ fontSize: '10px', fontWeight: '800' }}>@{reviewAuthor}</div>
                <p style={{ fontSize: '8px', color: '#4b5563', margin: '4px 0 0', lineHeight: '1.3' }}>
                  {reviewText.slice(0, 60)}...
                </p>
              </div>
            </div>
          ) : template === 'classic' ? (
            <div style={{ position: 'relative', flex: 1, borderRadius: '10px', overflow: 'hidden' }}>
              <img src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
              <div style={{
                position: 'absolute', top: '25%', left: '8%', right: '8%',
                background: '#fff', borderRadius: '10px', padding: '10px', color: '#111'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800' }}>@{reviewAuthor}</span>
                  <span style={{ fontSize: '7px', color: '#eab308' }}>⭐⭐⭐⭐⭐</span>
                </div>
                <p style={{ fontSize: '8px', color: '#374151', margin: 0, lineHeight: '1.3' }}>
                  {reviewText}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div style={{ flex: 1, minHeight: '160px', borderRadius: '10px', overflow: 'hidden' }}>
                <img src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ textAlign: 'center', color: bgColor === 'dark' ? '#fff' : '#111827', padding: '4px 0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800' }}>@{reviewAuthor}</div>
                <p style={{ fontSize: '9px', color: bgColor === 'dark' ? '#9ca3af' : '#4b5563', margin: '4px 0 0', lineHeight: '1.3', fontStyle: 'italic' }}>
                  "{reviewText.slice(0, 80)}..."
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Template Selector */}
        <div style={{ background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pilih Gaya Template
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STORY_TEMPLATES.map(t => {
              const active = template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '12px',
                    background: active ? 'rgba(124,58,237,0.15)' : '#0e0e12',
                    border: active ? '1.5px solid #7c3aed' : '1px solid #2d2d39',
                    color: '#fff', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{t.label}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{t.desc}</div>
                  </div>
                  {active && <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Colors Customizer */}
        <div style={{ background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Latar Belakang (Warna Canvas)
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {BACKGROUND_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setBgColor(c.id)}
                style={{
                  flex: 1, height: '40px', borderRadius: '8px', background: c.color,
                  border: bgColor === c.id ? '2.5px solid #7c3aed' : '1.5px solid #2d2d39',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: '800', color: c.id === 'dark' ? '#fff' : '#000' }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Ulasan Input */}
        <div style={{ background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tulis Ulasan Pembeli
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              value={reviewAuthor}
              onChange={e => setReviewAuthor(e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                background: '#0e0e12', border: '1px solid #2d2d39', color: '#fff',
                fontFamily: 'var(--m-font)', fontSize: '12px', outline: 'none'
              }}
              placeholder="Username Pembeli..."
            />
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              style={{
                width: '100%', height: '80px', padding: '10px', borderRadius: '8px',
                background: '#0e0e12', border: '1px solid #2d2d39', color: '#fff',
                fontFamily: 'var(--m-font)', fontSize: '12px', outline: 'none', resize: 'none',
                lineHeight: '1.4'
              }}
              placeholder="Ketik ulasan di sini..."
            />
          </div>
        </div>

        {/* Suggested Caption */}
        <div style={{ background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '20px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Caption Penjualan</span>
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

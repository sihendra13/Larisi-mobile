'use client';
import React, { useState, useEffect, useRef } from 'react';

const BENTO_LAYOUTS = [
  { id: 'grid2x2', label: '2x2 Grid Kolase', desc: '4 slot foto simetris' },
  { id: 'splitLeft', label: 'Featured Left', desc: '1 foto besar kiri, 2 kecil kanan' },
  { id: 'splitRight', label: 'Featured Right', desc: '1 foto besar kanan, 2 kecil kiri' }
];

const BENTO_BORDERS = [
  { id: 'none', label: 'Tanpa Garis', gap: 0 },
  { id: 'thin', label: 'Garis Tipis', gap: 4 },
  { id: 'thick', label: 'Garis Tebal', gap: 12 }
];

export default function BentoEditorScreen({ file, onBack, onSave, isGenZ }) {
  const [layout, setLayout] = useState('grid2x2');
  const [borderStyle, setBorderStyle] = useState('thin');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const [caption, setCaption] = useState('Semua varian favorit ready stock hari ini! Kombinasi warna pastel yang bikin ootd kamu makin maksimal. 🌸✨');
  const [generatingCaption, setGeneratingCaption] = useState(false);

  const canvasRef = useRef(null);

  const mockCaptions = [
    "Semua varian favorit ready stock hari ini! Kombinasi warna pastel yang bikin ootd kamu makin maksimal. 🌸✨",
    "Gak perlu bingung pilih warna, kolase bento ini nunjukin semua sudut estetik produk kami! Cuss langsung order! 🛒🛍️",
    "Lookbook mingguan ready! Desain elegan dengan harga ramah kantong. Pilihan terbaik buat kamu. 🌟👚",
    "Katalog lengkap untuk edisi terbatas bulan ini. Mana warna favorit pilihanmu? Komen di bawah ya! 👇💬"
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
    
    // Square collage aspect ratio (1080x1080)
    canvas.width = 1080;
    canvas.height = 1080;

    // Fill background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1080, 1080);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const gap = borderStyle === 'none' ? 0 : borderStyle === 'thin' ? 8 : 24;
      const size = 1080;

      if (layout === 'grid2x2') {
        const itemW = (size - gap) / 2;
        // Draw image in 4 grid slots
        ctx.drawImage(img, 0, 0, itemW, itemW);
        ctx.drawImage(img, itemW + gap, 0, itemW, itemW);
        ctx.drawImage(img, 0, itemW + gap, itemW, itemW);
        ctx.drawImage(img, itemW + gap, itemW + gap, itemW, itemW);
      } else if (layout === 'splitLeft') {
        const leftW = (size - gap) * 0.6;
        const rightW = (size - gap) * 0.4;
        const itemH = (size - gap) / 2;

        // Large Left Slot
        ctx.drawImage(img, 0, 0, leftW, size);

        // Small Right Slots
        ctx.drawImage(img, leftW + gap, 0, rightW, itemH);
        ctx.drawImage(img, leftW + gap, itemH + gap, rightW, itemH);
      } else {
        const leftW = (size - gap) * 0.4;
        const rightW = (size - gap) * 0.6;
        const itemH = (size - gap) / 2;

        // Small Left Slots
        ctx.drawImage(img, 0, 0, leftW, itemH);
        ctx.drawImage(img, 0, itemH + gap, leftW, itemH);

        // Large Right Slot
        ctx.drawImage(img, leftW + gap, 0, rightW, size);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onSave(dataUrl, caption);
    };
    img.src = file.url;
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
          Bento Collage Editor 🍱
        </span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Scrollable editor workspace */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Visual Live Preview Card (1:1 square aspect ratio) */}
        <div style={{
          width: '100%', aspectRatio: '1/1', alignSelf: 'center',
          position: 'relative', borderRadius: '16px', overflow: 'hidden',
          background: bgColor, border: '1px solid #1e1e24',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap',
          padding: borderStyle === 'thick' ? '12px' : borderStyle === 'thin' ? '4px' : '0'
        }}>
          {layout === 'grid2x2' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: borderStyle === 'thick' ? '10px' : borderStyle === 'thin' ? '4px' : '0', width: '100%', height: '100%' }}>
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
              ))}
            </div>
          ) : layout === 'splitLeft' ? (
            <div style={{ display: 'flex', gap: borderStyle === 'thick' ? '10px' : borderStyle === 'thin' ? '4px' : '0', width: '100%', height: '100%' }}>
              <div style={{ flex: 1.5 }}>
                <img src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: borderStyle === 'thick' ? '10px' : borderStyle === 'thin' ? '4px' : '0' }}>
                <img src={file.url} alt="" style={{ width: '100%', flex: 1, objectFit: 'cover', borderRadius: '6px' }} />
                <img src={file.url} alt="" style={{ width: '100%', flex: 1, objectFit: 'cover', borderRadius: '6px' }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: borderStyle === 'thick' ? '10px' : borderStyle === 'thin' ? '4px' : '0', width: '100%', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: borderStyle === 'thick' ? '10px' : borderStyle === 'thin' ? '4px' : '0' }}>
                <img src={file.url} alt="" style={{ width: '100%', flex: 1, objectFit: 'cover', borderRadius: '6px' }} />
                <img src={file.url} alt="" style={{ width: '100%', flex: 1, objectFit: 'cover', borderRadius: '6px' }} />
              </div>
              <div style={{ flex: 1.5 }}>
                <img src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              </div>
            </div>
          )}
        </div>

        {/* Layout Presets */}
        <div style={{ background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pilih Pola Grid Bento
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {BENTO_LAYOUTS.map(l => {
              const active = layout === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setLayout(l.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '12px',
                    background: active ? 'rgba(124,58,237,0.15)' : '#0e0e12',
                    border: active ? '1.5px solid #7c3aed' : '1px solid #2d2d39',
                    color: '#fff', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{l.label}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{l.desc}</div>
                  </div>
                  {active && <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Border Spacing Settings */}
        <div style={{ background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Jarak Antar Foto (Gap)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {BENTO_BORDERS.map(b => {
              const active = borderStyle === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setBorderStyle(b.id)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px',
                    background: active ? '#7c3aed' : '#0e0e12',
                    border: active ? '1.5px solid #7c3aed' : '1px solid #2d2d39',
                    color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '12px'
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Canvas Color */}
        <div style={{ background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Warna Garis / Latar Belakang
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['#ffffff', '#000000', '#ffedd5', '#f3e8ff', '#ccfbf1'].map(color => (
              <button
                key={color}
                onClick={() => setBgColor(color)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px', background: color,
                  border: bgColor === color ? '2.5px solid #7c3aed' : '1.5px solid #2d2d39',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>

        {/* Suggested Caption */}
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

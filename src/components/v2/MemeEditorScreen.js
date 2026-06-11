'use client';
import React, { useState, useEffect, useRef } from 'react';

const MEME_STYLES = [
  { id: 'classic', label: 'Classic', desc: 'Caps with black outline' },
  { id: 'modern', label: 'Modern', desc: 'White text banner style' },
  { id: 'impact', label: 'Impact', desc: 'Bold impact centered text' }
];

export default function MemeEditorScreen({ file, onBack, onSave, isGenZ }) {
  const [topText, setTopText] = useState('POV: THIS DESIGN');
  const [bottomText, setBottomText] = useState('IS JUST TOO GOOD');
  const [memeStyle, setMemeStyle] = useState('classic');
  const [caption, setCaption] = useState("When the product is just too good that you start questioning reality.");
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const canvasRef = useRef(null);

  // Suggested captions list for mock generator
  const mockCaptions = [
    "When the product is just too good that you start questioning reality. 🤯",
    "Me looking at the checkout screen wondering why I didn't buy this sooner. 🛒✨",
    "Cita rasa bintang 5 dengan harga kaki 5. Desain estetik dan super worth it! ⭐⭐⭐⭐⭐",
    "POV: Menemukan produk impian yang akhirnya ready stock! Langsung checkout! 🚀"
  ];

  const handleGenerateCaption = () => {
    setGeneratingCaption(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * mockCaptions.length);
      setCaption(mockCaptions[idx]);
      setGeneratingCaption(false);
    }, 800);
  };

  const handleUseDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas size matching natural image or high-res square
      const size = 1080;
      canvas.width = size;
      canvas.height = size;

      // Draw background/image
      if (memeStyle === 'modern') {
        // Modern banner is 15% height at top
        const bannerH = size * 0.18;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, bannerH);
        
        // Draw image below banner
        ctx.drawImage(img, 0, bannerH, size, size - bannerH);

        // Draw top text inside white banner
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(topText, size / 2, bannerH / 2);
      } else {
        // Classic & Impact overlays on top of the image
        ctx.drawImage(img, 0, 0, size, size);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        if (memeStyle === 'classic') {
          ctx.font = '900 72px Impact, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 10;
          ctx.lineJoin = 'miter';
          ctx.miterLimit = 2;

          // Top Text
          ctx.strokeText(topText.toUpperCase(), size / 2, 50);
          ctx.fillText(topText.toUpperCase(), size / 2, 50);

          // Bottom Text
          ctx.textBaseline = 'bottom';
          ctx.strokeText(bottomText.toUpperCase(), size / 2, size - 50);
          ctx.fillText(bottomText.toUpperCase(), size / 2, size - 50);
        } else if (memeStyle === 'impact') {
          ctx.font = 'bold 78px Arial Black, sans-serif';
          ctx.fillStyle = '#ffffff';

          // Top Text
          ctx.fillText(topText.toUpperCase(), size / 2, 60);

          // Bottom Text
          ctx.textBaseline = 'bottom';
          ctx.fillText(bottomText.toUpperCase(), size / 2, size - 60);
        }
      }

      // Convert canvas to image file url
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
      {/* Hidden rendering canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header bar */}
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
          AI Meme Generator
        </span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Scrollable editor body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Live Visual Preview Card */}
        <div style={{
          width: '100%', aspectRatio: '1/1', position: 'relative',
          borderRadius: '16px', overflow: 'hidden', background: '#111115',
          border: '1px solid #1e1e24', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column'
        }}>
          {memeStyle === 'modern' ? (
            <>
              {/* Top white banner */}
              <div style={{
                background: '#fff', color: '#000', padding: '12px 8px',
                fontFamily: 'var(--m-font, sans-serif)', fontSize: '15px', fontWeight: '700',
                textAlign: 'center', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {topText || 'TOP TEXT'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <img src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </>
          ) : (
            <>
              <img src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {/* Overlaid Texts */}
              <div style={{
                position: 'absolute', top: '20px', left: '10px', right: '10px',
                textAlign: 'center', pointerEvents: 'none', userSelect: 'none',
                fontFamily: memeStyle === 'classic' ? 'Impact, sans-serif' : 'Arial Black, sans-serif',
                fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase',
                textShadow: memeStyle === 'classic' ? '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000' : 'none'
              }}>
                {topText}
              </div>
              <div style={{
                position: 'absolute', bottom: '20px', left: '10px', right: '10px',
                textAlign: 'center', pointerEvents: 'none', userSelect: 'none',
                fontFamily: memeStyle === 'classic' ? 'Impact, sans-serif' : 'Arial Black, sans-serif',
                fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase',
                textShadow: memeStyle === 'classic' ? '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000' : 'none'
              }}>
                {bottomText}
              </div>
            </>
          )}
        </div>

        {/* Text Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontFamily: 'var(--m-font)', fontSize: '12px', fontWeight: '700', color: '#9ca3af', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Top Text</label>
            <input
              type="text"
              value={topText}
              onChange={e => setTopText(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                background: '#1e1e24', border: '1px solid #2d2d39', color: '#fff',
                fontFamily: 'var(--m-font)', fontSize: '14px', outline: 'none'
              }}
              placeholder="POV: THIS DESIGN"
            />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--m-font)', fontSize: '12px', fontWeight: '700', color: '#9ca3af', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Bottom Text</label>
            <input
              type="text"
              value={bottomText}
              disabled={memeStyle === 'modern'}
              onChange={e => setBottomText(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                background: memeStyle === 'modern' ? '#141418' : '#1e1e24',
                border: '1px solid #2d2d39', color: memeStyle === 'modern' ? '#4b5563' : '#fff',
                fontFamily: 'var(--m-font)', fontSize: '14px', outline: 'none'
              }}
              placeholder={memeStyle === 'modern' ? '(Disabled for Modern Style)' : "IS JUST TOO GOOD"}
            />
          </div>
        </div>

        {/* Suggested Caption Box */}
        <div style={{
          background: '#1e1e24', border: '1px solid #2d2d39', borderRadius: '16px', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' }}>
              Suggested Caption
            </span>
            <span style={{
              fontFamily: 'var(--m-font)', fontSize: '10px', fontWeight: '800', color: '#a5b4fc',
              background: '#1e223d', border: '1px solid rgba(165, 180, 252, 0.2)',
              padding: '2px 6px', borderRadius: '6px'
            }}>
              ✦ AI MAGIC
            </span>
          </div>
          <p style={{ fontFamily: 'var(--m-font)', fontSize: '13px', color: '#e2e8f0', lineHeight: '1.5', margin: 0 }}>
            {caption}
          </p>
          <button
            onClick={handleGenerateCaption}
            disabled={generatingCaption}
            style={{
              padding: '10px', borderRadius: '10px', border: '1px solid #334155',
              background: '#2d2d39', color: '#fff', fontFamily: 'var(--m-font)',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: generatingCaption ? 'spin 1s linear infinite' : 'none' }}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            {generatingCaption ? 'Generating...' : 'Generate New Caption'}
          </button>
        </div>

        {/* Meme Styles */}
        <div>
          <label style={{ fontFamily: 'var(--m-font)', fontSize: '12px', fontWeight: '700', color: '#9ca3af', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
            Meme Styles
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {MEME_STYLES.map(style => {
              const isSelected = memeStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setMemeStyle(style.id)}
                  style={{
                    flex: 1, padding: '12px 6px', borderRadius: '12px',
                    background: isSelected ? 'rgba(124, 58, 237, 0.12)' : '#1e1e24',
                    border: isSelected ? '2px solid #7c3aed' : '1px solid #2d2d39',
                    color: isSelected ? '#a78bfa' : '#9ca3af',
                    fontFamily: 'var(--m-font)', fontSize: '12px', fontWeight: '700',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '13px', color: isSelected ? '#fff' : '#fff' }}>{style.label}</span>
                  <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: '500' }}>{style.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gunakan Desain Button */}
      <div style={{
        padding: '16px',
        paddingBottom: 'calc(16px + 78px + env(safe-area-inset-bottom))',
        borderTop: '1px solid #1e1e24',
        background: '#0e0e12',
        flexShrink: 0
      }}>
        <button
          onClick={handleUseDesign}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#fff', fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)'
          }}
        >
          Gunakan Desain
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

'use client';
import React, { useEffect, useState } from 'react';

export default function InstallScreen({ onSkip, installPrompt }) {
  const [isIOS,      setIsIOS]      = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [showManual, setShowManual] = useState(false); /* tampilkan instruksi manual setelah klik gagal */

  useEffect(() => {
    setMounted(true);
    setIsIOS(/iPad|iPhone|iPod/.test(window.navigator.userAgent));
  }, []);

  const handleInstallClick = async () => {
    const prompt = installPrompt || window.__pwaInstallPrompt;
    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') onSkip();
      } catch (err) {
        console.warn('[PWA] install prompt error:', err);
        setShowManual(true); /* fallback ke instruksi manual */
      }
    } else {
      setShowManual(true); /* Chrome tidak kooperatif → tampilkan instruksi */
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-animated" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden', fontFamily: '-apple-system, sans-serif'
    }}>
      {/* Background blobs */}
      <div style={{ position:'absolute', top:'5%', left:'-5%', width:'300px', height:'300px', background:'var(--m-brand)', filter:'blur(100px)', opacity:0.15, borderRadius:'50%', animation:'float 8s ease-in-out infinite' }} />
      <div style={{ position:'absolute', bottom:'5%', right:'-5%', width:'250px', height:'250px', background:'#FF007A', filter:'blur(120px)', opacity:0.1, borderRadius:'50%', animation:'float 6s ease-in-out infinite reverse' }} />

      <div className="glass-card stagger-1" style={{
        width:'100%', maxWidth:'440px', borderRadius:'32px', padding:'40px 32px',
        display:'flex', flexDirection:'column', position:'relative', zIndex:10, textAlign:'center'
      }}>

        {/* Icon */}
        <div style={{
          width:'64px', height:'64px', background:'var(--m-brand)', borderRadius:'20px',
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px',
          boxShadow:'0 12px 24px rgba(121,26,219,0.3)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>

        <h1 style={{ fontSize:'24px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'8px', letterSpacing:'-0.5px' }}>
          Install Larisi di HP kamu
        </h1>
        <p style={{ fontSize:'14px', color:'var(--m-ink-sub)', marginBottom:'24px', lineHeight:'1.5' }}>
          Akses lebih cepat langsung dari layar utama HP kamu.
        </p>

        {/* ── STATE: Default (belum klik install) ── */}
        {!showManual && !isIOS && (
          <>
            <p style={{ fontSize:'15px', color:'var(--m-ink-sub)', marginBottom:'28px', lineHeight:'1.6' }}>
              Dapatkan pengalaman terbaik — akses super cepat, tanpa buka browser dulu.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <button onClick={handleInstallClick} style={{
                width:'100%', padding:'16px', borderRadius:'16px', background:'#111827', color:'#fff',
                border:'none', fontSize:'15px', fontWeight:'800', cursor:'pointer',
                boxShadow:'0 8px 24px rgba(0,0,0,0.15)'
              }}>
                Install Sekarang
              </button>
              <button onClick={onSkip} style={{
                width:'100%', padding:'16px', borderRadius:'16px', background:'transparent',
                color:'var(--m-ink-sub)', border:'none', fontSize:'14px', fontWeight:'600', cursor:'pointer'
              }}>
                Lanjut Tanpa Install
              </button>
            </div>
          </>
        )}

        {/* ── STATE: Chrome tidak kooperatif → instruksi manual Android ── */}
        {showManual && !isIOS && (
          <>
            <div style={{ background:'#f9fafb', borderRadius:'16px', padding:'20px', marginBottom:'24px', border:'1px solid #e5e7eb', textAlign:'left' }}>
              <p style={{ fontSize:'13px', color:'#6b7280', marginBottom:'14px', fontWeight:'600' }}>
                Install manual lewat Chrome:
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <Step num="1" text={<>Tap menu <strong>⋮</strong> di pojok kanan atas Chrome</>} />
                <Step num="2" text={<>Pilih <strong style={{color:'var(--m-brand)'}}>Tambah ke layar utama</strong> atau <strong style={{color:'var(--m-brand)'}}>Install app</strong></>} />
                <Step num="3" text={<>Tap <strong>Tambah</strong> untuk konfirmasi</>} />
              </div>
            </div>
            <button onClick={onSkip} style={{
              width:'100%', padding:'16px', borderRadius:'16px', background:'transparent',
              color:'var(--m-ink-sub)', border:'none', fontSize:'14px', fontWeight:'600', cursor:'pointer'
            }}>
              Lanjut Tanpa Install
            </button>
          </>
        )}

        {/* ── iOS: langsung instruksi manual ── */}
        {isIOS && (
          <>
            <div style={{ background:'#f9fafb', borderRadius:'16px', padding:'20px', marginBottom:'24px', border:'1px solid #e5e7eb', textAlign:'left' }}>
              <p style={{ fontSize:'13px', color:'#6b7280', marginBottom:'14px', fontWeight:'600' }}>
                Install di iPhone / iPad:
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <Step num="1" text={<>Buka di <strong>Safari</strong> (bukan Chrome), tap ikon <strong>Share ⬆️</strong> di bawah layar</>} />
                <Step num="2" text={<>Scroll ke bawah di menu Share, cari <strong style={{color:'var(--m-brand)'}}>Tambah ke Layar Utama</strong></>} />
                <Step num="3" text={<>Tap <strong>Tambah</strong> di pojok kanan atas</>} />
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <button onClick={onSkip} style={{
                width:'100%', padding:'16px', borderRadius:'16px', background:'#111827', color:'#fff',
                border:'none', fontSize:'15px', fontWeight:'800', cursor:'pointer',
                boxShadow:'0 8px 24px rgba(0,0,0,0.15)'
              }}>
                Sudah Install, Lanjut →
              </button>
              <button onClick={onSkip} style={{
                width:'100%', padding:'16px', borderRadius:'16px', background:'transparent',
                color:'var(--m-ink-sub)', border:'none', fontSize:'14px', fontWeight:'600', cursor:'pointer'
              }}>
                Lanjut Tanpa Install
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

function Step({ num, text }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
      <div style={{
        width:'24px', height:'24px', borderRadius:'50%', background:'var(--m-brand)',
        color:'#fff', fontSize:'12px', fontWeight:'800', flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center'
      }}>{num}</div>
      <span style={{ fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.5', paddingTop:'2px' }}>{text}</span>
    </div>
  );
}

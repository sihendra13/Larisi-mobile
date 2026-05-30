'use client';
import React, { useEffect, useState } from 'react';

export default function InstallScreen({ onSkip, installPrompt }) {
  const [isIOS, setIsIOS] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Detect iOS
    const ua = window.navigator.userAgent;
    const webkit = !!ua.match(/WebKit/i);
    const isIPad = !!ua.match(/iPad/i);
    const isIPhone = !!ua.match(/iPhone/i);
    const isIOSDevice = isIPad || isIPhone;
    const isSafari = isIOSDevice && webkit && !ua.match(/CriOS/i);
    setIsIOS(isIOSDevice);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        onSkip(); // Move to next screen after install
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-animated" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden', fontFamily: '-apple-system, sans-serif'
    }}>
      {/* Background Blobs for extra energy */}
      <div style={{
        position: 'absolute', top: '5%', left: '-5%', width: '300px', height: '300px',
        background: 'var(--m-brand)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', right: '-5%', width: '250px', height: '250px',
        background: '#FF007A', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite reverse'
      }} />

      {/* Install Card */}
      <div className="glass-card stagger-1" style={{
        width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '40px 32px',
        display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10,
        textAlign: 'center'
      }}>
        
        {/* Header Icon */}
        <div style={{
          width: '64px', height: '64px', background: 'var(--m-brand)', borderRadius: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          boxShadow: '0 12px 24px rgba(121, 26, 219, 0.3)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>

        <h1 style={{fontSize: '24px', fontWeight: '800', color: 'var(--m-ink)', marginBottom: '16px', letterSpacing: '-0.5px'}}>
          Install Larisi di HP kamu
        </h1>

        {isIOS ? (
          // iOS Instructions
          <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '15px', color: 'var(--m-ink)', fontWeight: '600', marginBottom: '16px', lineHeight: '1.5' }}>
              Tap ikon <span style={{ display: 'inline-block', padding: '4px 8px', background: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb', margin: '0 4px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom' }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span style={{ fontSize: '12px', marginLeft: '4px' }}>Share</span>
              </span> di bawah layar, lalu pilih <br/><strong style={{ color: 'var(--m-brand)' }}>"Tambah ke Layar Utama"</strong>
            </p>
            {/* Simple Animated Guide for iOS */}
            <div style={{ 
              width: '100%', height: '120px', background: '#e5e7eb', borderRadius: '12px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
            }}>
               <div style={{ animation: 'float 2s ease-in-out infinite' }}>
                 <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                   <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                   <line x1="12" y1="18" x2="12.01" y2="18"/>
                 </svg>
                 <div style={{ position: 'absolute', bottom: '10px', right: '10px', color: 'var(--m-brand)', transform: 'rotate(-45deg)' }}>
                   ⬆️
                 </div>
               </div>
            </div>
          </div>
        ) : (
          // Android / Desktop Instructions
          <p style={{ fontSize: '15px', color: 'var(--m-ink-sub)', marginBottom: '32px', lineHeight: '1.6' }}>
            Dapatkan pengalaman terbaik, akses super cepat, dan notifikasi langsung dari layar utama HP Anda.
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isIOS ? (
            <button onClick={onSkip} style={{
              width: '100%', padding: '16px', borderRadius: '16px', background: '#111827', color: '#fff',
              border: 'none', fontSize: '15px', fontWeight: '800', cursor: 'pointer', 
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', transition: 'all 0.2s'
            }}>
              Sudah Install, Lanjut →
            </button>
          ) : (
            <button onClick={handleInstallClick} style={{
              width: '100%', padding: '16px', borderRadius: '16px', background: '#111827', color: '#fff',
              border: 'none', fontSize: '15px', fontWeight: '800', cursor: 'pointer', 
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', transition: 'all 0.2s'
            }}>
              Install Sekarang
            </button>
          )}

          <button onClick={onSkip} style={{
            width: '100%', padding: '16px', borderRadius: '16px', background: 'transparent', color: 'var(--m-ink-sub)',
            border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            Lanjut Tanpa Install
          </button>
        </div>

      </div>
    </div>
  );
}

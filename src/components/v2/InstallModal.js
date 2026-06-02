import React, { useEffect, useState } from 'react';

export default function InstallModal({ isOpen, onClose }) {
  const [isIOS, setIsIOS] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsIOS(/iPad|iPhone|iPod/.test(window.navigator.userAgent));
  }, []);

  const handleInstallClick = async () => {
    const prompt = window.__pwaInstallPrompt;
    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          onClose();
        }
      } catch (err) {
        console.warn('[PWA] install prompt error:', err);
        setShowManual(true);
      }
    } else {
      setShowManual(true);
    }
  };

  if (!isOpen || !mounted) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '24px',
        padding: '32px 24px', display: 'flex', flexDirection: 'column', textAlign: 'center',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)', position: 'relative',
        animation: 'slideUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Tombol Tutup (X) */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px',
          background: '#F3F4F6', border: 'none', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#6B7280'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Icon */}
        <div style={{
          width: '56px', height: '56px', background: 'var(--m-brand)', borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          boxShadow: '0 8px 16px rgba(121,26,219,0.25)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>

        <h2 style={{ fontFamily: 'var(--m-font)', fontSize: '20px', fontWeight: '800', color: 'var(--m-ink)', marginBottom: '8px' }}>
          Akses Lebih Cepat!
        </h2>
        
        {!showManual && !isIOS && (
          <>
            <p style={{ fontFamily: 'var(--m-font)', fontSize: '14px', color: 'var(--m-ink-sub)', marginBottom: '24px', lineHeight: '1.5' }}>
              Install aplikasi Larisi di HP kamu agar bisa diakses langsung dari layar utama tanpa buka browser.
            </p>
            <button onClick={handleInstallClick} style={{
              width: '100%', padding: '16px', borderRadius: '16px', background: '#111827', color: '#fff',
              border: 'none', fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '800', cursor: 'pointer',
              marginBottom: '12px'
            }}>
              Install Sekarang
            </button>
            <button onClick={onClose} style={{
              width: '100%', padding: '16px', borderRadius: '16px', background: 'transparent',
              color: 'var(--m-ink-sub)', border: 'none', fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>
              Nanti Saja
            </button>
          </>
        )}

        {/* ── STATE: Chrome manual (Gagal auto prompt) ── */}
        {showManual && !isIOS && (
          <>
            <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '16px', marginBottom: '20px', textAlign: 'left', border: '1px solid #E5E7EB' }}>
              <p style={{ fontFamily: 'var(--m-font)', fontSize: '13px', color: '#6B7280', marginBottom: '12px', fontWeight: '600' }}>
                Cara Install Manual (Chrome):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Step num="1" text={<>Tap menu <strong>⋮</strong> di pojok kanan atas</>} />
                <Step num="2" text={<>Pilih <strong style={{color:'var(--m-brand)'}}>Tambah ke layar utama</strong></>} />
                <Step num="3" text={<>Tap <strong>Tambah</strong> untuk konfirmasi</>} />
              </div>
            </div>
            <button onClick={onClose} style={{
              width: '100%', padding: '16px', borderRadius: '16px', background: 'transparent',
              color: 'var(--m-ink-sub)', border: 'none', fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>
              Tutup
            </button>
          </>
        )}

        {/* ── STATE: iOS / Safari ── */}
        {isIOS && (
          <>
            <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '16px', marginBottom: '20px', textAlign: 'left', border: '1px solid #E5E7EB' }}>
              <p style={{ fontFamily: 'var(--m-font)', fontSize: '13px', color: '#6B7280', marginBottom: '12px', fontWeight: '600' }}>
                Install di iPhone / iPad:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Step num="1" text={<>Buka Safari, tap ikon <strong>Share ⬆️</strong> di bawah layar</>} />
                <Step num="2" text={<>Pilih <strong style={{color:'var(--m-brand)'}}>Tambah ke Layar Utama</strong></>} />
                <Step num="3" text={<>Tap <strong>Tambah</strong> di pojok kanan atas</>} />
              </div>
            </div>
            <button onClick={onClose} style={{
              width: '100%', padding: '16px', borderRadius: '16px', background: '#111827', color: '#fff',
              border: 'none', fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '800', cursor: 'pointer',
              marginBottom: '8px'
            }}>
              Sudah Install, Lanjut →
            </button>
            <button onClick={onClose} style={{
              width: '100%', padding: '16px', borderRadius: '16px', background: 'transparent',
              color: 'var(--m-ink-sub)', border: 'none', fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>
              Nanti Saja
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Step({ num, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', background: 'var(--m-brand)',
        color: '#fff', fontSize: '11px', fontWeight: '800', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px'
      }}>{num}</div>
      <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', color: 'var(--m-ink)', lineHeight: '1.4' }}>{text}</span>
    </div>
  );
}

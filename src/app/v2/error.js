'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Bisa disambungkan ke service tracking seperti Sentry
    console.error('App V2 Error Boundary Caught:', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      background: 'var(--m-bg)',
      textAlign: 'center'
    }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      
      <h2 style={{ fontFamily: 'var(--m-font)', fontSize: '24px', fontWeight: '800', color: 'var(--m-ink)', marginBottom: '12px' }}>
        Ups, terjadi kesalahan!
      </h2>
      
      <p style={{ fontFamily: 'var(--m-font)', fontSize: '14px', color: 'var(--m-ink-sub)', marginBottom: '32px', maxWidth: '320px', lineHeight: '1.6' }}>
        Aplikasi kesulitan memuat halaman. Bisa jadi karena gangguan sinyal atau data yang belum siap. Jangan khawatir, silakan coba lagi.
      </p>
      
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        style={{
          padding: '14px 32px',
          background: 'var(--m-brand)',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          fontFamily: 'var(--m-font)',
          fontSize: '15px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(121, 26, 219, 0.25)'
        }}
      >
        Muat Ulang Halaman
      </button>

      {/* Informasi error hanya dimunculkan di mode development untuk debugging, sembunyi di production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '40px', width: '100%', maxWidth: '400px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px', textAlign: 'left', overflowX: 'auto' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: '700', color: '#B91C1C', marginBottom: '8px' }}>
            [DEV ONLY] Detail Error:
          </p>
          <pre style={{ fontFamily: 'monospace', fontSize: '11px', color: '#991B1B', margin: 0, whiteSpace: 'pre-wrap' }}>
            {error?.message || String(error)}
          </pre>
        </div>
      )}
    </div>
  );
}

'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Aplikasi Mengalami Kendala Fatal
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '32px' }}>
            Terjadi masalah yang menyebabkan aplikasi tidak bisa dilanjutkan.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      </body>
    </html>
  );
}

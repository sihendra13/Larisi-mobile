'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

function DapurKontenMock() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [platform, setPlatform] = useState(searchParams.get('platform') || '');
  const [caption, setCaption] = useState(searchParams.get('caption') || '');
  const [image, setImage] = useState(null);

  const handleUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', background: '#0e0e12', minHeight: '100vh', color: '#fff' }}>
      <button 
        onClick={() => router.back()}
        style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}
      >
        ← Kembali ke Chat
      </button>

      <h2 style={{ marginBottom: '8px' }}>Dapur Konten (Simulasi)</h2>
      <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>
        Perhatikan bagaimana teks yang diketik oleh Jarvis sudah <b>Otomatis Terisi</b> di form ini. Anda tinggal mengunggah foto produk saja!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#1e1e24', padding: '20px', borderRadius: '12px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>Judul Campaign</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#0e0e12', color: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>Platform Tujuan</label>
          <input 
            type="text" 
            value={platform} 
            onChange={e => setPlatform(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#0e0e12', color: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>Caption (Draft dari AI)</label>
          <textarea 
            rows={5}
            value={caption} 
            onChange={e => setCaption(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#0e0e12', color: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#00e676', fontWeight: 'bold' }}>
            + Unggah Foto / Video Produk Asli
          </label>
          <div style={{ border: '2px dashed #444', borderRadius: '8px', padding: '20px', textAlign: 'center', background: '#0e0e12' }}>
            {image ? (
              <img src={image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
            ) : (
              <div>
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>Aset visual Anda akan diletakkan di sini</p>
                <input type="file" accept="image/*" onChange={handleUpload} style={{ fontSize: '12px' }} />
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => alert('Simulasi: Campaign berhasil di-publish ke Instagram/TikTok!')}
          style={{ width: '100%', padding: '14px', background: 'var(--m-brand, #791ADB)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
        >
          Publish Campaign 🚀
        </button>

      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ color: 'white', padding: '20px' }}>Loading...</div>}>
      <DapurKontenMock />
    </Suspense>
  );
}

'use client';
import { useState, useRef, useCallback } from 'react';

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const ImagePlaceholder = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.25}}>
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const LanjutBtn = ({ onClick, label }) => (
  <button onClick={onClick} style={{
    width:'100%', padding:'16px', borderRadius:'16px',
    background:'var(--m-ink)', color:'#fff', border:'none',
    fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700',
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
  }}>
    {label}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  </button>
);

export default function AsetSection({ onNext }) {
  const [files, setFiles] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFiles = useCallback((e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;
    setFiles(prev => [...prev, ...incoming].slice(0, 5));
    setActiveIdx(0);
    e.target.value = '';
  }, []);

  /* ─── EMPTY STATE ─── */
  if (files.length === 0) {
    return (
      <div className="panel" id="panel-upload">
        <div className="panel-header" style={{display:'flex'}}>
          <div className="panel-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div>
            <div className="panel-title">Aset Kreatif</div>
            <div className="panel-sub">Pilih foto atau ambil dari kamera</div>
          </div>
        </div>

        <div className="panel-body" style={{padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
          {/* Tombol Unggah + Kamera */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <button onClick={() => galleryRef.current?.click()} style={{
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:'10px', padding:'24px 12px', border:'1.5px dashed var(--m-brand)',
              borderRadius:'16px', background:'var(--m-brand-soft)', color:'var(--m-brand)',
              fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600', cursor:'pointer', minHeight:'120px',
            }}>
              <UploadIcon />
              Unggah
            </button>
            <button onClick={() => cameraRef.current?.click()} style={{
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:'10px', padding:'24px 12px', border:'1.5px dashed #D7D7DE',
              borderRadius:'16px', background:'var(--m-bg)', color:'var(--m-ink-sub)',
              fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600', cursor:'pointer', minHeight:'120px',
            }}>
              <CameraIcon />
              Kamera
            </button>
          </div>

          {/* Info */}
          <div style={{display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', background:'var(--m-bg)', borderRadius:'12px'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{fontSize:'13px', color:'var(--m-ink-sub)', fontFamily:'var(--m-font)'}}>Maksimal 5 Foto atau 1 Video</span>
          </div>

          {/* Empty thumbnails */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px'}}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                aspectRatio:'1', borderRadius:'12px', background:'var(--m-bg)',
                border:'1px solid #E8E8EE', display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <ImagePlaceholder />
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:'0 16px 16px'}}>
          <LanjutBtn onClick={onNext} label="Simpan & Lanjutkan" />
        </div>

        <input ref={galleryRef} type="file" accept="image/*,video/*" multiple style={{display:'none'}} onChange={handleFiles} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={handleFiles} />
      </div>
    );
  }

  /* ─── UPLOADED STATE ─── */
  const activeUrl = URL.createObjectURL(files[activeIdx]);

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>

      {/* Big preview */}
      <div style={{position:'relative', borderRadius:'16px', overflow:'hidden', background:'#111'}}>
        <img
          src={activeUrl}
          alt="preview"
          style={{width:'100%', display:'block', aspectRatio:'4/3', objectFit:'cover'}}
        />

        {/* Ubah Foto */}
        <button onClick={() => galleryRef.current?.click()} style={{
          position:'absolute', top:'12px', right:'12px',
          background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)',
          color:'#fff', border:'none', borderRadius:'99px',
          padding:'7px 14px', fontSize:'13px', fontWeight:'600',
          fontFamily:'var(--m-font)', cursor:'pointer',
          display:'flex', alignItems:'center', gap:'6px',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
          </svg>
          Ubah Foto
        </button>

        {/* Master Persona overlay */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0,
          background:'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)',
          padding:'40px 12px 12px',
        }}>
          <div className="persona-card" id="personaCard" style={{
            margin:0,
            background:'rgba(255,255,255,0.08)',
            backdropFilter:'blur(10px)',
            border:'1px solid rgba(255,255,255,0.15)',
          }}>
            <div className="persona-top">
              <div className="persona-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="persona-badge" id="personaBadge">Master Persona</div>
            </div>
            <div className="persona-name" id="personaName" style={{color:'#fff'}}>Culinary / Cafe</div>
            <div className="persona-targeting" id="personaTarget" style={{color:'rgba(255,255,255,0.75)'}}>Targeting: Foodies &amp; Urban Professionals</div>
            <div className="persona-age" id="personaAge" style={{color:'rgba(255,255,255,0.75)'}}>Age range: 20–40 · Mixed</div>
          </div>
        </div>
      </div>

      {/* Thumbnail grid */}
      <div className="panel" style={{padding:'12px'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px'}}>
          {files.map((f, i) => (
            <div
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                aspectRatio:'1', borderRadius:'10px', overflow:'hidden', cursor:'pointer',
                outline: i === activeIdx ? '2.5px solid var(--m-brand)' : 'none',
                outlineOffset:'2px',
              }}
            >
              <img
                src={URL.createObjectURL(f)}
                alt=""
                style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
              />
            </div>
          ))}
          {files.length < 5 && (
            <button onClick={() => galleryRef.current?.click()} style={{
              aspectRatio:'1', borderRadius:'10px', border:'1.5px dashed #D7D7DE',
              background:'var(--m-bg)', color:'var(--m-ink-sub)', display:'flex',
              alignItems:'center', justifyContent:'center', cursor:'pointer',
              fontSize:'24px', fontWeight:'400',
            }}>
              +
            </button>
          )}
        </div>
      </div>

      {/* CTA */}
      <LanjutBtn onClick={onNext} label="Lanjutkan ke Audiens" />

      <input ref={galleryRef} type="file" accept="image/*,video/*" multiple style={{display:'none'}} onChange={handleFiles} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={handleFiles} />
    </div>
  );
}

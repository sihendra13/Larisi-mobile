'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { analyzeImageCategory } from '@/lib/vision';
import { detectPersona, personaDB } from '@/data/personas';

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

/* Pesan yang berganti saat scanning — memberi kesan AI sedang berpikir */
const SCAN_MESSAGES = [
  'SiLaris sedang menganalisis kontenmu...',
  'Mendeteksi kategori bisnis...',
  'Mengidentifikasi target audiens...',
  'Menyiapkan Master Persona...',
];

export default function AsetSection() {
  const [files, setFiles]                 = useState([]);
  const [activeIdx, setActiveIdx]         = useState(0);
  const [isScanning, setIsScanning]       = useState(false);
  const [scanText, setScanText]           = useState(SCAN_MESSAGES[0]);
  const [detectedPersona, setDetectedPersona] = useState(null);

  const galleryRef              = useRef(null);
  const cameraRef               = useRef(null);
  const masterPersonaLockedRef  = useRef(false);
  const uploadedDataURLsRef     = useRef([]);

  /* ── Cycling scan text saat isScanning aktif — beri efek AI ── */
  useEffect(() => {
    if (!isScanning) return;
    setScanText(SCAN_MESSAGES[0]);
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % SCAN_MESSAGES.length;
      setScanText(SCAN_MESSAGES[idx]);
    }, 950);
    return () => clearInterval(interval);
  }, [isScanning]);

  /* ── showScanningOnly: upload berikutnya, persona tidak berubah ── */
  const showScanningOnly = useCallback(() => {
    setScanText(SCAN_MESSAGES[0]);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2200);
  }, []);

  /* ── startScanWithFile: sama persis logic desktop ── */
  const startScanWithFile = useCallback(async (filename, file) => {
    if (masterPersonaLockedRef.current) {
      showScanningOnly();
      return;
    }

    const startTime = Date.now();
    setIsScanning(true);
    setDetectedPersona(null);

    const isVideo = file && file.type.startsWith('video/');

    /* VIDEO: tidak bisa dianalisis Groq — cek filename, fallback ke General */
    if (isVideo) {
      await new Promise(r => setTimeout(r, 1800));
      setIsScanning(false);
      const p = detectPersona(filename);
      setDetectedPersona(p);
      masterPersonaLockedRef.current = true;
      return;
    }

    /* Tunggu base64 dari FileReader (max 3 detik, sama persis desktop) */
    let base64 = null;
    for (let i = 0; i < 30; i++) {
      if (uploadedDataURLsRef.current[0]) { base64 = uploadedDataURLsRef.current[0]; break; }
      await new Promise(r => setTimeout(r, 100));
    }

    /* Panggil Groq Vision */
    let visionKey   = null;
    let visionLabel = null;
    if (base64) {
      try {
        const bizCat = (typeof window !== 'undefined' && window.userBizProfile)
          ? window.userBizProfile.category : null;
        const vResult = await analyzeImageCategory(base64, bizCat);
        if (vResult.key) {
          visionKey   = vResult.key;
          visionLabel = vResult.label;
        }
      } catch (e) {
        console.warn('[persona] vision call error:', e);
      }
    }

    /* Pastikan animasi minimal 3.5 detik — beri "AI magic" feel */
    const elapsed   = Date.now() - startTime;
    const remaining = Math.max(0, 3500 - elapsed);
    if (remaining > 0) await new Promise(r => setTimeout(r, remaining));

    setIsScanning(false);

    if (visionKey) {
      const p = personaDB[visionKey];
      if (p) {
        setDetectedPersona({
          name:   p.name,
          target: p.target,
          age:    p.age   || '18–45',
          gender: p.gender || 'Mixed',
        });
        masterPersonaLockedRef.current = true;
        return;
      }
    }

    /* Fallback: filename-based detection (sama persis desktop) */
    const p = detectPersona(filename);
    setDetectedPersona(p);
    masterPersonaLockedRef.current = true;
  }, [showScanningOnly]);

  /* ── handleFiles: trigger scan on first upload ── */
  const handleFiles = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;

    const isFirst = files.length === 0;
    const newFiles = [...files, ...incoming].slice(0, 5);
    setFiles(newFiles);
    setActiveIdx(0);
    e.target.value = '';

    if (isFirst) {
      masterPersonaLockedRef.current = false;
      uploadedDataURLsRef.current    = [];
      /* Read base64 async (sama seperti desktop pakai FileReader) */
      const reader = new FileReader();
      reader.onload = (ev) => { uploadedDataURLsRef.current[0] = ev.target.result; };
      reader.readAsDataURL(incoming[0]);
      startScanWithFile(incoming[0].name, incoming[0]);
    } else {
      showScanningOnly();
    }
  };

  /* ── Delete file: reset persona jika semua dihapus ── */
  const deleteFile = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx);
    setFiles(newFiles);
    if (newFiles.length === 0) {
      masterPersonaLockedRef.current = false;
      uploadedDataURLsRef.current    = [];
      setDetectedPersona(null);
      setIsScanning(false);
    }
    if (activeIdx >= newFiles.length) setActiveIdx(Math.max(0, newFiles.length - 1));
  };

  /* ─── EMPTY STATE ─── */
  if (files.length === 0) {
    return (
      <div style={{
        background:'#fff',
        borderRadius:'16px',
        border:'1px solid #E4E4EB',
        padding:'20px 16px',
        display:'flex', flexDirection:'column', gap:'16px'
      }}>
        <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'700', color:'var(--m-ink)'}}>
          Aset Kreatif
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <button onClick={() => galleryRef.current?.click()} style={{
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap:'12px', padding:'28px 12px',
            border:'1.5px dashed #D7D7DE', borderRadius:'12px',
            background:'#F9F9FB', color:'var(--m-ink)',
            fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600',
            cursor:'pointer', minHeight:'120px',
          }}>
            <div style={{
              width:'44px', height:'44px', borderRadius:'22px', background:'#F0F0F5',
              display:'flex', alignItems:'center', justifyContent:'center', color:'var(--m-ink)'
            }}>
              <UploadIcon />
            </div>
            Unggah
          </button>
          <button onClick={() => cameraRef.current?.click()} style={{
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap:'12px', padding:'28px 12px',
            border:'1.5px dashed #D7D7DE', borderRadius:'12px',
            background:'#F9F9FB', color:'var(--m-ink)',
            fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'600',
            cursor:'pointer', minHeight:'120px',
          }}>
            <div style={{
              width:'44px', height:'44px', borderRadius:'22px', background:'#F0F0F5',
              display:'flex', alignItems:'center', justifyContent:'center', color:'var(--m-ink)'
            }}>
              <CameraIcon />
            </div>
            Kamera
          </button>
        </div>

        <div style={{
          display:'flex', alignItems:'center', gap:'8px',
          padding:'12px 14px', background:'#F4F4F7',
          borderRadius:'8px'
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{fontSize:'13px', color:'var(--m-ink-sub)', fontFamily:'var(--m-font)'}}>
            Maksimal 5 Foto atau 1 Video
          </span>
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

        {/* ── AI Scanning overlay — letaknya di gambar preview besar ── */}
        {isScanning && (
          <div style={{
            position:'absolute', inset:0,
            background:'rgba(0,0,0,0.70)',
            backdropFilter:'blur(3px)',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            gap:'14px', zIndex:10,
            overflow:'hidden',
          }}>
            {/* Corner targeting brackets */}
            <div className="ai-corner ai-corner--tl" />
            <div className="ai-corner ai-corner--tr" />
            <div className="ai-corner ai-corner--bl" />
            <div className="ai-corner ai-corner--br" />

            {/* Sweep scan line */}
            <div className="ai-scan-line" />

            {/* Center content */}
            <div style={{
              display:'flex', flexDirection:'column',
              alignItems:'center', gap:'10px', zIndex:1,
              position:'relative',
            }}>
              <div style={{display:'flex', gap:'6px', alignItems:'center'}}>
                <div className="scan-dot" style={{background:'#a78bfa'}} />
                <div className="scan-dot" style={{background:'#a78bfa'}} />
                <div className="scan-dot" style={{background:'#a78bfa'}} />
              </div>
              <div className="scan-text-overlay">{scanText}</div>
            </div>
          </div>
        )}

        {/* Ubah Foto — tetap muncul walau sedang scanning */}
        <button onClick={() => galleryRef.current?.click()} style={{
          position:'absolute', top:'12px', right:'12px',
          background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)',
          color:'#fff', border:'none', borderRadius:'99px',
          padding:'7px 14px', fontSize:'13px', fontWeight:'600',
          fontFamily:'var(--m-font)', cursor:'pointer',
          display:'flex', alignItems:'center', gap:'6px', zIndex:11,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
          </svg>
          Ubah Foto
        </button>

        {/* Master Persona overlay — muncul setelah scan selesai ── */}
        {!isScanning && detectedPersona && (
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            background:'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)',
            padding:'40px 12px 12px',
          }}>
            {/* className="persona-card visible" — .visible wajib agar display:block (CSS default display:none) */}
            <div className="persona-card visible" id="personaCard" style={{
              margin:0,
              display:'block',
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
                <div className="persona-badge" id="personaBadge" style={{color:'#e9d5ff'}}>Master Persona</div>
              </div>
              <div className="persona-name" id="personaName" style={{color:'#fff'}}>
                {detectedPersona.name}
              </div>
              <div className="persona-targeting" id="personaTarget" style={{color:'rgba(255,255,255,0.75)'}}>
                Targeting: {detectedPersona.target}
              </div>
              <div className="persona-age" id="personaAge" style={{color:'rgba(255,255,255,0.75)'}}>
                Age range: {detectedPersona.age} · {detectedPersona.gender}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail grid */}
      <div className="panel" style={{padding:'16px'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px'}}>
          {files.map((f, i) => (
            <div
              key={i}
              style={{
                position:'relative',
                aspectRatio:'1', borderRadius:'10px', overflow:'hidden', cursor:'pointer',
                outline: i === activeIdx ? '2.5px solid var(--m-brand)' : 'none',
                outlineOffset:'2px',
              }}
            >
              <img
                src={URL.createObjectURL(f)}
                alt=""
                onClick={() => setActiveIdx(i)}
                style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
              />
              <button
                onClick={(e) => { e.stopPropagation(); deleteFile(i); }}
                style={{
                  position:'absolute', top:'4px', right:'4px',
                  width:'24px', height:'24px', borderRadius:'12px',
                  background:'rgba(0,0,0,0.6)', border:'none', color:'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', backdropFilter:'blur(4px)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
          {files.length < 5 && (
            <button onClick={() => galleryRef.current?.click()} style={{
              aspectRatio:'1', borderRadius:'10px',
              border:'1.5px dashed #D7D7DE', background:'var(--m-bg)',
              color:'var(--m-ink-sub)', display:'flex',
              alignItems:'center', justifyContent:'center',
              cursor:'pointer', fontSize:'24px',
            }}>
              +
            </button>
          )}
        </div>
      </div>

      <input ref={galleryRef} type="file" accept="image/*,video/*" multiple style={{display:'none'}} onChange={handleFiles} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={handleFiles} />
    </div>
  );
}

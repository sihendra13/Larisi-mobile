'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { analyzeImageCategory } from '@/lib/vision';
import { detectPersona, personaDB } from '@/data/personas';

/* ── Platform icons ── */
const PLATFORM_ICONS = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="#fff" stroke="none"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="rgba(255,255,255,0.9)"/>
      <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="#1877F2"/>
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="rgba(0,0,0,0.7)"/>
      <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="rgba(255,0,0,0.9)"/>
      <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
    </svg>
  ),
};

const FORMATS      = ['Post', 'Reel', 'Story'];
const FORMAT_RATIO = { post: '4/5', reel: '9/16', story: '9/16' };

const SCAN_MESSAGES = [
  'SiLaris sedang menganalisis kontenmu...',
  'Mendeteksi kategori bisnis...',
  'Mengidentifikasi target audiens...',
  'Menyiapkan Master Persona...',
];

const AI_STYLES = [
  { id: 'studio',    label: 'Studio Pro',  desc: 'Latar putih bersih, profesional', emoji: '🏢' },
  { id: 'lifestyle', label: 'Lifestyle',   desc: 'Suasana natural & hangat',         emoji: '☀️' },
  { id: 'flatlay',   label: 'Flat Lay',    desc: 'Tampilan atas, rapi & minimalis',  emoji: '📐' },
];

export default function AsetScreen({ platform, format, onFormatChange, files, onFilesChange, onBack, onNext }) {
  const [selectedIdx,    setSelectedIdx]    = useState(0);

  /* ── Upload-mode & mixing validation (V1 port) ── */
  const [uploadMode,     setUploadMode]     = useState(null);
  const [modal,          setModal]          = useState(null);

  /* ── Scanning & persona detection (V1 port) ── */
  const [isScanning,     setIsScanning]     = useState(false);
  const [scanText,       setScanText]       = useState(SCAN_MESSAGES[0]);
  const [detectedPersona, setDetectedPersona] = useState(null);

  /* ── AI Kreatif sheet ── */
  const [showAISheet, setShowAISheet] = useState(false);
  const [animateAI,   setAnimateAI]   = useState(false);
  const [aiPhoto,     setAiPhoto]     = useState(null);
  const [aiStyle,     setAiStyle]     = useState('studio');

  const fileInputRef   = useRef(null);
  const aiPhotoRef     = useRef(null);

  /* V1 refs */
  const masterPersonaLockedRef = useRef(false);
  const uploadedDataURLsRef    = useRef([]);
  const pendingFilesRef        = useRef(null);

  const MAX_FILES = 5;
  const fmtLower  = format.toLowerCase();

  /* ── Keep selectedIdx in-bounds ── */
  useEffect(() => {
    if (files.length > 0 && selectedIdx >= files.length) {
      setSelectedIdx(files.length - 1);
    }
  }, [files.length, selectedIdx]);

  /* ── Scan text cycling ── */
  useEffect(() => {
    if (!isScanning) return;
    setScanText(SCAN_MESSAGES[0]);
    let idx = 0;
    const iv = setInterval(() => {
      idx = (idx + 1) % SCAN_MESSAGES.length;
      setScanText(SCAN_MESSAGES[idx]);
    }, 950);
    return () => clearInterval(iv);
  }, [isScanning]);

  /* ── AI sheet helpers ── */
  const openAISheet  = () => { setShowAISheet(true);  setTimeout(() => setAnimateAI(true),  10); };
  const closeAISheet = () => { setAnimateAI(false);   setTimeout(() => setShowAISheet(false), 320); };

  /* ── showScanningOnly: persona already locked ── */
  const showScanningOnly = useCallback(() => {
    setScanText(SCAN_MESSAGES[0]);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2200);
  }, []);

  /* ── startScanWithFile: Groq Vision scan (V1 port) ── */
  const startScanWithFile = useCallback(async (filename, file) => {
    if (masterPersonaLockedRef.current) { showScanningOnly(); return; }

    const startTime = Date.now();
    setIsScanning(true);
    setDetectedPersona(null);

    const isVideo = file && file.type.startsWith('video/');
    if (isVideo) {
      await new Promise(r => setTimeout(r, 1800));
      setIsScanning(false);
      const p = detectPersona(filename);
      setDetectedPersona(p);
      masterPersonaLockedRef.current = true;
      return;
    }

    /* Wait for FileReader base64 */
    let base64 = null;
    for (let i = 0; i < 30; i++) {
      if (uploadedDataURLsRef.current[0]) { base64 = uploadedDataURLsRef.current[0]; break; }
      await new Promise(r => setTimeout(r, 100));
    }

    /* Groq Vision */
    let visionKey = null;
    if (base64) {
      try {
        const vResult = await analyzeImageCategory(base64, null);
        if (vResult.key) visionKey = vResult.key;
      } catch (e) { console.warn('[persona] vision error:', e); }
    }

    /* Minimum 3.5s animation */
    const elapsed   = Date.now() - startTime;
    const remaining = Math.max(0, 3500 - elapsed);
    if (remaining > 0) await new Promise(r => setTimeout(r, remaining));

    setIsScanning(false);

    if (visionKey) {
      const p = personaDB[visionKey];
      if (p) {
        setDetectedPersona({ name: p.name, target: p.target, age: p.age || '18–45', gender: p.gender || 'Mixed' });
        masterPersonaLockedRef.current = true;
        return;
      }
    }
    const p = detectPersona(filename);
    setDetectedPersona(p);
    masterPersonaLockedRef.current = true;
  }, [showScanningOnly]);

  /* ── processFiles: apply validated files (V1 port) ── */
  const processFiles = useCallback((incoming, treatAsFirst) => {
    const newHasVideo = incoming.some(f => f.type.startsWith('video/'));
    let accepted;
    if (newHasVideo) {
      accepted = incoming.filter(f => f.type.startsWith('video/')).slice(0, 1);
      setUploadMode('video');
    } else {
      const remaining = treatAsFirst ? MAX_FILES : Math.max(0, MAX_FILES - files.length);
      accepted = incoming.filter(f => f.type.startsWith('image/')).slice(0, remaining);
      setUploadMode('photo');
    }
    if (!accepted.length) return;

    const newObjs = accepted.map(f => ({
      url:  URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'photo',
      name: f.name,
    }));
    const combined = treatAsFirst ? newObjs : [...files, ...newObjs].slice(0, MAX_FILES);
    onFilesChange(combined);
    setSelectedIdx(0);

    if (treatAsFirst) {
      masterPersonaLockedRef.current = false;
      uploadedDataURLsRef.current    = [];
      const reader = new FileReader();
      reader.onload = ev => { uploadedDataURLsRef.current[0] = ev.target.result; };
      reader.readAsDataURL(accepted[0]);
      startScanWithFile(accepted[0].name, accepted[0]);
    } else {
      showScanningOnly();
    }
  }, [files, onFilesChange, startScanWithFile, showScanningOnly]);

  /* ── handleFiles: mixing validation (V1 port) ── */
  const handleFiles = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;
    e.target.value = '';

    const isFirst     = files.length === 0;
    const newHasVideo = incoming.some(f => f.type.startsWith('video/'));

    if (!isFirst && uploadMode === 'photo' && newHasVideo) {
      pendingFilesRef.current = incoming;
      setModal({
        message: 'Foto dan video tidak bisa dicampur dalam satu konten. Mau beralih ke video? Semua foto yang sudah diupload akan dihapus.',
        onConfirm: () => {
          onFilesChange([]);
          setDetectedPersona(null);
          setUploadMode(null);
          masterPersonaLockedRef.current = false;
          uploadedDataURLsRef.current    = [];
          setModal(null);
          processFiles(pendingFilesRef.current, true);
        },
      });
      return;
    }
    if (!isFirst && uploadMode === 'video' && !newHasVideo) {
      pendingFilesRef.current = incoming;
      setModal({
        message: 'Foto dan video tidak bisa dicampur dalam satu konten. Mau beralih ke foto? Video kamu akan dihapus.',
        onConfirm: () => {
          onFilesChange([]);
          setDetectedPersona(null);
          setUploadMode(null);
          masterPersonaLockedRef.current = false;
          uploadedDataURLsRef.current    = [];
          setModal(null);
          processFiles(pendingFilesRef.current, true);
        },
      });
      return;
    }
    processFiles(incoming, isFirst);
  };

  /* ── deleteFile ── */
  const deleteFile = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx);
    onFilesChange(newFiles);
    if (newFiles.length === 0) {
      masterPersonaLockedRef.current = false;
      uploadedDataURLsRef.current    = [];
      setDetectedPersona(null);
      setIsScanning(false);
      setUploadMode(null);
    }
    if (selectedIdx >= newFiles.length) setSelectedIdx(Math.max(0, newFiles.length - 1));
  };

  const previewFile = files[selectedIdx] || null;
  const handleNext  = () => onNext(detectedPersona);

  /* ════════════════════════════════════════════════════
     RENDER — full-screen overlay layout
  ════════════════════════════════════════════════════ */
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      flex: 1, overflow: 'hidden',
      position: 'relative',
      background: '#000',
    }}>

      {/* ══════════════════════════════════════════
          1. FULL-SCREEN MEDIA (background layer)
      ══════════════════════════════════════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {previewFile ? (
          previewFile.type === 'video' ? (
            <video src={previewFile.url} autoPlay muted loop playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src={previewFile.url} alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )
        ) : (
          /* ── Empty state ── */
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(160deg, #12082a 0%, #1a1035 50%, #0e2040 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
          }}>
            <div style={{ opacity: 0.35, textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--m-font)', fontSize: '13px', marginTop: '10px' }}>
                Tap + untuk tambah foto atau video
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          2. SCANNING OVERLAY
      ══════════════════════════════════════════ */}
      {isScanning && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(3px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '14px', overflow: 'hidden',
        }}>
          <div className="ai-corner ai-corner--tl" />
          <div className="ai-corner ai-corner--tr" />
          <div className="ai-corner ai-corner--bl" />
          <div className="ai-corner ai-corner--br" />
          <div className="ai-scan-line" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div className="scan-dot" style={{ background: '#a78bfa' }} />
              <div className="scan-dot" style={{ background: '#a78bfa' }} />
              <div className="scan-dot" style={{ background: '#a78bfa' }} />
            </div>
            <div className="scan-text-overlay">{scanText}</div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          3. TOP OVERLAY — transparent header + chips
      ══════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.30) 65%, transparent 100%)',
        paddingTop: '12px',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 8px' }}>
          <button onClick={onBack} style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.18)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            {PLATFORM_ICONS[platform]}
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              Aset Kreatif
            </span>
          </div>

          <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
            1/2
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '4px', padding: '0 16px', marginBottom: '10px' }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              flex: 1, height: '2.5px', borderRadius: '2px',
              background: i < 1 ? '#fff' : 'rgba(255,255,255,0.25)',
            }} />
          ))}
        </div>

        {/* Format chips — Instagram underline style */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', paddingBottom: '4px' }}>
          {FORMATS.map(f => {
            const active = fmtLower === f.toLowerCase();
            return (
              <button key={f}
                onClick={() => onFormatChange(f.toLowerCase())}
                style={{
                  padding: '5px 18px 7px',
                  border: 'none', background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--m-font)', fontSize: '14px',
                  fontWeight: active ? '700' : '500',
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  borderBottom: active ? '2px solid #fff' : '2px solid transparent',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'color .15s',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          4. BOTTOM OVERLAY — persona + thumbnails + actions
      ══════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.55) 55%, transparent 100%)',
        paddingTop: '40px', // space for gradient fade
        paddingBottom: 'calc(60px + env(safe-area-inset-bottom))',
      }}>

        {/* ── Master Persona card (after scan) ── */}
        {!isScanning && detectedPersona && (
          <div style={{ padding: '0 14px 12px' }}>
            <div style={{
              background: 'rgba(15,8,30,0.72)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(167,139,250,0.28)',
              borderRadius: '14px',
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#22c55e', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '10px', fontWeight: '700', color: '#e9d5ff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Master Persona
                </span>
              </div>
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '800', color: '#fff', marginBottom: '3px', letterSpacing: '-0.01em' }}>
                {detectedPersona.name}
              </div>
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>
                {detectedPersona.target} · {detectedPersona.age}
              </div>
            </div>
          </div>
        )}

        {/* ── Thumbnail strip ── */}
        {files.length > 0 && (
          <div style={{
            display: 'flex', gap: '6px', overflowX: 'auto',
            padding: '0 14px 10px',
            scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
          }}>
            {files.map((f, i) => (
              <div key={i}
                onClick={() => setSelectedIdx(i)}
                style={{
                  position: 'relative', flexShrink: 0,
                  width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden',
                  border: i === selectedIdx ? '2.5px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  boxShadow: i === selectedIdx ? '0 0 0 1px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                {f.type === 'video' ? (
                  <video src={f.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                ) : (
                  <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {/* Video indicator */}
                {f.type === 'video' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                )}
                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteFile(i); }}
                  style={{
                    position: 'absolute', top: '1px', right: '1px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0,
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Action bar: [+][AI✨]  ←→  [Next →] ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
        }}>
          {/* Left: + and AI ✨ */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

            {/* + : direct native gallery trigger */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>

            {/* AI ✨ */}
            <button
              onClick={openAISheet}
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(124,58,237,0.55)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
              </svg>
            </button>
          </div>

          {/* Right: Next → (pill) */}
          <button
            onClick={handleNext}
            style={{
              padding: '11px 26px', borderRadius: '99px',
              background: '#fff', color: '#111', border: 'none',
              fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Next
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ══ AI Kreatif Bottom Sheet ══ */}
      {showAISheet && (
        <>
          <div onClick={closeAISheet} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998,
            opacity: animateAI ? 1 : 0, transition: 'opacity 0.3s ease-out',
          }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
            background: '#fff', borderRadius: '20px 20px 0 0',
            display: 'flex', flexDirection: 'column',
            maxHeight: '88vh', overflow: 'hidden',
            transform: animateAI ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
          }}>
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0', flexShrink: 0 }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#E4E4EB' }} />
            </div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--m-brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700', color: 'var(--m-ink)' }}>AI Kreatif</div>
                  <div style={{ fontFamily: 'var(--m-font)', fontSize: '11px', color: 'var(--m-ink-sub)' }}>Upload foto → AI bikin 3 variasi profesional</div>
                </div>
              </div>
              <button onClick={closeAISheet} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F4F4F7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {/* Step 1 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink-sub)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1 · Foto Produkmu
                </div>
                <div onClick={() => aiPhotoRef.current?.click()} style={{
                  border: aiPhoto ? '2px solid var(--m-brand)' : '2px dashed #D7D7DE',
                  borderRadius: '14px', overflow: 'hidden',
                  background: aiPhoto ? '#000' : '#F9F9FB',
                  height: '160px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  {aiPhoto ? (
                    <>
                      <img src={aiPhoto.url} alt="produk" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.55)', borderRadius: '8px', padding: '4px 10px' }}>
                        <span style={{ fontFamily: 'var(--m-font)', fontSize: '11px', color: '#fff', fontWeight: '600' }}>Ganti</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EBEBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '600', color: 'var(--m-ink)' }}>Tap untuk upload foto</div>
                      <div style={{ fontFamily: 'var(--m-font)', fontSize: '11px', color: 'var(--m-ink-sub)', marginTop: '2px' }}>JPG atau PNG, max 10MB</div>
                    </div>
                  )}
                </div>
              </div>
              {/* Step 2 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink-sub)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2 · Pilih Style
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {AI_STYLES.map(s => (
                    <div key={s.id} onClick={() => setAiStyle(s.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
                      border: aiStyle === s.id ? '2px solid var(--m-brand)' : '1.5px solid #E4E4EB',
                      background: aiStyle === s.id ? 'var(--m-brand-soft)' : '#fff',
                      transition: 'all .15s',
                    }}>
                      <span style={{ fontSize: '22px', flexShrink: 0 }}>{s.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '700', color: aiStyle === s.id ? 'var(--m-brand)' : 'var(--m-ink)' }}>{s.label}</div>
                        <div style={{ fontFamily: 'var(--m-font)', fontSize: '12px', color: 'var(--m-ink-sub)', marginTop: '1px' }}>{s.desc}</div>
                      </div>
                      {aiStyle === s.id && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--m-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '11px', height: '11px' }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Generate button */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F0F5', background: '#fff', flexShrink: 0, paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
              <button disabled={!aiPhoto} style={{
                width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                background: aiPhoto ? 'var(--m-brand)' : '#E4E4EB',
                color: aiPhoto ? '#fff' : '#A0A0B0',
                fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700',
                cursor: aiPhoto ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
                </svg>
                {aiPhoto ? 'Generate 3 Variasi' : 'Upload foto dulu'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══ Foto/video mixing modal ══ */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '18px', padding: '28px 24px', maxWidth: '340px', width: '90%', boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>
              Perhatian
            </div>
            <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', color: '#666', marginBottom: '22px', lineHeight: '1.55' }}>
              {modal.message}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '9px 20px', borderRadius: '10px', border: '1px solid #E0E0E0', background: '#fff', fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#555' }}>
                Batal
              </button>
              <button onClick={modal.onConfirm} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: '#111', color: '#fff', fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                Ganti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      {/* multiple — galeri (foto+video, native picker) */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
      {/* AI Kreatif — foto only */}
      <input ref={aiPhotoRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (!f) return;
          setAiPhoto({ url: URL.createObjectURL(f), file: f });
          e.target.value = '';
        }}
      />

    </div>
  );
}

'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { analyzeImageCategory } from '@/lib/vision';
import { detectPersona, personaDB } from '@/data/personas';

/* ── Platform icons ── */
const PLATFORM_ICONS = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#1877F2"/>
      <path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/>
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#000"/>
      <path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/>
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#FF0000"/>
      <path d="M9.5 8.5l6 3.5-6 3.5V8.5z" fill="white"/>
    </svg>
  ),
};

const FORMATS     = ['Post', 'Reel', 'Story'];
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

/* ── Progress bar ── */
const ProgressBar = ({ step, total }) => (
  <div style={{ display: 'flex', gap: '4px', padding: '0 16px', marginTop: '4px', marginBottom: '0' }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        flex: 1, height: '3px', borderRadius: '2px',
        background: i < step ? 'var(--m-brand)' : 'rgba(255,255,255,0.2)',
        transition: 'background .3s',
      }} />
    ))}
  </div>
);

export default function AsetScreen({ platform, format, onFormatChange, files, onFilesChange, onBack, onNext }) {
  const [selectedIdx,    setSelectedIdx]    = useState(0);

  /* ── Upload-mode & mixing validation (V1 port) ── */
  const [uploadMode,     setUploadMode]     = useState(null);   // 'photo' | 'video' | null
  const [modal,          setModal]          = useState(null);   // { message, onConfirm }

  /* ── Scanning & persona detection (V1 port) ── */
  const [isScanning,     setIsScanning]     = useState(false);
  const [scanText,       setScanText]       = useState(SCAN_MESSAGES[0]);
  const [detectedPersona, setDetectedPersona] = useState(null);

  /* ── Upload action sheet ── */
  const [showSheet,    setShowSheet]    = useState(false);
  const [animateSheet, setAnimateSheet] = useState(false);

  /* ── AI Kreatif sheet ── */
  const [showAISheet, setShowAISheet] = useState(false);
  const [animateAI,   setAnimateAI]   = useState(false);
  const [aiPhoto,     setAiPhoto]     = useState(null);   // { url, file }
  const [aiStyle,     setAiStyle]     = useState('studio');

  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);
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

  /* ── Sheet helpers ── */
  const openSheet  = () => { setShowSheet(true);  setTimeout(() => setAnimateSheet(true),  10); };
  const closeSheet = () => { setAnimateSheet(false); setTimeout(() => setShowSheet(false), 320); };
  const openAISheet  = () => { setShowAISheet(true);  setTimeout(() => setAnimateAI(true),  10); };
  const closeAISheet = () => { setAnimateAI(false);   setTimeout(() => setShowAISheet(false), 320); };

  /* ── showScanningOnly: persona already locked, just animate ── */
  const showScanningOnly = useCallback(() => {
    setScanText(SCAN_MESSAGES[0]);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2200);
  }, []);

  /* ── startScanWithFile: full Groq Vision scan (V1 port) ── */
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

    /* Wait for FileReader base64 (max 3s) */
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
    closeSheet();
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

  /* ── Next: pass detected persona to parent ── */
  const handleNext = () => onNext(detectedPersona);

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#000' }}>

      {/* ── Header (dark, Instagram-like) ── */}
      <div style={{ background: '#0a0a0a', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>

          {/* Back */}
          <button onClick={onBack} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {PLATFORM_ICONS[platform]}
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700', color: '#fff' }}>
              Aset Kreatif
            </span>
          </div>

          {/* Step */}
          <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.45)' }}>
            1/2
          </span>
        </div>

        <ProgressBar step={1} total={2} />

        {/* Format tabs */}
        <div style={{
          display: 'flex', gap: '0',
          background: 'rgba(255,255,255,0.08)', borderRadius: '12px',
          padding: '3px', margin: '10px 16px 12px',
        }}>
          {FORMATS.map(f => {
            const active = fmtLower === f.toLowerCase();
            return (
              <button key={f}
                onClick={() => onFormatChange(f.toLowerCase())}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '600',
                  background: active ? '#fff' : 'transparent',
                  color: active ? '#111' : 'rgba(255,255,255,0.55)',
                  transition: 'all .2s',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Phone mockup: fills remaining space ── */}
      <div style={{
        flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', minHeight: 0,
        background: '#000',
        padding: fmtLower === 'post' ? '6px 20px' : '0',
      }}>
        <div style={{
          position: 'relative',
          height: '100%',
          aspectRatio: FORMAT_RATIO[fmtLower],
          maxWidth: '100%',
          background: '#111',
          overflow: 'hidden',
          borderRadius: fmtLower === 'post' ? '20px' : '0',
          boxShadow: fmtLower === 'post' ? '0 0 0 2px rgba(255,255,255,0.08)' : 'none',
        }}>

          {/* Notch (subtle) */}
          {fmtLower === 'post' && (
            <div style={{
              position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
              width: '52px', height: '5px', background: 'rgba(0,0,0,0.55)', borderRadius: '3px', zIndex: 10,
            }} />
          )}

          {/* ── Media content ── */}
          {previewFile ? (
            previewFile.type === 'video' ? (
              <video src={previewFile.url} autoPlay muted loop playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={previewFile.url} alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )
          ) : (
            /* ── Empty state: tap to upload ── */
            <div onClick={openSheet} style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '18px', cursor: 'pointer',
              background: 'linear-gradient(160deg, #12082a 0%, #1a1035 50%, #0e2040 100%)',
            }}>
              <div style={{
                width: '68px', height: '68px', borderRadius: '22px',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px dashed rgba(255,255,255,0.25)',
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <div style={{ textAlign: 'center', padding: '0 32px' }}>
                <div style={{ color: '#fff', fontFamily: 'var(--m-font)', fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>
                  Tambah Foto atau Video
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--m-font)', fontSize: '12px', lineHeight: '1.4' }}>
                  Maks 5 Foto atau 1 Video
                </div>
              </div>
            </div>
          )}

          {/* ── AI Scanning overlay (V1 CSS classes) ── */}
          {isScanning && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(3px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '14px', zIndex: 20, overflow: 'hidden',
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
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '10px',
                zIndex: 1, position: 'relative',
              }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div className="scan-dot" style={{ background: '#a78bfa' }} />
                  <div className="scan-dot" style={{ background: '#a78bfa' }} />
                  <div className="scan-dot" style={{ background: '#a78bfa' }} />
                </div>
                <div className="scan-text-overlay">{scanText}</div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom toolbar ── */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(0,0,0,0.93)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>

        {/* Row 1: Thumbnails + "+" + AI ✨ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px 8px' }}>

          {/* Scrollable thumbnail strip */}
          <div style={{
            display: 'flex', gap: '6px', flex: 1,
            overflowX: 'auto', scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}>
            {files.map((f, i) => (
              <div key={i}
                onClick={() => setSelectedIdx(i)}
                style={{
                  position: 'relative', flexShrink: 0,
                  width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden',
                  border: i === selectedIdx ? '2.5px solid #fff' : '2px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                }}
              >
                {f.type === 'video' ? (
                  <video src={f.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                ) : (
                  <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteFile(i); }}
                  style={{
                    position: 'absolute', top: '1px', right: '1px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0, flexShrink: 0,
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* "+" add button — shown when below max */}
          {files.length < MAX_FILES && (
            <button
              onClick={openSheet}
              style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(255,255,255,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          )}

          {/* AI ✨ button */}
          <button
            onClick={openAISheet}
            style={{
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(124,58,237,0.45)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
            </svg>
          </button>
        </div>

        {/* Row 2: Next → */}
        <div style={{ padding: '0 12px', paddingBottom: 'calc(14px + 60px + env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleNext}
            style={{
              width: '100%', padding: '15px', borderRadius: '14px',
              background: '#fff', color: '#111', border: 'none',
              fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
            }}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ══ Upload action sheet ══ */}
      {showSheet && (
        <>
          <div onClick={closeSheet} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998,
            opacity: animateSheet ? 1 : 0, transition: 'opacity 0.3s ease-out',
          }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
            background: '#fff', borderRadius: '20px 20px 0 0',
            transform: animateSheet ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
          }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#E4E4EB' }} />
            </div>
            {/* Title */}
            <div style={{ padding: '14px 16px 10px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700', color: 'var(--m-ink)' }}>
                Tambah Aset
              </div>
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '12px', color: 'var(--m-ink-sub)', marginTop: '4px' }}>
                Maks 5 Foto atau 1 Video · Tidak bisa dicampur
              </div>
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 16px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>

              {/* Galeri */}
              <button onClick={() => fileInputRef.current?.click()} style={{
                width: '100%', padding: '16px', borderRadius: '14px',
                background: 'var(--m-brand-soft)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--m-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '700', color: 'var(--m-ink)' }}>Pilih dari Galeri</div>
                  <div style={{ fontFamily: 'var(--m-font)', fontSize: '12px', color: 'var(--m-ink-sub)' }}>Foto atau video dari perangkatmu</div>
                </div>
              </button>

              {/* Kamera */}
              <button onClick={() => cameraInputRef.current?.click()} style={{
                width: '100%', padding: '16px', borderRadius: '14px',
                background: '#F5F5F7', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--m-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '700', color: 'var(--m-ink)' }}>Ambil Foto / Video</div>
                  <div style={{ fontFamily: 'var(--m-font)', fontSize: '12px', color: 'var(--m-ink-sub)' }}>Gunakan kamera sekarang</div>
                </div>
              </button>

              {/* Cancel */}
              <button onClick={closeSheet} style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: 'transparent', border: '1.5px solid #E4E4EB', cursor: 'pointer',
                fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '600', color: 'var(--m-ink-sub)',
              }}>
                Batal
              </button>
            </div>
          </div>
        </>
      )}

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

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

              {/* Step 1: Foto produk */}
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

              {/* Step 2: Style */}
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
                transition: 'background .2s',
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

      {/* ══ Foto/video mixing validation modal ══ */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '16px', padding: '28px 24px', maxWidth: '340px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '8px' }}>
              Perhatian
            </div>
            <div style={{ fontFamily: 'var(--m-font)', fontSize: '13px', color: '#6a6a6a', marginBottom: '20px', lineHeight: '1.5' }}>
              {modal.message}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #E0E0E0', background: '#fff', fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Batal
              </button>
              <button onClick={modal.onConfirm} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#111827', color: '#fff', fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                Ganti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef}   type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
      <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" style={{ display: 'none' }} onChange={handleFiles} />
      <input ref={aiPhotoRef}     type="file" accept="image/*" style={{ display: 'none' }}
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

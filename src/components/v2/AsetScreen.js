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

  /* ── Edit tampilan sheet ── */
  const [showEditSheet,    setShowEditSheet]    = useState(false);
  const [animateEditSheet, setAnimateEditSheet] = useState(false);
  /* Per-file edit settings keyed by file.url */
  const [editSettings,     setEditSettings]     = useState({});
  /* { brightness:100, saturation:100, panY:0 } */
  /* Per-file landscape detection + aspect ratio (onLoad / onLoadedMetadata) */
  const [fileRatios,       setFileRatios]       = useState({});
  /* { [url]: { isLandscape: bool, ratio: naturalW/naturalH } } */

  const fileInputRef      = useRef(null);
  const aiPhotoRef        = useRef(null);
  const editImageAreaRef  = useRef(null);  /* ref ke area gambar di edit modal */
  const touchRef          = useRef(null);  /* state drag aktif */

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
  const isEmpty     = files.length === 0;
  const handleNext  = () => onNext(detectedPersona);

  /* ── Blur pillarbox: Reel/Story always; Post when image is landscape ── */
  const isCurrentLandscape = previewFile ? (fileRatios[previewFile.url]?.isLandscape ?? false) : false;
  const showPillarbox = !!previewFile && (
    fmtLower === 'reel' || fmtLower === 'story' || isCurrentLandscape
  );

  /* ── Edit helpers — cropScale/Offset control zoom+pan within the frame ── */
  const DEFAULT_EDIT = { brightness: 100, saturation: 100, cropScale: 1.0, cropOffsetX: 0, cropOffsetY: 0 };
  const getEdit  = (url) => (url && editSettings[url]) ? editSettings[url] : DEFAULT_EDIT;
  const setEditKey = (url, key, val) =>
    setEditSettings(prev => ({ ...prev, [url]: { ...(prev[url] || DEFAULT_EDIT), [key]: val } }));

  const currentEdit = previewFile ? getEdit(previewFile.url) : DEFAULT_EDIT;

  const openEditSheet = () => {
    setShowEditSheet(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimateEditSheet(true)));
  };
  const closeEditSheet = () => {
    setAnimateEditSheet(false);
    setTimeout(() => setShowEditSheet(false), 350);
  };

  /* ── Non-passive touchmove on edit image area to prevent page scroll ── */
  useEffect(() => {
    const el = editImageAreaRef.current;
    if (!el || !showEditSheet) return;
    const prevent = (ev) => { if (touchRef.current) ev.preventDefault(); };
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, [showEditSheet]);

  /* ── Zoom change: re-clamp existing offset within new bounds ── */
  const handleZoomChange = (newScale) => {
    if (!previewFile) return;
    const info  = fileRatios[previewFile.url];
    const ratio = info?.ratio ?? (isCurrentLandscape ? 16/9 : 3/4);
    const el    = editImageAreaRef.current;
    const W     = el ? el.offsetWidth  : window.innerWidth;
    const H     = el ? el.offsetHeight : window.innerHeight * 0.65;
    const cr    = W / H;
    const imgW  = ratio > cr ? W           : H * ratio;
    const imgH  = ratio > cr ? W / ratio   : H;
    const maxX  = Math.max(0, (imgW * newScale - W) / 2);
    const maxY  = Math.max(0, (imgH * newScale - H) / 2);
    const cur   = editSettings[previewFile.url] || DEFAULT_EDIT;
    setEditSettings(prev => ({
      ...prev,
      [previewFile.url]: {
        ...cur,
        cropScale:   newScale,
        cropOffsetX: Math.max(-maxX, Math.min(maxX, cur.cropOffsetX)),
        cropOffsetY: Math.max(-maxY, Math.min(maxY, cur.cropOffsetY)),
      },
    }));
  };

  /* ── Touch drag handlers for crop pan ── */
  const handleEditTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const t   = e.touches[0];
    const cur = editSettings[previewFile?.url] || DEFAULT_EDIT;
    touchRef.current = {
      startX: t.clientX, startY: t.clientY,
      startOffsetX: cur.cropOffsetX, startOffsetY: cur.cropOffsetY,
    };
  };

  const handleEditTouchMove = (e) => {
    const tr = touchRef.current;
    if (!tr || !previewFile || e.touches.length !== 1) return;
    const t  = e.touches[0];
    /* Capture all ref values into local vars BEFORE setEditSettings,
       because touchRef.current may be nulled by touchEnd before React
       processes the batched update. */
    const dx         = t.clientX - tr.startX;
    const dy         = t.clientY - tr.startY;
    const startOffX  = tr.startOffsetX;
    const startOffY  = tr.startOffsetY;
    const scale      = (editSettings[previewFile.url] || DEFAULT_EDIT).cropScale;
    const info       = fileRatios[previewFile.url];
    const ratio      = info?.ratio ?? (isCurrentLandscape ? 16/9 : 3/4);
    const el         = editImageAreaRef.current;
    const W          = el ? el.offsetWidth  : window.innerWidth;
    const H          = el ? el.offsetHeight : window.innerHeight * 0.65;
    const cr         = W / H;
    const imgW       = ratio > cr ? W         : H * ratio;
    const imgH       = ratio > cr ? W / ratio : H;
    const maxX       = Math.max(0, (imgW * scale - W) / 2);
    const maxY       = Math.max(0, (imgH * scale - H) / 2);
    /* All values already captured — safe to update state */
    const clampedX   = Math.max(-maxX, Math.min(maxX, startOffX + dx));
    const clampedY   = Math.max(-maxY, Math.min(maxY, startOffY + dy));
    setEditSettings(prev => ({
      ...prev,
      [previewFile.url]: {
        ...(prev[previewFile.url] || DEFAULT_EDIT),
        cropOffsetX: clampedX,
        cropOffsetY: clampedY,
      },
    }));
  };

  const handleEditTouchEnd = () => { touchRef.current = null; };

  /* ════════════════════════════════════════════════════
     RENDER — full-screen overlay layout
     Empty state = light bg (matches app); media loaded = dark
  ════════════════════════════════════════════════════ */
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      flex: 1, overflow: 'hidden',
      position: 'relative',
      background: isEmpty ? 'var(--m-bg)' : '#000',
      transition: 'background 0.3s ease',
    }}>

      {/* ══════════════════════════════════════════
          1. FULL-SCREEN MEDIA (background layer)
      ══════════════════════════════════════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        {previewFile ? (
          showPillarbox ? (
            /* ── Blur pillarbox (landscape or Reel/Story) ── */
            <>
              {/* Blurred bg — always centered, just fills frame */}
              {previewFile.type === 'video' ? (
                <video src={previewFile.url} autoPlay muted loop playsInline
                  onLoadedMetadata={e => {
                    const {videoWidth:w, videoHeight:h} = e.target;
                    setFileRatios(prev => ({...prev, [previewFile.url]: {isLandscape: w > h, ratio: w/h}}));
                  }}
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: '50% 50%',
                    filter: 'blur(22px) brightness(0.52) saturate(1.5)',
                    transform: 'scale(1.14)',
                  }}/>
              ) : (
                <img src={previewFile.url} alt="" style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: '50% 50%',
                  filter: 'blur(22px) brightness(0.52) saturate(1.5)',
                  transform: 'scale(1.14)',
                }}/>
              )}
              {/* Foreground — flex wrapper clips zoom; no objectFit (iOS WebKit compat) */}
              {previewFile.type === 'video' ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <video src={previewFile.url} autoPlay muted loop playsInline style={{
                    maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', display: 'block',
                    transform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                    WebkitTransform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                    transformOrigin: 'center', willChange: 'transform',
                    filter: `brightness(${currentEdit.brightness/100}) saturate(${currentEdit.saturation/100})`,
                  }}/>
                </div>
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={previewFile.url} alt="preview"
                    onLoad={e => {
                      const {naturalWidth:w, naturalHeight:h} = e.target;
                      setFileRatios(prev => ({...prev, [previewFile.url]: {isLandscape: w > h, ratio: w/h}}));
                    }}
                    style={{
                      maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto',
                      display: 'block', flexShrink: 0,
                      transform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                      WebkitTransform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                      transformOrigin: 'center', willChange: 'transform',
                      filter: `brightness(${currentEdit.brightness/100}) saturate(${currentEdit.saturation/100})`,
                    }}/>
                </div>
              )}
            </>
          ) : (
            /* ── Normal (Post portrait/square) — cover, no pillarbox ── */
            previewFile.type === 'video' ? (
              <video src={previewFile.url} autoPlay muted loop playsInline style={{
                width: '100%', height: '100%', objectFit: 'cover',
                filter: `brightness(${currentEdit.brightness/100}) saturate(${currentEdit.saturation/100})`,
              }}/>
            ) : (
              <img src={previewFile.url} alt="preview"
                onLoad={e => {
                  const {naturalWidth:w, naturalHeight:h} = e.target;
                  setFileRatios(prev => ({...prev, [previewFile.url]: {isLandscape: w > h, ratio: w/h}}));
                }}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: `brightness(${currentEdit.brightness/100}) saturate(${currentEdit.saturation/100})`,
                }}/>
            )
          )
        ) : (
          /* ── Empty state — light bg, dark content ── */
          <div style={{
            width: '100%', height: '100%',
            background: 'var(--m-bg)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0',
          }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#C0C0CC" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <div style={{ color: 'var(--m-ink-sub)', fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Tap + untuk tambah foto atau video
            </div>
            <div style={{ color: '#B0B0BC', fontFamily: 'var(--m-font)', fontSize: '12px', fontWeight: '500' }}>
              Maksimal 5 Foto dan 1 Video
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
          3. TOP OVERLAY — header + chips
          Light mode when empty, dark overlay when media loaded
      ══════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        background: isEmpty
          ? 'var(--m-bg)'
          : 'linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.30) 65%, transparent 100%)',
        paddingTop: '12px',
        borderBottom: isEmpty ? '1px solid #ECECF1' : 'none',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 8px' }}>
          <button onClick={onBack} style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: isEmpty ? '#fff' : 'rgba(0,0,0,0.35)',
            backdropFilter: isEmpty ? 'none' : 'blur(6px)',
            border: isEmpty ? 'none' : '1px solid rgba(255,255,255,0.18)',
            boxShadow: isEmpty ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke={isEmpty ? 'var(--m-ink)' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            {/* Platform icon: light mode = colour icon, dark = white icon */}
            {isEmpty ? (
              /* Colour icons for light bg */
              platform === 'instagram' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/>
                </svg>
              ) : PLATFORM_ICONS[platform]
            ) : PLATFORM_ICONS[platform]}
            <span style={{
              fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700',
              color: isEmpty ? 'var(--m-ink)' : '#fff',
              textShadow: isEmpty ? 'none' : '0 1px 4px rgba(0,0,0,0.5)',
            }}>
              Aset Kreatif
            </span>
          </div>

          <span style={{
            fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '600',
            color: isEmpty ? 'var(--m-ink-sub)' : 'rgba(255,255,255,0.55)',
            textShadow: isEmpty ? 'none' : '0 1px 3px rgba(0,0,0,0.4)',
          }}>
            1/2
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '4px', padding: '0 16px', marginBottom: '10px' }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              flex: 1, height: '2.5px', borderRadius: '2px',
              background: i < 1
                ? (isEmpty ? 'var(--m-brand)' : '#fff')
                : (isEmpty ? '#E4E4EB' : 'rgba(255,255,255,0.25)'),
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
                  color: isEmpty
                    ? (active ? 'var(--m-ink)' : 'var(--m-ink-sub)')
                    : (active ? '#fff' : 'rgba(255,255,255,0.45)'),
                  borderBottom: active
                    ? `2px solid ${isEmpty ? 'var(--m-ink)' : '#fff'}`
                    : '2px solid transparent',
                  textShadow: isEmpty ? 'none' : '0 1px 3px rgba(0,0,0,0.4)',
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
        background: isEmpty
          ? 'var(--m-bg)'
          : 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.55) 55%, transparent 100%)',
        borderTop: isEmpty ? '1px solid #ECECF1' : 'none',
        paddingTop: isEmpty ? '14px' : '40px',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
      }}>

        {/* ── Master Persona card — V1 glass style ── */}
        {!isScanning && detectedPersona && (
          <div style={{ padding: '0 14px 12px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '14px',
              padding: '14px',
            }}>
              {/* Top: check + label */}
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
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '11px', fontWeight: '700', color: '#e9d5ff', letterSpacing: '0.3px' }}>
                  Master Persona
                </span>
              </div>
              {/* Name */}
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '3px', letterSpacing: '-0.01em' }}>
                {detectedPersona.name}
              </div>
              {/* Targeting */}
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginBottom: '2px' }}>
                Targeting: {detectedPersona.target}
              </div>
              {/* Age range */}
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.75)' }}>
                Age range: {detectedPersona.age || '18–45'} · {detectedPersona.gender || 'Mixed'}
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
                  width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden',
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
          {/* Left: + , Edit (when files present), AI ✨ */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

            {/* + : direct native gallery trigger */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '52px', height: '48px', borderRadius: '14px',
                background: isEmpty ? '#2d2d36' : 'rgba(255,255,255,0.18)',
                backdropFilter: isEmpty ? 'none' : 'blur(8px)',
                border: isEmpty ? 'none' : '1.5px solid rgba(255,255,255,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>

            {/* 🎨 Edit tampilan — only when files are present */}
            {files.length > 0 && (
              <button
                onClick={openEditSheet}
                style={{
                  width: '52px', height: '48px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(255,255,255,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Sliders / adjust icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
                  <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
                  <line x1="1" y1="14" x2="7" y2="14"/>
                  <line x1="9" y1="8" x2="15" y2="8"/>
                  <line x1="17" y1="16" x2="23" y2="16"/>
                </svg>
              </button>
            )}

            {/* AI ✨ */}
            <button
              onClick={openAISheet}
              style={{
                width: '52px', height: '48px', borderRadius: '14px',
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

          {/* Right: Next → */}
          <button
            onClick={handleNext}
            style={{
              padding: '11px 26px', borderRadius: '14px',
              background: isEmpty ? 'var(--m-ink)' : '#fff',
              color: isEmpty ? '#fff' : '#111',
              border: 'none',
              fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: isEmpty ? '0 2px 12px rgba(0,0,0,0.18)' : '0 2px 12px rgba(0,0,0,0.35)',
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

      {/* ══ Edit Tampilan — Full-Screen Modal ══ */}
      {showEditSheet && previewFile && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#111',
          display: 'flex', flexDirection: 'column',
          transform: animateEditSheet ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
        }}>

          {/* ── Image area: touch drag to pan, crop frame overlay ── */}
          <div
            ref={editImageAreaRef}
            onTouchStart={handleEditTouchStart}
            onTouchMove={handleEditTouchMove}
            onTouchEnd={handleEditTouchEnd}
            style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'grab' }}
          >
            {/* Blurred background (always cover, decorative) */}
            {previewFile.type === 'video' ? (
              <video src={previewFile.url} autoPlay muted loop playsInline style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: '50% 50%',
                filter: 'blur(22px) brightness(0.52) saturate(1.5)',
                transform: 'scale(1.14)',
              }}/>
            ) : (
              <img src={previewFile.url} alt="" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: '50% 50%',
                filter: 'blur(22px) brightness(0.52) saturate(1.5)',
                transform: 'scale(1.14)',
              }}/>
            )}

            {/* Foreground — flex wrapper for pillarbox; cover for non-pillarbox (iOS WebKit compat) */}
            {previewFile.type === 'video' ? (
              showPillarbox ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <video src={previewFile.url} autoPlay muted loop playsInline style={{
                    maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', display: 'block',
                    transform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                    WebkitTransform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                    transformOrigin: 'center', willChange: 'transform',
                    filter: `brightness(${currentEdit.brightness/100}) saturate(${currentEdit.saturation/100})`,
                  }}/>
                </div>
              ) : (
                <video src={previewFile.url} autoPlay muted loop playsInline style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover',
                  transform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                  WebkitTransform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                  transformOrigin: 'center', willChange: 'transform',
                  filter: `brightness(${currentEdit.brightness/100}) saturate(${currentEdit.saturation/100})`,
                }}/>
              )
            ) : (
              showPillarbox ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={previewFile.url} alt="preview" style={{
                    maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto',
                    display: 'block', flexShrink: 0,
                    transform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                    WebkitTransform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                    transformOrigin: 'center', willChange: 'transform',
                    filter: `brightness(${currentEdit.brightness/100}) saturate(${currentEdit.saturation/100})`,
                  }}/>
                </div>
              ) : (
                <img src={previewFile.url} alt="preview" style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover',
                  transform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                  WebkitTransform: `translate(${currentEdit.cropOffsetX}px, ${currentEdit.cropOffsetY}px) scale(${currentEdit.cropScale})`,
                  transformOrigin: 'center', willChange: 'transform',
                  filter: `brightness(${currentEdit.brightness/100}) saturate(${currentEdit.saturation/100})`,
                }}/>
              )
            )}

            {/* ── Crop frame indicator: white border + dim outside ── */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                ...((fmtLower === 'reel' || fmtLower === 'story') ? {
                  height: '100%', width: 'auto', aspectRatio: '9/16', maxWidth: '100%',
                } : {
                  width: '100%', height: 'auto', aspectRatio: '4/5', maxHeight: '100%',
                }),
                border: '1.5px solid rgba(255,255,255,0.80)',
                borderRadius: '3px',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.42)',
              }}/>
            </div>

            {/* ── Floating header over image ── */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2,
              padding: 'calc(env(safe-area-inset-top) + 12px) 16px 20px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.68) 0%, transparent 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <button onClick={closeEditSheet} style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <span style={{ fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                Edit Tampilan
              </span>
              <button
                onClick={() => setEditSettings(prev => ({ ...prev, [previewFile.url]: DEFAULT_EDIT }))}
                style={{
                  padding: '7px 14px', borderRadius: '20px',
                  background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '600',
                  color: '#fff', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* ── White controls panel ── */}
          <div style={{
            flexShrink: 0, background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '20px 20px 0',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>

            {/* Zoom — drag gambar untuk pan, slider untuk scale */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)' }}>Zoom & Geser</span>
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '12px', color: 'var(--m-ink-sub)' }}>
                  {currentEdit.cropScale <= 1.01 ? 'Original' : `${currentEdit.cropScale.toFixed(1)}×`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '17px', color: 'var(--m-ink-sub)', fontWeight: '400', lineHeight: 1 }}>−</span>
                <input type="range" min={1} max={4} step={0.05}
                  value={currentEdit.cropScale}
                  onChange={e => handleZoomChange(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#111', height: '4px', cursor: 'pointer' }}
                />
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '17px', color: 'var(--m-ink-sub)', fontWeight: '400', lineHeight: 1 }}>+</span>
              </div>
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '11px', color: 'var(--m-ink-sub)', marginTop: '6px', textAlign: 'center' }}>
                Drag gambar di atas untuk menggeser
              </div>
            </div>

            {/* Terang-Gelap */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)' }}>Terang–Gelap</span>
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '12px', color: 'var(--m-ink-sub)' }}>{currentEdit.brightness}%</span>
              </div>
              <input type="range" min={50} max={150} step={1}
                value={currentEdit.brightness}
                onChange={e => setEditKey(previewFile.url, 'brightness', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#111', height: '4px', cursor: 'pointer' }}
              />
            </div>

            {/* Ketajaman Warna */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: 'var(--m-ink)' }}>Ketajaman Warna</span>
                <span style={{ fontFamily: 'var(--m-font)', fontSize: '12px', color: 'var(--m-ink-sub)' }}>{currentEdit.saturation}%</span>
              </div>
              <input type="range" min={0} max={200} step={1}
                value={currentEdit.saturation}
                onChange={e => setEditKey(previewFile.url, 'saturation', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#111', height: '4px', cursor: 'pointer' }}
              />
            </div>

            {/* Selesai */}
            <button
              onClick={closeEditSheet}
              style={{
                width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
                background: 'var(--m-ink)',
                fontFamily: 'var(--m-font)', fontSize: '15px', fontWeight: '700',
                color: '#fff', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              Selesai
            </button>
          </div>
        </div>
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

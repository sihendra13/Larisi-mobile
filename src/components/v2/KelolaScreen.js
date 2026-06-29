'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import SiLarisScreen from './SiLarisScreen';
import MobileHeader from '@/components/layout/MobileHeader';
import { SUPABASE_URL, SUPABASE_ANON_KEY, fmtViews } from '@/lib/config';

import { parseSafeDate, fmtDate, platformLabel, fetchCampaigns, archiveCampaign, fetchAnalytics, extractMetrics, matchPost } from '@/lib/campaigns';

/* ─── Platform icon ─── */
function PlatIcon({ plat }) {
  const p = (plat || '').toLowerCase();
  if (p === 'ig' || p === 'instagram') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/>
    </svg>
  );
  if (p === 'meta' || p === 'facebook') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.40 18.627 0 12 0 5.373 0 0 5.4 0 12.073 0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
  );
  if (p === 'tiktok') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#000"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.06a8.16 8.16 0 0 0 4.77 1.52V7.15a4.85 4.85 0 0 1-1-.46z"/></svg>
  );
  if (p === 'yt' || p === 'youtube') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  );
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
}


/* ── Lapis 3: Auto-converter untuk thumbnail ── */
function createThumbFromUrl(blobUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Important for external URLs
    img.onload = () => {
      try {
        const maxW = 600;
        const ratio = maxW / img.naturalWidth;
        const c = document.createElement('canvas');
        c.width  = maxW;
        c.height = Math.round(img.naturalHeight * ratio);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.9));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = blobUrl;
  });
}

async function uploadThumbToStorage(campaignId, dataUrl, accessToken) {
  if (!campaignId || !dataUrl?.startsWith('data:image')) return null;
  try {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const path = `${campaignId}.jpg`;
    const res  = await fetch(`${SUPABASE_URL}/storage/v1/object/thumbnails/${path}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
      body: blob,
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/thumbnails/${path}`;
  } catch { return null; }
}

/* ════════════════════════════════════════
   Main Component
   ════════════════════════════════════════ */
export default function KelolaScreen({ sessionId, accessToken, profile, onAvatarClick, onNavigateToDapur, isGenZ }) {
  const [campaigns,   setCampaigns]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState('Semua');
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [analytics,   setAnalytics]   = useState(null);
  const [loadingAn,   setLoadingAn]   = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null); // campaign yang mau diarsipkan
  // realReach: { [campaignId]: number } — reach real dari PostForMe, '—' kalau belum ada
  const [realReach,   setRealReach]   = useState({});
  const [showSiLaris, setShowSiLaris] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(true);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [showPlatformSheet, setShowPlatformSheet] = useState(false);
  const [animatePlatformSheet, setAnimatePlatformSheet] = useState(false);
  const lastScrollY = useRef(0);
  const [mediaErrors, setMediaErrors] = useState({});
  const [mediaTypeFallback, setMediaTypeFallback] = useState({});
  const [retroFetchComplete, setRetroFetchComplete] = useState(false);
  const repairingCampaignsRef = useRef(new Set());
  const attemptedRepairsRef = useRef(new Set());

  const isVideoUrl = (url) => {
    if (!url) return false;
    return url.toLowerCase().includes('.mp4') || 
           url.toLowerCase().includes('.mov') || 
           url.toLowerCase().includes('.webm') || 
           url.startsWith('data:video');
  };

  const handleMediaError = useCallback(async (campId) => {
    if (repairingCampaignsRef.current.has(campId) || attemptedRepairsRef.current.has(campId)) return;
    repairingCampaignsRef.current.add(campId);
    attemptedRepairsRef.current.add(campId);

    try {
      const camp = campaigns.find(c => c.id === campId);
      if (!camp) return;

      const accounts = (() => {
        try { return JSON.parse(localStorage.getItem('radar_social_accounts') || '[]'); } catch { return []; }
      })();
      const platApiMap = { ig: 'instagram', meta: 'facebook', tiktok: 'tiktok', youtube: 'youtube' };
      const sp = platApiMap[camp.platforms[0]] || camp.platforms[0];
      const acc = accounts.find(a => a.platform === sp);
      if (!acc?.id) return;

      const posts = await fetchAnalytics(acc.id, accessToken);
      const post = matchPost(posts, camp);
      if (post) {
        const feedThumb = post.thumbnail_url || post.media_url || post.thumb_url
          || post.media?.[0]?.url || null;
        
        if (feedThumb && feedThumb !== camp.thumbUrl) {
          console.log('[KelolaScreen] Auto-repaired thumbnail for campaign:', campId, feedThumb);
          setCampaigns(prev => prev.map(c => c.id === campId ? { ...c, thumbUrl: feedThumb } : c));
          setMediaErrors(prev => ({ ...prev, [campId]: false }));
          if (selectedCamp && selectedCamp.id === campId) {
            setSelectedCamp(prev => ({ ...prev, thumbUrl: feedThumb }));
          }

          const uid = profile?.id;
          if (uid && accessToken) {
            await fetch(
              `${SUPABASE_URL}/rest/v1/campaigns?id=eq.${campId}&user_id=eq.${uid}`,
              {
                method: 'PATCH',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ thumb_url: feedThumb }),
              }
            ).catch(() => {});
          }
        }
      }
    } catch (e) {
      console.warn('[KelolaScreen] Auto-repair failed for campaign:', campId, e);
    } finally {
      setTimeout(() => {
        repairingCampaignsRef.current.delete(campId);
      }, 5000);
    }
  }, [campaigns, selectedCamp, accessToken, profile]);

  const handleOpenPlatformSheet = () => {
    const accounts = (() => {
      try { return JSON.parse(localStorage.getItem('radar_social_accounts') || '[]'); } catch { return []; }
    })();
    setSocialAccounts(accounts);
    setShowPlatformSheet(true);
    setTimeout(() => setAnimatePlatformSheet(true), 10);
  };

  const handleClosePlatformSheet = () => {
    setAnimatePlatformSheet(false);
    setTimeout(() => setShowPlatformSheet(false), 300);
  };

  /* ── Load campaigns on mount, lalu fetch real reach dari PostForMe ── */
  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    fetchCampaigns(sessionId, accessToken).then(async rows => {
      const platMap = { instagram: 'ig', facebook: 'meta' };
      const mapped = rows.map(r => ({
        id:               r.id,
        name:             r.nama_campaign || 'Campaign',
        status:           (() => {
                            let s = r.status === 'active' ? 'running' : (r.status || 'running');
                            if (s === 'scheduled' && r.scheduled_at) {
                              const d = parseSafeDate(r.scheduled_at);
                              if (!isNaN(d.getTime()) && d.getTime() <= Date.now()) {
                                s = 'running';
                              }
                            }
                            return s;
                          })(),
        platforms:        (r.platforms || []).map(p => platMap[p] || p),
        format:           r.format || 'post',
        thumbUrl:         r.thumb_url || null,
        hasVideo:         r.has_video || false,
        thumbColor:       '#791ADB',
        reachTarget:      r.estimated_reach_max || 10000,
        created_at:       r.created_at || null,
        scheduled_at:     r.scheduled_at || null,
        post_id:          r.post_id || null,
        post_url:         r.post_url || null,
        platform_post_id: r.platform_post_id || null,
        budget:           r.budget_idr || 0,
      }));
      setCampaigns(mapped);
      setLoading(false);

      // Fetch real reach dari PostForMe per akun — sama seperti desktop _loadAnalyticsForCard
      // Cache per social account ID agar tidak fetch berkali-kali untuk akun yang sama
      const accounts = (() => {
        try { return JSON.parse(localStorage.getItem('radar_social_accounts') || '[]'); } catch { return []; }
      })();
      const platApiMap = { ig:'instagram', meta:'facebook', tiktok:'tiktok', youtube:'youtube' };
      const feedCache = {}; // accountId → posts[]

      for (const camp of mapped) {
        if (camp.status === 'paused') continue;
        const sp  = platApiMap[camp.platforms[0]] || camp.platforms[0];
        const acc = accounts.find(a => a.platform === sp);
        if (!acc?.id) continue;

        if (!feedCache[acc.id]) {
          try {
            feedCache[acc.id] = await fetchAnalytics(acc.id, accessToken);
          } catch { feedCache[acc.id] = []; }
        }
        const posts = feedCache[acc.id] || [];
        const post  = matchPost(posts, camp);
        if (post) {
          const m = extractMetrics(post, camp.platforms[0]);
          if (m.reach > 0) {
            setRealReach(prev => ({ ...prev, [camp.id]: m.reach }));
          }
          // Lapis 3: Retroactive thumbnail dari PostForMe feed ATAU konversi CDN URL basi ke Supabase Storage
          let currentThumbUrl = camp.thumbUrl;
          if (!currentThumbUrl) {
            currentThumbUrl = post.thumbnail_url || post.media_url || post.thumb_url || post.media?.[0]?.url || null;
            if (currentThumbUrl) {
              setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, thumbUrl: currentThumbUrl } : c));
            }
          }

          // Lapis 3 Konversi: Jika URL-nya masih CDN eksternal (bukan Supabase Storage), download dan simpan permanen
          if (currentThumbUrl && !currentThumbUrl.includes('/storage/v1/object/public/thumbnails/')) {
             if (!window._convertingThumbs) window._convertingThumbs = new Set();
             if (!window._convertingThumbs.has(camp.id)) {
               window._convertingThumbs.add(camp.id);
               // Lakukan secara async agar tidak mem-blok loop
               (async () => {
                 try {
                   const jpegDataUrl = await createThumbFromUrl(currentThumbUrl);
                   if (jpegDataUrl) {
                     const permUrl = await uploadThumbToStorage(camp.id, jpegDataUrl, accessToken);
                     if (permUrl) {
                        // Update DB
                        await fetch(`${SUPABASE_URL}/rest/v1/campaigns?id=eq.${camp.id}`, {
                          method: 'PATCH',
                          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ thumb_url: permUrl }),
                        });
                        // Update UI seketika
                        setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, thumbUrl: permUrl } : c));
                     }
                   }
                 } catch(e) {}
               })();
             }
          }
        }
      }
      setRetroFetchComplete(true);
    }).catch(() => {
      setLoading(false);
      setRetroFetchComplete(true);
    });
  }, [sessionId, accessToken]);

  /* ── Filter tab ── */
  const filtered = campaigns.filter(c => {
    if (activeTab === 'Terjadwal')   return c.status === 'scheduled';
    if (activeTab === 'Diarsipkan') return c.status === 'paused';
    return c.status !== 'paused'; // Semua = aktif saja
  });

  /* ── Load analytics when detail opens ── */
  const openDetail = useCallback(async (camp, silent = false) => {
    if (!silent) {
      setSelectedCamp(camp);
      setAnalytics(null);
      setLoadingAn(true);
    }

    const accounts = (() => {
      try { return JSON.parse(localStorage.getItem('radar_social_accounts') || '[]'); } catch { return []; }
    })();

    const platApiMap = { ig: 'instagram', meta: 'facebook', tiktok: 'tiktok', youtube: 'youtube' };
    const sp  = platApiMap[camp.platforms[0]] || camp.platforms[0];
    const acc = accounts.find(a => a.platform === sp);

    if (!acc?.id) { if (!silent) setLoadingAn(false); else { /* done background refresh */ } return; }

    const posts = await fetchAnalytics(acc.id, accessToken);
    const post  = matchPost(posts, camp);
    if (post) {
      console.log('[DEBUG KelolaScreen] matched post:', post);
      console.log('[DEBUG KelolaScreen] extracted metrics:', extractMetrics(post, camp.platforms[0]));
      setAnalytics(extractMetrics(post, camp.platforms[0]));

      // Retroactive thumbnail dari PostForMe feed kalau thumb_url null
      if (!camp.thumbUrl) {
        const feedThumb = post.thumbnail_url || post.media_url || post.thumb_url
          || post.media?.[0]?.url || null;
        if (feedThumb) {
          setSelectedCamp(prev => ({ ...prev, thumbUrl: feedThumb }));
        }
      }

      // Retroactive post_url dari feed kalau belum ada
      if (!camp.post_url) {
        const feedUrl = post.post_url || post.platform_url || post.permalink || post.url || null;
        if (feedUrl) {
          setSelectedCamp(prev => ({ ...prev, post_url: feedUrl }));
        }
      }
    }
    setLoadingAn(false);

    // Simpan avatar + username dari akun IG ke camp untuk ditampilkan di detail
    if (!silent) {
      setSelectedCamp(prev => ({
        ...prev,
        avatarUrl: acc.avatar_url || null,
        username:  acc.username   || null,
      }));
    }
  }, [accessToken]);

  /* ── Auto-refresh analytics for detail view every 15s ── */
  useEffect(() => {
    if (!selectedCamp) return;
    const interval = setInterval(() => {
      openDetail(selectedCamp, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedCamp, openDetail]);

  /* ── Archive — konfirmasi dulu, sama seperti desktop ── */
  const handleArchive = useCallback((camp) => {
    setArchiveTarget(camp);
  }, []);

  const confirmArchive = useCallback(async () => {
    if (!archiveTarget) return;
    const camp = archiveTarget;
    setArchiveTarget(null);
    await archiveCampaign(camp.id, sessionId, accessToken);
    setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, status: 'paused' } : c));
    setSelectedCamp(null);
  }, [archiveTarget, sessionId, accessToken]);

  const handleDetailScroll = (e) => {
    const y = e.target.scrollTop;
    if (y > lastScrollY.current && y > 50) setIsFabExpanded(false);
    else if (y < lastScrollY.current - 5) setIsFabExpanded(true);
    lastScrollY.current = y;
  };

  /* ════════ DETAIL VIEW ════════ */
  if (selectedCamp) {
    const c   = selectedCamp;
    const an  = analytics;
    const plat = c.platforms[0] || 'ig';
    const statusColor = c.status === 'running' ? '#16a34a' : c.status === 'scheduled' ? '#791ADB' : '#d97706';
    const statusLbl   = c.status === 'running' ? 'Berjalan' : c.status === 'scheduled' ? 'Terjadwal' : 'Diarsipkan';

    const MetricCard = ({ label, value, sub, accent }) => {
      const isDisabled = c.status === 'scheduled';
      return (
        <div style={{ background: isGenZ ? '#1e1e24' : '#fff', borderRadius:'16px', padding:'16px', border: isGenZ ? '1px solid #2d2d39' : '1px solid #E4E4EB', opacity: isDisabled ? 0.6 : 1 }}>
          <div style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color: isGenZ ? '#9ca3af' : 'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px' }}>{label}</div>
          <div style={{ fontFamily:'var(--m-font)', fontSize:'22px', fontWeight:'800', color: accent || (isGenZ ? '#fff' : 'var(--m-ink)'), marginBottom:'4px' }}>
            {isDisabled ? '0' : loadingAn ? '…' : (value != null ? fmtViews(value) : '—')}
          </div>
          {sub && <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color: isGenZ ? '#9ca3af' : 'var(--m-ink-sub)' }}>{sub}</div>}
        </div>
      );
    };

    return (
      <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background: isGenZ ? '#0e0e12' : '#F9F9FA', zIndex:9999, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Header */}
        <header style={{ display:'flex', alignItems:'center', padding:'16px', background: isGenZ ? '#0e0e12' : '#F9F9FA', borderBottom: isGenZ ? '1px solid #1e1e24' : 'none' }}>
          <button onClick={() => setSelectedCamp(null)} style={{ width:'40px', height:'40px', borderRadius:'50%', background: isGenZ ? '#1e1e24' : '#fff', border: isGenZ ? '1px solid #2d2d39' : '1px solid #ECECF1', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: isGenZ ? '#fff' : 'currentColor' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color: isGenZ ? '#fff' : 'var(--m-ink)', marginLeft:'12px' }}>Detail Iklan</div>
          <button
            onClick={() => handleArchive(c)}
            style={{ width:'40px', height:'40px', borderRadius:'50%', background: isGenZ ? '#1e1e24' : '#fff', border: isGenZ ? '1px solid #2d2d39' : '1px solid #ECECF1', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: isGenZ ? '#fff' : 'currentColor', marginLeft:'auto' }}
            title="Arsipkan"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </header>

        {/* Scrollable */}
        <main onScroll={handleDetailScroll} style={{ flex:1, overflowY:'auto', padding:'0 16px 100px' }}>

          {/* Campaign Card */}
          <div style={{ background: isGenZ ? '#1e1e24' : '#fff', border: isGenZ ? '1px solid #2d2d39' : '1px solid #E4E4EB', borderRadius:'20px', padding:'16px', marginBottom:'16px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'12px' }}>
              {/* Avatar akun IG — sama seperti desktop (avatar_url dari social account) */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'50%', border:'1.5px solid #E4E4EB', overflow:'hidden', background:'#F3E8FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {c.avatarUrl
                    ? <img src={c.avatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                    : <span style={{ fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'700', color:'var(--m-brand)' }}>
                        {(profile?.business_name || profile?.full_name || 'L').charAt(0).toUpperCase()}
                      </span>
                  }
                </div>
                <div style={{ position:'absolute', bottom:'-2px', right:'-2px', background:'#fff', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.12)' }}>
                  <PlatIcon plat={plat} />
                </div>
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                {/* Judul + status badge */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px', marginBottom:'2px' }}>
                  <div style={{ fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', color: isGenZ ? '#fff' : 'var(--m-ink)', lineHeight:'1.3', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{c.name}</div>
                  <div style={{ background: c.status === 'running' ? (isGenZ ? 'rgba(22, 163, 74, 0.15)' : '#E6F4EA') : c.status === 'scheduled' ? (isGenZ ? 'rgba(121, 26, 219, 0.15)' : '#F3E8FF') : (isGenZ ? 'rgba(217, 119, 6, 0.15)' : '#FEF3C7'), padding:'4px 10px', borderRadius:'999px', display:'flex', alignItems:'center', gap:'5px', flexShrink:0 }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: statusColor }} />
                    <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color: statusColor }}>{statusLbl}</span>
                  </div>
                </div>
                {/* Username akun + platform · format */}
                
                <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color: isGenZ ? '#9ca3af' : 'var(--m-ink-sub)', marginBottom:'2px' }}>
                  {c.username ? `@${c.username}` : platformLabel(c.platforms)} · {platformLabel(c.platforms)} · {(c.format || 'POST').toUpperCase()}
                </div>
                <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color: isGenZ ? '#9ca3af' : 'var(--m-ink-sub)', marginBottom:'4px' }}>
                  {c.status === 'scheduled' ? (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', color:'#791ADB', fontWeight:'700' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Tayang: {(() => {
                        const dateIso = c.scheduled_at || c.created_at;
                        if (!dateIso) return '';
                        const d = parseSafeDate(dateIso);
                        if (isNaN(d.getTime())) return '';
                        const mName = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
                        const pad = (n) => String(n).padStart(2, '0');
                        return `${d.getDate()} ${mName[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}.${pad(d.getMinutes())}`;
                      })()}
                    </span>
                  ) : (
                    c.post_url
                      ? <a href={c.post_url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'4px', textDecoration:'none' }}>
                          <span style={{ fontWeight:'700', color:'var(--m-brand)', textDecoration:'underline', textUnderlineOffset:'2px' }}>{fmtDate(c.created_at)}</span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      : <span>{fmtDate(c.created_at)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div style={{ width:'100%', aspectRatio:'16/9', borderRadius:'12px', overflow:'hidden', background: '#E5E7EB', position:'relative' }}>
              {c.thumbUrl && !mediaErrors[c.id] ? (
                isVideoUrl(c.thumbUrl) || mediaTypeFallback[c.id] ? (
                  <video
                    src={c.thumbUrl}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    muted
                    playsInline
                    autoPlay
                    loop
                    preload="auto"
                    onError={() => {
                      setMediaErrors(prev => ({ ...prev, [c.id]: true }));
                      handleMediaError(c.id);
                    }}
                  />
                ) : (
                  <img
                    src={c.thumbUrl}
                    alt=""
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={() => {
                      setMediaTypeFallback(prev => ({ ...prev, [c.id]: true }));
                    }}
                  />
                )
              ) : (c.thumbUrl && mediaErrors[c.id]) || (!c.thumbUrl && retroFetchComplete) ? (
                <div style={{ position:'absolute', inset:0, background: '#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ color:'#9ca3af', fontSize:'11px', fontWeight:'600' }}>Foto tidak tersedia</span>
                </div>
              ) : (
                <div style={{ position:'absolute', inset:0, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: '#D1D5DB' }} />
              )}
              <div style={{ position:'absolute', bottom:'10px', left:'10px', background:'rgba(0,0,0,0.5)', color:'#fff', padding:'4px 8px', borderRadius:'6px', display:'flex', alignItems:'center', gap:'4px' }}>
                {(c.hasVideo || c.format === 'reel' || c.format === 'video' || c.format === 'story')
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                  : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                }
                <span style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700' }}>{(c.format || 'POST').toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
            <MetricCard label="REACH"       value={an?.reach}       sub="Orang dijangkau"   accent="var(--m-brand)" />
            <MetricCard label="ENGAGEMENTS" value={an?.engagements} sub="Total interaksi"   accent="var(--m-brand)" />
            <MetricCard label="LIKES"       value={an?.likes}       sub="Suka / Reaksi" />
            <MetricCard label="COMMENTS"    value={an?.comments}    sub="Komentar" />
            <MetricCard label="SHARES"      value={an?.shares}      sub="Dibagikan" />
            {(c.format === 'reel' || c.format === 'video')
              ? <MetricCard label="VIEWS"   value={an?.views}       sub="Ditonton" />
              : <MetricCard label="SAVED"   value={an?.saved}       sub="Disimpan" />
            }
          </div>


          {c.status === 'scheduled' ? (
            <div style={{ background:'#F3E8FF', border:'1px solid #C084FC', borderRadius:'16px', padding:'14px 16px', marginBottom:'16px', fontFamily:'var(--m-font)', fontSize:'13px', color:'#5B21B6', lineHeight:'1.5' }}>
              📅 <strong>Postingan ini dijadwalkan tayang.</strong> Konten akan dipublikasikan secara otomatis pada waktu yang ditentukan. Metrik performa akan mulai dicatat setelah postingan tayang.
            </div>
          ) : !an && !loadingAn ? (
            <div style={{ background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:'16px', padding:'14px 16px', marginBottom:'16px', fontFamily:'var(--m-font)', fontSize:'13px', color:'#92400E', lineHeight:'1.5' }}>
              ⚠ Data engagement belum tersedia. Pastikan akun sosial media sudah terhubung di Dapur Konten.
            </div>
          ) : null}

          {/* Boost */}
          <button style={{ width:'100%', padding:'16px', borderRadius:'16px', background:'#1A1A1A', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 4px 14px rgba(26,26,26,0.2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Boost Iklan
          </button>
        </main>

        {/* FAB SiLaris */}
        {!showSiLaris && (
          <button onClick={() => setShowSiLaris(true)} style={{ position:'absolute', bottom:'24px', right:'16px', background:'var(--m-brand)', color:'#fff', borderRadius:'999px', padding: isFabExpanded ? '12px 12px 12px 20px' : '12px', display:'flex', alignItems:'center', justifyContent:'flex-end', gap: isFabExpanded ? '10px' : '0px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.15)', cursor:'pointer', zIndex:310, transition:'all 0.3s cubic-bezier(0.25,0.8,0.25,1)', overflow:'hidden', whiteSpace:'nowrap', maxWidth: isFabExpanded ? '280px' : '64px', height:'64px' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', textAlign:'right', opacity: isFabExpanded ? 1 : 0, transition:'opacity 0.2s', width: isFabExpanded ? 'auto' : '0px', overflow:'hidden' }}>
              <span style={{ fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', lineHeight:'1.2' }}>Tanya SiLaris</span>
              <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'500', opacity:0.9 }}>Performa Insight Iklanmu</span>
            </div>
            <div style={{ width:'40px', height:'40px', borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src="/logo-dashboard.png" alt="SiLaris" style={{ width:'36px', height:'36px', objectFit:'contain' }} />
            </div>
          </button>
        )}
        {showSiLaris && <SiLarisScreen onBack={() => setShowSiLaris(false)} campaign={c} analytics={an} />}
      </div>
    );
  }

  /* ════════ LIST VIEW ════════ */
  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background: isGenZ ? '#0e0e12' : 'var(--m-bg)' }}>
      {isGenZ ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: '#0e0e12', borderBottom: '1px solid #1e1e24',
          flexShrink: 0
        }}>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontFamily: 'var(--m-font, sans-serif)', fontSize: '18px', fontWeight: '800', color: '#fff' }}>
            Kelola Iklan
          </span>
          <button onClick={onAvatarClick} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#1e1e24', color: '#fff', fontWeight: 'bold', fontSize: '13px'
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (profile?.full_name || profile?.business_name || 'P').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
            )}
          </button>
        </div>
      ) : (
        <MobileHeader
          userName={profile?.full_name || profile?.business_name || 'Pengguna'}
          userInitials={(profile?.full_name || profile?.business_name || 'P').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
          isPro={profile?.selected_plan === 'pro'}
          onAvatarClick={onAvatarClick}
        />
      )}

      <main style={{ flex:1, overflowY:'auto', padding:'0 16px', paddingBottom:'calc(100px + env(safe-area-inset-bottom))' }}>

        <div style={{ padding:'24px 0 20px' }}>
          <h1 style={{ fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color: isGenZ ? '#fff' : 'var(--m-ink)', lineHeight:'1.2', marginBottom:'6px' }}>Kelola Iklan</h1>
          <p style={{ fontFamily:'var(--m-font)', fontSize:'14px', color: isGenZ ? '#9ca3af' : 'var(--m-ink-sub)', lineHeight:'1.5' }}>Pantau performa konten yang sudah terposting</p>
        </div>

        {/* Tabs */}
        <div style={{ position:'sticky', top:0, zIndex:190, background: isGenZ ? '#0e0e12' : 'var(--m-bg)', display:'flex', alignItems:'center', paddingTop:'12px', paddingBottom:'16px', margin:'0 -16px', paddingLeft:'16px', paddingRight:'16px', marginBottom:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', background: isGenZ ? '#1e1e24' : '#F5F5F7', gap:'4px', borderRadius:'999px', padding:'4px', flex:1, border: isGenZ ? '1px solid #2d2d39' : 'none' }}>
            {['Semua', 'Terjadwal', 'Diarsipkan'].map(tab => {
              const active = tab === activeTab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex:1, padding:'8px 0', borderRadius:'999px', border:'none', background: active ? 'var(--m-brand)' : 'transparent', color: active ? '#fff' : (isGenZ ? '#9ca3af' : 'var(--m-ink-sub)'), fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s' }}>
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 0', gap:'12px' }}>
            <div style={{ width:'32px', height:'32px', border:'3px solid #E5E7EB', borderTopColor:'var(--m-brand)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
            <span style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)' }}>Memuat campaign…</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 16px', textAlign:'center', gap:'12px' }}>
            <div style={{ fontSize:'40px' }}>📭</div>
            <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)' }}>Belum ada iklan</div>
            <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)', lineHeight:'1.5' }}>Buat iklan pertamamu dari Dapur Konten dan posting ke akun sosial mediamu.</div>
          </div>
        )}

        {/* Grid 2 kolom — thumbnail + reach */}
        {!loading && filtered.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'8px', paddingBottom:'24px' }}>
            {filtered.map(camp => (
              <div
                key={camp.id}
                onClick={() => openDetail(camp)}
                style={{ aspectRatio:'1/1', borderRadius:'16px', position:'relative', cursor:'pointer', overflow:'hidden', background: isGenZ ? '#1e1e24' : '#E5E7EB', border: isGenZ ? '1px solid #2d2d39' : 'none', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}
              >
                {/* Skeleton Loader */}
                {!camp.thumbUrl && !retroFetchComplete && (
                  <div style={{ position:'absolute', inset:0, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: '#D1D5DB' }} />
                )}
                {/* Media Renderer */}
                {camp.thumbUrl && !mediaErrors[camp.id] && (
                  isVideoUrl(camp.thumbUrl) || mediaTypeFallback[camp.id] ? (
                    <video
                      src={camp.thumbUrl}
                      style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                      muted
                      playsInline
                      autoPlay
                      loop
                      preload="auto"
                      onError={() => {
                        setMediaErrors(prev => ({ ...prev, [camp.id]: true }));
                        handleMediaError(camp.id);
                      }}
                    />
                  ) : (
                    <img
                      src={camp.thumbUrl}
                      alt=""
                      style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                      onError={() => {
                        setMediaTypeFallback(prev => ({ ...prev, [camp.id]: true }));
                      }}
                    />
                  )
                )}
                {/* Fallback Placeholder */}
                {((camp.thumbUrl && mediaErrors[camp.id]) || (!camp.thumbUrl && retroFetchComplete)) && (
                  <div style={{ position:'absolute', inset:0, background: '#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style={{ color:'#9ca3af', fontSize:'11px', fontWeight:'600' }}>Foto tidak tersedia</span>
                  </div>
                )}

                {/* Format badge — ikon berdasarkan file type (video/foto), label berdasarkan format */}
                <div style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.4)', borderRadius:'6px', padding:'4px 6px', display:'flex', alignItems:'center', gap:'3px' }}>
                  {(camp.hasVideo || camp.format === 'reel' || camp.format === 'video' || camp.format === 'story')
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  }
                  <span style={{ fontFamily:'var(--m-font)', fontSize:'9px', fontWeight:'800', color:'#fff' }}>{(camp.format || 'POST').toUpperCase()}</span>
                </div>

                {/* Bottom gradient */}
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'45%', background:'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))', display:'flex', alignItems:'flex-end', padding:'10px 10px 12px' }}>
                  {camp.status === 'scheduled' ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                      <span style={{
                        fontFamily:'var(--m-font)', fontSize:'8px', fontWeight:'800',
                        color:'#fff', background:'#791ADB', padding:'3px 6px',
                        borderRadius:'4px', textTransform:'uppercase', alignSelf:'flex-start',
                        display:'inline-flex', alignItems:'center', gap:'3px'
                      }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Jadwal Tayang
                      </span>
                      <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'#fff', paddingLeft:'2px' }}>
                        {camp.scheduled_at ? new Date(camp.scheduled_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      <span style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'800', color:'#fff' }}>
                        {realReach[camp.id] != null ? fmtViews(realReach[camp.id]) : '—'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      {!loading && !selectedCamp && (
        <button
          onClick={handleOpenPlatformSheet}
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--m-brand)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(121, 26, 219, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      {/* ── Platform Selection Bottom Sheet ── */}
      {showPlatformSheet && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClosePlatformSheet}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              opacity: animatePlatformSheet ? 1 : 0, transition: 'opacity 0.3s ease-out'
            }}
          />
          {/* Sheet */}
          <div
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
              background: isGenZ ? '#0e0e12' : '#fff', borderRadius: '24px 24px 0 0',
              borderTop: isGenZ ? '1px solid #1e1e24' : 'none',
              padding: '24px 16px calc(32px + env(safe-area-inset-bottom))',
              transform: animatePlatformSheet ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
              display: 'flex', flexDirection: 'column',
              maxHeight: '85vh',
            }}
          >
            <div style={{ width: '40px', height: '4px', background: isGenZ ? '#374151' : '#e5e7eb', borderRadius: '2px', margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--m-font)', fontSize: '18px', fontWeight: '800', color: isGenZ ? '#fff' : 'var(--m-ink)', marginBottom: '4px' }}>Pilih Platform Iklan</h3>
                <p style={{ fontFamily: 'var(--m-font)', fontSize: '13px', color: isGenZ ? '#9ca3af' : 'var(--m-ink-sub)' }}>Pilih platform media sosial untuk mulai membuat iklan baru</p>
              </div>
              <button onClick={handleClosePlatformSheet} style={{ width: '32px', height: '32px', borderRadius: '50%', background: isGenZ ? '#1e1e24' : '#F5F5F7', border: isGenZ ? '1px solid #2d2d39' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isGenZ ? '#fff' : 'var(--m-ink)'} strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingBottom: '16px' }}>
              {['instagram', 'facebook', 'tiktok', 'youtube'].map(platId => {
                const acc = socialAccounts.find(a => a.platform === platId);
                const isConn = !!acc;

                const config = {
                  instagram: {
                    label: 'Instagram',
                    softBg: '#FFF0F3', softBorder: '#FFD6E0',
                    badgeBg: 'linear-gradient(135deg,#f09433,#bc1888)',
                    iconBadge: (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg>
                    ),
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    )
                  },
                  facebook: {
                    label: 'Facebook',
                    softBg: '#EEF4FF', softBorder: '#C9DDFF',
                    badgeBg: '#1877F2',
                    iconBadge: (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M13.5 8h2V5.5h-2C11.57 5.5 10 7.07 10 9v1.5H8V13h2v7h3v-7h2l.5-2.5H13V9c0-.28.22-.5.5-.5z" fill="white"/></svg>
                    ),
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="#1877F2" /></svg>
                    )
                  },
                  tiktok: {
                    label: 'TikTok',
                    softBg: '#F5F5F5', softBorder: '#E0E0E0',
                    badgeBg: '#0E0E12',
                    iconBadge: (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M16 8c.55.73 1.4 1.2 2.35 1.25v2.1a4.55 4.55 0 01-2.35-.65v5.8a4.1 4.1 0 11-4.1-4.1h.27v2.1H12a2 2 0 102 2V8z" fill="white"/></svg>
                    ),
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000"><path d="M12.53.02C13.84 0 15 1 15 2.3c.02 2.3 1.5 3.3 3.5 3.3v3c-1.3-.1-2.5-.7-3.3-1.6v8.4c.1 4.5-4.4 7-8.2 4.4C3 16.6 3.6 11 8.2 11.1v3.2c-2.4 0-3.3 2-2.3 3.4 1 1.4 3.7.8 3.5-1.9V0h3.1z" /></svg>
                    )
                  },
                  youtube: {
                    label: 'YouTube',
                    softBg: '#FFF2F2', softBorder: '#FFD0D0',
                    badgeBg: '#FF0000',
                    iconBadge: (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z" fill="white"/><path d="M9.5 8.5l4 2.5-4 2.5V8.5z" fill="#FF0000"/></svg>
                    ),
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    )
                  }
                }[platId];

                return (
                  <div
                    key={platId}
                    onClick={() => {
                      handleClosePlatformSheet();
                      if (onNavigateToDapur) {
                        onNavigateToDapur(platId);
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', borderRadius: '16px',
                      background: isConn ? (isGenZ ? '#1e1e24' : '#fff') : (isGenZ ? '#141418' : '#FAF9FC'),
                      border: isConn ? (isGenZ ? '1.5px solid #16A34A' : '1.5px solid #D1FAE5') : (isGenZ ? '1.5px solid #2d2d39' : '1.5px solid #EBEBF0'),
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      opacity: isConn ? 1 : 0.65,
                    }}
                  >
                    {isConn ? (
                      <div style={{position:'relative',width:'44px',height:'44px',flexShrink:0}}>
                        {acc.avatar_url ? (
                          <img src={acc.avatar_url} alt={acc.username || config.label}
                            style={{width:'44px',height:'44px',borderRadius:'12px',objectFit:'cover'}}
                            onError={e => { e.target.style.display='none'; }}
                          />
                        ) : (
                          <div style={{width:'44px',height:'44px',borderRadius:'12px',background:config.badgeBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <span style={{color:'#fff',fontFamily:'var(--m-font)',fontSize:'16px',fontWeight:'700'}}>
                              {(acc.username || config.label).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div style={{position:'absolute',bottom:'-3px',right:'-3px',width:'18px',height:'18px',borderRadius:'50%',background:config.badgeBg,border: isGenZ ? '2px solid #1e1e24' : '2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {config.iconBadge}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: config.softBg, border: `1px solid ${config.softBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {config.icon}
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '700', color: isGenZ ? '#fff' : 'var(--m-ink)' }}>
                        {config.label} {isConn && acc.username ? `(@${acc.username})` : ''}
                      </div>
                      <div style={{ fontFamily: 'var(--m-font)', fontSize: '11px', color: isGenZ ? '#9ca3af' : 'var(--m-ink-sub)' }}>
                        {isConn ? 'Terhubung & Siap Posting' : 'Belum Terhubung'}
                      </div>
                    </div>

                    {!isConn && (
                      <span style={{ fontFamily: 'var(--m-font)', fontSize: '11px', fontWeight: '700', color: 'var(--m-brand)' }}>Hubungkan →</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Archive Confirm Modal — sama seperti desktop deleteConfirmOverlay ── */}
      {archiveTarget && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setArchiveTarget(null); }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', backdropFilter:'blur(4px)' }}
        >
          <div style={{ background:'#fff', borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'340px', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'700', color:'#111827' }}>Arsipkan Campaign?</div>
                <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'#6B7280', marginTop:'2px' }}>Iklan akan dipindahkan ke tab Diarsipkan</div>
              </div>
            </div>

            {/* Campaign name */}
            <div style={{ background:'#F9FAFB', borderRadius:'10px', padding:'12px 14px', marginBottom:'14px' }}>
              <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{archiveTarget.name}</div>
              <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'#6B7280', marginTop:'3px' }}>{platformLabel(archiveTarget.platforms)}</div>
            </div>

            {/* Warning */}
            <div style={{ background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:'10px', padding:'12px 14px', marginBottom:'20px', fontFamily:'var(--m-font)', fontSize:'12px', color:'#92400E', lineHeight:'1.6' }}>
              ⚠️ <strong>Postingan di {platformLabel(archiveTarget.platforms)} TIDAK akan terhapus.</strong> Kamu perlu hapus manual di masing-masing platform.
            </div>

            {/* Buttons */}
            <div style={{ display:'flex', gap:'10px' }}>
              <button
                onClick={() => setArchiveTarget(null)}
                style={{ flex:1, padding:'11px', borderRadius:'12px', border:'1.5px solid #E5E7EB', background:'#fff', color:'#374151', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}
              >
                Batal
              </button>
              <button
                onClick={confirmArchive}
                style={{ flex:1, padding:'11px', borderRadius:'12px', border:'none', background:'#6B7280', color:'#fff', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}
              >
                Arsipkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

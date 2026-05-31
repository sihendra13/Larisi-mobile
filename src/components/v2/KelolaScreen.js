'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import SiLarisScreen from './SiLarisScreen';
import MobileHeader from '@/components/layout/MobileHeader';
import { SUPABASE_URL, SUPABASE_ANON_KEY, fmtViews } from '@/lib/config';

/* ─── Helpers ─── */
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function platformLabel(platforms) {
  if (!platforms || !platforms.length) return 'IG';
  const map = { ig: 'IG', instagram: 'IG', meta: 'FB', facebook: 'FB', tiktok: 'TikTok', youtube: 'YT' };
  return platforms.map(p => map[p] || p.toUpperCase()).join(', ');
}

/* ─── Fetch campaigns dari Supabase ─── */
// Sama seperti desktop: query by session_id dengan anon key (session_id = access control)
async function fetchCampaigns(sessionId, accessToken) {
  const sid = sessionId || localStorage.getItem('radar_session_id');
  if (!sid && !accessToken) return [];

  try {
    // Primary: session_id + anon key (sama seperti desktop getCampaigns)
    if (sid) {
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/campaigns?session_id=eq.${sid}&order=created_at.desc&limit=20`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      if (resp.ok) {
        const rows = await resp.json();
        if (rows.length > 0) return rows;
      }
    }

    // Fallback: user JWT + user_id (untuk campaign yang disimpan dengan auth)
    if (accessToken) {
      let uid = null;
      try { uid = JSON.parse(atob(accessToken.split('.')[1]))?.sub || null; } catch {}
      if (uid) {
        const resp2 = await fetch(
          `${SUPABASE_URL}/rest/v1/campaigns?user_id=eq.${uid}&order=created_at.desc&limit=20`,
          { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` } }
        );
        if (resp2.ok) return await resp2.json();
      }
    }
    return [];
  } catch { return []; }
}

/* ─── Archive campaign di Supabase ─── */
async function archiveCampaign(campaignId, sessionId, accessToken) {
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/campaigns?id=eq.${campaignId}&session_id=eq.${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paused' }),
      }
    );
  } catch {}
}

/* ─── Fetch analytics dari PostForMe via proxy ─── */
async function fetchAnalytics(socialAccountId, accessToken) {
  if (!socialAccountId || !accessToken) return [];
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/functions/v1/postforme-proxy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/v1/social-account-feeds/${socialAccountId}?expand=metrics&limit=50`,
          method: 'GET',
        }),
      }
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    return data?.posts || data?.data || data?.items || data?.feeds || data?.results || data?.feed || (Array.isArray(data) ? data : []);
  } catch { return []; }
}

/* ─── Extract metrics dari satu post ─── */
function extractMetrics(post, platform) {
  const m = post?.metrics || {};
  const plat = (platform || '').toLowerCase();

  const _rbt = (m.reactions_by_type && typeof m.reactions_by_type === 'object') ? m.reactions_by_type : {};
  let likes = 0;
  if (plat === 'meta') {
    likes = parseInt(m.reactions_total ?? m.reactions_like ?? _rbt.like ?? m.like_count ?? m.reactions ?? 0) || 0;
  } else {
    likes = parseInt(_rbt.like ?? m.like_count ?? m.likes ?? m.reactions_total ?? m.favorite_count ?? 0) || 0;
  }
  const comments = parseInt(m.comments || m.comment_count || m.reply_count || 0) || 0;
  const shares   = parseInt(m.shares || m.share_count || m.retweet_count || 0) || 0;
  const views    = parseInt(m.video_views || m.video_views_unique || m.view_count || m.views || m.play_count || m.impressions || 0) || 0;
  const saved    = parseInt(m.saved || 0) || 0;

  let reach = 0;
  if (plat === 'meta') {
    const or = parseInt(m.organic_reach || 0) || 0;
    const pr = parseInt(m.paid_reach    || 0) || 0;
    const vr = parseInt(m.viral_reach   || 0) || 0;
    const fr = parseInt(m.fan_reach     || 0) || 0;
    reach = (or + pr + vr + fr) || parseInt(m.reach || m.total_reach || 0) || 0;
  } else {
    reach = parseInt(m.reach || m.organic_reach || m.total_reach || 0) || 0;
  }

  const engagements = likes + comments + shares;
  return { likes, comments, shares, views, saved, reach, engagements };
}

/* ─── Match post dari feed ke campaign ─── */
function matchPost(posts, campaign) {
  if (!posts.length) return null;
  // Exact match via platform_post_id
  if (campaign.platform_post_id) {
    const exact = posts.find(p => p.platform_post_id === campaign.platform_post_id);
    if (exact) return exact;
  }
  // Temporal match ±15 menit
  if (campaign.created_at) {
    const campTime = new Date(campaign.created_at).getTime();
    let best = null, bestDiff = Infinity;
    for (const p of posts) {
      const t = new Date(p.posted_at || p.published_at || p.created_at || p.scheduled_at || 0).getTime();
      if (!t) continue;
      const diff = Math.abs(campTime - t);
      if (diff < bestDiff) { bestDiff = diff; best = p; }
    }
    if (best && bestDiff <= 15 * 60 * 1000) return best;
  }
  return null;
}

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
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
}

/* ════════════════════════════════════════
   Main Component
   ════════════════════════════════════════ */
export default function KelolaScreen({ sessionId, accessToken, profile, onAvatarClick }) {
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
  const lastScrollY = useRef(0);

  /* ── Load campaigns on mount, lalu fetch real reach dari PostForMe ── */
  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    fetchCampaigns(sessionId, accessToken).then(async rows => {
      const platMap = { instagram: 'ig', facebook: 'meta' };
      const mapped = rows.map(r => ({
        id:               r.id,
        name:             r.nama_campaign || 'Campaign',
        status:           r.status === 'active' ? 'running' : (r.status || 'running'),
        platforms:        (r.platforms || []).map(p => platMap[p] || p),
        format:           r.format || 'post',
        thumbUrl:         r.thumb_url || null,
        hasVideo:         r.has_video || false,
        thumbColor:       '#791ADB',
        reachTarget:      r.estimated_reach_max || 10000,
        created_at:       r.created_at || null,
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
          // Retroactive thumbnail dari PostForMe feed
          if (!camp.thumbUrl) {
            const feedThumb = post.thumbnail_url || post.media_url || post.thumb_url
              || post.media?.[0]?.url || null;
            if (feedThumb) {
              setCampaigns(prev => prev.map(c =>
                c.id === camp.id ? { ...c, thumbUrl: feedThumb } : c
              ));
            }
          }
        }
      }
    });
  }, [sessionId, accessToken]);

  /* ── Filter tab ── */
  const filtered = campaigns.filter(c => {
    if (activeTab === 'Berjalan')   return c.status === 'running';
    if (activeTab === 'Diarsipkan') return c.status === 'paused';
    return c.status !== 'paused'; // Semua = aktif saja
  });

  /* ── Load analytics when detail opens ── */
  const openDetail = useCallback(async (camp) => {
    setSelectedCamp(camp);
    setAnalytics(null);
    setLoadingAn(true);

    const accounts = (() => {
      try { return JSON.parse(localStorage.getItem('radar_social_accounts') || '[]'); } catch { return []; }
    })();

    const platApiMap = { ig: 'instagram', meta: 'facebook', tiktok: 'tiktok', youtube: 'youtube' };
    const sp  = platApiMap[camp.platforms[0]] || camp.platforms[0];
    const acc = accounts.find(a => a.platform === sp);

    if (!acc?.id) { setLoadingAn(false); return; }

    const posts = await fetchAnalytics(acc.id, accessToken);
    const post  = matchPost(posts, camp);
    if (post) {
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
    setSelectedCamp(prev => ({
      ...prev,
      avatarUrl: acc.avatar_url || null,
      username:  acc.username   || null,
    }));
  }, [accessToken]);

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
    const statusColor = c.status === 'running' ? '#16a34a' : '#d97706';
    const statusLbl   = c.status === 'running' ? 'Berjalan' : 'Diarsipkan';

    const MetricCard = ({ label, value, sub, accent }) => (
      <div style={{ background:'#fff', borderRadius:'16px', padding:'16px', border:'1px solid #E4E4EB' }}>
        <div style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px' }}>{label}</div>
        <div style={{ fontFamily:'var(--m-font)', fontSize:'22px', fontWeight:'800', color: accent || 'var(--m-ink)', marginBottom:'4px' }}>
          {loadingAn ? '…' : (value != null ? fmtViews(value) : '—')}
        </div>
        {sub && <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)' }}>{sub}</div>}
      </div>
    );

    return (
      <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'#F9F9FA', zIndex:9999, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Header */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:'#F9F9FA' }}>
          <button onClick={() => setSelectedCamp(null)} style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#fff', border:'1px solid #ECECF1', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)' }}>Detail Iklan</div>
          <button
            onClick={() => handleArchive(c)}
            style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#fff', border:'1px solid #ECECF1', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}
            title="Arsipkan"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </header>

        {/* Scrollable */}
        <main onScroll={handleDetailScroll} style={{ flex:1, overflowY:'auto', padding:'0 16px 100px' }}>

          {/* Campaign Card */}
          <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'16px', marginBottom:'16px' }}>
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
                  <div style={{ fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', color:'var(--m-ink)', lineHeight:'1.3', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{c.name}</div>
                  <div style={{ background: c.status === 'running' ? '#E6F4EA' : '#FEF3C7', padding:'4px 10px', borderRadius:'999px', display:'flex', alignItems:'center', gap:'5px', flexShrink:0 }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: statusColor }} />
                    <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color: statusColor }}>{statusLbl}</span>
                  </div>
                </div>
                {/* Username akun + platform · format */}
                <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'2px' }}>
                  {c.username ? `@${c.username}` : platformLabel(c.platforms)}
                </div>
                <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'4px' }}>
                  {platformLabel(c.platforms)} · {c.format?.toUpperCase() || 'POST'}
                </div>
                {/* Timestamp — link ke postingan kalau ada post_url */}
                {c.post_url
                  ? <a href={c.post_url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'4px', textDecoration:'none' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      <span style={{ fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-brand)', textDecoration:'underline', textUnderlineOffset:'2px' }}>{fmtDate(c.created_at)}</span>
                    </a>
                  : <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>{fmtDate(c.created_at)}</div>
                }
              </div>
            </div>

            {/* Thumbnail */}
            <div style={{ width:'100%', aspectRatio:'16/9', borderRadius:'12px', overflow:'hidden', background: c.thumbColor || '#791ADB', position:'relative' }}>
              {c.thumbUrl
                ? <img src={c.thumbUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                : <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />
              }
              <div style={{ position:'absolute', bottom:'10px', left:'10px', background:'rgba(0,0,0,0.5)', color:'#fff', padding:'4px 8px', borderRadius:'6px', display:'flex', alignItems:'center', gap:'4px' }}>
                {c.hasVideo && <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>}
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

          {/* Estimasi reach dari campaign */}
          <div style={{ background:'#fff', borderRadius:'20px', padding:'20px', border:'1px solid #E4E4EB', marginBottom:'16px' }}>
            <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'12px' }}>Estimasi Reach Campaign</div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
              <span style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>Target</span>
              <span style={{ fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-ink)' }}>{fmtViews(c.reachTarget)}</span>
            </div>
            <div style={{ width:'100%', height:'6px', background:'#F3F3F6', borderRadius:'999px', overflow:'hidden' }}>
              <div style={{ height:'100%', width: `${Math.min(100, Math.round(((an?.reach || c.reach) / (c.reachTarget || 1)) * 100))}%`, background:'var(--m-brand)', borderRadius:'999px', transition:'width 0.4s' }} />
            </div>
          </div>

          {!an && !loadingAn && (
            <div style={{ background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:'16px', padding:'14px 16px', marginBottom:'16px', fontFamily:'var(--m-font)', fontSize:'13px', color:'#92400E', lineHeight:'1.5' }}>
              ⚠ Data engagement belum tersedia. Pastikan akun sosial media sudah terhubung di Dapur Konten.
            </div>
          )}

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
        {showSiLaris && <SiLarisScreen onBack={() => setShowSiLaris(false)} />}
      </div>
    );
  }

  /* ════════ LIST VIEW ════════ */
  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)' }}>
      <MobileHeader
        userName={profile?.full_name || profile?.business_name || 'Pengguna'}
        userInitials={(profile?.full_name || profile?.business_name || 'P').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
        isPro={profile?.selected_plan === 'pro'}
        onAvatarClick={onAvatarClick}
      />

      <main style={{ flex:1, overflowY:'auto', padding:'0 16px', paddingBottom:'calc(100px + env(safe-area-inset-bottom))' }}>

        <div style={{ padding:'24px 0 20px' }}>
          <h1 style={{ fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', lineHeight:'1.2', marginBottom:'6px' }}>Kelola Iklan</h1>
          <p style={{ fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)', lineHeight:'1.5' }}>Pantau performa konten yang sudah terposting</p>
        </div>

        {/* Tabs */}
        <div style={{ position:'sticky', top:0, zIndex:190, background:'var(--m-bg)', display:'flex', alignItems:'center', paddingTop:'12px', paddingBottom:'16px', margin:'0 -16px', paddingLeft:'16px', paddingRight:'16px', marginBottom:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', background:'#F5F5F7', gap:'4px', borderRadius:'999px', padding:'4px', flex:1 }}>
            {['Semua', 'Berjalan', 'Diarsipkan'].map(tab => {
              const active = tab === activeTab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex:1, padding:'8px 0', borderRadius:'999px', border:'none', background: active ? 'var(--m-brand)' : 'transparent', color: active ? '#fff' : 'var(--m-ink-sub)', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s' }}>
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
                style={{ aspectRatio:'1/1', borderRadius:'16px', position:'relative', cursor:'pointer', overflow:'hidden', background: camp.thumbColor || '#791ADB', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}
              >
                {/* Thumbnail image */}
                {camp.thumbUrl && (
                  <img src={camp.thumbUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                )}

                {/* Format badge — ikon berdasarkan file type (video/foto), label berdasarkan format */}
                <div style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.4)', borderRadius:'6px', padding:'4px 6px', display:'flex', alignItems:'center', gap:'3px' }}>
                  {camp.hasVideo
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  }
                  <span style={{ fontFamily:'var(--m-font)', fontSize:'9px', fontWeight:'800', color:'#fff' }}>{(camp.format || 'POST').toUpperCase()}</span>
                </div>

                {/* Bottom gradient — real reach dari PostForMe, '—' kalau belum ada */}
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', background:'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))', display:'flex', alignItems:'flex-end', padding:'10px 10px 12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'800', color:'#fff' }}>
                      {realReach[camp.id] != null ? fmtViews(realReach[camp.id]) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Buat Iklan Baru */}
        {!loading && (
          <div style={{ paddingBottom:'24px', marginTop: filtered.length === 0 ? '0' : '-8px' }}>
            <button style={{ width:'100%', padding:'16px', borderRadius:'16px', background:'#202434', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 4px 14px rgba(32,36,52,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
              Buat Iklan Baru
            </button>
          </div>
        )}
      </main>

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

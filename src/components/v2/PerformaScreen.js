'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import MobileHeader from '@/components/layout/MobileHeader';
import { fetchCampaigns, fetchAnalytics, matchPost, extractMetrics } from '@/lib/campaigns';
import {
  anAggregate, anNeedsRegenerate, callSilarisAnalytics, buildAnalyticsFallback,
  anGetCache, anSetCache, anErLabel, anFmtK, anDelta, AN_PLAT, anRelTime,
  anStreak, anPostingFreq, anMilestones, anSmartCalendar, buildRekomendasiData,
  anGetMilestones, anSetMilestone, anGetStrategies, anSaveStrategy, anDeleteStrategy,
  callSilarisCompetitor, anParseFollowers, anEstCompER, anExtractHandle,
} from '@/lib/analyticsEngine';

export default function PerformaScreen({ sessionId, accessToken, profile, userId: userIdProp, onAvatarClick, onGoToDapur }) {
  // userId dari JWT (paling akurat) — fallback ke profile.id
  const authUserId = userIdProp || profile?.id || null;
  const [activeTab, setActiveTab]       = useState('Insight');
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [agg, setAgg]                   = useState(null);
  const [aiNarrative, setAiNarrative]   = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [streak, setStreak]             = useState(null);
  const [newMilestones, setNewMilestones] = useState([]);
  const [calendar, setCalendar]         = useState([]);
  const [strategies, setStrategies]     = useState([]);
  // Competitor
  const [compInput, setCompInput]       = useState('');
  const [compPlatform, setCompPlatform] = useState('ig');
  const [compResult, setCompResult]     = useState(null);
  const [compLoading, setCompLoading]   = useState(false);
  const [compSaving, setCompSaving]     = useState(false);
  const [compSaved, setCompSaved]       = useState(false);
  // Strategi tersimpan — expanded item
  const [expandedStratId, setExpandedStratId] = useState(null);
  const [stratStatus, setStratStatus]   = useState({}); // { [id]: 'baru'|'sedang'|'selesai' }
  // Boost
  const [boostCamp, setBoostCamp]       = useState(null);
  const [boostBudget, setBoostBudget]   = useState(25000);

  const tabs = ['Insight', 'Rekomendasi', 'Local Pulse', 'Strategi'];

  const loadData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const rows = await fetchCampaigns(sessionId, accessToken);
      const platMap = { instagram: 'ig', facebook: 'meta' };
      const mapped = rows.map(r => ({
        ...r,
        name: r.nama_campaign || 'Campaign',
        status: r.status === 'active' ? 'running' : (r.status || 'running'),
        platforms: (r.platforms || []).map(p => platMap[p] || p),
      }));

      const accounts = (() => {
        if (typeof window === 'undefined') return [];
        try { return JSON.parse(localStorage.getItem('radar_social_accounts') || '[]'); } catch { return []; }
      })();

      const allPosts = {};
      await Promise.all(accounts.map(async acc => {
        const posts = await fetchAnalytics(acc.id, accessToken);
        allPosts[acc.platform] = posts || [];
      }));

      const platApiMap = { ig: 'instagram', meta: 'facebook', tiktok: 'tiktok', youtube: 'youtube' };
      mapped.forEach(c => {
        const sp = platApiMap[c.platforms[0]] || c.platforms[0];
        const posts = allPosts[sp] || [];
        const post = matchPost(posts, c);
        if (post) c._engagement = extractMetrics(post, c.platforms[0]);
      });

      const aggData = anAggregate(mapped);
      setAgg(aggData);
      setStreak(anStreak(mapped));
      setCalendar(anSmartCalendar(aggData));

      // Milestone check
      const reached = anMilestones(aggData);
      if (authUserId && accessToken && reached.length) {
        const saved = await anGetMilestones(authUserId, accessToken);
        const savedKeys = new Set(saved.map(s => s.milestone_key));
        const fresh = reached.filter(m => !savedKeys.has(m.key));
        setNewMilestones(fresh);
        await Promise.all(fresh.map(m => anSetMilestone(authUserId, m.key, m.value, accessToken)));
      }

      // Strategies
      if (authUserId && accessToken) {
        const strats = await anGetStrategies(authUserId, accessToken);
        setStrategies(strats);
      }

      // AI Narrative
      const cacheUserId = authUserId || sessionId;
      let cached = null;
      if (!forceRefresh) cached = await anGetCache(cacheUserId, 'narasi');
      if (cached && !anNeedsRegenerate(aggData, cached.agg_snapshot)) {
        setAiNarrative(cached.payload);
      } else {
        const aiRes = await callSilarisAnalytics(aggData, profile);
        if (aiRes) {
          setAiNarrative(aiRes);
          await anSetCache(cacheUserId, 'narasi', aiRes, aggData, 60);
        } else {
          setAiNarrative(buildAnalyticsFallback(aggData, profile));
        }
      }

      setLastUpdated(new Date().toISOString());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [sessionId, accessToken, profile]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Competitor Analysis ──
  const handleAnalyzeCompetitor = async () => {
    const raw = compInput.trim();
    if (!raw) return;
    const handle = anExtractHandle(raw);
    setCompInput(handle);
    setCompLoading(true);
    setCompResult(null);

    // Cache localStorage 24 jam
    const cacheKey = `radar_comp_${handle}_${compPlatform}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && Date.now() - cached.ts < 86400000) {
        setCompResult(cached.result);
        setCompLoading(false);
        return;
      }
    } catch {}

    const result = await callSilarisCompetitor(handle, compPlatform, agg, profile);
    if (result) {
      // Override ER dengan benchmark
      const fc = anParseFollowers(result.comp_followers);
      result.comp_er = anEstCompER(fc, handle).toFixed(1) + '%';
      result._followerCount = fc;
      try { localStorage.setItem(cacheKey, JSON.stringify({ result, ts: Date.now() })); } catch {}
    }
    setCompResult(result);
    setCompLoading(false);
  };

  const handleSaveStrategy = async () => {
    if (!compResult) return;
    const userId = authUserId;
    if (!userId || !accessToken) return;
    setCompSaving(true);
    try {
      const ok = await anSaveStrategy(userId, {
        handle: compResult.comp_handle || compInput,
        platform: compPlatform,
        comp_result: compResult,
      }, accessToken);
      if (ok) {
        const strats = await anGetStrategies(userId, accessToken);
        setStrategies(strats);
        setCompSaved(true);
        setTimeout(() => setCompSaved(false), 3000);
      } else {
        // Fallback: tetap refresh list meski save gagal
        const strats = await anGetStrategies(userId, accessToken);
        setStrategies(strats);
      }
    } catch (e) {
      console.error('[save strategy]', e);
    } finally {
      setCompSaving(false);
    }
  };

  const handleDeleteStrategy = async (id) => {
    await anDeleteStrategy(id, accessToken);
    setStrategies(prev => prev.filter(s => s.id !== id));
  };

  // ── Boost helpers ──
  const handleBoostCopy = () => {
    if (!boostCamp) return;
    const rec = `💡 Rekomendasi Boost — Larisi\n` +
      `📱 Platform: ${(boostCamp.platforms || []).map(p => (AN_PLAT[p] || {}).name || p).join(', ')}\n` +
      `💰 Budget harian: Rp ${boostBudget.toLocaleString('id-ID')}\n` +
      `⏰ Prime time: ${agg?.bestDay || 'Kamis'}, ${String(agg?.bestHour || 19).padStart(2,'0')}:00\n` +
      `📈 Est. reach baru: ${(boostBudget / 5).toLocaleString('id-ID')}–${(boostBudget / 3).toLocaleString('id-ID')} orang`;
    navigator.clipboard?.writeText(rec).catch(() => {});
  };
  const handleBoostOpen = () => {
    handleBoostCopy();
    const plats = boostCamp?.platforms || [];
    const url = plats.includes('tiktok') && !plats.includes('meta') && !plats.includes('ig')
      ? 'https://ads.tiktok.com/i18n/creation/campaign'
      : 'https://www.facebook.com/adsmanager/creation';
    setTimeout(() => window.open(url, '_blank'), 400);
  };

  const Sk = ({ w, h, br = '8px' }) => (
    <div style={{ width: w, height: h, borderRadius: br, background: '#E5E7EB', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
  );

  // ── Local Pulse: Kondisi A/B ──
  const hasEnoughTimeData = (agg?.total || 0) >= 10 && (agg?.distinctDays || 0) >= 2;
  const activeHour  = hasEnoughTimeData ? (agg?.bestHourER || agg?.bestHour || 19) : (agg?.bestHour || 19);
  const jamSubtext  = hasEnoughTimeData
    ? 'Berdasarkan performa engagement iklan aktif kamu'
    : 'Berdasarkan jam posting iklanmu — makin akurat setelah lebih banyak iklan berjalan';

  // ── Rekomendasi data-driven ──
  const rekoData = agg ? buildRekomendasiData(agg) : null;
  const postFreq = agg ? anPostingFreq(agg) : null;

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)' }}>
      <MobileHeader
        userName={profile?.full_name || profile?.business_name || 'Pengguna'}
        userInitials={(profile?.full_name || profile?.business_name || 'P').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
        isPro={profile?.selected_plan === 'pro'}
        onAvatarClick={onAvatarClick}
      />

      <main style={{ flex:1, overflowY:'auto', padding:'0 16px', paddingBottom:'calc(80px + env(safe-area-inset-bottom))' }}>

        <div style={{ padding:'24px 0 16px' }}>
          <h1 style={{ fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', lineHeight:'1.2', marginBottom:'6px' }}>Performa Iklan</h1>
          <p style={{ fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)', lineHeight:'1.5' }}>Lihat hasil & temukan saran pintar.</p>
        </div>

        {/* Status bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: loading ? '#FBBC04' : '#34A853' }} />
            <span style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', fontWeight:'600' }}>
              {loading ? 'Memuat data...' : `Diperbarui ${anRelTime(lastUpdated)}`}
            </span>
          </div>
          <button onClick={() => loadData(true)} disabled={loading || refreshing}
            style={{ background:'none', border:'none', color:'var(--m-brand)', display:'flex', alignItems:'center', gap:'4px', fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', cursor:'pointer', opacity:(loading||refreshing)?0.5:1 }}>
            <svg style={{ transform: refreshing ? 'rotate(180deg)' : 'none', transition:'transform 0.3s' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div style={{ position:'sticky', top:0, zIndex:190, background:'var(--m-bg)', paddingTop:'12px', paddingBottom:'16px', margin:'0 -16px', paddingLeft:'16px', paddingRight:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', background:'#F5F5F7', borderRadius:'999px', padding:'4px', overflowX:'auto', scrollbarWidth:'none', gap:'4px' }}>
            {tabs.map(tab => {
              const active = tab === activeTab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'8px 16px', borderRadius:'999px', border:'none', flexShrink:0, background: active ? 'var(--m-brand)' : '#fff', color: active ? '#fff' : 'var(--m-ink-sub)', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s' }}>
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ INSIGHT TAB ══ */}
        {activeTab === 'Insight' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  {[1,2,3,4].map(i => <Sk key={i} w="100%" h="110px" br="16px" />)}
                </div>
                <Sk w="100%" h="60px" br="16px" />
                <Sk w="100%" h="250px" br="20px" />
              </div>
            ) : (
              <>
                {/* 4 KPI Cards */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid var(--m-brand)' }}>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'8px' }}>TOTAL REACH</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px' }}>{anFmtK(agg?.totalReach)}</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4' }}>Orang tahu bisnis kamu · dari {agg?.countThisMonth || agg?.total || 0} iklan</div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid #34A853' }}>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'8px' }}>IKLAN AKTIF</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px' }}>{agg?.active || 0}</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4' }}>{anDelta(agg?.reachThisMonth || 0, agg?.reachLastMonth || 0)?.text || 'Sedang berjalan'}</div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid #FBBC04' }}>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'8px' }}>PERFORMA KONTEN</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px' }}>{agg?.avgER ? `${agg.avgER.toFixed(1)}%` : '0%'}</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4' }}>{anErLabel(agg?.avgER).label}</div>
                  </div>
                  {/* Card 4: KONTEN TERBAIK (ganti INTERAKSI) */}
                  <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid #4285F4' }}>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'8px' }}>KONTEN TERBAIK</div>
                    {agg?.bestCamp ? (
                      <>
                        <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:'1.3' }}>
                          {agg.bestCamp.name}
                        </div>
                        <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)' }}>
                          {agg.bestER > 0 ? `ER ${agg.bestER.toFixed(1)}%` : 'Engagement tertinggi'}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.5' }}>Belum ada data</div>
                    )}
                  </div>
                </div>

                {/* Streak Card — selalu tampil */}
                {streak !== null && (
                  <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', overflow:'hidden' }}>
                    {/* Highlight baris atas */}
                    <div style={{ background:'#F0E6FF', padding:'12px 16px', borderBottom:'1px solid #D6BCFA' }}>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'600', color:'#5B21B6', lineHeight:'1.6' }}>
                        Algoritma Instagram, Facebook, dan TikTok secara aktif memprioritaskan akun yang posting rutin.{' '}
                        <strong style={{ color:'#4C1D95' }}>Akun yang konsisten mendapat organic reach lebih tinggi tanpa perlu iklan berbayar.</strong>
                      </div>
                    </div>
                    {/* Status personal */}
                    <div style={{ padding:'14px 16px' }}>
                      {streak.weeks > 0 && streak.thisWeek ? (
                        <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                          <span style={{ fontSize:'22px', flexShrink:0 }}>🔥</span>
                          <div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'3px' }}>
                              Kamu Aktif {streak.weeks} minggu berturut-turut!
                            </div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.4' }}>
                              Algoritma platform mengenali akunmu yang konsisten, reach organikmu akan lebih terjaga.
                              {postFreq && ` · ${postFreq.perMonth}/${postFreq.ideal}x bulan ini`}
                            </div>
                          </div>
                        </div>
                      ) : streak.weeks > 0 && !streak.thisWeek ? (
                        <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                          <span style={{ fontSize:'22px', flexShrink:0 }}>⚠️</span>
                          <div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'800', color:'#B45309', marginBottom:'3px' }}>
                              Belum posting minggu ini.
                            </div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.4' }}>
                              Posting sekarang agar algoritma terus mengenal kontenmu dan tidak skip akunmu.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.5', marginBottom:'10px' }}>
                            Posting rutin setiap minggu, algoritma akan lebih sering tampilkan iklanmu.
                          </div>
                          <button onClick={onGoToDapur}
                            style={{ padding:'10px 20px', background:'var(--m-brand)', color:'#fff', border:'none', borderRadius:'10px', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                            Mulai Sekarang →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Milestone baru */}
                {newMilestones.length > 0 && (
                  <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                      <span style={{ fontSize:'18px' }}>🏆</span>
                      <div>
                        <div style={{ fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)' }}>Pencapaian Baru!</div>
                        <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)' }}>Kamu baru saja mencapai ini</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      {newMilestones.map(m => (
                        <div key={m.key} style={{ background:'#F9F9FA', borderRadius:'12px', padding:'14px 16px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                          <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#F0E6FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'18px' }}>
                            {m.label.match(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{27FF}]/u)?.[0] || '🎯'}
                          </div>
                          <div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'3px' }}>
                              {m.label.replace(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{27FF}]/gu, '').trim()}
                            </div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.4' }}>{m.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SiLaris AI Card */}
                {aiNarrative && (
                  <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px', marginTop:'4px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'var(--m-brand)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                        <img src="/logo-dashboard.png" alt="SiLaris" style={{ width:'24px', height:'24px', objectFit:'contain' }} />
                      </div>
                      <div>
                        <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-brand)' }}>SiLaris</div>
                        <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>AI Social Media Analysis</div>
                      </div>
                    </div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.6', marginBottom:'12px' }}>{aiNarrative.narasi_p1}</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.6', marginBottom:'12px' }}>{aiNarrative.narasi_p2}</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)', lineHeight:'1.6', marginBottom:'12px' }}>{aiNarrative.narasi_p3}</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'#999', fontStyle:'italic', marginBottom:'16px' }}>{aiNarrative.narasi_footer}</div>
                    <div style={{ background:'#FFF9E6', borderRadius:'12px', padding:'16px', border:'1px solid #FFE082', marginBottom:'12px' }}>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'#B27A00', letterSpacing:'0.5px', marginBottom:'8px' }}>💡 ARTINYA UNTUK BISNISMU</div>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5' }}>{aiNarrative.clue_potensi}</div>
                    </div>
                    <div style={{ background:'#F0E6FF', borderRadius:'12px', padding:'16px', border:'1px solid #D6BCFA' }}>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-brand)', letterSpacing:'0.5px', marginBottom:'8px' }}>🎯 YANG BISA DILAKUKAN SEKARANG</div>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5' }}>{aiNarrative.clue_todo}</div>
                    </div>
                    {/* Boost CTA kalau ada bestCamp */}
                    {agg?.bestCamp && (
                      <button onClick={() => { setBoostCamp(agg.bestCamp); setBoostBudget(25000); }}
                        style={{ width:'100%', marginTop:'16px', padding:'14px', borderRadius:'12px', background:'#1A1A1A', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                        🚀 Boost {agg.bestCamp.name} →
                      </button>
                    )}
                  </div>
                )}

                {/* Mood Audiens */}
                {agg?.hasMoodData && (
                  <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                      <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#F4F4F7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:'16px' }}>☺</span>
                      </div>
                      <div>
                        <div style={{ fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)' }}>Mood Audiens</div>
                        <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>{aiNarrative?.mood_insight || 'Reaksi audiens terhadap iklanmu'}</div>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                      {agg.moodData.map((m, idx) => {
                        const pct = agg.totalReact > 0 ? Math.round((m.count / agg.totalReact) * 100) : 0;
                        return (
                          <div key={idx} style={{ background:'#F9F9FA', borderRadius:'12px', padding:'12px', textAlign:'center' }}>
                            <div style={{ fontSize:'20px', marginBottom:'4px' }}>{m.emoji}</div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)' }}>{pct}%</div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)' }}>{m.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Platform Terkuat */}
                {agg?.platList?.length > 0 && (
                  <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                      <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#F4F4F7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)' }}>Platform Terkuat</div>
                        <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>{aiNarrative?.platform_insight || 'Engagement per platform'}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      {agg.platList.map((p, idx) => {
                        const platInfo = AN_PLAT[p.key] || { name: p.key, color: '#666' };
                        return (
                          <div key={idx} style={{ background:'#F9F9FA', borderRadius:'12px', padding:'12px', display:'flex', alignItems:'center', gap:'12px' }}>
                            <div style={{ color: platInfo.color, fontWeight:'800', fontFamily:'var(--m-font)', fontSize:'13px' }}>{platInfo.name}</div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-brand)', background:'#F0E6FF', padding:'4px 8px', borderRadius:'6px' }}>ER {p.avgER.toFixed(1)}%</div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)' }}>{p.count} iklan</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ REKOMENDASI TAB ══ */}
        {activeTab === 'Rekomendasi' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <Sk w="100%" h="250px" br="20px" />
                <Sk w="100%" h="120px" br="20px" />
              </div>
            ) : rekoData ? (
              <>
                <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#FFF0F5', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:'16px' }}>🎯</span>
                    </div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)' }}>Rekomendasi Minggu Ini</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
                    {rekoData.map((r, idx) => {
                      const platInfo = r.platform === 'all' ? { name: 'Semua Platform', color: '#666' } : (AN_PLAT[r.platform] || { name: r.platform, color: '#666' });
                      return (
                        <div key={idx} style={{ background:'#F9F9FA', borderRadius:'12px', padding:'16px' }}>
                          <div style={{ display:'flex', gap:'12px' }}>
                            <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#1A1A1A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', flexShrink:0 }}>{idx + 1}</div>
                            <div>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap' }}>
                                <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color: platInfo.color }}>{platInfo.name}</span>
                                {r.hari && <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)' }}>{r.hari}{r.jam ? `, ${r.jam}` : ''}</span>}
                              </div>
                              <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5', fontWeight:'700' }}>{r.aksi}</div>
                              <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.5', marginTop:'4px' }}>{r.alasan}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => {}} style={{ width:'100%', padding:'14px', borderRadius:'12px', background:'#1A1A1A', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                    🚀 Buat Iklan Sekarang →
                  </button>
                </div>

                {/* Konsistensi nudge */}
                {postFreq && (
                  <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px' }}>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-ink)', marginBottom:'8px' }}>📊 Frekuensi Posting</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ flex:1, height:'6px', borderRadius:'999px', background:'#E4E4EB', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:'999px', background:'var(--m-brand)', width: `${Math.min(100, Math.round(postFreq.perMonth / postFreq.ideal * 100))}%`, transition:'width 0.5s' }} />
                      </div>
                      <span style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', flexShrink:0 }}>{postFreq.perMonth}/{postFreq.ideal}x</span>
                    </div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', marginTop:'6px' }}>
                      Ideal {(AN_PLAT[postFreq.platform] || {}).name || postFreq.platform}: {postFreq.ideal}x/bulan
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'32px', textAlign:'center' }}>
                <div style={{ fontSize:'32px', marginBottom:'12px' }}>📊</div>
                <div style={{ fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'8px' }}>Butuh minimal 5 iklan</div>
                <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)', lineHeight:'1.5' }}>
                  Tambah lebih banyak iklan lewat Dapur Konten dan data akan dianalisis otomatis.
                </div>
                <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginTop:'8px', opacity:0.7 }}>
                  Saat ini: {agg?.total || 0} dari 5 iklan
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ LOCAL PULSE TAB ══ */}
        {activeTab === 'Local Pulse' && (
          <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#F0E6FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <div style={{ fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)' }}>Local Pulse</div>
                  <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)' }}>Pola lokal terbaik</div>
                </div>
              </div>
              <div style={{ background:'#F0E6FF', padding:'6px 10px', borderRadius:'999px' }}>
                <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-brand)', letterSpacing:'0.5px' }}>LOKAL</span>
              </div>
            </div>

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[1,2,3,4].map(i => <Sk key={i} w="100%" h="80px" br="16px" />)}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {/* Jam Terbaik — Kondisi A/B */}
                <div style={{ background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px' }}>JAM TERBAIK POSTING</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px' }}>
                      {String(activeHour).padStart(2,'0')}:00 – {String((activeHour + 2) % 24).padStart(2,'0')}:00
                    </div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.4' }}>{jamSubtext}</div>
                  </div>
                </div>

                {/* Hari Terkuat */}
                <div style={{ background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px' }}>HARI TERKUAT</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px' }}>{agg?.bestDay || 'Minggu'}</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>Hari dengan aktivitas iklan tertinggi</div>
                  </div>
                </div>

                {/* Smart Calendar */}
                {calendar.length > 0 && (
                  <div style={{ background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:'16px' }}>📅</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'8px' }}>JADWAL POSTING MINGGU INI</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                        {calendar.map((slot, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <span style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight: slot.isBestDay ? '800' : '600', color:'var(--m-ink)', minWidth:'120px' }}>{slot.label}</span>
                            <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-brand)', background:'#F0E6FF', padding:'2px 8px', borderRadius:'999px', flexShrink:0 }}>{slot.jam}</span>
                            <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', flexShrink:0 }}>{(AN_PLAT[slot.platform] || {}).name || slot.platform}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stitch insight */}
                {aiNarrative?.stitch_insight && (
                  <div style={{ background:'#FFF9E6', borderRadius:'12px', padding:'16px', border:'1px solid #FFE082' }}>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'#B27A00', lineHeight:'1.5' }}>
                      <span style={{ fontWeight:'700' }}>💡 Insights: </span>{aiNarrative.stitch_insight}
                    </div>
                  </div>
                )}

                {/* Format Terbaik */}
                <div style={{ background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px' }}>FORMAT TERBAIK</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px' }}>{agg?.topFormat || 'Foto / Video'}</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>Format dominan dari iklan aktif</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ STRATEGI TAB ══ */}
        {activeTab === 'Strategi' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

            {/* Competitor Analysis */}
            <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#F0E6FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)' }}>Competitor Analysis</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>Analisa pesaing instan</div>
                  </div>
                </div>
                <div style={{ background:'#E6F4EA', padding:'4px 8px', borderRadius:'999px' }}>
                  <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'#34A853', letterSpacing:'0.5px' }}>GRATIS</span>
                </div>
              </div>

              {/* Platform tabs */}
              <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
                {[['ig','Instagram'],['meta','Facebook'],['tiktok','TikTok']].map(([key, label]) => (
                  <button key={key} onClick={() => { setCompPlatform(key); setCompResult(null); }}
                    style={{ flex:1, padding:'10px', background: compPlatform === key ? '#1A1A1A' : 'transparent', border:'none', borderRadius:'999px', fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color: compPlatform === key ? '#fff' : 'var(--m-ink-sub)', cursor:'pointer', transition:'all 0.2s' }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
                <input type="text" value={compInput} onChange={e => setCompInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !compLoading && handleAnalyzeCompetitor()}
                  placeholder="Paste link atau @handle pesaing..."
                  style={{ flex:1, padding:'12px 16px', background:'#F5F5F7', border:'none', borderRadius:'12px', outline:'none', fontFamily:'var(--m-font)', fontSize:'13px' }} />
                <button onClick={handleAnalyzeCompetitor} disabled={compLoading || !compInput.trim()}
                  style={{ padding:'12px 20px', background:'#1A1A1A', color:'#fff', border:'none', borderRadius:'12px', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer', opacity: compLoading || !compInput.trim() ? 0.6 : 1, display:'flex', alignItems:'center', gap:'6px' }}>
                  {compLoading ? (
                    <><div style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Analisa</>
                  ) : 'Analisa →'}
                </button>
              </div>

              {/* Comp Result */}
              {compResult && (
                <div style={{ background:'#F9F9FA', borderRadius:'16px', padding:'16px', marginBottom:'16px' }}>
                  <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'12px', fontStyle:'italic' }}>
                    Profil estimatif AI · bukan data dashboard pesaing
                  </div>
                  {/* Compare grid */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
                    <div style={{ background:'#fff', borderRadius:'12px', padding:'12px' }}>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', marginBottom:'6px' }}>KAMU</div>
                      {agg?.avgER && <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-brand)', marginBottom:'4px' }}>ER {agg.avgER.toFixed(1)}%</div>}
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>{agg?.active || 0} iklan aktif</div>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>Reach {anFmtK(agg?.totalReach || 0)}</div>
                    </div>
                    <div style={{ background:'#fff', borderRadius:'12px', padding:'12px' }}>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', marginBottom:'6px' }}>PESAING · {compResult.comp_handle || compInput}</div>
                      {compResult.comp_er && <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'#E1306C', marginBottom:'4px' }}>Est. ER {compResult.comp_er}</div>}
                      {compResult.comp_followers && <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>{compResult.comp_followers} followers</div>}
                      {compResult.comp_freq && <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>{compResult.comp_freq}</div>}
                      {compResult.comp_format && <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>{compResult.comp_format}</div>}
                    </div>
                  </div>
                  {/* Insights */}
                  {compResult.insights?.map((ins, i) => (
                    <div key={i} style={{ background:'#F9F9FA', borderRadius:'12px', padding:'12px 14px', marginBottom:'6px', display:'flex', gap:'8px', alignItems:'flex-start' }}>
                      <span style={{ fontSize:'12px', flexShrink:0, marginTop:'1px' }}>
                        {ins.type === 'green' ? '💡' : ins.type === 'amber' ? '⚠️' : '🔍'}
                      </span>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink)', lineHeight:'1.5' }}>{ins.text}</div>
                    </div>
                  ))}
                  {/* Save button */}
                  <button onClick={handleSaveStrategy} disabled={compSaving || compSaved || !authUserId || !accessToken}
                    style={{ width:'100%', marginTop:'8px', padding:'12px', borderRadius:'12px', background: compSaved ? '#E6F4EA' : '#1A1A1A', border:'none', cursor: compSaved ? 'default' : 'pointer', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color: compSaved ? '#34A853' : '#fff', opacity: compSaving ? 0.6 : 1, transition:'all 0.3s' }}>
                    {compSaved ? '✓ Tersimpan!' : compSaving ? 'Menyimpan...' : '✨ Simpan Strategi Pesaing Ini'}
                  </button>
                </div>
              )}

              <div style={{ background:'#F0E6FF', borderRadius:'12px', padding:'16px' }}>
                <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5' }}>
                  ⚡ Upgrade <strong>Pro</strong> untuk analisis hingga 3 pesaing sekaligus. <a href="#" style={{ color:'var(--m-brand)', textDecoration:'none', fontWeight:'700' }}>Lihat paket →</a>
                </div>
              </div>
              <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', textAlign:'center', marginTop:'12px' }}>
                Estimasi berdasarkan data publik · bukan dashboard pesaing
              </div>
            </div>

            {/* Boost Card — hanya jika ada bestCamp */}
            {agg?.bestCamp && (
              <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#F0E6FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:'20px' }}>🚀</span>
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)' }}>Boost Iklan Terbaik</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'180px' }}>{agg.bestCamp.name}</div>
                  </div>
                </div>
                <div style={{ background:'#F9F9FA', borderRadius:'12px', padding:'12px', marginBottom:'16px' }}>
                  <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.6' }}>
                    Iklan dengan engagement tertinggi. Boost dengan budget kecil untuk jangkau lebih banyak orang.
                  </div>
                </div>
                <button onClick={() => { setBoostCamp(agg.bestCamp); setBoostBudget(25000); }}
                  style={{ width:'100%', padding:'14px', borderRadius:'12px', background:'#1A1A1A', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                  🚀 Boost Sekarang →
                </button>
              </div>
            )}

            {/* Strategi Tersimpan */}
            <div style={{ background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#F0E6FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)' }}>Strategi Tersimpan</div>
                      <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'var(--m-brand)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700' }}>{strategies.length}</div>
                    </div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>Analisis pesaing yang kamu simpan</div>
                  </div>
                </div>
              </div>

              {strategies.length === 0 ? (
                <div style={{ background:'#F9F9FA', borderRadius:'16px', padding:'24px', textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)', marginBottom:'8px' }}>Belum ada strategi tersimpan.</div>
                  <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', opacity:0.7 }}>Analisis pesaing di atas lalu simpan hasilnya.</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {strategies.map(s => {
                    const platInfo = AN_PLAT[s.platform] || { name: s.platform, color: '#666' };
                    const result   = s.comp_result || {};
                    const isOpen   = expandedStratId === s.id;
                    const status   = stratStatus[s.id] || 'baru';
                    const statusMap = { baru: { icon:'⚪', label:'Baru', color:'#6B7280' }, sedang: { icon:'🔵', label:'Berjalan', color:'#2563EB' }, selesai: { icon:'✅', label:'Selesai', color:'#16a34a' } };
                    const st = statusMap[status];
                    const nextStatus = { baru:'sedang', sedang:'selesai', selesai:'baru' };

                    return (
                      <div key={s.id} style={{ background:'#F9F9FA', borderRadius:'12px', overflow:'hidden', border: isOpen ? '1px solid #E4E4EB' : '1px solid transparent' }}>
                        {/* Header — tap untuk expand */}
                        <div onClick={() => setExpandedStratId(isOpen ? null : s.id)}
                          style={{ padding:'14px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-ink)', marginBottom:'2px' }}>{s.handle}</div>
                            <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color: platInfo.color }}>{platInfo.name}{result.comp_er ? ` · Est. ER ${result.comp_er}` : ''}</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setStratStatus(prev => ({ ...prev, [s.id]: nextStatus[status] })); }}
                            style={{ background: status === 'selesai' ? '#E6F4EA' : '#fff', border:'1px solid #E4E4EB', borderRadius:'999px', padding:'4px 10px', fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'600', color: st.color, cursor:'pointer', flexShrink:0 }}>
                            {st.icon} {st.label}
                          </button>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>

                        {/* Expanded content */}
                        {isOpen && (
                          <div style={{ borderTop:'1px solid #E4E4EB', padding:'14px', background:'#fff' }}>
                            {/* Insights */}
                            {result.insights?.length > 0 && (
                              <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'14px' }}>
                                {result.insights.map((ins, i) => (
                                  <div key={i} style={{ background:'#F9F9FA', borderRadius:'10px', padding:'10px 12px', display:'flex', gap:'8px', alignItems:'flex-start' }}>
                                    <span style={{ fontSize:'12px', flexShrink:0 }}>{ins.type === 'green' ? '💡' : ins.type === 'amber' ? '⚠️' : '🔍'}</span>
                                    <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink)', lineHeight:'1.5' }}>{ins.text}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Actions */}
                            <div style={{ display:'flex', gap:'8px' }}>
                              <button onClick={onGoToDapur}
                                style={{ flex:1, padding:'11px', borderRadius:'10px', background:'#1A1A1A', color:'#fff', border:'none', fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
                                🚀 Buat Iklan
                              </button>
                              <button onClick={() => handleDeleteStrategy(s.id)}
                                style={{ width:'44px', height:'44px', borderRadius:'10px', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* ══ BOOST MODAL ══ */}
      {boostCamp && (
        <div onClick={e => { if (e.target === e.currentTarget) setBoostCamp(null); }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:9999, display:'flex', alignItems:'flex-end', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:'24px', width:'100%', maxHeight:'80vh', overflowY:'auto' }}>
            {/* Handle */}
            <div style={{ width:'40px', height:'4px', borderRadius:'999px', background:'#E4E4EB', margin:'0 auto 20px' }} />
            <div style={{ fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px' }}>🚀 Boost Iklan</div>
            <div style={{ fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)', marginBottom:'20px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{boostCamp.name}</div>

            {/* Rekomendasi card */}
            <div style={{ background:'#F9F9FA', borderRadius:'12px', padding:'16px', marginBottom:'20px' }}>
              <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'12px' }}>💡 REKOMENDASI LARISI</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {[
                  ['📱', 'Platform', (boostCamp.platforms || []).map(p => (AN_PLAT[p] || {}).name || p).join(', ')],
                  ['⏰', 'Prime Time', `${agg?.bestDay || 'Kamis'}, ${String(agg?.bestHour || 19).padStart(2,'0')}:00`],
                  ['📈', 'Est. Reach Baru', `${Math.round(boostBudget/5).toLocaleString('id-ID')}–${Math.round(boostBudget/3).toLocaleString('id-ID')} orang`],
                  ['🎬', 'Format', (boostCamp.format || 'post').toUpperCase()],
                ].map(([icon, label, val]) => (
                  <div key={label} style={{ background:'#fff', borderRadius:'8px', padding:'10px' }}>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'10px', color:'#9ca3af', marginBottom:'2px' }}>{icon} {label}</div>
                    <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'600', color:'var(--m-ink)', lineHeight:'1.3' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget slider */}
            <div style={{ marginBottom:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                <span style={{ fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-ink)' }}>💰 Budget Harian</span>
                <span style={{ fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-brand)' }}>Rp {boostBudget.toLocaleString('id-ID')}</span>
              </div>
              <input type="range" min="10000" max="500000" step="5000" value={boostBudget}
                onChange={e => setBoostBudget(Number(e.target.value))}
                style={{ width:'100%', accentColor:'var(--m-brand)', height:'4px', cursor:'pointer' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--m-font)', fontSize:'10px', color:'#9ca3af', marginTop:'4px' }}>
                <span>Rp 10.000</span><span>Rp 500.000</span>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display:'flex', gap:'10px', marginBottom:'8px' }}>
              <button onClick={handleBoostCopy}
                style={{ flex:1, padding:'14px', borderRadius:'12px', border:'1.5px solid #1A1A1A', background:'#fff', color:'#1A1A1A', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                Salin Rekomendasi
              </button>
              <button onClick={handleBoostOpen}
                style={{ flex:1, padding:'14px', borderRadius:'12px', border:'none', background:'#1A1A1A', color:'#fff', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                {(boostCamp.platforms || []).includes('tiktok') && !(boostCamp.platforms || []).includes('meta') && !(boostCamp.platforms || []).includes('ig')
                  ? 'Buka TikTok Ads' : 'Buka Meta Ads'}
              </button>
            </div>
            <div style={{ fontFamily:'var(--m-font)', fontSize:'10px', color:'#9ca3af', textAlign:'center' }}>
              Form Ads Manager perlu diisi manual · Salin rekomendasi sebagai panduan
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

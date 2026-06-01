'use client';
import { useState, useEffect, useCallback } from 'react';
import MobileHeader from '@/components/layout/MobileHeader';
import { fetchCampaigns, fetchAnalytics, matchPost, extractMetrics } from '@/lib/campaigns';
import {
  anAggregate,
  anNeedsRegenerate,
  callSilarisAnalytics,
  buildAnalyticsFallback,
  anGetCache,
  anSetCache,
  anErLabel,
  anFmtK,
  anDelta,
  AN_PLAT,
  anRelTime
} from '@/lib/analyticsEngine';

export default function PerformaScreen({ sessionId, accessToken, profile, onAvatarClick }) {
  const [activeTab, setActiveTab] = useState('Insight');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agg, setAgg] = useState(null);
  const [aiNarrative, setAiNarrative] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
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
        if (post) {
          c._engagement = extractMetrics(post, c.platforms[0]);
        }
      });

      const aggData = anAggregate(mapped);
      setAgg(aggData);

      const userId = profile?.id || sessionId;
      let cached = null;
      if (!forceRefresh) {
        cached = await anGetCache(userId, 'narasi');
      }

      if (cached && !anNeedsRegenerate(aggData, cached.agg_snapshot)) {
        setAiNarrative(cached.payload);
      } else {
        const aiRes = await callSilarisAnalytics(aggData, profile);
        if (aiRes) {
          setAiNarrative(aiRes);
          await anSetCache(userId, 'narasi', aiRes, aggData, 60);
        } else {
          setAiNarrative(buildAnalyticsFallback(aggData, profile));
        }
      }

      setLastUpdated(new Date().toISOString());

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId, accessToken, profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const SkeletonBlock = ({ w, h, br = '8px' }) => (
    <div style={{ width: w, height: h, borderRadius: br, background: '#E5E7EB', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
  );

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>
      {/* ── Header ── */}
      <MobileHeader
        userName={profile?.full_name || profile?.business_name || 'Pengguna'}
        userInitials={(profile?.full_name || profile?.business_name || 'P').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
        isPro={profile?.selected_plan === 'pro'}
        onAvatarClick={onAvatarClick}
      />

      <main style={{flex:1, overflowY:'auto', padding:'0 16px', paddingBottom:'calc(80px + env(safe-area-inset-bottom))'}}>
        
        {/* Page title */}
        <div style={{padding:'24px 0 16px'}}>
          <h1 style={{fontFamily:'var(--m-font)',fontSize:'28px',fontWeight:'800',color:'var(--m-ink)',lineHeight:'1.2',marginBottom:'6px'}}>
            Performa Iklan
          </h1>
          <p style={{fontFamily:'var(--m-font)',fontSize:'14px',color:'var(--m-ink-sub)', lineHeight:'1.5'}}>
            Lihat hasil & temukan saran pintar.
          </p>
        </div>

        {/* Status */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
            <div style={{width:'8px', height:'8px', borderRadius:'50%', background: loading ? '#FBBC04' : '#34A853'}} />
            <span style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', fontWeight:'600'}}>
              {loading ? 'Memuat data...' : `Diperbarui ${anRelTime(lastUpdated)}`}
            </span>
          </div>
          <button 
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            style={{
              background:'none', border:'none', color:'var(--m-brand)', display:'flex', alignItems:'center', gap:'4px',
              fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', cursor:'pointer', opacity: (loading || refreshing) ? 0.5 : 1
            }}>
            <svg style={{ transform: refreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 190, background: 'var(--m-bg)',
          paddingTop:'12px', paddingBottom:'16px', margin:'0 -16px', paddingLeft:'16px', paddingRight:'16px',
        }}>
          <div style={{
            display:'flex', alignItems:'center', background:'#F5F5F7',
            borderRadius:'999px', padding:'4px', overflowX:'auto', scrollbarWidth:'none', gap:'4px'
          }}>
            {tabs.map(tab => {
              const active = tab === activeTab;
              return (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding:'8px 16px', borderRadius:'999px', border:'none', flexShrink:0,
                    background: active ? 'var(--m-brand)' : '#fff',
                    color: active ? '#fff' : 'var(--m-ink-sub)',
                    fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700',
                    cursor:'pointer', transition:'all 0.2s',
                  }}>
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TAB CONTENT ── */}

        {activeTab === 'Insight' && (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[1, 2, 3, 4].map(i => <SkeletonBlock key={i} w="100%" h="110px" br="16px" />)}
                </div>
                <SkeletonBlock w="100%" h="250px" br="20px" />
                <SkeletonBlock w="100%" h="150px" br="20px" />
              </div>
            ) : (
              <>
                {/* Grid 4 Cards */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                  <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid var(--m-brand)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px'}}>
                      <span style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px'}}>TOTAL REACH</span>
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>{anFmtK(agg?.totalReach)}</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>Orang tahu bisnis kamu · dari {agg?.countThisMonth || agg?.total || 0} iklan</div>
                  </div>
                  <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid #34A853'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px'}}>
                      <span style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px'}}>IKLAN AKTIF</span>
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>{agg?.active || 0}</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>{anDelta(agg?.reachThisMonth || 0, agg?.reachLastMonth || 0)?.text || 'Sedang berjalan'}</div>
                  </div>
                  <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid #FBBC04'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px'}}>
                      <span style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px'}}>PERFORMA KONTEN</span>
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>{agg?.avgER ? `${agg.avgER.toFixed(1)}%` : '0%'}</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>{anErLabel(agg?.avgER).label}</div>
                  </div>
                  <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid #4285F4'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px'}}>
                      <span style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px'}}>INTERAKSI</span>
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>{anFmtK(agg?.totalReact || 0)}</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>Suka, komentar, & bagikan</div>
                  </div>
                </div>

                {/* SiLaris Analysis Card */}
                {aiNarrative && (
                  <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px', marginTop:'8px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px'}}>
                      <div style={{
                        width:'40px', height:'40px', borderRadius:'50%', background:'var(--m-brand)',
                        display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'
                      }}>
                        <img src="/logo-dashboard.png" alt="SiLaris" style={{width:'24px', height:'24px', objectFit:'contain'}} />
                      </div>
                      <div>
                        <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-brand)'}}>SiLaris</div>
                        <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>AI Social Media Analysis</div>
                      </div>
                    </div>
                    
                    <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.6', marginBottom:'16px'}}>
                      {aiNarrative.narasi_p1}
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.6', marginBottom:'16px'}}>
                      {aiNarrative.narasi_p2}
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)', lineHeight:'1.6', marginBottom:'16px'}}>
                      {aiNarrative.narasi_p3}
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'#999', fontStyle:'italic', marginBottom:'16px'}}>
                      {aiNarrative.narasi_footer}
                    </div>

                    <div style={{background:'#FFF9E6', borderRadius:'12px', padding:'16px', border:'1px solid #FFE082'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px'}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBC04" stroke="#FBBC04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 12 3a4.65 4.65 0 0 0-4.5 8.5c.76.76 1.23 1.52 1.41 2.5"/></svg>
                        <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'#B27A00', letterSpacing:'0.5px'}}>ARTINYA UNTUK BISNISMU</span>
                      </div>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5'}}>
                        {aiNarrative.clue_potensi}
                      </div>
                    </div>
                    
                    <div style={{background:'#F0E6FF', borderRadius:'12px', padding:'16px', border:'1px solid #D6BCFA', marginTop:'12px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px'}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--m-brand)" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-brand)', letterSpacing:'0.5px'}}>YANG BISA DILAKUKAN SEKARANG</span>
                      </div>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5'}}>
                        {aiNarrative.clue_todo}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mood Audiens */}
                {agg?.hasMoodData && (
                  <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
                      <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#F4F4F7', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <span style={{fontSize:'16px'}}>☺</span>
                      </div>
                      <div>
                        <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)'}}>Mood Audiens</div>
                        <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>{aiNarrative?.mood_insight || 'Reaksi audiens terhadap iklanmu'}</div>
                      </div>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                      {agg.moodData.map((m, idx) => {
                        const pct = agg.totalReact > 0 ? Math.round((m.count / agg.totalReact) * 100) : 0;
                        return (
                          <div key={idx} style={{background:'#F9F9FA', borderRadius:'12px', padding:'12px', textAlign:'center'}}>
                            <div style={{fontSize:'20px', marginBottom:'4px'}}>{m.emoji}</div>
                            <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>{pct}%</div>
                            <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>{m.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Platform Terkuat */}
                {agg?.platList?.length > 0 && (
                  <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
                      <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#F4F4F7', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                      </div>
                      <div>
                        <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)'}}>Platform Terkuat</div>
                        <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>{aiNarrative?.platform_insight || 'Engagement per platform'}</div>
                      </div>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                      {agg.platList.map((p, idx) => {
                        const platInfo = AN_PLAT[p.key] || { name: p.key, color: '#666' };
                        return (
                          <div key={idx} style={{background:'#F9F9FA', borderRadius:'12px', padding:'12px', display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{color: platInfo.color, fontWeight:'800'}}>{platInfo.name}</div>
                            <div style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-brand)', background:'#F0E6FF', padding:'4px 8px', borderRadius:'6px'}}>ER {p.avgER.toFixed(1)}%</div>
                            <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>{p.count} iklan</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'Rekomendasi' && (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SkeletonBlock w="100%" h="250px" br="20px" />
                <SkeletonBlock w="100%" h="200px" br="20px" />
              </div>
            ) : (
              <>
                {/* Rekomendasi Minggu Ini */}
                <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
                    <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#FFF0F5', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#E1306C" stroke="#E1306C"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                    <div>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>Rekomendasi Pintar</div>
                    </div>
                  </div>

                  <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px'}}>
                    {aiNarrative?.rekomendasi?.map((r, idx) => (
                      <div key={idx} style={{background:'#F9F9FA', borderRadius:'12px', padding:'16px'}}>
                        <div style={{display:'flex', gap:'12px'}}>
                          <div style={{width:'24px', height:'24px', borderRadius:'50%', background:'#1A1A1A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', flexShrink:0}}>{idx + 1}</div>
                          <div>
                            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                              <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:(AN_PLAT[r.platform]?.color || '#1877F2')}}>{AN_PLAT[r.platform]?.name || r.platform}</span>
                              <span style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>{r.hari}, {r.jam}</span>
                            </div>
                            <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5', fontWeight:'bold'}}>
                              {r.aksi}
                            </div>
                            <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.5', marginTop:'4px'}}>
                              {r.alasan}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button style={{
                    width:'100%', padding:'14px', borderRadius:'12px', background:'#1A1A1A', color:'#fff',
                    border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'
                  }}>
                    {aiNarrative?.rekom_cta || 'Buat Iklan Sekarang'} →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'Local Pulse' && (
          <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#F0E6FF', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)'}}>Local Pulse</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>Pola lokal terbaik</div>
                </div>
              </div>
              <div style={{background:'#F0E6FF', padding:'6px 10px', borderRadius:'999px'}}>
                <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-brand)', letterSpacing:'0.5px'}}>LOKAL</span>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SkeletonBlock w="100%" h="80px" br="16px" />
                <SkeletonBlock w="100%" h="80px" br="16px" />
                <SkeletonBlock w="100%" h="80px" br="16px" />
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {/* Jam Terbaik */}
                <div style={{background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px'}}>
                  <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>JAM TERBAIK POSTING</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>
                      {String(agg?.bestHour || 19).padStart(2,'0')}:00 – {String((agg?.bestHour || 19) + 2).padStart(2,'0')}:00
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>Berdasarkan jam posting iklanmu.</div>
                  </div>
                </div>

                {/* Hari Terkuat */}
                <div style={{background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px'}}>
                  <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>HARI TERKUAT</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>{agg?.bestDay || 'Minggu'}</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>Hari dengan aktivitas iklan tertinggi</div>
                  </div>
                </div>

                {/* Sapaan highlight */}
                {aiNarrative?.stitch_insight && (
                  <div style={{background:'#FFF9E6', borderRadius:'12px', padding:'16px', border:'1px solid #FFE082', margin:'4px 0'}}>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'#B27A00', lineHeight:'1.5'}}>
                      <span style={{fontWeight:'700'}}>💡 Insights:</span> {aiNarrative.stitch_insight}
                    </div>
                  </div>
                )}

                {/* Format Terbaik */}
                <div style={{background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px'}}>
                  <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>FORMAT TERBAIK</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>{agg?.topFormat || 'Foto / Video'}</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>Format dominan dari iklan aktif</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Strategi' && (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            
            {/* Competitor Analysis */}
            <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#F0E6FF', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>Competitor Analysis</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Analisa pesaing instan</div>
                  </div>
                </div>
                <div style={{background:'#E6F4EA', padding:'4px 8px', borderRadius:'999px'}}>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'#34A853', letterSpacing:'0.5px'}}>GRATIS</span>
                </div>
              </div>

              <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
                <button style={{flex:1, padding:'10px', background:'#fff', border:'1px solid #E4E4EB', borderRadius:'999px', fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-ink)', boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>Instagram</button>
                <button style={{flex:1, padding:'10px', background:'transparent', border:'none', fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'600', color:'var(--m-ink-sub)'}}>Facebook</button>
                <button style={{flex:1, padding:'10px', background:'transparent', border:'none', fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'600', color:'var(--m-ink-sub)'}}>TikTok</button>
              </div>

              <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
                <input 
                  type="text" 
                  placeholder="Paste link atau @handle pesaing..." 
                  style={{flex:1, padding:'12px 16px', background:'#F5F5F7', border:'none', borderRadius:'12px', outline:'none', fontFamily:'var(--m-font)', fontSize:'13px'}}
                />
                <button style={{padding:'12px 20px', background:'#1A1A1A', color:'#fff', border:'none', borderRadius:'12px', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer'}}>
                  Analisa →
                </button>
              </div>

              <div style={{background:'#F0E6FF', borderRadius:'12px', padding:'16px'}}>
                <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5'}}>
                  ⚡ Upgrade <strong>Pro</strong> untuk analisis hingga 3 pesaing sekaligus. <a href="#" style={{color:'var(--m-brand)', textDecoration:'none', fontWeight:'700'}}>Lihat paket →</a>
                </div>
              </div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', textAlign:'center', marginTop:'12px'}}>
                Estimasi berdasarkan data publik · bukan dashboard pesaing
              </div>
            </div>
            
            {/* Strategi Tersimpan */}
            <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#F0E6FF', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>Strategi Tersimpan</div>
                      <div style={{width:'20px', height:'20px', borderRadius:'50%', background:'var(--m-brand)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700'}}>0</div>
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Rencana iklan yang kamu simpan</div>
                  </div>
                </div>
              </div>

              <div style={{background:'#F9F9FA', borderRadius:'16px', padding:'24px', textAlign:'center'}}>
                <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)', marginBottom:'8px'}}>Belum ada strategi tersimpan.</div>
                <button style={{padding:'8px 16px', background:'var(--m-brand)', color:'#fff', border:'none', borderRadius:'8px', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer'}}>Buat Strategi</button>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

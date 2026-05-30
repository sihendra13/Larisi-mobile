'use client';
import { useState, useRef, useEffect } from 'react';
import SiLarisScreen from './SiLarisScreen';
import MobileHeader from '@/components/layout/MobileHeader';

// Dummy data for grid
const dummyAds = [
  { id: 1, type: 'photo', views: '319', imgColor: '#8C5A41', badge: 'photo' },
  { id: 2, type: 'video', views: '2.4k', imgColor: '#7A8C5D', badge: 'reel' },
  { id: 3, type: 'photo', views: '892', imgColor: '#3A2E2A', badge: 'photo' },
  { id: 4, type: 'video', views: '1.2k', imgColor: '#B83B5E', badge: 'reel' },
  { id: 5, type: 'photo', views: '540', imgColor: '#8E6E53', badge: 'photo' },
  { id: 6, type: 'photo', views: '0', imgColor: '#6B6B6B', badge: 'photo' },
];

export default function KelolaScreen({ profile, onAvatarClick }) {
  const [activeTab, setActiveTab] = useState('Semua');
  const [showSiLaris, setShowSiLaris] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [isFabExpanded, setIsFabExpanded] = useState(true);
  const lastScrollY = useRef(0);

  const handleDetailScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsFabExpanded(false); // scrolling down
    } else if (currentScrollY < lastScrollY.current - 5) {
      setIsFabExpanded(true);  // scrolling up
    }
    lastScrollY.current = currentScrollY;
  };

  if (selectedAd) {
    return (
      <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'#F9F9FA', zIndex:9999, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        {/* Detail Header */}
        <header style={{
          display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:'#F9F9FA', zIndex:310
        }}>
          <button onClick={() => setSelectedAd(null)} style={{width:'40px', height:'40px', borderRadius:'50%', background:'#fff', border:'1px solid #ECECF1', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>Detail Iklan</div>
          <button style={{width:'40px', height:'40px', borderRadius:'50%', background:'#fff', border:'1px solid #ECECF1', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </header>

        {/* Scrollable Content */}
        <main onScroll={handleDetailScroll} style={{flex:1, overflowY:'auto', padding:'20px 16px', display:'flex', flexDirection:'column', gap:'20px'}}>
          
          {/* Top Hero Card (Old Kelola Card) */}
          <div style={{
            background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'16px', marginBottom:'16px'
          }}>
            <div style={{display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'12px'}}>
              <div style={{position:'relative', flexShrink: 0}}>
                <div style={{
                  width:'44px', height:'44px', borderRadius:'50%', border:'1.5px solid #E1306C',
                  display:'flex', alignItems:'center', justifyContent:'center', background:'#FFF0F5'
                }}>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'20px', fontWeight:'700', color:'#E1306C'}}>N</span>
                </div>
                {/* IG badge */}
                <div style={{
                  position:'absolute', bottom:'-2px', right:'-2px', background:'#fff', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.12)'
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/></svg>
                </div>
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px', marginBottom:'2px'}}>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', color:'var(--m-ink)'}}>Reel Pondok Indah Jakarta</div>
                  <div style={{display:'flex', alignItems:'center', gap:'12px', flexShrink: 0, marginTop:'-2px'}}>
                    <div style={{background:'#E6F4EA', padding:'4px 10px', borderRadius:'999px', display:'flex', alignItems:'center', gap:'6px'}}>
                      <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#34A853'}} />
                      <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:'#34A853'}}>Berjalan</span>
                    </div>
                    <button style={{background:'none', border:'none', cursor:'pointer', color:'var(--m-ink-sub)', padding:'4px', marginRight:'8px', display:'flex', alignItems:'center'}}>
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>@tesakunlarisi</div>
                <div style={{display:'flex', alignItems:'center', gap:'4px', cursor:'pointer', marginTop:'4px'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-brand)', textDecoration:'underline', textUnderlineOffset:'2px', whiteSpace:'nowrap'}}>Minggu, 24 Mei 2026 • 09.37</span>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div style={{
              width:'100%', aspectRatio:'21/9', background:'linear-gradient(135deg, #6B46C1, #4C1D95)', borderRadius:'12px',
              position:'relative', overflow:'hidden',
              backgroundImage:'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
            }}>
              <div style={{position:'absolute', bottom:'30%', left:'15%', width:'70px', height:'70px', borderRadius:'50%', background:'rgba(0,0,0,0.1)'}} />
              <div style={{position:'absolute', top:'30%', right:'15%', width:'100px', height:'60px', borderRadius:'8px', background:'rgba(0,0,0,0.1)'}} />
              <div style={{position:'absolute', bottom:'12px', left:'12px', display:'flex', alignItems:'center', gap:'4px', background:'rgba(0,0,0,0.5)', color:'#fff', padding:'4px 8px', borderRadius:'6px'}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                <span style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700'}}>REEL</span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px'}}>
            <div style={{background:'#fff', borderRadius:'16px', padding:'16px', border:'1px solid #E4E4EB'}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>ENGAGEMENTS</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'24px', fontWeight:'800', color:'var(--m-brand)', marginBottom:'4px'}}>223</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Total interaksi</div>
            </div>
            <div style={{background:'#fff', borderRadius:'16px', padding:'16px', border:'1px solid #E4E4EB'}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>REACH</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'24px', fontWeight:'800', color:'var(--m-brand)', marginBottom:'4px'}}>109</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>↑ 18% hari ini</div>
            </div>
            <div style={{background:'#fff', borderRadius:'16px', padding:'16px', border:'1px solid #E4E4EB'}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>VIEWS</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>114</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>24 jam terakhir</div>
            </div>
            <div style={{background:'#fff', borderRadius:'16px', padding:'16px', border:'1px solid #E4E4EB'}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>REACTIONS</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>0</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Belum ada</div>
            </div>
            <div style={{background:'#fff', borderRadius:'16px', padding:'16px', border:'1px solid #E4E4EB'}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>COMMENTS</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>0</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Belum ada</div>
            </div>
            <div style={{background:'#fff', borderRadius:'16px', padding:'16px', border:'1px solid #E4E4EB'}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>SHARES</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>0</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Belum ada</div>
            </div>
          </div>

          {/* Chart Card */}
          <div style={{background:'#fff', borderRadius:'20px', padding:'20px', border:'1px solid #E4E4EB', marginBottom:'16px'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
              <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)'}}>Jangkauan 7 Hari</div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'800', color:'var(--m-brand)'}}>+62%</div>
            </div>
            <div style={{width:'100%', height:'80px', background:'linear-gradient(to top, rgba(107, 70, 193, 0.1), transparent)', position:'relative', borderRadius:'8px', overflow:'hidden'}}>
              {/* SVG Mock Line Chart */}
              <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 100 L0 80 L20 85 L40 60 L60 65 L80 40 L100 20 L100 100 Z" fill="rgba(107, 70, 193, 0.1)"/>
                <path d="M0 80 L20 85 L40 60 L60 65 L80 40 L100 20" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="100" cy="20" r="3" fill="var(--m-brand)"/>
              </svg>
            </div>
          </div>
          
          {/* Boost Iklan */}
          <button style={{
            width:'100%', padding:'16px', borderRadius:'16px', background:'#1A1A1A', color:'#fff',
            border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
            marginTop: '4px', marginBottom: '80px',
            boxShadow:'0 4px 14px rgba(26,26,26,0.2)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Boost Iklan
          </button>
        </main>

        {/* Floating Action Button Tanya SiLaris */}
        {!showSiLaris && (
          <button
            onClick={() => setShowSiLaris(true)}
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '16px',
              background: 'var(--m-brand)',
              color: '#fff',
              borderRadius: '999px',
              padding: isFabExpanded ? '12px 12px 12px 20px' : '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: isFabExpanded ? '10px' : '0px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              zIndex: 310,
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: isFabExpanded ? '280px' : '64px',
              height: '64px',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              textAlign: 'right',
              opacity: isFabExpanded ? 1 : 0,
              transition: 'opacity 0.2s',
              width: isFabExpanded ? 'auto' : '0px',
              overflow: 'hidden'
            }}>
              <span style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', lineHeight:'1.2'}}>Tanya SiLaris</span>
              <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'500', opacity:0.9}}>Performa Insight Iklanmu</span>
            </div>
            
            <div style={{
              width:'40px', height:'40px', borderRadius:'50%', background:'var(--m-brand)', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              <img src="/logo-dashboard.png" alt="SiLaris" style={{width:'36px', height:'36px', objectFit:'contain'}} />
            </div>
          </button>
        )}
        
        {showSiLaris && <SiLarisScreen onBack={() => setShowSiLaris(false)} />}
      </div>
    );
  }

  return (
    <>
      <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>
      {/* ── Header ── */}
      <MobileHeader
        userName={profile?.full_name || profile?.business_name || 'Pengguna'}
        userInitials={(profile?.full_name || profile?.business_name || 'P').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
        isPro={profile?.selected_plan === 'pro'}
        onAvatarClick={onAvatarClick}
      />

      <main style={{flex:1, overflowY:'auto', padding:'0 16px', paddingBottom:'calc(100px + env(safe-area-inset-bottom))'}}>
        
        {/* Page title */}
        <div style={{padding:'24px 0 20px'}}>
          <h1 style={{fontFamily:'var(--m-font)',fontSize:'28px',fontWeight:'800',color:'var(--m-ink)',lineHeight:'1.2',marginBottom:'6px'}}>
            Kelola Iklan
          </h1>
          <p style={{fontFamily:'var(--m-font)',fontSize:'14px',color:'var(--m-ink-sub)', lineHeight:'1.5'}}>
            Pantau performa dan edit konten iklanmu
          </p>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          position:'sticky', top:0, zIndex:190, background:'var(--m-bg)',
          display:'flex', alignItems:'center',
          paddingTop:'12px', paddingBottom:'16px', margin:'0 -16px', paddingLeft:'16px', paddingRight:'16px',
          marginBottom:'8px'
        }}>
          <div style={{
            display:'flex', alignItems:'center', background:'#F5F5F7', gap:'4px',
            borderRadius:'999px', padding:'4px', flex:1,
          }}>
            {['Semua', 'Berjalan', 'Diarsipkan'].map(tab => {
              const active = tab === activeTab;
              return (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex:1, padding:'8px 0', borderRadius:'999px', border:'none',
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

        {/* ── Ad Grid ── */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'8px', paddingBottom:'24px'}}>
          {dummyAds.map((ad, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedAd(ad)}
              style={{
                background: ad.imgColor, aspectRatio:'1/1', borderRadius:'16px', position:'relative', cursor:'pointer', overflow:'hidden',
                boxShadow:'0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              {/* Top Right Badge (Reel/Photo) */}
              <div style={{position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.4)', borderRadius:'6px', padding:'4px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {ad.badge === 'reel' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                )}
              </div>

              {/* Bottom Gradient overlay */}
              <div style={{
                position:'absolute', bottom:0, left:0, right:0, height:'50%',
                background:'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
                display:'flex', alignItems:'flex-end', padding:'12px'
              }}>
                <div style={{display:'flex', alignItems:'center', gap:'6px', color:'#fff'}}>
                  {/* Users Icon for Reach */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'800'}}>{ad.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Non-Sticky CTA for Buat Iklan Baru */}
        <div style={{ padding:'0 0 24px 0', marginTop:'-8px' }}>
          <button style={{
            width:'100%', padding:'16px', borderRadius:'16px', background:'#202434', color:'#fff',
            border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
            boxShadow:'0 4px 14px rgba(32,36,52,0.15)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
            Buat Iklan Baru
          </button>
        </div>
      </main>
    </div>
    </>
  );
}

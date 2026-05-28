'use client';
import { useState } from 'react';
import SiLarisScreen from './SiLarisScreen';

export default function KelolaScreen() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [showSiLaris, setShowSiLaris] = useState(false);

  return (
    <>
      <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>
      {/* ── Header ── */}
      <header style={{
        position:'sticky', top:0, zIndex:200,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 16px', background:'#fff',
      }}>
        <img src="/logo_larisi.svg" alt="Larisi" style={{height:'22px', width:'auto'}} />
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <button style={{width:'38px',height:'38px',borderRadius:'50%',background:'#fff',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button style={{width:'38px',height:'38px',borderRadius:'50%',background:'#fff',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
          <div style={{display:'flex',alignItems:'center',gap:'8px',background:'#F4F4F7',borderRadius:'999px',padding:'4px 4px 4px 12px',cursor:'pointer'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
              <span style={{fontFamily:'var(--m-font)',fontSize:'12px',fontWeight:'700',color:'var(--m-ink)',lineHeight:'1.2'}}>Nila Craft</span>
              <span style={{color:'var(--m-brand)',fontSize:'10px',fontWeight:'700',lineHeight:'1.2'}}>PRO</span>
            </div>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--m-ink)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{color:'#fff',fontFamily:'var(--m-font)',fontSize:'13px',fontWeight:'700'}}>N</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{flex:1, overflowY:'auto', padding:'0 16px', paddingBottom:'calc(80px + env(safe-area-inset-bottom))'}}>
        
        {/* Page title */}
        <div style={{padding:'24px 0 20px'}}>
          <h1 style={{fontFamily:'var(--m-font)',fontSize:'28px',fontWeight:'800',color:'var(--m-ink)',lineHeight:'1.2',marginBottom:'6px'}}>
            Kelola Iklan
          </h1>
          <p style={{fontFamily:'var(--m-font)',fontSize:'14px',color:'var(--m-ink-sub)', lineHeight:'1.5'}}>
            Pantau iklan yang sedang berjalan secara real-time.
          </p>
        </div>

        {/* ── Tabs & Filter ── */}
        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px'}}>
          <div style={{
            display:'flex', alignItems:'center', background:'#F5F5F7',
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
                    background: active ? 'var(--m-brand)' : 'transparent',
                    color: active ? '#fff' : 'var(--m-ink-sub)',
                    fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700',
                    cursor:'pointer', transition:'all 0.2s',
                  }}>
                  {tab}
                </button>
              );
            })}
          </div>
          <button style={{
            width:'36px', height:'36px', borderRadius:'50%', background:'#fff', border:'1px solid #ECECF1',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer',
            boxShadow:'0 2px 6px rgba(0,0,0,0.04)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
          </button>
        </div>

        {/* ── Ad Card 1 ── */}
        <div 
          onClick={() => setShowSiLaris(true)}
          style={{
            background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px',
            padding:'16px', marginBottom:'16px', cursor:'pointer'
          }}
        >
          {/* Card Header */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <div style={{position:'relative'}}>
                <div style={{
                  width:'40px', height:'40px', borderRadius:'50%', border:'1.5px solid #E1306C',
                  display:'flex', alignItems:'center', justifyContent:'center', background:'#FFF0F5'
                }}>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'700', color:'#E1306C'}}>N</span>
                </div>
                {/* Small IG badge */}
                <div style={{
                  position:'absolute', bottom:'-4px', right:'-4px', background:'#fff',
                  borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 1px 3px rgba(0,0,0,0.12)'
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none"/>
                  </svg>
                </div>
              </div>
              <div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'2px'}}>Post IG foto</div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>@tesakunlarisi</div>
              </div>
            </div>
            
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <div style={{
                background:'#E6F4EA', padding:'4px 10px', borderRadius:'99px',
                display:'flex', alignItems:'center', gap:'6px'
              }}>
                <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#34A853'}} />
                <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:'#34A853'}}>Berjalan</span>
              </div>
              <button style={{background:'none', border:'none', cursor:'pointer', color:'var(--m-ink-sub)', display:'flex', alignItems:'center', padding:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>

          <div style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-brand)', marginBottom:'12px'}}>
            Minggu, 24 Mei 2026 • 10.54
          </div>

          {/* Thumbnail */}
          <div style={{
            width:'100%', aspectRatio:'16/9', background:'#E8C39E', borderRadius:'12px',
            marginBottom:'16px', position:'relative', overflow:'hidden',
            backgroundImage:'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)'
          }}>
            {/* Fake mockup circles inside thumb */}
            <div style={{
              position:'absolute', bottom:'30%', left:'15%', width:'70px', height:'70px', borderRadius:'50%',
              background:'rgba(0,0,0,0.1)'
            }} />
            <div style={{
              position:'absolute', top:'30%', right:'15%', width:'100px', height:'60px', borderRadius:'8px',
              background:'rgba(0,0,0,0.1)'
            }} />
            <div style={{
              position:'absolute', bottom:'12px', left:'12px', background:'rgba(0,0,0,0.5)',
              color:'#fff', fontFamily:'var(--m-font)', fontSize:'10px', padding:'4px 8px', borderRadius:'6px'
            }}>
              product<br/>photo
            </div>
          </div>

          {/* Engagements */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
            <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink)', letterSpacing:'0.5px', textTransform:'uppercase'}}>
              ENGAGEMENTS
            </span>
            <span style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-brand)'}}>
              3
            </span>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px'}}>
            {[
              { label:'Reactions', val:'0' },
              { label:'Comments', val:'0' },
              { label:'Shares', val:'0' },
              { label:'Views', val:'2' },
              { label:'Reach', val:'1', arrow:true },
            ].map(row => (
              <div key={row.label} style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <span style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>{row.label}</span>
                <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-ink)'}}>{row.val}</span>
                  {row.arrow && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{width:'100%', height:'3px', background:'#F5F5F7', borderRadius:'2px', marginBottom:'16px'}}>
            <div style={{width:'10%', height:'100%', background:'var(--m-brand)', borderRadius:'2px'}} />
          </div>

          {/* Boost Button */}
          <button style={{
            width:'100%', padding:'14px', borderRadius:'12px', background:'#1A1A1A', color:'#fff',
            border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
            boxShadow:'0 4px 14px rgba(14,14,18,0.20)'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Boost
          </button>
        </div>



      </main>
    </div>
    {showSiLaris && <SiLarisScreen onBack={() => setShowSiLaris(false)} />}
    </>
  );
}

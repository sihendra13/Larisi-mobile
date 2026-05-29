'use client';
import { useState } from 'react';

export default function PerformaScreen() {
  const [activeTab, setActiveTab] = useState('Insight');
  
  const tabs = ['Insight', 'Rekomendasi', 'Local Pulse', 'Strategi'];

  return (
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
            <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#34A853'}} />
            <span style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', fontWeight:'600'}}>Diperbarui baru saja</span>
          </div>
          <button style={{
            background:'none', border:'none', color:'var(--m-brand)', display:'flex', alignItems:'center', gap:'4px',
            fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', cursor:'pointer'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            {/* Grid 4 Cards */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid var(--m-brand)'}}>
                <div style={{display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px'}}>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px'}}>TOTAL REACH</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4C4D4" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>110</div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>Orang tahu bisnis kamu · dari 2 iklan bulan ini</div>
              </div>
              <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid #34A853'}}>
                <div style={{display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px'}}>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px'}}>IKLAN BERJALAN</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4C4D4" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>2</div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>Bulan pertama, terus semangat!</div>
              </div>
              <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid #FBBC04'}}>
                <div style={{display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px'}}>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px'}}>PERFORMA KONTEN</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4C4D4" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>0%</div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>Belum ada data ER</div>
              </div>
              <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px', borderTop:'3px solid #4285F4'}}>
                <div style={{display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px'}}>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px'}}>IKLAN BERBAYAR</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4C4D4" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'28px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>0</div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>Semua reach dari konten organik</div>
              </div>
            </div>

            {/* SiLaris Analysis Card */}
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
                  <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Social Media Analysis</div>
                </div>
              </div>
              
              <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.6', marginBottom:'16px'}}>
                Nila Craft, kamu di jalur yang tepat! Kamu telah membuat <strong>2 iklan</strong> dan mencapai <strong>110 orang</strong> secara organik, namun <em>engagement rate</em> belum bisa dihitung karena reach masih terlalu sedikit.
              </div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)', lineHeight:'1.6', marginBottom:'16px'}}>
                Reach organik Instagram rata-rata hanya 3–4% dari followers. 110 reach di bulan pertama itu <strong>normal dan sehat</strong> — fondasi sudah kuat.
              </div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'#999', fontStyle:'italic', marginBottom:'16px'}}>
                Data akan semakin akurat setelah lebih banyak iklan berjalan.
              </div>

              <div style={{background:'#FFF9E6', borderRadius:'12px', padding:'16px', border:'1px solid #FFE082'}}>
                <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBC04" stroke="#FBBC04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 12 3a4.65 4.65 0 0 0-4.5 8.5c.76.76 1.23 1.52 1.41 2.5"/></svg>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'#B27A00', letterSpacing:'0.5px'}}>ARTINYA UNTUK BISNISMU</span>
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5'}}>
                  Kualitas konten sudah terbukti. Tantangan berikutnya bukan membuat konten lebih bagus, tapi lebih banyak orang yang melihatnya.
                </div>
              </div>
            </div>

            {/* Mood Audiens */}
            <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#F4F4F7', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span style={{fontSize:'16px'}}>☺</span>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)'}}>Mood Audiens Minggu Ini</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Breakdown Reactions Semua Iklan</div>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                <div style={{background:'#F9F9FA', borderRadius:'12px', padding:'12px', textAlign:'center'}}>
                  <div style={{fontSize:'20px', marginBottom:'4px'}}>❤️</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>0%</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Love</div>
                </div>
                <div style={{background:'#F9F9FA', borderRadius:'12px', padding:'12px', textAlign:'center'}}>
                  <div style={{fontSize:'20px', marginBottom:'4px'}}>👍</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>100%</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Like</div>
                </div>
                <div style={{background:'#F9F9FA', borderRadius:'12px', padding:'12px', textAlign:'center'}}>
                  <div style={{fontSize:'20px', marginBottom:'4px'}}>😂</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>0%</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Haha</div>
                </div>
                <div style={{background:'#F9F9FA', borderRadius:'12px', padding:'12px', textAlign:'center'}}>
                  <div style={{fontSize:'20px', marginBottom:'4px'}}>😲</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>0%</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Wow</div>
                </div>
              </div>
            </div>
            
            {/* Platform Terkuat */}
            <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#F4F4F7', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)'}}>Platform Terkuat</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Engagement Rate Per Platform</div>
                </div>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                <div style={{background:'#F9F9FA', borderRadius:'12px', padding:'12px', display:'flex', alignItems:'center', gap:'12px'}}>
                  <div style={{color:'#1877F2'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-brand)', background:'#F0E6FF', padding:'4px 8px', borderRadius:'6px'}}>ER 34.5%</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>3 iklan</div>
                </div>
                <div style={{background:'#F9F9FA', borderRadius:'12px', padding:'12px', display:'flex', alignItems:'center', gap:'12px'}}>
                  <div style={{color:'#E1306C'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"/></svg></div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', color:'var(--m-brand)', background:'#F0E6FF', padding:'4px 8px', borderRadius:'6px'}}>ER 0.7%</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>7 iklan</div>
                </div>
                <div style={{background:'#F9F9FA', borderRadius:'12px', padding:'12px', display:'flex', alignItems:'center', gap:'12px', opacity:0.5}}>
                  <div style={{color:'var(--m-ink-sub)'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.63-1.07 5.16-2.91 7.02-1.92 1.94-4.66 2.96-7.44 2.89-2.61-.06-5.11-1.07-6.96-2.92-1.84-1.85-2.88-4.38-2.9-7.01-.02-2.8.96-5.54 2.74-7.59 1.78-2.05 4.31-3.23 7.04-3.32v4.07c-1.35.03-2.66.52-3.66 1.41-.99.88-1.58 2.12-1.66 3.46-.07 1.2.29 2.4.98 3.37.69.97 1.73 1.63 2.9 1.83 1.25.21 2.56-.03 3.59-.72 1.05-.71 1.72-1.84 1.85-3.11.05-1.58-.02-3.16-.01-4.75 0-3.69-.01-7.39.02-11.08z"/></svg></div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>belum dipakai</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'Rekomendasi' && (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {/* Rekomendasi Minggu Ini */}
            <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#FFF0F5', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#E1306C" stroke="#E1306C"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>Rekomendasi Minggu Ini</div>
                </div>
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px'}}>
                <div style={{background:'#F9F9FA', borderRadius:'12px', padding:'16px'}}>
                  <div style={{display:'flex', gap:'12px'}}>
                    <div style={{width:'24px', height:'24px', borderRadius:'50%', background:'#1A1A1A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', flexShrink:0}}>1</div>
                    <div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                        <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:'#1877F2'}}>Facebook</span>
                        <span style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Minggu, 14:00</span>
                      </div>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5'}}>
                        Buat iklan seperti "FB Post text stiching", caption "Sugeng rawuh Ada tempat maka..." terbukti disukai audiens.
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{background:'#F9F9FA', borderRadius:'12px', padding:'16px'}}>
                  <div style={{display:'flex', gap:'12px'}}>
                    <div style={{width:'24px', height:'24px', borderRadius:'50%', background:'#1A1A1A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', flexShrink:0}}>2</div>
                    <div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                        <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:'#E1306C'}}>Instagram</span>
                        <span style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)'}}>Minggu, 13:00</span>
                      </div>
                      <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink)', lineHeight:'1.5'}}>
                        Kamu punya 7 iklan di Instagram. Konsisten posting di platform ini untuk membangun audiens yang lebih luas di Yogyakarta.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button style={{
                width:'100%', padding:'14px', borderRadius:'12px', background:'#1A1A1A', color:'#fff',
                border:'none', cursor:'pointer', fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'700',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'
              }}>
                Buat Iklan Sekarang →
              </button>
            </div>

            {/* Iklan Terbaik */}
            <div style={{background:'#fff', border:'1px solid #E4E4EB', borderRadius:'20px', padding:'20px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#F0E6FF', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)'}}>Iklan Terbaik</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Performa Tertinggi</div>
                </div>
              </div>
              <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', fontStyle:'italic', marginBottom:'16px', lineHeight:'1.5'}}>
                Dipilih berdasarkan Engagement Rate tertinggi, konten yang paling banyak memicu reaksi dari orang yang melihatnya.
              </div>

              <div style={{background:'#F9F9FA', border:'1px solid #E4E4EB', borderRadius:'16px', padding:'16px'}}>
                <div style={{display:'flex', alignItems:'flex-start', gap:'12px'}}>
                  <div style={{width:'40px', height:'40px', borderRadius:'8px', background:'#E8C39E', flexShrink:0}} />
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'2px'}}>FB Post text stiching</div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-brand)', marginBottom:'8px'}}>@VespaKita · 17 Mei 2026 ↗</div>
                    <div style={{display:'flex', gap:'8px'}}>
                      <span style={{background:'#F0E6FF', color:'var(--m-brand)', fontSize:'10px', fontWeight:'700', padding:'4px 8px', borderRadius:'4px'}}>ER 66.7%</span>
                      <span style={{background:'#E6F4EA', color:'#34A853', fontSize:'10px', fontWeight:'700', padding:'4px 8px', borderRadius:'4px'}}>Reach 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {/* Jam Terbaik */}
              <div style={{background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>JAM TERBAIK POSTING</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>09:00 – 11:00</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>Berdasarkan jam posting iklanmu — akan lebih akurat setelah lebih banyak iklan di hari berbeda.</div>
                </div>
              </div>

              {/* Hari Terkuat */}
              <div style={{background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>HARI TERKUAT</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>Minggu</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>Hari dengan aktivitas iklan tertinggi</div>
                </div>
              </div>

              {/* Sapaan Lokal */}
              <div style={{background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>SAPAAN LOKAL TERBAIK</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-brand)', marginBottom:'4px'}}>"Sugeng rawuh"</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)', lineHeight:'1.4'}}>Sapaan khas <strong>Bantul</strong>, terbukti meningkatkan engagement lokal</div>
                </div>
              </div>

              {/* Sapaan highlight */}
              <div style={{background:'#FFF9E6', borderRadius:'12px', padding:'16px', border:'1px solid #FFE082', margin:'-4px 0 4px'}}>
                <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'#B27A00', lineHeight:'1.5'}}>
                  <span style={{fontWeight:'700'}}>💡 72% brand engagement</span> datang dari konten yang bicara bahasa lokal — tambahkan ke caption iklanmu.
                </div>
              </div>

              {/* Format Terbaik */}
              <div style={{background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#fff', border:'1px solid #E4E4EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', color:'var(--m-ink-sub)', letterSpacing:'0.5px', marginBottom:'4px'}}>FORMAT TERBAIK</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'18px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>Foto dengan teks</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)'}}>Format dominan dari iklan aktif</div>
                </div>
              </div>
            </div>
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
                      <div style={{width:'20px', height:'20px', borderRadius:'50%', background:'var(--m-brand)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700'}}>1</div>
                    </div>
                    <div style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Rencana iklan yang kamu simpan</div>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
              </div>

              <div style={{background:'#F9F9FA', borderRadius:'16px', padding:'16px', display:'flex', gap:'12px'}}>
                <div style={{width:'4px', background:'var(--m-brand)', borderRadius:'99px', flexShrink:0}} />
                <div style={{flex:1}}>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'800', color:'var(--m-brand)', letterSpacing:'0.5px', marginBottom:'4px'}}>BANTUL · MINGGU</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'6px'}}>Sapaan Sugeng Rawuh + Reel kerajinan</div>
                  <div style={{fontFamily:'var(--m-font)', fontSize:'13px', color:'var(--m-ink-sub)', lineHeight:'1.5', marginBottom:'12px'}}>
                    Posting 09:00, format foto dengan teks, target warga sekitar 1.0 km.
                  </div>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button style={{padding:'8px 16px', background:'var(--m-brand)', color:'#fff', border:'none', borderRadius:'8px', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer'}}>Terapkan</button>
                    <button style={{padding:'8px 16px', background:'#fff', color:'var(--m-ink)', border:'1px solid #E4E4EB', borderRadius:'8px', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer'}}>Edit</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

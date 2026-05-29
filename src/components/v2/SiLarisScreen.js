'use client';
import { useState, useEffect, useRef } from 'react';

export default function SiLarisScreen({ onBack }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on mount
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'#F9F9FB', height:'100%', position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:99999}}>
      
      {/* ── Header ── */}
      <header style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 16px', background:'#fff', borderBottom:'1px solid #ECECF1',
        zIndex:10, flexShrink:0
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <button onClick={onBack} style={{
            width:'36px', height:'36px', borderRadius:'50%', background:'#fff', border:'1px solid #ECECF1',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <div style={{
              width:'40px', height:'40px', borderRadius:'50%', background:'var(--m-brand)',
              display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'
            }}>
              <img src="/logo-dashboard.png" alt="SiLaris" style={{width:'24px', height:'24px', objectFit:'contain'}} />
            </div>
            <div style={{display:'flex', flexDirection:'column'}}>
              <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                <span style={{fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)'}}>SiLaris</span>
                <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#34A853'}} />
              </div>
              <span style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Asisten cerdas · online</span>
            </div>
          </div>
        </div>

        <button style={{
          width:'36px', height:'36px', borderRadius:'50%', background:'#fff', border:'1px solid #ECECF1',
          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
        </button>
      </header>

      {/* ── Chat Area ── */}
      <main style={{flex:1, overflowY:'auto', padding:'20px 16px', display:'flex', flexDirection:'column', gap:'16px'}}>
        
        {/* SiLaris Greeting */}
        <div style={{display:'flex', gap:'10px', alignItems:'flex-start'}}>
          <div style={{
            width:'28px', height:'28px', borderRadius:'50%', background:'var(--m-brand)', flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center', marginTop:'4px', overflow:'hidden'
          }}>
            <img src="/logo-dashboard.png" alt="SiLaris" style={{width:'18px', height:'18px', objectFit:'contain'}} />
          </div>
          <div style={{
            background:'#fff', borderRadius:'16px', borderTopLeftRadius:'4px',
            padding:'14px', border:'1px solid #ECECF1', boxShadow:'0 2px 8px rgba(0,0,0,0.02)',
            maxWidth:'90%'
          }}>
            <div style={{fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)', marginBottom:'4px'}}>
              Halo Nila 👋
            </div>
            <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.5'}}>
              Aku SiLaris, asisten cerdas yang siap bantu iklan kamu jadi rebutan pelanggan. Berikut adalah analisis untuk iklan yang kamu pilih.
            </div>
          </div>
        </div>

        {/* Ad Summary Card (e-commerce style) */}
        <div style={{display:'flex', justifyContent:'center', paddingLeft:'38px'}}>
          <div style={{
            background:'#fff', borderRadius:'16px', padding:'12px', border:'1px solid #ECECF1',
            boxShadow:'0 4px 12px rgba(0,0,0,0.04)', display:'flex', gap:'12px', width:'100%', maxWidth:'100%'
          }}>
            {/* Thumbnail */}
            <div style={{
              width:'80px', height:'80px', borderRadius:'10px', background:'#E8C39E', flexShrink:0,
              backgroundImage:'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)',
              display:'flex', alignItems:'flex-end', padding:'6px', position:'relative', overflow:'hidden'
            }}>
              <div style={{
                background:'rgba(0,0,0,0.5)', color:'#fff', fontFamily:'var(--m-font)', 
                fontSize:'9px', padding:'3px 6px', borderRadius:'4px', fontWeight:'700'
              }}>
                REEL
              </div>
            </div>
            
            {/* Details */}
            <div style={{display:'flex', flexDirection:'column', justifyContent:'center', flex:1, minWidth:0}}>
              <div style={{
                fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'800', color:'var(--m-ink)', 
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:'4px'
              }}>
                Reel Pondok Indah
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px'}}>
                <span style={{fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color:'#34A853', background:'#E6F4EA', padding:'2px 6px', borderRadius:'4px'}}>
                  Berjalan
                </span>
                <span style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>
                  24 Mei 2026
                </span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Views:</span>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-ink)'}}>1,2K</span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)'}}>Reach:</span>
                  <span style={{fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-ink)'}}>109</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Message */}
        <div style={{display:'flex', justifyContent:'flex-end'}}>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', maxWidth:'85%'}}>
            <div style={{
              background:'var(--m-brand)', color:'#fff', padding:'14px', 
              borderRadius:'16px', borderBottomRightRadius:'4px',
              fontFamily:'var(--m-font)', fontSize:'14px', lineHeight:'1.5'
            }}>
              Iklan reelku kok views naik tapi reaksi nol? Apa yang harus aku perbaiki?
            </div>
            <span style={{fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', marginTop:'4px', marginRight:'4px'}}>
              10.42 · Terkirim
            </span>
          </div>
        </div>

        {/* SiLaris Reply */}
        <div style={{display:'flex', gap:'10px', alignItems:'flex-start'}}>
          <div style={{
            width:'28px', height:'28px', borderRadius:'50%', background:'var(--m-brand)', flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center', marginTop:'4px', overflow:'hidden'
          }}>
            <img src="/logo-dashboard.png" alt="SiLaris" style={{width:'18px', height:'18px', objectFit:'contain'}} />
          </div>
          <div style={{
            background:'#fff', borderRadius:'16px', borderTopLeftRadius:'4px',
            padding:'16px', border:'1px solid #ECECF1', boxShadow:'0 2px 8px rgba(0,0,0,0.02)',
            maxWidth:'90%'
          }}>
            <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.5', marginBottom:'12px'}}>
              Berdasarkan data 24 jam, viewers <strong>scroll cepat</strong> di detik 3-5. Coba 3 hal ini:
            </div>
            
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <div style={{display:'flex', gap:'10px'}}>
                <div style={{
                  width:'20px', height:'20px', borderRadius:'50%', background:'var(--m-brand-soft)', color:'var(--m-brand)',
                  fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                }}>
                  1
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.4'}}>
                  Tambahkan CTA "Ketuk untuk pesan" di detik pertama
                </div>
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <div style={{
                  width:'20px', height:'20px', borderRadius:'50%', background:'var(--m-brand-soft)', color:'var(--m-brand)',
                  fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                }}>
                  2
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.4'}}>
                  Ganti caption ke pertanyaan: "Sudah coba kulit asli?"
                </div>
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <div style={{
                  width:'20px', height:'20px', borderRadius:'50%', background:'var(--m-brand-soft)', color:'var(--m-brand)',
                  fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                }}>
                  3
                </div>
                <div style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.4'}}>
                  Boost +5km, target warga umur 25-40
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Chips */}
        <div style={{display:'flex', flexWrap:'wrap', gap:'8px', paddingLeft:'38px', marginTop:'-4px'}}>
          <button style={{
            padding:'10px 16px', borderRadius:'999px', border:'1.5px solid var(--m-brand)', background:'#fff',
            color:'var(--m-brand)', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer'
          }}>
            Terapkan saran #3
          </button>
          <button style={{
            padding:'10px 16px', borderRadius:'999px', border:'1.5px solid var(--m-brand)', background:'#fff',
            color:'var(--m-brand)', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer'
          }}>
            Lihat audiens
          </button>
          <button style={{
            padding:'10px 16px', borderRadius:'999px', border:'1.5px solid var(--m-brand)', background:'#fff',
            color:'var(--m-brand)', fontFamily:'var(--m-font)', fontSize:'13px', fontWeight:'700', cursor:'pointer'
          }}>
            Buat caption baru
          </button>
        </div>

        <div ref={bottomRef} style={{height:'10px'}} />
      </main>

      {/* ── Bottom Input ── */}
      <footer style={{
        padding:'12px 16px', background:'#fff', borderTop:'1px solid #ECECF1',
        paddingBottom:'calc(12px + env(safe-area-inset-bottom))',
        flexShrink:0
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <button style={{
            width:'40px', height:'40px', borderRadius:'50%', border:'1px solid #ECECF1', background:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <div style={{
            flex:1, height:'44px', borderRadius:'999px', background:'#F5F5F7',
            display:'flex', alignItems:'center', padding:'0 16px'
          }}>
            <input 
              type="text" 
              placeholder="Ketik pesan ke SiLaris..." 
              style={{
                border:'none', background:'transparent', width:'100%', outline:'none',
                fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)'
              }} 
            />
          </div>
          <button style={{
            width:'44px', height:'44px', borderRadius:'50%', background:'var(--m-brand)', border:'none',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0,
            boxShadow:'0 4px 12px rgba(108, 92, 231, 0.3)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'-2px', marginTop:'2px'}}>
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </footer>

    </div>
  );
}

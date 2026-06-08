'use client';
import { useState, useEffect, useRef } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

/* ─── Build campaign data object ─── */
function buildCampaignData(campaign, analytics) {
  const platLabel = { ig:'Instagram', meta:'Facebook', tiktok:'TikTok', youtube:'YouTube' };
  const an = analytics || {};
  return {
    name:      campaign?.name     || '-',
    platform:  platLabel[(campaign?.platforms||[])[0]] || '-',
    format:    campaign?.format   || 'post',
    post_time: campaign?.scheduled_at
      ? 'Terjadwal: ' + new Date(campaign.scheduled_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
      : campaign?.created_at
        ? new Date(campaign.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
        : null,
    caption:      (campaign?.caption || '').slice(0, 300) || null,
    reactions:    an.likes        ?? null,
    comments:     an.comments     ?? null,
    shares:       an.shares       ?? null,
    views:        an.views        ?? null,
    reach:        an.reach        ?? null,
    total_eng:    an.engagements  ?? null,
    saved:        an.saved        ?? null,
    engagement_rate: (an.reach > 0 && an.engagements != null)
      ? ((an.engagements / an.reach) * 100).toFixed(1) + '%'
      : null,
  };
}

/* ─── Build system prompt ─── */
function buildSystemPrompt(profile, cd, isScheduled) {
  const bizName  = profile?.business_name || null;
  const category = profile?.category      || null;
  const city     = profile?.city          || null;

  const baseRules = [
    'KARAKTER & TONE:',
    'Bicara semangat dan hangat seperti coach yang peduli, bukan laporan audit kering.',
    'Urutan selalu: rayakan yang bagus dulu, WHY di balik angka, aksi konkret.',
    '',
    'FORMAT DUA MODE:',
    '',
    'MODE 1 AUTO-INSIGHT (pertama kali analisa campaign):',
    isScheduled
      ? 'Buka WAJIB dengan: "Hei! Postingan iklan \\"' + cd.name + '\\" kamu sudah dijadwalkan ya 👋"'
      : 'Buka WAJIB dengan: "Hei! Saya udah cek data iklan \\"' + cd.name + '\\" kamu nih 👋"',
    isScheduled
      ? 'Lanjut dengan menerangkan detail penjadwalan dan tips jam posting terbaik agar jangkauan maksimal.'
      : 'Lanjut dengan 3 seksi:\n📊 PERFORMA SEKARANG\n• Engagement Rate: [angka] — [interpretasi coach]\n• Paling kuat: [metric + artinya bagi bisnis]\n• Perlu diperhatiin: [metric + kenapa penting]\n💡 INSIGHT UTAMA\n[1-2 kalimat mengalir, jelaskan WHY di balik angka]\n🎯 SARAN LANGSUNG\n[1 action konkret spesifik hari ini]',
    'Tutup: "Ada yang mau kamu tanyain lebih dalam?"',
    '',
    'MODE 2 CHAT LANJUTAN:',
    'Paragraf mengalir natural, JANGAN pakai header 📊 💡 🎯.',
    'Langsung ke poin, coach style, saran spesifik di akhir.',
    '',
    'ANALISIS CAPTION:',
    'Kalau ada caption di data, nilai apakah sudah optimal.',
    'Kalau bisa diperbaiki, tulis versi yang lebih kuat.',
    '',
    'BENCHMARK:',
    'Engagement Rate: <1% sangat rendah, 1-3% normal, 3-10% bagus, >10% luar biasa.',
    'Reach: <100 perlu boost, 100-1000 growing, >1000 sudah luas.',
    '',
    'SARAN WAJIB SPESIFIK:',
    'Hashtag: 3-5 contoh nyata sesuai bisnis + platform + lokasi.',
    'Jam posting: jam spesifik + alasan.',
    'Budget boost: angka konkret (contoh: Rp 20rb-50rb per hari 3 hari).',
    '',
    'ATURAN KERAS:',
    'HANYA analisa campaign yang sedang dibuka.',
    'JANGAN berasumsi data yang tidak ada di context.',
    'DILARANG gunakan em-dash (—), ganti dengan koma.',
    'Jawaban tanpa action item DILARANG.',
    '',
    'DATA CAMPAIGN:',
    'Nama: ' + cd.name,
    'Platform: ' + cd.platform,
    'Format: ' + cd.format,
    'Tanggal: ' + (cd.post_time || '-'),
    cd.caption ? 'Caption: "' + cd.caption + '"' : 'Caption: tidak tersedia',
    isScheduled ? 'Status: Terjadwal (Belum Terbit)' : 'Status: Aktif',
    'Reach: ' + (cd.reach ?? '-'),
    'Engagement total: ' + (cd.total_eng ?? '-'),
    'Likes/Reaksi: ' + (cd.reactions ?? '-'),
    'Comments: ' + (cd.comments ?? '-'),
    'Shares: ' + (cd.shares ?? '-'),
    'Views: ' + (cd.views ?? '-'),
    cd.saved != null ? 'Saved: ' + cd.saved : '',
    'Engagement Rate: ' + (cd.engagement_rate || 'belum cukup data'),
  ].filter(Boolean).join('\n');

  if (bizName) {
    return [
      'Kamu adalah SiLaris, Asisten Iklan AI yang semangat dan inspiratif untuk bisnis lokal Indonesia.',
      '',
      'KONTEKS USER:',
      'Bisnis: ' + bizName,
      'Kategori: ' + (category || 'Umum'),
      'Region: ' + (city || 'Indonesia'),
      '',
      'Sesuaikan insight dengan industri: ' + (category || 'Umum') + '.',
      'Selalu ada 1 quick action konkret.',
      '',
      baseRules,
    ].join('\n');
  }

  return [
    'Kamu adalah SiLaris, Asisten Iklan AI yang semangat dan inspiratif untuk bisnis lokal Indonesia.',
    '',
    baseRules,
  ].join('\n');
}

function fmtV(n) {
  if (!n || n < 1) return '0';
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','') + 'jt';
  if (n >= 1000)    return (n/1000).toFixed(1).replace('.0','') + 'rb';
  return String(n);
}

export default function SiLarisScreen({ onBack, campaign, analytics }) {
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [initialized, setInitialized] = useState(false);
  const historyRef = useRef([]);
  const bottomRef  = useRef(null);

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('radar_user_profile') || 'null'); } catch { return null; }
  })();

  const isScheduled = campaign?.status === 'scheduled';
  const cd           = buildCampaignData(campaign, analytics);
  const systemPrompt = buildSystemPrompt(profile, cd, isScheduled);

  const initialChips = isScheduled 
    ? ['Lihat detail jadwal', 'Bagikan ke tim'] 
    : ['Lihat performa', 'Optimalkan targeting', 'Bagikan ke tim'];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  /* Auto-insight saat pertama buka */
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    if (isScheduled) {
      callAI(`Tulis ringkasan singkat bahwa campaign "${cd.name}" sudah dijadwalkan secara otomatis dan tips jam posting optimal.`, true);
    } else {
      callAI(`Analisa campaign "${cd.name}" dan berikan auto-insight mengikuti format MODE 1.`, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callAI = async (text, isAuto) => {
    setLoading(true);
    if (!isAuto) {
      historyRef.current.push({ role:'user', content: text });
      setMessages(prev => [...prev, { type:'user', text }]);
      setInput('');
    }

    const msgs = isAuto
      ? [{ role:'user', content: text }]
      : historyRef.current.slice(-6).map(m => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/silaris-chat`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ systemPrompt, messages: msgs }),
      });
      const data  = await resp.json();
      const reply = data?.reply || 'Maaf, ada gangguan. Coba lagi ya!';
      historyRef.current.push({ role:'assistant', content: reply });
      setMessages(prev => [...prev, { type:'ai', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { type:'ai', text:'Koneksi bermasalah. Coba lagi ya!' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => { if (input.trim() && !loading) callAI(input.trim(), false); };

  const handleChipClick = async (chipText) => {
    if (loading) return;
    
    // Add user message to UI
    setMessages(prev => [...prev, { type: 'user', text: chipText }]);
    
    if (chipText === 'Lihat detail jadwal') {
      setLoading(true);
      setTimeout(() => {
        const schedTimeStr = campaign?.scheduled_at 
          ? new Date(campaign.scheduled_at).toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
          : '—';
        const platLabel = { ig:'Instagram', meta:'Facebook', tiktok:'TikTok', youtube:'YouTube' }[(campaign?.platforms||[])[0]] || 'Instagram';
        const reply = `Iklan dijadwalkan pada:<br/><br/>Waktu: <strong>${schedTimeStr}</strong><br/>Platform: <strong>${platLabel}</strong><br/>Status: Terjadwal otomatis<br/><br/>Anda dapat membatalkan atau mengubah jadwal sebelum waktu tayang.`;
        setMessages(prev => [...prev, { type: 'ai', text: reply }]);
        setLoading(false);
      }, 600);
    } else if (chipText === 'Bagikan ke tim') {
      setLoading(true);
      setTimeout(() => {
        const reply = `Konten campaign <strong>${campaign?.name || 'Iklan Baru'}</strong> siap dibagikan ke tim! Anda dapat menyalin tautan postingan atau laporan performa ini.`;
        setMessages(prev => [...prev, { type: 'ai', text: reply }]);
        setLoading(false);
      }, 600);
    } else {
      callAI(chipText, false);
    }
  };

  const platColor = { ig:'#E1306C', meta:'#1877F2', tiktok:'#010101', youtube:'#FF0000' };
  const plat  = (campaign?.platforms||[])[0] || 'ig';
  const color = platColor[plat] || 'var(--m-brand)';

  return (
    <div style={{ position:'fixed', inset:0, background:'#F9F9FB', zIndex:99999, display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'#fff', borderBottom:'1px solid #ECECF1', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button onClick={onBack} style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#fff', border:'1px solid #ECECF1', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'var(--m-brand)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
              <img src="/logo-dashboard.png" alt="SiLaris" style={{ width:'24px', height:'24px', objectFit:'contain' }} />
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <span style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'800', color:'var(--m-ink)' }}>SiLaris</span>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#34A853' }} />
              </div>
              <span style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>Asisten cerdas · online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat */}
      <main style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>

        {/* Campaign card context */}
        <div style={{ background:'#fff', borderRadius:'16px', padding:'12px', border:'1px solid #ECECF1', display:'flex', gap:'12px' }}>
          {campaign?.thumbUrl
            ? <img src={campaign.thumbUrl} alt="" style={{ width:'72px', height:'72px', borderRadius:'10px', objectFit:'cover', flexShrink:0 }} onError={e=>{e.target.style.display='none';}} />
            : <div style={{ width:'72px', height:'72px', borderRadius:'10px', background:color+'20', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700', color }}>{(campaign?.format||'POST').toUpperCase()}</span>
              </div>
          }
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'var(--m-font)', fontSize:'14px', fontWeight:'800', color:'var(--m-ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'4px' }}>{cd.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
              <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', fontWeight:'700', color: isScheduled ? '#791ADB' : campaign?.status==='running'?'#34A853':'#d97706', background: isScheduled ? '#F3E8FF' : campaign?.status==='running'?'#E6F4EA':'#FEF3C7', padding:'2px 7px', borderRadius:'4px' }}>
                {isScheduled ? 'Terjadwal' : campaign?.status==='running'?'Berjalan':'Diarsipkan'}
              </span>
              {cd.post_time && <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)' }}>{cd.post_time}</span>}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              {!isScheduled && cd.views != null && <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)' }}>Views: <strong style={{color:'var(--m-ink)'}}>{fmtV(cd.views)}</strong></span>}
              {!isScheduled && cd.reach != null && (
                <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', display:'flex', alignItems:'center', gap:'2px' }}>
                  Reach: <strong style={{color:'var(--m-ink)'}}>{fmtV(cd.reach)}</strong>
                  {cd.reach > 0 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>}
                </span>
              )}
              {isScheduled && (
                <span style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)' }}>
                  Akan tayang otomatis
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ display:'flex', justifyContent:msg.type==='user'?'flex-end':'flex-start', gap:'8px', alignItems:'flex-start' }}>
            {msg.type === 'ai' && (
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--m-brand)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', marginTop:'2px', overflow:'hidden' }}>
                <img src="/logo-dashboard.png" alt="" style={{ width:'18px', height:'18px', objectFit:'contain' }} />
              </div>
            )}
            {msg.type === 'user' ? (
              <div style={{ maxWidth:'85%' }}>
                <div style={{ background:'var(--m-brand)', color:'#fff', padding:'12px 14px', borderRadius:'16px', borderBottomRightRadius:'4px', fontFamily:'var(--m-font)', fontSize:'14px', lineHeight:'1.5' }}>{msg.text}</div>
                <div style={{ fontFamily:'var(--m-font)', fontSize:'11px', color:'var(--m-ink-sub)', marginTop:'4px', textAlign:'right', marginRight:'4px' }}>Terkirim</div>
              </div>
            ) : (
              <div
                style={{ maxWidth:'90%', background:'#fff', borderRadius:'16px', borderTopLeftRadius:'4px', padding:'14px', border:'1px solid #ECECF1', fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)', lineHeight:'1.6' }}
                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>') }}
              />
            )}
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display:'flex', gap:'8px', alignItems:'flex-start' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--m-brand)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
              <img src="/logo-dashboard.png" alt="" style={{ width:'18px', height:'18px', objectFit:'contain' }} />
            </div>
            <div style={{ background:'#fff', borderRadius:'16px', borderTopLeftRadius:'4px', padding:'14px', border:'1px solid #ECECF1', display:'flex', gap:'5px', alignItems:'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:'7px', height:'7px', borderRadius:'50%', background:'var(--m-brand)', opacity:0.4, animation:`pulse 1.2s ease-in-out ${i*0.4}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height:'4px' }} />
      </main>

      {/* Chips */}
      {initialChips.length > 0 && (
        <div style={{ display:'flex', gap:'8px', padding:'10px 16px', overflowX:'auto', background:'#fff', borderTop:'1px solid #ECECF1', flexShrink:0, WebkitOverflowScrolling:'touch' }}>
          {initialChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              disabled={loading}
              style={{
                padding:'8px 14px',
                borderRadius:'999px',
                background:'#F3E8FF',
                border:'1px solid #D6BCFA',
                color:'#791ADB',
                fontFamily:'var(--m-font)',
                fontSize:'12px',
                fontWeight:'700',
                cursor:'pointer',
                whiteSpace:'nowrap',
                transition:'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <footer style={{ padding:'12px 16px', background:'#fff', borderTop:'1px solid #ECECF1', paddingBottom:'calc(12px + env(safe-area-inset-bottom))', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ flex:1, height:'44px', borderRadius:'999px', background:'#F5F5F7', display:'flex', alignItems:'center', padding:'0 16px' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ketik pesan ke SiLaris..."
              style={{ border:'none', background:'transparent', width:'100%', outline:'none', fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink)' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{ width:'44px', height:'44px', borderRadius:'50%', background:input.trim()?'var(--m-brand)':'#E5E7EB', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:input.trim()?'pointer':'default', flexShrink:0, transition:'background 0.2s', boxShadow:input.trim()?'0 4px 12px rgba(108,92,231,0.3)':'none' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft:'-2px', marginTop:'2px' }}>
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}

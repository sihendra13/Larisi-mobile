import React, { useState } from 'react';

export default function SilarisV2Screen() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Halo bos! Saya SiLaris V2 (Asisten AI Larisi). Ada yang bisa saya bantu hari ini? 🚀' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    
    // 1. Tambahkan pesan user ke UI
    const newMessages = [...messages, { id: Date.now(), role: 'user', content: userText }];
    setMessages(newMessages);
    
    // Tambahkan indikator loading sementara
    const loadingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: loadingId, role: 'assistant', content: 'SiLaris sedang berpikir... 💭' }]);

    try {
      // 2. Format history pesan untuk dikirim ke API (tanpa ID)
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      
      // 3. Panggil API Route PWA
      const res = await fetch('/api/silaris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });
      
      const data = await res.json();
      
      // 4. Hapus loading & tampilkan balasan asli
      setMessages(prev => prev.filter(m => m.id !== loadingId));

      if (res.ok && data.message) {
        setMessages(prev => [...prev, { id: Date.now() + 2, ...data.message }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: `⚠️ Error: ${data.error || 'Gagal merespons.'}` }]);
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: '⚠️ Koneksi terputus.' }]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0e0e12', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ padding: '16px', background: '#1e1e24', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #2d2d39' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--m-brand, #791ADB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo-dashboard.png" alt="SiLaris" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>SiLaris V2 (Jarvis)</div>
          <div style={{ fontSize: '12px', color: '#888' }}>Asisten Marketing Otomatis</div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              maxWidth: '80%', 
              padding: '12px 16px', 
              borderRadius: '16px', 
              background: msg.role === 'user' ? 'var(--m-brand, #791ADB)' : '#2d2d39',
              borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
              borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
              lineHeight: '1.4',
              fontSize: '14px'
            }}>
              
              {/* Jika pesan biasa */}
              {msg.type !== 'tool_call' && (
                <div>{msg.content}</div>
              )}

              {/* Jika pesan berupa tool_call (Jarvis mengeksekusi aksi) */}
              {msg.type === 'tool_call' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px' }}>✨</span>
                    <strong style={{ color: '#00e676' }}>Aksi Dijalankan!</strong>
                  </div>
                  <div style={{ background: '#1e1e24', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #00e676' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Draft Campaign Baru:</div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}>{msg.args?.title || 'Campaign Tanpa Judul'}</div>
                    
                    <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '4px' }}>
                      <strong>Platform:</strong> {msg.args?.platform || '-'}
                    </div>
                    {msg.args?.caption && (
                      <div style={{ fontSize: '13px', color: '#ccc', marginTop: '8px', fontStyle: 'italic' }}>
                        "{msg.args.caption}"
                      </div>
                    )}
                    
                    <button 
                      onClick={() => window.location.href = `/silaris-v2/dapur?title=${encodeURIComponent(msg.args?.title || '')}&platform=${encodeURIComponent(msg.args?.platform || '')}&caption=${encodeURIComponent(msg.args?.caption || '')}`}
                      style={{ marginTop: '12px', width: '100%', padding: '8px', background: '#3a3a48', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Lihat di Dapur Konten 👉
                    </button>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '13px', color: '#aaa' }}>
                    Siap Bos! Draft-nya sudah saya siapkan dan otomatis masuk ke Dapur Konten. Tinggal di-review saja ya.
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px', background: '#1e1e24', borderTop: '1px solid #2d2d39' }}>
        <div style={{ display: 'flex', gap: '12px', background: '#0e0e12', borderRadius: '24px', padding: '4px 4px 4px 16px', alignItems: 'center' }}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Tanya SiLaris..." 
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '15px' }}
          />
          <button 
            onClick={handleSend}
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--m-brand, #791ADB)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

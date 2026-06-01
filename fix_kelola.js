const fs = require('fs');
const path = './src/components/v2/KelolaScreen.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix fmtDate for iOS Safari (replace space with T if needed)
content = content.replace(
  "function fmtDate(iso) {\n  if (!iso) return '';\n  const d = new Date(iso);",
  "function fmtDate(iso) {\n  if (!iso) return '';\n  const d = new Date(iso.replace(' ', 'T'));"
);

// 2. Fix Date parsing in matchPost
content = content.replace(
  "const campTime = new Date(campaign.created_at).getTime();",
  "const campTime = new Date(campaign.created_at.replace(' ', 'T')).getTime();"
);
content = content.replace(
  "const t = new Date(p.posted_at || p.published_at || p.created_at || p.scheduled_at || 0).getTime();",
  "const pTimeStr = p.posted_at || p.published_at || p.created_at || p.scheduled_at || '';\n      const t = new Date(pTimeStr.replace(' ', 'T')).getTime();"
);

// 3. Fix Detail view Thumbnail skeleton & badges
const oldDetailThumb = `            {/* Thumbnail */}
            <div style={{ width:'100%', aspectRatio:'16/9', borderRadius:'12px', overflow:'hidden', background: c.thumbColor || '#791ADB', position:'relative' }}>
              {c.thumbUrl
                ? <img src={c.thumbUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                : <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />
              }
              <div style={{ position:'absolute', bottom:'10px', left:'10px', background:'rgba(0,0,0,0.5)', color:'#fff', padding:'4px 8px', borderRadius:'6px', display:'flex', alignItems:'center', gap:'4px' }}>
                {c.hasVideo && <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>}
                <span style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700' }}>{(c.format || 'POST').toUpperCase()}</span>
              </div>
            </div>`;

const newDetailThumb = `            {/* Thumbnail */}
            <div style={{ width:'100%', aspectRatio:'16/9', borderRadius:'12px', overflow:'hidden', background: '#E5E7EB', position:'relative' }}>
              {c.thumbUrl
                ? <img src={c.thumbUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                : <div style={{ position:'absolute', inset:0, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: '#D1D5DB' }} />
              }
              <div style={{ position:'absolute', bottom:'10px', left:'10px', background:'rgba(0,0,0,0.5)', color:'#fff', padding:'4px 8px', borderRadius:'6px', display:'flex', alignItems:'center', gap:'4px' }}>
                {(c.format === 'reel' || c.format === 'video' || c.hasVideo)
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                  : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                }
                <span style={{ fontFamily:'var(--m-font)', fontSize:'10px', fontWeight:'700' }}>{(c.format || 'POST').toUpperCase()}</span>
              </div>
            </div>`;
content = content.replace(oldDetailThumb, newDetailThumb);

// 4. Move Timestamp up in Detail view
const oldTimestamp = `                <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'4px' }}>
                  {platformLabel(c.platforms)} · {c.format?.toUpperCase() || 'POST'}
                </div>
                {/* Timestamp — link ke postingan kalau ada post_url */}
                {c.post_url
                  ? <a href={c.post_url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'4px', textDecoration:'none' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      <span style={{ fontFamily:'var(--m-font)', fontSize:'12px', fontWeight:'700', color:'var(--m-brand)', textDecoration:'underline', textUnderlineOffset:'2px' }}>{fmtDate(c.created_at)}</span>
                    </a>
                  : <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)' }}>{fmtDate(c.created_at)}</div>
                }`;

const newTimestamp = `                <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'4px', display:'flex', alignItems:'center', gap:'4px', flexWrap:'wrap' }}>
                  <span>{platformLabel(c.platforms)} · {(c.format || 'POST').toUpperCase()} · </span>
                  {c.post_url
                    ? <a href={c.post_url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'4px', textDecoration:'none' }}>
                        <span style={{ fontWeight:'700', color:'var(--m-brand)', textDecoration:'underline', textUnderlineOffset:'2px' }}>{fmtDate(c.created_at)}</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    : <span>{fmtDate(c.created_at)}</span>
                  }
                </div>`;
content = content.replace(oldTimestamp, newTimestamp);

// 5. Fix List view Thumbnail skeleton & badges
const oldListThumb = `              <div
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
                  }`;

const newListThumb = `              <div
                key={camp.id}
                onClick={() => openDetail(camp)}
                style={{ aspectRatio:'1/1', borderRadius:'16px', position:'relative', cursor:'pointer', overflow:'hidden', background: '#E5E7EB', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}
              >
                {/* Skeleton Loader */}
                {!camp.thumbUrl && (
                  <div style={{ position:'absolute', inset:0, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: '#D1D5DB' }} />
                )}
                {/* Thumbnail image */}
                {camp.thumbUrl && (
                  <img src={camp.thumbUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                )}

                {/* Format badge — ikon berdasarkan file type (video/foto), label berdasarkan format */}
                <div style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.4)', borderRadius:'6px', padding:'4px 6px', display:'flex', alignItems:'center', gap:'3px' }}>
                  {(camp.format === 'reel' || camp.format === 'video' || camp.hasVideo)
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  }`;
content = content.replace(oldListThumb, newListThumb);

fs.writeFileSync(path, content, 'utf8');

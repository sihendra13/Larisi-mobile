const fs = require('fs');
const path = './src/components/v2/KelolaScreen.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Move timestamp and rearrange header in Detail view
const oldHeader = `<div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'4px', display:'flex', alignItems:'center', gap:'4px', flexWrap:'wrap' }}>
                  <span>{platformLabel(c.platforms)} · {(c.format || 'POST').toUpperCase()} · </span>
                  {c.post_url
                    ? <a href={c.post_url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'4px', textDecoration:'none' }}>
                        <span style={{ fontWeight:'700', color:'var(--m-brand)', textDecoration:'underline', textUnderlineOffset:'2px' }}>{fmtDate(c.created_at)}</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    : <span>{fmtDate(c.created_at)}</span>
                  }
                </div>`;

const newHeader = `<div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'2px' }}>
                  {c.username ? \`@\${c.username}\` : platformLabel(c.platforms)} · {platformLabel(c.platforms)} · {(c.format || 'POST').toUpperCase()}
                </div>
                <div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'4px' }}>
                  {c.post_url
                    ? <a href={c.post_url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'4px', textDecoration:'none' }}>
                        <span style={{ fontWeight:'700', color:'var(--m-brand)', textDecoration:'underline', textUnderlineOffset:'2px' }}>{fmtDate(c.created_at)}</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    : <span>{fmtDate(c.created_at)}</span>
                  }
                </div>`;

// First remove the old username display
const oldUsername = `<div style={{ fontFamily:'var(--m-font)', fontSize:'12px', color:'var(--m-ink-sub)', marginBottom:'2px' }}>
                  {c.username ? \`@\${c.username}\` : platformLabel(c.platforms)}
                </div>`;
content = content.replace(oldUsername, "");
content = content.replace(oldHeader, newHeader);


// 2. Fix exact match by casting to String
content = content.replace(
  "const exact = posts.find(p => p.platform_post_id === campaign.platform_post_id);",
  "const exact = posts.find(p => String(p.platform_post_id) === String(campaign.platform_post_id));"
);

// 3. Add auto-refresh interval for Detail View
// We'll insert a useEffect right after openDetail
const openDetailEndStr = `    // Simpan avatar + username dari akun IG ke camp untuk ditampilkan di detail
    if (acc?.avatar_url) setSelectedCamp(prev => ({ ...prev, avatarUrl: acc.avatar_url }));
    if (acc?.username)   setSelectedCamp(prev => ({ ...prev, username: acc.username }));
  }, [accessToken]);`;

const autoRefreshHook = `    // Simpan avatar + username dari akun IG ke camp untuk ditampilkan di detail
    if (acc?.avatar_url) setSelectedCamp(prev => ({ ...prev, avatarUrl: acc.avatar_url }));
    if (acc?.username)   setSelectedCamp(prev => ({ ...prev, username: acc.username }));
  }, [accessToken]);

  /* ── Auto-refresh analytics for detail view every 30s ── */
  useEffect(() => {
    if (!selectedCamp) return;
    const interval = setInterval(() => {
      openDetail(selectedCamp); // refresh silent or with loading?
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedCamp, openDetail]);`;

// Need to make sure openDetail doesn't set loading state to true if it's already open, so it doesn't blink.
// We can modify openDetail to take an optional param.
const openDetailStart = `const openDetail = useCallback(async (camp) => {
    setSelectedCamp(camp);
    setAnalytics(null);
    setLoadingAn(true);`;
const openDetailStartNew = `const openDetail = useCallback(async (camp, silent = false) => {
    if (!silent) {
      setSelectedCamp(camp);
      setAnalytics(null);
      setLoadingAn(true);
    }`;
content = content.replace(openDetailStart, openDetailStartNew);
content = content.replace("setLoadingAn(false);", "if (!silent) setLoadingAn(false); else { /* done background refresh */ }");

const autoRefreshHookNew = `    // Simpan avatar + username dari akun IG ke camp untuk ditampilkan di detail
    if (acc?.avatar_url && !silent) setSelectedCamp(prev => ({ ...prev, avatarUrl: acc.avatar_url }));
    if (acc?.username && !silent)   setSelectedCamp(prev => ({ ...prev, username: acc.username }));
  }, [accessToken]);

  /* ── Auto-refresh analytics for detail view every 15s ── */
  useEffect(() => {
    if (!selectedCamp) return;
    const interval = setInterval(() => {
      openDetail(selectedCamp, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedCamp, openDetail]);`;
content = content.replace(openDetailEndStr, autoRefreshHookNew);


fs.writeFileSync(path, content, 'utf8');

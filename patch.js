const fs = require('fs');
let content = fs.readFileSync('src/components/v2/KelolaScreen.js', 'utf8');

content = content.replace(
  "  const [mediaTypeFallback, setMediaTypeFallback] = useState({});\n  const repairingCampaignsRef = useRef(new Set());",
  "  const [mediaTypeFallback, setMediaTypeFallback] = useState({});\n  const [retroFetchComplete, setRetroFetchComplete] = useState(false);\n  const repairingCampaignsRef = useRef(new Set());"
);

content = content.replace(
  `        }
      }
    });
  }, [sessionId, accessToken]);`,
  `        }
      }
      setRetroFetchComplete(true);
    }).catch(() => {
      setLoading(false);
      setRetroFetchComplete(true);
    });
  }, [sessionId, accessToken]);`
);

content = content.replace(
  `              ) : c.thumbUrl && mediaErrors[c.id] ? (
                <div style={{ position:'absolute', inset:0, background: '#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ color:'#9ca3af', fontSize:'11px', fontWeight:'600' }}>Foto tidak tersedia</span>
                </div>
              ) : (
                <div style={{ position:'absolute', inset:0, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: '#D1D5DB' }} />
              )}`,
  `              ) : (c.thumbUrl && mediaErrors[c.id]) || (!c.thumbUrl && retroFetchComplete) ? (
                <div style={{ position:'absolute', inset:0, background: '#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ color:'#9ca3af', fontSize:'11px', fontWeight:'600' }}>Foto tidak tersedia</span>
                </div>
              ) : (
                <div style={{ position:'absolute', inset:0, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: '#D1D5DB' }} />
              )}`
);

content = content.replace(
  `                {/* Skeleton Loader */}
                {!camp.thumbUrl && (
                  <div style={{ position:'absolute', inset:0, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: '#D1D5DB' }} />
                )}`,
  `                {/* Skeleton Loader */}
                {!camp.thumbUrl && !retroFetchComplete && (
                  <div style={{ position:'absolute', inset:0, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: '#D1D5DB' }} />
                )}`
);

content = content.replace(
  `                {/* Fallback Placeholder */}
                {camp.thumbUrl && mediaErrors[camp.id] && (
                  <div style={{ position:'absolute', inset:0, background: '#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style={{ color:'#9ca3af', fontSize:'11px', fontWeight:'600' }}>Foto tidak tersedia</span>
                  </div>
                )}`,
  `                {/* Fallback Placeholder */}
                {((camp.thumbUrl && mediaErrors[camp.id]) || (!camp.thumbUrl && retroFetchComplete)) && (
                  <div style={{ position:'absolute', inset:0, background: '#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style={{ color:'#9ca3af', fontSize:'11px', fontWeight:'600' }}>Foto tidak tersedia</span>
                  </div>
                )}`
);

fs.writeFileSync('src/components/v2/KelolaScreen.js', content, 'utf8');

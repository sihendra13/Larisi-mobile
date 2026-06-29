const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace desktop thumbnail block
  const oldDesktop = `{c.thumbUrl && !mediaErrors[c.id] ? (
                isVideoUrl(c.thumbUrl) ? (
                  <video
                    src={c.thumbUrl}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    muted
                    playsInline
                    autoPlay
                    loop
                    onError={() => {
                      setMediaErrors(prev => ({ ...prev, [c.id]: true }));
                      handleMediaError(c.id);
                    }}
                  />
                ) : (
                  <img
                    src={c.thumbUrl}
                    alt=""
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={() => {
                      setMediaErrors(prev => ({ ...prev, [c.id]: true }));
                      handleMediaError(c.id);
                    }}
                  />
                )
              ) : c.thumbUrl && mediaErrors[c.id] ? (
                c.hasVideo ? (
                  <div style={{ position:'absolute', inset:0, background: '#1a1a2e', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                    <span style={{ fontSize:'28px', color:'#fff' }}>▶</span>
                    <span style={{ color:'#fff', fontSize:'11px', fontWeight:'700', letterSpacing:'0.05em' }}>VIDEO</span>
                  </div>
                ) : (
                  <div style={{ position:'absolute', inset:0, background: '#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style={{ color:'#9ca3af', fontSize:'12px', fontWeight:'600' }}>Foto tidak tersedia</span>
                  </div>
                )
              ) : (`;

  const newDesktop = `{c.thumbUrl && !mediaErrors[c.id] ? (
                <img
                  src={c.thumbUrl}
                  alt=""
                  style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={() => {
                    setMediaErrors(prev => ({ ...prev, [c.id]: true }));
                    handleMediaError(c.id);
                  }}
                />
              ) : c.thumbUrl && mediaErrors[c.id] ? (
                <div style={{ position:'absolute', inset:0, background: '#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ color:'#9ca3af', fontSize:'12px', fontWeight:'600' }}>Foto tidak tersedia</span>
                </div>
              ) : (`;

  // Replace mobile thumbnail block
  const oldMobile = `{camp.thumbUrl && !mediaErrors[camp.id] && (
                  isVideoUrl(camp.thumbUrl) ? (
                    <video
                      src={camp.thumbUrl}
                      style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                      muted
                      playsInline
                      autoPlay
                      loop
                      onError={() => {
                        setMediaErrors(prev => ({ ...prev, [camp.id]: true }));
                        handleMediaError(camp.id);
                      }}
                    />
                  ) : (
                    <img
                      src={camp.thumbUrl}
                      alt=""
                      style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                      onError={() => {
                        setMediaErrors(prev => ({ ...prev, [camp.id]: true }));
                        handleMediaError(camp.id);
                      }}
                    />
                  )
                )}
                {/* Fallback Placeholder */}
                {camp.thumbUrl && mediaErrors[camp.id] && (
                  camp.hasVideo ? (
                    <div style={{ position:'absolute', inset:0, background: '#1a1a2e', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                      <span style={{ fontSize:'24px', color:'#fff' }}>▶</span>
                      <span style={{ color:'#fff', fontSize:'10px', fontWeight:'700', letterSpacing:'0.05em' }}>VIDEO</span>
                    </div>
                  ) : (
                    <div style={{ position:'absolute', inset:0, background: '#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span style={{ color:'#9ca3af', fontSize:'11px', fontWeight:'600' }}>Foto tidak tersedia</span>
                    </div>
                  )
                )}`;

  const newMobile = `{camp.thumbUrl && !mediaErrors[camp.id] && (
                  <img
                    src={camp.thumbUrl}
                    alt=""
                    style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                    onError={() => {
                      setMediaErrors(prev => ({ ...prev, [camp.id]: true }));
                      handleMediaError(camp.id);
                    }}
                  />
                )}
                {/* Fallback Placeholder */}
                {camp.thumbUrl && mediaErrors[camp.id] && (
                  <div style={{ position:'absolute', inset:0, background: '#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style={{ color:'#9ca3af', fontSize:'11px', fontWeight:'600' }}>Foto tidak tersedia</span>
                  </div>
                )}`;

  if (content.includes(oldDesktop)) {
    content = content.replace(oldDesktop, newDesktop);
    console.log('Patched desktop in ' + filePath);
  } else {
    console.log('Failed to patch desktop in ' + filePath);
  }

  if (content.includes(oldMobile)) {
    content = content.replace(oldMobile, newMobile);
    console.log('Patched mobile in ' + filePath);
  } else {
    console.log('Failed to patch mobile in ' + filePath);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

patchFile('src/components/v2/KelolaScreen.js');

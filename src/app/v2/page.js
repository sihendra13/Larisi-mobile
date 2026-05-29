'use client';
import { useState, useEffect } from 'react';
import BottomNav      from '@/components/layout/BottomNav';
import PlatformScreen from '@/components/v2/PlatformScreen';
import AudiensScreen  from '@/components/v2/AudiensScreen';
import AsetScreen     from '@/components/v2/AsetScreen';
import CaptionScreen  from '@/components/v2/CaptionScreen';
import KelolaScreen   from '@/components/v2/KelolaScreen';
import PerformaScreen from '@/components/v2/PerformaScreen';
import { getProfile, getSessionId, getAccessToken } from '@/lib/config';

export default function DapurV2() {
  const [screen,     setScreen]     = useState('platform');
  const [activeNav,  setActiveNav]  = useState('command');

  /* ── Shared state (dioper antar screen) ── */
  const [platform,   setPlatform]   = useState('instagram');
  const [format,     setFormat]     = useState('reel');
  const [locName,    setLocName]    = useState('');
  const [locFull,    setLocFull]    = useState('');
  const [locPop,     setLocPop]     = useState(50000);
  const [radius,     setRadius]     = useState(1.0);
  const [localOn,    setLocalOn]    = useState(true);
  const [travelerOn, setTravelerOn] = useState(false);
  const [files,      setFiles]      = useState([]);   /* { url, type, name }[] */
  const [persona,    setPersona]    = useState(null); /* detected master persona */
  const [caption,    setCaption]    = useState('');

  /* ── User data dari Supabase (via localStorage yang diisi V1 login flow) ── */
  const [profile,    setProfile]    = useState(null);
  const [sessionId,  setSessionId]  = useState(null);
  const [accessToken,setAccessToken]= useState(null);

  useEffect(() => {
    const tok = getAccessToken();

    /* ── Auth check: belum login → redirect ke V1 login page ── */
    if (!tok) {
      window.location.href = '/login.html';
      return;
    }

    const p   = getProfile();
    const sid = getSessionId();
    if (p)   setProfile(p);
    if (sid) setSessionId(sid);
    setAccessToken(tok);

    /* Set lokasi default dari profil bisnis user */
    if (p?.kecamatan) {
      setLocName(p.kecamatan);
      setLocFull([p.kecamatan, p.kabupaten || p.city].filter(Boolean).join(', '));
    } else {
      setLocName('Sumbersari');
      setLocFull('Sumbersari, Bantul');
    }
  }, []);

  const BACK = { audiens:'platform', aset:'audiens', caption:'aset' };
  const goTo   = (s) => setScreen(s);
  const goBack = () => { if (BACK[screen]) goTo(BACK[screen]); };

  return (
    <div id="app-root" className="mobile-app-root">

      <div style={{ display: activeNav === 'command' ? 'contents' : 'none' }}>
        {screen === 'platform' && (
          <PlatformScreen
            platform={platform}
            onSelectPlatform={setPlatform}
            onNext={() => goTo('audiens')}
          />
        )}

        {screen === 'audiens' && (
          <AudiensScreen
            platform={platform}
            onBack={goBack}
            onNext={() => goTo('aset')}
            locName={locName}   setLocName={setLocName}
            locFull={locFull}   setLocFull={setLocFull}
            locPop={locPop}     setLocPop={setLocPop}
            radius={radius}     setRadius={setRadius}
            localOn={localOn}   setLocalOn={setLocalOn}
            travelerOn={travelerOn} setTravelerOn={setTravelerOn}
          />
        )}

        {screen === 'aset' && (
          <AsetScreen
            platform={platform}
            format={format}       onFormatChange={setFormat}
            files={files}         onFilesChange={setFiles}
            onBack={goBack}
            onNext={(p) => { if (p) setPersona(p); goTo('caption'); }}
          />
        )}

        {screen === 'caption' && (
          <CaptionScreen
            platform={platform}
            format={format}
            files={files}
            locName={locName}
            locFull={locFull}
            locPop={locPop}
            radius={radius}
            localOn={localOn}
            travelerOn={travelerOn}
            persona={persona}
            profile={profile}
            caption={caption}
            setCaption={setCaption}
            onBack={goBack}
            onUbahAset={() => goTo('aset')}
          />
        )}
      </div>

      {activeNav === 'monitor' && <KelolaScreen sessionId={sessionId} accessToken={accessToken} />}
      {activeNav === 'analytics' && <PerformaScreen />}

      <BottomNav activeNav={activeNav} onSwitch={setActiveNav} />
    </div>
  );
}

'use client';
import { useState } from 'react';
import BottomNav      from '@/components/layout/BottomNav';
import PlatformScreen from '@/components/v2/PlatformScreen';
import AudiensScreen  from '@/components/v2/AudiensScreen';
import AsetScreen     from '@/components/v2/AsetScreen';
import CaptionScreen  from '@/components/v2/CaptionScreen';
import KelolaScreen   from '@/components/v2/KelolaScreen';
import PerformaScreen from '@/components/v2/PerformaScreen';

export default function DapurV2() {
  const [screen,     setScreen]     = useState('platform');
  const [activeNav,  setActiveNav]  = useState('command');

  /* ── Shared state (dioper antar screen) ── */
  const [platform,   setPlatform]   = useState('instagram');
  const [format,     setFormat]     = useState('reel');
  const [locName,    setLocName]    = useState('Sumbersari');
  const [locFull,    setLocFull]    = useState('Sumbersari, Bantul');
  const [locPop,     setLocPop]     = useState(50000);
  const [radius,     setRadius]     = useState(1.0);
  const [localOn,    setLocalOn]    = useState(true);
  const [travelerOn, setTravelerOn] = useState(false);
  const [files,      setFiles]      = useState([]);   /* { url, type, name }[] */
  const [persona,    setPersona]    = useState(null); /* detected master persona */
  const [caption,    setCaption]    = useState('');

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
            caption={caption}
            setCaption={setCaption}
            onBack={goBack}
            onUbahAset={() => goTo('aset')}
          />
        )}
      </div>

      {activeNav === 'monitor' && <KelolaScreen />}
      {activeNav === 'analytics' && <PerformaScreen />}

      <BottomNav activeNav={activeNav} onSwitch={setActiveNav} />
    </div>
  );
}

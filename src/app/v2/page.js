'use client';
import { useState, useEffect } from 'react';
import BottomNav         from '@/components/layout/BottomNav';
import PlatformScreen    from '@/components/v2/PlatformScreen';
import AudiensScreen     from '@/components/v2/AudiensScreen';
import AsetScreen        from '@/components/v2/AsetScreen';
import CaptionScreen     from '@/components/v2/CaptionScreen';
import KelolaScreen      from '@/components/v2/KelolaScreen';
import PerformaScreen    from '@/components/v2/PerformaScreen';
import LoginScreen       from '@/components/v2/LoginScreen';
import RegisterScreen    from '@/components/v2/RegisterScreen';
import OnboardingScreen  from '@/components/v2/OnboardingScreen';
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

  /* ── Auth state: 'loading' | 'login' | 'register' | 'onboarding' | 'app' ── */
  const [authState,  setAuthState]  = useState('loading');
  const [profile,    setProfile]    = useState(null);
  const [sessionId,  setSessionId]  = useState(null);
  const [accessToken,setAccessToken]= useState(null);
  const [userId,     setUserId]     = useState(null);

  useEffect(() => {
    const tok = getAccessToken();
    if (!tok) { setAuthState('login'); return; }

    const p   = getProfile();
    const sid = getSessionId();

    /* Parse userId dari JWT token */
    let uid = null;
    try {
      const payload = JSON.parse(atob(tok.split('.')[1]));
      uid = payload.sub || null;
    } catch {}

    setAccessToken(tok);
    setUserId(uid);
    if (sid) setSessionId(sid);

    if (p) {
      setProfile(p);
      applyLocation(p);
      /* Profil lengkap → langsung ke app */
      setAuthState(p.business_name ? 'app' : 'onboarding');
    } else {
      setAuthState('onboarding');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyLocation(p) {
    if (p?.kecamatan) {
      setLocName(p.kecamatan);
      setLocFull([p.kecamatan, p.kabupaten || p.city].filter(Boolean).join(', '));
    } else {
      setLocName('Sumbersari');
      setLocFull('Sumbersari, Bantul');
    }
  }

  /* Callback setelah login berhasil */
  const handleLoginSuccess = ({ access_token, user, profile: p }) => {
    setAccessToken(access_token);
    setUserId(user?.id || null);
    if (p) {
      setProfile(p);
      applyLocation(p);
      setAuthState(p.business_name ? 'app' : 'onboarding');
    } else {
      setAuthState('onboarding');
    }
  };

  /* Callback setelah register berhasil */
  const handleRegisterSuccess = ({ access_token, user }) => {
    setAccessToken(access_token);
    setUserId(user?.id || null);
    /* Profil belum ada → langsung ke onboarding */
    setAuthState('onboarding');
  };

  /* Callback setelah onboarding selesai */
  const handleOnboardingComplete = (p) => {
    setProfile(p);
    applyLocation(p);
    setAuthState('app');
  };

  const BACK = { audiens:'platform', aset:'audiens', caption:'aset' };
  const goTo   = (s) => setScreen(s);
  const goBack = () => { if (BACK[screen]) goTo(BACK[screen]); };

  /* ── Loading state ── */
  if (authState === 'loading') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F9FA' }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--m-font, sans-serif)' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #E4E4EB', borderTopColor: '#111827', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>Memuat...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  /* ── Login screen ── */
  if (authState === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onGoRegister={() => setAuthState('register')}
      />
    );
  }

  /* ── Register screen ── */
  if (authState === 'register') {
    return (
      <RegisterScreen
        onRegisterSuccess={handleRegisterSuccess}
        onGoLogin={() => setAuthState('login')}
      />
    );
  }

  /* ── Onboarding screen ── */
  if (authState === 'onboarding') {
    return (
      <OnboardingScreen
        accessToken={accessToken}
        userId={userId}
        onComplete={handleOnboardingComplete}
      />
    );
  }

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

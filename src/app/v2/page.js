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
import ProfilePanel      from '@/components/v2/ProfilePanel';
import ReminderModal     from '@/components/v2/ReminderModal';
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

  /* ── PWA install prompt ── */
  const [installPrompt,  setInstallPrompt]  = useState(null);
  const [showInstallBar, setShowInstallBar] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      /* Tampilkan hanya kalau belum pernah dismiss */
      const dismissed = localStorage.getItem('pwa_install_dismissed');
      if (!dismissed) setShowInstallBar(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallBar(false);
    setInstallPrompt(null);
  };

  const dismissInstall = () => {
    setShowInstallBar(false);
    localStorage.setItem('pwa_install_dismissed', '1');
  };

  /* ── Auth state: 'loading' | 'login' | 'register' | 'onboarding' | 'app' ── */
  const [authState,  setAuthState]  = useState('loading');
  const [profile,    setProfile]    = useState(null);
  const [sessionId,  setSessionId]  = useState(null);
  const [accessToken,setAccessToken]= useState(null);
  const [userId,     setUserId]     = useState(null);
  const [otpEmail,   setOtpEmail]   = useState('');
  const [needsOtp,   setNeedsOtp]   = useState(false);
  const [showPanel,  setShowPanel]  = useState(false);

  useEffect(() => {
    /* Simpan plan dari URL param jika ada (dari landing page) */
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    if (planParam) {
      localStorage.setItem('larisi_selected_plan', planParam);
      localStorage.removeItem('larisi_trial_start');
    }

    const tok = getAccessToken();
    if (!tok) {
      /* Ada ?plan= → user datang dari landing page → langsung register */
      setAuthState(planParam ? 'register' : 'login');
      return;
    }

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
      /* Hindari duplikasi kalau kecamatan == kabupaten (misal: kec. Bantul di kab. Bantul).
         Kalau sama → pakai provinsi sebagai pengganti kabupaten.
         Kalau provinsi juga kosong → tetap satu kata saja (lebih baik dari "Bantul, Bantul"). */
      const kab = (p.kabupaten || p.city || '').toLowerCase();
      const kec = p.kecamatan.toLowerCase();
      const second = kab && kab !== kec
        ? (p.kabupaten || p.city)
        : (p.provinsi || p.kabupaten || p.city || '');
      setLocFull([p.kecamatan, second].filter(Boolean).join(', '));
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
  const handleRegisterSuccess = ({ access_token, user, email, needsOtp: otp }) => {
    if (access_token) setAccessToken(access_token);
    setUserId(user?.id || null);
    setOtpEmail(email || '');
    setNeedsOtp(!!otp);
    /* Profil belum ada → ke onboarding (OTP di step 1 jika diperlukan) */
    setAuthState('onboarding');
  };

  /* Callback ketika OTP berhasil diverifikasi → dapat access_token baru */
  const handleOtpVerified = (tok) => {
    setAccessToken(tok);
  };

  /* Callback setelah onboarding selesai */
  const handleOnboardingComplete = (p) => {
    setProfile(p);
    applyLocation(p);
    setAuthState('app');
  };

  /* Callback setelah profil di-edit dari ProfilePanel */
  const handleProfileSaved = (p) => {
    setProfile(p);
    applyLocation(p);
    localStorage.setItem('radar_user_profile', JSON.stringify(p));
  };

  /* Logout */
  const handleLogout = () => {
    setAuthState('login');
    setProfile(null);
    setAccessToken(null);
    setUserId(null);
    setShowPanel(false);
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
        email={otpEmail}
        needsOtp={needsOtp}
        onComplete={handleOnboardingComplete}
        onTokenReceived={handleOtpVerified}
      />
    );
  }

  return (
    <div id="app-root" className="mobile-app-root">

      {/* ── PWA Install Banner ── */}
      {showInstallBar && (
        <div style={{
          position: 'fixed', bottom: '72px', left: '12px', right: '12px', zIndex: 1000,
          background: '#111827', borderRadius: '14px',
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}>
          <img src="/icons/icon-192.png" alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>Install Larisi</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Akses lebih cepat dari home screen</div>
          </div>
          <button onClick={handleInstall} style={{
            background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '7px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0,
          }}>Install</button>
          <button onClick={dismissInstall} style={{
            background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
            padding: '4px', fontSize: '16px', flexShrink: 0, lineHeight: 1,
          }}>✕</button>
        </div>
      )}

      <div style={{ display: activeNav === 'command' ? 'contents' : 'none' }}>
        {screen === 'platform' && (
          <PlatformScreen
            platform={platform}
            onSelectPlatform={setPlatform}
            onNext={() => goTo('audiens')}
            profile={profile}
            onAvatarClick={() => setShowPanel(true)}
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
            profile={profile}
            onAvatarClick={() => setShowPanel(true)}
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

      {activeNav === 'monitor' && (
        <KelolaScreen
          sessionId={sessionId}
          accessToken={accessToken}
          profile={profile}
          onAvatarClick={() => setShowPanel(true)}
        />
      )}
      {activeNav === 'analytics' && (
        <PerformaScreen
          profile={profile}
          onAvatarClick={() => setShowPanel(true)}
        />
      )}

      {/* ── Profile Panel (slide dari kanan) ── */}
      <ProfilePanel
        open={showPanel}
        onClose={() => setShowPanel(false)}
        onLogout={handleLogout}
        onSaved={handleProfileSaved}
        profile={profile}
        accessToken={accessToken}
        userId={userId}
      />

      {/* ── Reminder Modal (muncul setelah 7 detik untuk profil tidak lengkap) ── */}
      <ReminderModal
        profile={profile}
        onOpenProfile={() => { setShowPanel(true); }}
      />

      <BottomNav activeNav={activeNav} onSwitch={setActiveNav} />
    </div>
  );
}

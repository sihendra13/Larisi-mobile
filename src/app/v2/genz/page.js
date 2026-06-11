'use client';
import { useState, useEffect } from 'react';
import BottomNav         from '@/components/layout/BottomNav';
import PlatformScreen    from '@/components/v2/PlatformScreen';
import AsetScreen        from '@/components/v2/AsetScreen';
import CaptionScreen     from '@/components/v2/CaptionScreen';
import KelolaScreen      from '@/components/v2/KelolaScreen';
import PerformaScreen    from '@/components/v2/PerformaScreen';
import LoginScreen       from '@/components/v2/LoginScreen';
import RegisterScreen    from '@/components/v2/RegisterScreen';
import OnboardingScreen  from '@/components/v2/OnboardingScreen';
import SplashScreen      from '@/components/v2/SplashScreen';
import InstallModal      from '@/components/v2/InstallModal';
import ProfilePanel      from '@/components/v2/ProfilePanel';
import ReminderModal     from '@/components/v2/ReminderModal';
import PricingModal      from '@/components/v2/PricingModal';
import CancelSubscriptionModal from '@/components/v2/CancelSubscriptionModal';
import DuitkuModal       from '@/components/v2/DuitkuModal';
import MemeEditorScreen  from '@/components/v2/MemeEditorScreen';
import PublishMemeScreen from '@/components/v2/PublishMemeScreen';
import { getProfile, getSessionId, getAccessToken, getValidAccessToken, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';
import { handleOAuthRedirectCallback, syncSocialAccountsToSupabase } from '@/lib/connectSocial';

/* ── Mobile Toast Helper ── */
function showMobileToast(message, type = 'success') {
  const existing = document.getElementById('m-page-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'm-page-toast';
  const bg = type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#10B981';
  toast.style.cssText = `position:fixed;top:24px;left:50%;transform:translateX(-50%) translateY(-80px);background:${bg};color:#fff;padding:12px 20px;border-radius:14px;font-size:13px;font-weight:700;font-family:-apple-system,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.25);z-index:999999;white-space:normal;max-width:80vw;text-align:center;line-height:1.4;transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),opacity 0.35s ease;opacity:0;pointer-events:none;`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  }));
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(-80px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

export default function GenZPage() {
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
  const [autoOpenStory, setAutoOpenStory] = useState(false);

  /* ── Paywall & Pricing State ── */
  const [showPricing, setShowPricing] = useState(false);
  const [pricingTitle, setPricingTitle] = useState('Masa Trial Selesai!');
  const [pricingDesc, setPricingDesc] = useState('7 hari gratis Anda telah berakhir. Pilih paket untuk mulai berlangganan:');
  const [showDuitku, setShowDuitku] = useState(false);
  const [duitkuDetails, setDuitkuDetails] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  /* ── PWA install prompt ── */
  const [installPrompt,  setInstallPrompt]  = useState(null);
  const [showInstallBar, setShowInstallBar] = useState(false);

  useEffect(() => {
    if (window.__pwaInstallPrompt) {
      setInstallPrompt(window.__pwaInstallPrompt);
    }
    const handler = (e) => {
      e.preventDefault();
      window.__pwaInstallPrompt = e;
      setInstallPrompt(e);
      const dismissed = localStorage.getItem('larisi_install_dismissed');
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
    localStorage.setItem('larisi_install_dismissed', '1');
  };

  /* ── Auth state ── */
  const [authState,  setAuthState]  = useState('loading');
  const [profile,    setProfile]    = useState(null);
  const [sessionId,  setSessionId]  = useState(null);
  const [accessToken,setAccessToken]= useState(null);
  const [userId,     setUserId]     = useState(null);
  const [otpEmail,   setOtpEmail]   = useState('');
  const [needsOtp,   setNeedsOtp]   = useState(false);
  const [showPanel,  setShowPanel]  = useState(false);

  /* ── Flow State ── */
  const [showSplash, setShowSplash] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    handleOAuthRedirectCallback().then(result => {
      if (result) {
        const tok = getAccessToken();
        const uid = (() => {
          try {
            const payload = JSON.parse(atob(tok.split('.')[1]));
            return payload.sub || null;
          } catch { return null; }
        })();
        if (uid && tok) syncSocialAccountsToSupabase(uid, tok);
      }
    });

    (async () => {
      const splashShown = localStorage.getItem('larisi_splash_shown');
      const tok = await getValidAccessToken().catch(() => getAccessToken());

      const urlParams = new URLSearchParams(window.location.search);
      const planParam = urlParams.get('plan');
      if (planParam) {
        localStorage.setItem('larisi_selected_plan', planParam);
        localStorage.setItem('larisi_intent', 'register');
        localStorage.removeItem('larisi_trial_start');
      }

    const checkAndSetUserMode = (p) => {
      if (p && p.category) {
        const isCreator = p.category === 'konten_kreator' || p.category === 'genz_seller';
        const mode = isCreator ? 'creator' : 'umkm';
        localStorage.setItem('larisi_user_mode', mode);
        return mode;
      }
      return localStorage.getItem('larisi_user_mode');
    };

    const continueToAuth = () => {
        if (!tok) {
          const intent = localStorage.getItem('larisi_intent');
          const goToRegister = planParam || intent === 'register';
          setAuthState(goToRegister ? 'register' : 'login');
          return;
        }
        const pCached = getProfile();
        const cachedMode = checkAndSetUserMode(pCached);
        if (cachedMode === 'umkm') {
          window.location.replace('/v2');
          return;
        }
        const sid     = getSessionId();

        let uid = null;
        try {
          const payload = JSON.parse(atob(tok.split('.')[1]));
          uid = payload.sub || null;
        } catch {}

        setAccessToken(tok);
        setUserId(uid);
        if (sid) setSessionId(sid);

        if (pCached) {
          restoreSocialAccounts(pCached);
          setProfile(pCached);
          applyLocation(pCached);
          setAuthState(pCached.business_name ? 'app' : 'onboarding');
        }

        if (uid && tok) {
          fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${tok}` },
          }).then(r => r.ok ? r.json() : null).then(rows => {
            const fresh = rows?.[0];
            if (!fresh) { if (!pCached) setAuthState('onboarding'); return; }
            const freshMode = checkAndSetUserMode(fresh);
            if (freshMode === 'umkm') {
              window.location.replace('/v2');
              return;
            }

            localStorage.setItem('radar_user_profile', JSON.stringify(fresh));
            restoreSocialAccounts(fresh);
            setProfile(fresh);
            applyLocation(fresh);

            if (fresh.postforme_external_id) {
              localStorage.setItem('radar_session_id', fresh.postforme_external_id);
              setSessionId(fresh.postforme_external_id);
            } else {
              let extId = localStorage.getItem('radar_session_id');
              if (!extId || extId === uid) {
                extId = 'radar_user_' + Math.random().toString(36).slice(2, 10);
                localStorage.setItem('radar_session_id', extId);
              }
              fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}`, {
                method: 'PATCH',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${tok}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ postforme_external_id: extId }),
              }).catch(() => {});
            }

            setAuthState(fresh.business_name ? 'app' : 'onboarding');
          }).catch(() => { if (!pCached) setAuthState('onboarding'); });
        } else if (!pCached) {
          setAuthState('onboarding');
        }
      };

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

      if (isStandalone && !splashShown) {
        setShowSplash(true);
        setTimeout(() => {
          setShowSplash(false);
          localStorage.setItem('larisi_splash_shown', '1');
          continueToAuth();
        }, 4500);
      } else {
        setShowSplash(false);
        continueToAuth();
      }
    })();
  }, []);

  useEffect(() => {
    if (authState === 'app') {
      const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      const dismissed = localStorage.getItem('larisi_install_dismissed');
      
      if (isIOS && !isStandalone && !dismissed) {
        const timer = setTimeout(() => setShowInstallModal(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [authState]);

  function applyLocation(p) {
    if (p?.kecamatan) {
      setLocName(p.kecamatan);
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

  const restoreSocialAccounts = (profile) => {
    if (profile?.social_accounts) {
      try {
        localStorage.setItem('radar_social_accounts',
          typeof profile.social_accounts === 'string'
            ? profile.social_accounts
            : JSON.stringify(profile.social_accounts)
        );
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (!userId || authState !== 'app') return;

    const refreshAll = async () => {
      try {
        const freshTok = await getValidAccessToken();
        if (freshTok) setAccessToken(freshTok);
      } catch (e) {}

      if (typeof window !== 'undefined' && window.getUserProfile) {
        try {
          const { data, error } = await window.getUserProfile(userId);
          if (data && !error) {
            restoreSocialAccounts(data);
            setProfile(data);
          }
        } catch (e) {}
      }
    };

    refreshAll();
    const timer = setInterval(refreshAll, 30 * 60 * 1000);
    const onVisChange = () => { if (!document.hidden) refreshAll(); };
    window.addEventListener('focus', refreshAll);
    window.addEventListener('visibilitychange', onVisChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refreshAll);
      window.removeEventListener('visibilitychange', onVisChange);
    };
  }, [userId, authState]);

  const handleLoginSuccess = ({ access_token, user, profile: p }) => {
    setAccessToken(access_token);
    setUserId(user?.id || null);
    if (p) {
      restoreSocialAccounts(p);
      setProfile(p);
      applyLocation(p);
      setAuthState(p.business_name ? 'app' : 'onboarding');
    } else {
      setAuthState('onboarding');
    }
  };

  const triggerUpgrade = (title, desc) => {
    setPricingTitle(title || 'Upgrade Paket Anda');
    setPricingDesc(desc || 'Pilih paket yang sesuai untuk membuka fitur ini:');
    setShowPricing(true);
  };

  const handleSelectPlan = async (selectedPlan, amount) => {
    if (selectedPlan === 'freemium') {
      setShowPricing(false);
      return;
    }

    try {
      showMobileToast('Menghubungkan ke Duitku...', 'warning');
      const email = profile?.email || '';
      const name = profile?.business_name || profile?.full_name || 'Pelanggan Larisi';
      const phone = profile?.phone || profile?.phone_number || '081234567890';
      const orderId = 'LARISI-' + Date.now();

      const resp = await fetch(SUPABASE_URL + '/functions/v1/duitku-invoice', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, amount, email, name, phone, orderId, userId: profile?.id || '' })
      });
      const result = await resp.json();

      if (result.vaNumber || result.paymentUrl) {
        setShowPricing(false);
        setDuitkuDetails({ ...result, plan: selectedPlan, originalAmount: amount, amount: result.amount || amount, orderId });
        setShowDuitku(true);
      } else {
        throw new Error(result.error || 'Gagal membuat invoice Duitku');
      }
    } catch(err) {
      showMobileToast('Maaf, ' + err.message, 'error');
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelLoading(true);
      const tok = await getValidAccessToken(accessToken) || accessToken;
      if (!tok) throw new Error('Akses token tidak valid');

      const resp = await fetch(SUPABASE_URL + '/rest/v1/profiles?id=eq.' + profile?.id, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + tok, 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_plan: 'freemium', payment_status: 'cancelled', ai_launch_count: 10 })
      });

      if (!resp.ok) throw new Error('Gagal membatalkan subscription');

      setProfile({ ...profile, selected_plan: 'freemium', payment_status: 'cancelled', ai_launch_count: 10 });
      setShowCancelModal(false);
      setShowPricing(false);
      showMobileToast('✓ Subscription dibatalkan. Kembali ke Freemium.');
    } catch(err) {
      showMobileToast('Gagal membatalkan subscription. Coba lagi.', 'error');
    } finally {
      setIsCancelLoading(false);
    }
  };

  const handleRegisterSuccess = ({ access_token, user, email, needsOtp: otp }) => {
    if (access_token) setAccessToken(access_token);
    setUserId(user?.id || null);
    setOtpEmail(email || '');
    setNeedsOtp(!!otp);
    localStorage.removeItem('larisi_intent');
    setAuthState('onboarding');
  };

  const handleOtpVerified = (tok) => {
    setAccessToken(tok);
  };

  const handleOnboardingComplete = (p) => {
    restoreSocialAccounts(p);
    setProfile(p);
    applyLocation(p);
    
    if (p && p.category) {
      const isCreator = p.category === 'konten_kreator' || p.category === 'genz_seller';
      if (!isCreator) {
        localStorage.setItem('larisi_user_mode', 'umkm');
        window.location.replace('/v2');
        return;
      }
    }
    setAuthState('app');
  };

  const handleProfileSaved = (p) => {
    restoreSocialAccounts(p);
    setProfile(p);
    applyLocation(p);
    localStorage.setItem('radar_user_profile', JSON.stringify(p));
  };

  const handleLogout = () => {
    setAuthState('login');
    setProfile(null);
    setAccessToken(null);
    setUserId(null);
    setShowPanel(false);
  };

  /* ── GEN Z TRANSITION FLOW ── */
  const BACK = { aset: 'platform', caption: 'aset' };
  const goTo   = (s) => setScreen(s);
  const goBack = () => {
    if (BACK[screen]) {
      goTo(BACK[screen]);
    } else {
      // Jika menekan back di luar alur default, kembalikan ke monitor/dashboard
      setActiveNav('monitor');
    }
  };

  const handleLaunchSuccess = () => {
    const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const dismissed = localStorage.getItem('larisi_install_dismissed');

    if (!isIOS && !isStandalone && !dismissed) {
      setShowInstallModal(true);
    }

    setScreen('platform');
    setActiveNav('command');
  };

  if (showSplash) {
    return <SplashScreen />;
  }

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

  if (authState === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onGoRegister={() => setAuthState('register')}
      />
    );
  }

  if (authState === 'register') {
    return (
      <RegisterScreen
        onRegisterSuccess={handleRegisterSuccess}
        onGoLogin={() => setAuthState('login')}
      />
    );
  }

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

      <InstallModal 
        isOpen={showInstallModal} 
        onClose={() => {
          setShowInstallModal(false);
          localStorage.setItem('larisi_install_dismissed', '1');
        }} 
      />

      {showInstallBar && (
        <div style={{
          position: 'fixed', top: '12px', left: '12px', right: '12px', zIndex: 10000,
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
            onNext={() => goTo('aset')}
            onStartStoryMaker={(tool, file) => {
              if (file) {
                setFiles([file]);
              }
              if (tool === 'meme') {
                setScreen('meme-editor');
              } else {
                setScreen('aset');
                setAutoOpenStory(tool || 'story');
              }
            }}
            profile={profile}
            accessToken={accessToken}
            userId={userId}
            onAvatarClick={() => setShowPanel(true)}
            isGenZ={true}
          />
        )}

        {screen === 'meme-editor' && (
          <MemeEditorScreen
            file={files[0]}
            onBack={() => setScreen('platform')}
            onSave={(dataUrl, generatedCaption) => {
              setFiles([{ url: dataUrl, type: 'photo', name: 'meme-design.jpg' }]);
              setCaption(generatedCaption);
              setScreen('publish-meme');
            }}
            isGenZ={true}
          />
        )}

        {screen === 'publish-meme' && (
          <PublishMemeScreen
            imageUrl={files[0]?.url}
            caption={caption}
            onBack={() => setScreen('meme-editor')}
            profile={profile}
            isGenZ={true}
            accessToken={accessToken}
            sessionId={sessionId}
            userId={userId}
            files={files}
            locName={locName}
            locFull={locFull}
            locPop={locPop}
            radius={radius}
            setRadius={setRadius}
            localOn={localOn}
            travelerOn={travelerOn}
            onLaunchSuccess={handleLaunchSuccess}
            triggerUpgrade={triggerUpgrade}
          />
        )}

        {screen === 'aset' && (
          <AsetScreen
            platform={platform}
            format={format}       onFormatChange={setFormat}
            files={files}         onFilesChange={setFiles}
            onBack={goBack}
            onNext={(p) => { if (p) setPersona(p); goTo('caption'); }}
            isGenZ={true}
            autoOpenStory={autoOpenStory}
            onStoryOpened={() => setAutoOpenStory(false)}
          />
        )}

        {screen === 'caption' && (
          <CaptionScreen
            platform={platform}
            setPlatform={setPlatform}
            format={format}
            setFormat={setFormat}
            files={files}
            locName={locName}
            setLocName={setLocName}
            locFull={locFull}
            setLocFull={setLocFull}
            locPop={locPop}
            setLocPop={setLocPop}
            radius={radius}
            setRadius={setRadius}
            localOn={localOn}
            setLocalOn={setLocalOn}
            travelerOn={travelerOn}
            setTravelerOn={setTravelerOn}
            persona={persona}
            profile={profile}
            caption={caption}
            setCaption={setCaption}
            accessToken={accessToken}
            sessionId={sessionId}
            userId={userId}
            onBack={goBack}
            onUbahAset={() => goTo('aset')}
            onLaunchSuccess={handleLaunchSuccess}
            triggerUpgrade={triggerUpgrade}
            isGenZ={true}
          />
        )}
      </div>

      {activeNav === 'monitor' && (
        <KelolaScreen
          sessionId={sessionId}
          accessToken={accessToken}
          profile={profile}
          onAvatarClick={() => setShowPanel(true)}
          onNavigateToDapur={(plat) => {
            setPlatform(plat);
            setScreen('aset'); // Gen Z langsung lompat ke aset
            setActiveNav('command');
          }}
        />
      )}
      {activeNav === 'analytics' && (
        <PerformaScreen
          sessionId={sessionId}
          accessToken={accessToken}
          profile={profile}
          userId={userId}
          onAvatarClick={() => setShowPanel(true)}
          onGoToDapur={() => setActiveNav('command')}
          triggerUpgrade={triggerUpgrade}
        />
      )}

      <ProfilePanel
        open={showPanel}
        onClose={() => setShowPanel(false)}
        onLogout={handleLogout}
        onSaved={handleProfileSaved}
        onCancelSubscription={() => { setShowPanel(false); setShowCancelModal(true); }}
        onTriggerInstall={() => { setShowPanel(false); setShowInstallModal(true); }}
        profile={profile}
        accessToken={accessToken}
        userId={userId}
      />

      <ReminderModal
        profile={profile}
        onOpenProfile={() => { setShowPanel(true); }}
      />

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onSelectPlan={handleSelectPlan}
        onCancelClick={() => setShowCancelModal(true)}
        currentPlan={profile?.selected_plan || 'freemium'}
        title={pricingTitle}
        description={pricingDesc}
      />

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        currentPlan={profile?.selected_plan || 'freemium'}
        isLoading={isCancelLoading}
      />

      <DuitkuModal
        isOpen={showDuitku}
        onClose={() => setShowDuitku(false)}
        paymentDetails={duitkuDetails}
      />

      <BottomNav activeNav={activeNav} onSwitch={setActiveNav} isGenZ={true} />
    </div>
  );
}

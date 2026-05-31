import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

/* redirect_uri harus ke callback yang sudah support cross-origin ('*') */
const REDIRECT_URI = 'https://larisi.id/postforme-callback';

const INSTAGRAM_SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_insights',
  'instagram_manage_comments',
  'pages_read_engagement',
];

/**
 * Hubungkan akun sosial via PostForMe OAuth — identik dengan desktop onboarding.html
 *
 * Flow:
 * 1. Buka popup blank dulu (harus dari user gesture langsung, sebelum await)
 * 2. POST ke postforme-auth untuk dapat OAuth URL
 * 3. Arahkan popup ke OAuth URL
 * 4. Dengarkan postMessage dari postforme-callback.html
 * 5. Setelah berhasil, fetch detail akun dari postforme-proxy
 */
export function connectSocial({ platform, accessToken, userId, onStart, onDone, onCancel, onLog }) {
  /* Detect iOS PWA standalone — pakai polling approach */
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const useRedirect = false; // Disabled — redirect tidak bisa kembali ke PWA context
  onLog?.(`[connectSocial] Starting ${platform} connect on iOS=${isIOS}, Standalone=${isStandalone}`);

  /* Ambil atau buat external_id */
  let externalId = localStorage.getItem('radar_session_id');
  if (!externalId) {
    const profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
    externalId = profile.postforme_external_id
      || ('radar_user_' + Math.random().toString(36).slice(2, 10));
    localStorage.setItem('radar_session_id', externalId);
  }

  onStart?.(platform);

  let done = false;
  let popup = null;
  let pollInterval = null;
  let closedCheck = null;

  const cleanup = () => {
    if (closedCheck) clearInterval(closedCheck);
    if (pollInterval) clearInterval(pollInterval);
    window.removeEventListener('message', msgHandler);
    if (cleanup._visHandler) {
      document.removeEventListener('visibilitychange', cleanup._visHandler);
      cleanup._visHandler = null;
    }
  };

  /* Helper: fetch detail akun dari PostForMe & simpan ke localStorage */
  const fetchAndSaveAccount = async (accountIds) => {
    let accountData = { id: (accountIds || [])[0] || `pfm_${platform}_${Date.now()}`, platform, username: '', avatar_url: '' };
    try {
      const pfResp = await fetch(`${SUPABASE_URL}/functions/v1/postforme-proxy`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: `/v1/social-accounts?external_id=${encodeURIComponent(externalId)}`, method: 'GET' }),
      });
      if (pfResp.ok) {
        const pfData = await pfResp.json();
        const list = pfData.data || pfData.accounts || (Array.isArray(pfData) ? pfData : []);
        const match = list.find(a => (a.platform || a.provider || '').toLowerCase().startsWith(platform));
        if (match) {
          accountData = {
            id: match.id || accountData.id,
            platform,
            username: match.username || match.name || match.handle || '',
            avatar_url: match.avatar_url || match.profile_photo_url || match.profile_picture_url
                     || match.picture || match.avatar || match.image_url || '',
          };
        }
      }
    } catch (e) { console.warn('[connectSocial] proxy error:', e); }

    const existing = JSON.parse(localStorage.getItem('radar_social_accounts') || '[]');
    const filtered = existing.filter(a => a.platform !== platform);
    filtered.push(accountData);
    localStorage.setItem('radar_social_accounts', JSON.stringify(filtered));
    popup?.close();
    onDone?.(platform, accountData);
  };

  /* Poll satu kali ke PostForMe, return true jika akun baru ditemukan */
  const pollOnce = async (existingIds) => {
    if (done) return false;
    try {
      const pfResp = await fetch(`${SUPABASE_URL}/functions/v1/postforme-proxy`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: `/v1/social-accounts?external_id=${encodeURIComponent(externalId)}`, method: 'GET' }),
      });
      if (!pfResp.ok) return false;
      const pfData = await pfResp.json();
      const list = pfData.data || pfData.accounts || (Array.isArray(pfData) ? pfData : []);
      const match = list.find(a => {
        const plt = (a.platform || a.provider || '').toLowerCase();
        return plt.startsWith(platform);
      });
      if (match && !done) {
        done = true;
        cleanup();
        onLog?.(`[connectSocial] Found new account: ${match.username || match.name}`);
        const accountData = {
          id: match.id, platform,
          username: match.username || match.name || match.handle || '',
          avatar_url: match.avatar_url || match.profile_photo_url || match.profile_picture_url
                   || match.picture || match.avatar || match.image_url || '',
        };
        const existing2 = JSON.parse(localStorage.getItem('radar_social_accounts') || '[]');
        const filtered2 = existing2.filter(a => a.platform !== platform);
        filtered2.push(accountData);
        localStorage.setItem('radar_social_accounts', JSON.stringify(filtered2));
        popup?.close();
        onDone?.(platform, accountData);
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  };

  /* Polling strategy:
     - iOS PWA: JS suspended saat di background. Pakai visibilitychange sebagai trigger utama.
               Juga jalankan interval lambat (5s) sebagai backup kalau visibilitychange tidak fire.
     - Desktop: interval 3s + postMessage */
  const startPolling = (existingIds) => {
    onLog?.(`[connectSocial] Starting polling for ${platform}...`);
    let attempts = 0;
    const maxAttempts = 40;

    /* Interval sebagai backup */
    pollInterval = setInterval(async () => {
      if (done) { clearInterval(pollInterval); return; }
      attempts++;
      if (attempts > maxAttempts) { clearInterval(pollInterval); if (!done) { cleanup(); onCancel?.(); } return; }
      await pollOnce(existingIds);
    }, isIOS ? 5000 : 3000);

    /* visibilitychange: saat user balik ke app dari Safari — poll SEGERA */
    const onVisibilityChange = async () => {
      if (document.hidden || done) return;
      onLog?.(`[connectSocial] Foreground detected, polling now...`);
      await pollOnce(existingIds);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    cleanup._visHandler = onVisibilityChange;
  };

  /* Tidak perlu fetch existing IDs — langsung cari akun platform setelah OAuth selesai */
  let existingAccountIds = [];

  /* Fetch OAuth URL lalu buka popup */
  fetch(`${SUPABASE_URL}/functions/v1/postforme-auth`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform, redirect_uri: REDIRECT_URI, external_id: externalId,
      ...(platform === 'instagram' ? { scopes: INSTAGRAM_SCOPES } : {}),
    }),
  })
  .then(resp => { if (!resp.ok) throw new Error('Server error ' + resp.status); return resp.json(); })
  .then(data => {
    const authUrl = data.url || data.auth_url || data.redirect_url || data.authorization_url;
    if (!authUrl) throw new Error('URL OAuth tidak tersedia');
    onLog?.(`[connectSocial] Auth URL: ${authUrl?.substring(0, 50)}...`);

    popup = window.open('about:blank', 'postforme_oauth', 'width=520,height=700,left=100,top=80');
    onLog?.(`[connectSocial] Popup opened: ${popup ? 'SUCCESS' : 'NULL (BLOCKED)'}`);
    if (popup) {
      popup.location.href = authUrl;
      onLog?.(`[connectSocial] Redirecting popup to OAuth`);
    } else {
      window.open(authUrl, 'postforme_oauth', 'width=520,height=700,left=100,top=80');
    }

    /* Mulai polling untuk iOS PWA (postMessage mungkin tidak sampai) */
    startPolling(existingAccountIds);
  })
  .catch(err => {
    console.error('[connectSocial] error:', err);
    popup?.close();
    onCancel?.();
  });

  /* Dengarkan postMessage dari postforme-callback.html (desktop/non-iOS) */
  const msgHandler = async (event) => {
    const { type, accountIds } = event.data || {};
    if (type !== 'postforme_oauth_success' && type !== 'postforme_oauth_resync') return;
    if (done) return;
    done = true;
    cleanup();
    onLog?.(`[connectSocial] postMessage received: ${type}`);
    await fetchAndSaveAccount(accountIds || []);
  };
  window.addEventListener('message', msgHandler);

  /* Pantau popup ditutup manual — HANYA di non-iOS
     Di iOS popup.closed langsung true karena dibuka di Safari terpisah,
     jadi jangan cancel di iOS, biarkan poll jalan terus */
  if (!isIOS) {
    closedCheck = setInterval(() => {
      if (popup?.closed && !done) {
        onLog?.(`[connectSocial] Popup closed by user, stopping poll`);
        cleanup();
        onCancel?.();
      }
    }, 800);
  }
}

/**
 * Handle OAuth callback dari redirect flow (iOS PWA)
 * Dipanggil dari page.js saat app load — detect ?oauth_callback=1 di URL
 * Return: { platform, accountData } atau null
 */
export async function handleOAuthRedirectCallback() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get('oauth_callback') !== '1') return null;

  /* Bersihkan URL tanpa reload */
  window.history.replaceState({}, '', window.location.pathname);

  const platform = localStorage.getItem('larisi_oauth_pending_platform') || '';
  const externalId = localStorage.getItem('larisi_oauth_external_id') || localStorage.getItem('radar_session_id') || '';
  localStorage.removeItem('larisi_oauth_pending_platform');
  localStorage.removeItem('larisi_oauth_external_id');
  localStorage.removeItem('larisi_oauth_return_url');

  const ids = params.get('accountIds') || '';
  if (!platform) return null;

  let accountData = { id: ids.split(',')[0] || `pfm_${platform}_${Date.now()}`, platform, username: '', avatar_url: '' };

  try {
    const pfResp = await fetch(`${SUPABASE_URL}/functions/v1/postforme-proxy`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: `/v1/social-accounts?external_id=${encodeURIComponent(externalId)}`, method: 'GET' }),
    });
    if (pfResp.ok) {
      const pfData = await pfResp.json();
      const list = pfData.data || pfData.accounts || (Array.isArray(pfData) ? pfData : []);
      const match = list.find(a => (a.platform || a.provider || '').toLowerCase().startsWith(platform));
      if (match) {
        accountData = {
          id: match.id || accountData.id,
          platform,
          username: match.username || match.name || match.handle || '',
          avatar_url: match.avatar_url || match.profile_photo_url || match.profile_picture_url
                   || match.picture || match.avatar || match.image_url || '',
        };
      }
    }
  } catch (e) { console.warn('[connectSocial] redirect callback error:', e); }

  const existing = JSON.parse(localStorage.getItem('radar_social_accounts') || '[]');
  const filtered = existing.filter(a => a.platform !== platform);
  filtered.push(accountData);
  localStorage.setItem('radar_social_accounts', JSON.stringify(filtered));

  return { platform, accountData };
}

/** Baca akun tersimpan dari localStorage (handle format array & object lama) */
export function getStoredAccounts() {
  try {
    const raw = localStorage.getItem('radar_social_accounts');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return Object.entries(parsed).map(([plt, data]) => ({
      platform: plt, id: `pfm_${plt}_legacy`, username: '', avatar_url: '',
      ...(typeof data === 'object' && data !== null ? data : {}),
    }));
  } catch { return []; }
}

/** Cek apakah platform sudah terhubung */
export function isConnected(platform) {
  return getStoredAccounts().some(a => a.platform === platform);
}

/** Sync social accounts dari localStorage ke Supabase (profiles.social_accounts) */
export async function syncSocialAccountsToSupabase(userId, accessToken) {
  try {
    const accountsRaw = localStorage.getItem('radar_social_accounts');
    if (!accountsRaw) return { success: true, message: 'No accounts to sync' };

    const accounts = JSON.parse(accountsRaw);
    console.log('[connectSocial] Syncing', accounts.length, 'social accounts to Supabase...');

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        social_accounts: accounts,
      }),
    });

    if (!resp.ok) {
      throw new Error(`Server error ${resp.status}`);
    }

    console.log('[connectSocial] Successfully synced social accounts to Supabase');
    return { success: true };
  } catch (err) {
    console.error('[connectSocial] Sync to Supabase error:', err);
    return { success: false, error: err.message };
  }
}

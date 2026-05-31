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
  /* Detect iOS PWA standalone — pakai redirect flow, bukan popup */
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const useRedirect = isIOS && isStandalone;
  onLog?.(`[connectSocial] Starting ${platform} connect on iOS=${isIOS}, Standalone=${isStandalone}, useRedirect=${useRedirect}`);

  /* Ambil atau buat external_id */
  let externalId = localStorage.getItem('radar_session_id');
  if (!externalId) {
    const profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
    externalId = profile.postforme_external_id
      || ('radar_user_' + Math.random().toString(36).slice(2, 10));
    localStorage.setItem('radar_session_id', externalId);
  }

  onStart?.(platform);

  /* Redirect flow: simpan state ke localStorage sebelum redirect */
  if (useRedirect) {
    const returnUrl = window.location.href.split('?')[0];
    localStorage.setItem('larisi_oauth_return_url', returnUrl);
    localStorage.setItem('larisi_oauth_pending_platform', platform);
    localStorage.setItem('larisi_oauth_external_id', externalId);
    onLog?.(`[connectSocial] iOS PWA: saving state for redirect flow`);
  }

  let done = false;
  let popup = null;

  const cleanup = () => {
    if (closedCheck) clearInterval(closedCheck);
    window.removeEventListener('message', msgHandler);
  };

  /* Helper: fetch detail akun & simpan ke localStorage */
  const processAccount = async (accountIds) => {
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

  /* Fetch OAuth URL */
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

    if (useRedirect) {
      /* iOS PWA: redirect full page */
      onLog?.(`[connectSocial] iOS PWA: redirecting full page to OAuth`);
      window.location.href = authUrl;
    } else {
      /* Desktop: popup */
      popup = window.open('about:blank', 'postforme_oauth', 'width=520,height=700,left=100,top=80');
      onLog?.(`[connectSocial] Popup opened: ${popup ? 'SUCCESS' : 'NULL (BLOCKED)'}`);
      if (popup) {
        popup.location.href = authUrl;
        onLog?.(`[connectSocial] Redirecting popup to OAuth`);
      } else {
        window.open(authUrl, 'postforme_oauth', 'width=520,height=700,left=100,top=80');
      }
    }
  })
  .catch(err => {
    console.error('[connectSocial] error:', err);
    popup?.close();
    onCancel?.();
  });

  /* Popup flow: dengarkan postMessage dari postforme-callback.html */
  const msgHandler = async (event) => {
    const { type, accountIds } = event.data || {};
    if (type !== 'postforme_oauth_success' && type !== 'postforme_oauth_resync') return;
    if (done) return;
    done = true;
    cleanup();
    await processAccount(accountIds || []);
  };

  if (!useRedirect) {
    window.addEventListener('message', msgHandler);
  }

  /* Pantau popup ditutup manual (hanya popup flow) */
  const closedCheck = useRedirect ? null : setInterval(() => {
    if (popup?.closed && !done) { cleanup(); onCancel?.(); }
  }, 800);
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

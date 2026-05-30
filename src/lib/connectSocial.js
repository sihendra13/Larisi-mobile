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
export function connectSocial({ platform, accessToken, userId, onStart, onDone, onCancel }) {
  /* Ambil atau buat external_id (identik desktop) */
  let externalId = localStorage.getItem('radar_session_id');
  if (!externalId) {
    const profile = JSON.parse(localStorage.getItem('radar_user_profile') || '{}');
    externalId = profile.postforme_external_id
      || ('radar_user_' + Math.random().toString(36).slice(2, 10));
    localStorage.setItem('radar_session_id', externalId);
  }

  /* Buka popup SEBELUM await — browser hanya izinkan dari user gesture langsung */
  const popup = window.open('about:blank', 'postforme_oauth', 'width=520,height=700,left=100,top=80');
  onStart?.(platform);

  let done = false;

  const cleanup = () => {
    clearInterval(closedCheck);
    window.removeEventListener('message', msgHandler);
  };

  /* Fetch OAuth URL dari Supabase function */
  fetch(`${SUPABASE_URL}/functions/v1/postforme-auth`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      platform,
      redirect_uri: REDIRECT_URI,
      external_id:  externalId,
      ...(platform === 'instagram' ? { scopes: INSTAGRAM_SCOPES } : {}),
    }),
  })
  .then(resp => {
    if (!resp.ok) throw new Error('Server error ' + resp.status);
    return resp.json();
  })
  .then(data => {
    const authUrl = data.url || data.auth_url || data.redirect_url || data.authorization_url;
    if (!authUrl) throw new Error('URL OAuth tidak tersedia');
    if (popup) popup.location.href = authUrl;
    else {
      /* Fallback kalau popup diblokir */
      window.open(authUrl, 'postforme_oauth', 'width=520,height=700,left=100,top=80');
    }
  })
  .catch(err => {
    console.error('[connectSocial] error:', err);
    if (popup) popup.close();
    onCancel?.();
  });

  /* Dengarkan callback dari postforme-callback.html */
  const msgHandler = async (event) => {
    const { type, accountIds } = event.data || {};
    if (type !== 'postforme_oauth_success' && type !== 'postforme_oauth_resync') return;
    if (done) return;
    done = true;
    cleanup();

    /* Coba ambil detail akun (username + avatar) dari PostForMe API */
    let accountData = { id: (accountIds || [])[0] || `pfm_${platform}_${Date.now()}`, platform, username: '', avatar_url: '' };

    try {
      const pfUrl = `${SUPABASE_URL}/functions/v1/postforme-proxy`;
      console.log('[connectSocial] fetching avatar from:', pfUrl);
      const pfResp = await fetch(pfUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/v1/social-accounts?external_id=${encodeURIComponent(externalId)}`,
          method: 'GET',
        }),
      });
      if (pfResp.ok) {
        const pfData = await pfResp.json();
        const list   = pfData.data || pfData.accounts || (Array.isArray(pfData) ? pfData : []);
        const match  = list.find(a =>
          (a.platform || a.provider || '').toLowerCase().startsWith(platform)
        );
        if (match) {
          console.log('[connectSocial] match object keys:', Object.keys(match));
          console.log('[connectSocial] match object:', match);
          accountData = {
            id:         match.id || accountData.id,
            platform,
            username:   match.username || match.name || match.handle || '',
            /* Avatar field — sama dengan desktop onboarding.html */
            avatar_url: match.avatar_url || match.profile_photo_url || match.profile_picture_url
                     || match.picture || match.avatar || match.image_url || '',
          };
        } else {
          console.log('[connectSocial] no match found in list:', list);
        }
      }
    } catch (e) {
      console.warn('[connectSocial] proxy error:', e);
    }

    /* Simpan ke localStorage sebagai array (kompatibel desktop) */
    console.log('[connectSocial] accountData before save:', accountData);
    const existing = JSON.parse(localStorage.getItem('radar_social_accounts') || '[]');
    const filtered = existing.filter(a => a.platform !== platform);
    filtered.push(accountData);
    localStorage.setItem('radar_social_accounts', JSON.stringify(filtered));
    console.log('[connectSocial] saved to localStorage:', filtered);

    popup?.close();
    onDone?.(platform, accountData);
  };

  window.addEventListener('message', msgHandler);

  /* Pantau popup ditutup manual */
  const closedCheck = setInterval(() => {
    if (popup?.closed && !done) {
      cleanup();
      onCancel?.();
    }
  }, 800);
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

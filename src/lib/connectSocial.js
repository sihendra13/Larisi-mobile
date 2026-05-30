import { SUPABASE_URL } from './config';

/**
 * Buka OAuth popup PostForMe dan simpan akun ke localStorage setelah berhasil.
 * Digunakan di OnboardingScreen dan PlatformScreen.
 *
 * @param {object} opts
 * @param {string}   opts.platform     - 'instagram' | 'facebook' | 'tiktok' | 'youtube'
 * @param {string}   opts.accessToken  - Supabase JWT
 * @param {string}   opts.userId       - user ID untuk session
 * @param {function} opts.onStart      - dipanggil saat popup dibuka, arg: platform
 * @param {function} opts.onDone       - dipanggil saat berhasil, arg: (platform, accData)
 * @param {function} opts.onCancel     - dipanggil saat popup ditutup tanpa connect
 */
export function connectSocial({ platform, accessToken, userId, onStart, onDone, onCancel }) {
  const sessionId = localStorage.getItem('radar_session_id') || userId || '';
  const url =
    `${SUPABASE_URL}/functions/v1/postforme-auth` +
    `?platform=${platform}` +
    `&session_id=${encodeURIComponent(sessionId)}` +
    `&token=${encodeURIComponent(accessToken)}`;

  const popup = window.open(url, 'postforme-auth', 'width=520,height=640,left=100,top=100');
  onStart?.(platform);

  let done = false;

  const finish = (accData) => {
    if (done) return;
    done = true;
    /* Simpan ke localStorage sebagai array — kompatibel dengan desktop */
    const existing = JSON.parse(localStorage.getItem('radar_social_accounts') || '[]');
    const filtered = existing.filter(a => a.platform !== platform);
    filtered.push(accData);
    localStorage.setItem('radar_social_accounts', JSON.stringify(filtered));
    onDone?.(platform, accData);
    popup?.close();
    cleanup();
  };

  const onMsg = (e) => {
    const { type, accountIds } = e.data || {};
    if (type === 'postforme_oauth_success') {
      const id = (accountIds || [])[0] || `pfm_${platform}_${Date.now()}`;
      finish({ id, platform, username: '', avatar_url: '' });
    } else if (type === 'postforme_oauth_resync') {
      /* Akun sudah terhubung sebelumnya — tandai connected */
      finish({ id: `pfm_${platform}_resync_${Date.now()}`, platform, username: '', avatar_url: '' });
    }
  };

  const closedCheck = setInterval(() => {
    if (popup?.closed && !done) {
      onCancel?.();
      cleanup();
    }
  }, 800);

  function cleanup() {
    clearInterval(closedCheck);
    window.removeEventListener('message', onMsg);
  }

  window.addEventListener('message', onMsg);
}

/**
 * Baca akun yang sudah terhubung dari localStorage.
 * Handle dua format: array (desktop/baru) dan object (mobile lama).
 */
export function getStoredAccounts() {
  try {
    const raw = localStorage.getItem('radar_social_accounts');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    /* Konversi format object lama → array */
    return Object.entries(parsed).map(([plt, data]) => ({
      platform: plt,
      id: `pfm_${plt}_legacy`,
      username: '',
      avatar_url: '',
      ...(typeof data === 'object' && data !== null ? data : {}),
    }));
  } catch { return []; }
}

/** Cek apakah platform sudah terhubung */
export function isConnected(platform) {
  return getStoredAccounts().some(a => a.platform === platform);
}

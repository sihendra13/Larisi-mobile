import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// Public key aman untuk client (private key HANYA di Supabase secrets, lihat setup notes).
const VAPID_PUBLIC_KEY = 'BE_TIbpfm8kOSjKlAbv2cc2gJXCA0UZU_8Nwxhx6qo_Nf5afjMReCbV9dsv7WExmPiW0Bm1CNmg7bX4NelPoeeQ';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

/**
 * Deteksi iOS yang belum di-add-to-homescreen — Web Push (iOS 16.4+)
 * hanya bekerja kalau PWA dibuka dalam mode standalone.
 */
export function isIOSStandaloneRequired() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  return isIOS && !isStandalone;
}

/**
 * Minta izin notifikasi (kalau belum ditanya) lalu subscribe ke Web Push
 * dan simpan subscription ke Supabase. Aman dipanggil berkali-kali —
 * pushManager.getSubscription() dipakai dulu supaya tidak subscribe ganda.
 */
export async function subscribeToPush(userId, accessToken) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'Browser tidak mendukung push notification.' };
  }
  if (!userId || !accessToken) {
    return { success: false, error: 'User belum login.' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { success: false, error: 'Izin notifikasi ditolak.', permission };
  }

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const subJson = sub.toJSON();
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?on_conflict=endpoint`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      user_id: userId,
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth_key: subJson.keys.auth,
      user_agent: navigator.userAgent,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    return { success: false, error: `Gagal menyimpan subscription ke server. ${text}` };
  }
  return { success: true, permission };
}

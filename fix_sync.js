const fs = require('fs');
const path = './src/lib/connectSocial.js';
let content = fs.readFileSync(path, 'utf8');

const fetchAndSyncFn = `
/** Fetch akun terhubung dari PostForMe API, update nama & avatar_url, lalu simpan */
export async function refreshConnectedAccounts(externalId, userId, accessToken) {
  try {
    const resp = await fetch(\`\${SUPABASE_URL}/functions/v1/postforme-proxy\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${SUPABASE_ANON_KEY}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: \`/v1/social-accounts?external_id=\${encodeURIComponent(externalId)}\`, method: 'GET' }),
    });
    if (!resp.ok) return false;
    const data = await resp.json();
    const list = data.data || data.accounts || (Array.isArray(data) ? data : []);
    if (!list.length) return false;

    let existing = JSON.parse(localStorage.getItem('radar_social_accounts') || '[]');
    let changed = false;

    list.forEach(a => {
      const norm = normalizeAccount(a);
      const idx = existing.findIndex(e => e.id === norm.id || (e.platform === norm.platform && e.platform));
      if (idx !== -1) {
        if (norm.id && existing[idx].id !== norm.id) {
          existing[idx].id = norm.id; changed = true;
        }
        if (norm.username && existing[idx].username !== norm.username) {
          existing[idx].username = norm.username; changed = true;
        }
        if (norm.avatar_url && existing[idx].avatar_url !== norm.avatar_url) {
          existing[idx].avatar_url = norm.avatar_url; changed = true;
        }
      }
    });

    if (changed) {
      localStorage.setItem('radar_social_accounts', JSON.stringify(existing));
      if (userId && accessToken) {
        await syncSocialAccountsToSupabase(userId, accessToken);
      }
      return true;
    }
  } catch(e) { console.warn('[connectSocial] refresh error:', e); }
  return false;
}
`;

content = content + '\n' + fetchAndSyncFn;
fs.writeFileSync(path, content, 'utf8');

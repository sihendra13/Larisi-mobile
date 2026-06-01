const fs = require('fs');
const path = './src/components/v2/PlatformScreen.js';
let content = fs.readFileSync(path, 'utf8');

// Import refreshConnectedAccounts
content = content.replace(
  "import { connectSocial, getStoredAccounts, syncSocialAccountsToSupabase, prefetchAuthUrl } from '@/lib/connectSocial';",
  "import { connectSocial, getStoredAccounts, syncSocialAccountsToSupabase, prefetchAuthUrl, refreshConnectedAccounts } from '@/lib/connectSocial';"
);

// Add useEffect to call refreshConnectedAccounts
const refreshEffect = `
  useEffect(() => {
    (async () => {
      const externalId = localStorage.getItem('radar_session_id') || '';
      if (externalId && userId && accessToken) {
        const changed = await refreshConnectedAccounts(externalId, userId, accessToken);
        if (changed) {
          setAccounts(getStoredAccounts());
        }
      }
    })();
  }, [userId, accessToken]);
`;

content = content.replace(
  "  useEffect(() => {\n    (async () => {",
  refreshEffect + "\n  useEffect(() => {\n    (async () => {"
);

fs.writeFileSync(path, content, 'utf8');

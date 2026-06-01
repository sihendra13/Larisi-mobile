const fs = require('fs');
const path = './src/components/v2/OnboardingScreen.js';
let content = fs.readFileSync(path, 'utf8');

// Import refreshConnectedAccounts
content = content.replace(
  "import { connectSocial, getStoredAccounts, syncSocialAccountsToSupabase } from '@/lib/connectSocial';",
  "import { connectSocial, getStoredAccounts, syncSocialAccountsToSupabase, refreshConnectedAccounts } from '@/lib/connectSocial';"
);

// Add useEffect to call refreshConnectedAccounts when step === 2
const refreshEffect = `
  useEffect(() => {
    if (step === 2) {
      (async () => {
        const externalId = localStorage.getItem('radar_session_id') || '';
        if (externalId && userId && token) {
          const changed = await refreshConnectedAccounts(externalId, userId, token);
          if (changed) {
            setAccounts(getStoredAccounts());
          }
        }
      })();
      setAccounts(getStoredAccounts());
    }
  }, [step, userId, token]);
`;

content = content.replace(
  "  /* ── Helper: add debug log ── */",
  refreshEffect + "\n  /* ── Helper: add debug log ── */"
);

fs.writeFileSync(path, content, 'utf8');

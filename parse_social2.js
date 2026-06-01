const fs = require('fs');
const path = './src/lib/connectSocial.js';
let content = fs.readFileSync(path, 'utf8');

const normalizeFn = `
function normalizeAccount(a, defaultPlatform) {
  let apiAvatarUrl = a.profile_photo_url
                   || a.profile_picture_url || a.picture || a.avatar
                   || a.profile_image_url   || a.photo_url || a.image_url
                   || a.profile_photo       || a.profile_pic
                   || (a.user && (a.user.profile_picture_url || a.user.picture))
                   || '';
  if (apiAvatarUrl && typeof apiAvatarUrl === 'object') {
    apiAvatarUrl = apiAvatarUrl.data?.url || apiAvatarUrl.url || '';
  }
  let apiUsername = a.username || a.handle || a.name || a.title || '';
  return {
    id: a.id,
    platform: defaultPlatform || a.platform || '',
    username: apiUsername,
    avatar_url: apiAvatarUrl
  };
}
`;

content = content.replace('/* Utility helpers */', '/* Utility helpers */' + normalizeFn);

// Update fetchAndSaveAccount multipleMatches
content = content.replace(
  'const multipleMatches = matches.map(m => ({\n            id: m.id || `pfm_${platform}_${Date.now()}_${Math.random()}`,\n            platform,\n            username: m.username || m.name || m.handle || \'\',\n            avatar_url: m.avatar_url || m.profile_photo_url || m.profile_picture_url || m.picture || m.avatar || m.image_url || \'\',\n          }));',
  `const multipleMatches = matches.map(m => {
            const norm = normalizeAccount(m, platform);
            norm.id = norm.id || \`pfm_\${platform}_\${Date.now()}_\${Math.random()}\`;
            return norm;
          });`
);

// Update fetchAndSaveAccount single match
content = content.replace(
  'const accountData = {\n            id: match.id, platform,\n            username: match.username || match.name || match.handle || \'\',\n            avatar_url: match.avatar_url || match.profile_photo_url || match.profile_picture_url\n                     || match.picture || match.avatar || match.image_url || \'\',\n          };',
  'const accountData = normalizeAccount(match, platform);'
);

fs.writeFileSync(path, content, 'utf8');

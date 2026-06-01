const fs = require('fs');
const path = './src/components/v2/KelolaScreen.js';
let content = fs.readFileSync(path, 'utf8');

const matchOld = `  // Exact match via platform_post_id
  if (campaign.platform_post_id) {
    const exact = posts.find(p => String(p.platform_post_id) === String(campaign.platform_post_id));
    if (exact) return exact;
  }`;

const matchNew = `  // Exact match via platform_post_id
  if (campaign.platform_post_id) {
    const exact = posts.find(p => String(p.platform_post_id) === String(campaign.platform_post_id));
    if (exact) return exact;
  }
  // Exact match via post_id (PostForMe internal ID)
  if (campaign.post_id) {
    const exactInternal = posts.find(p => String(p.id) === String(campaign.post_id) || String(p.post_id) === String(campaign.post_id));
    if (exactInternal) return exactInternal;
  }`;

content = content.replace(matchOld, matchNew);

fs.writeFileSync(path, content, 'utf8');

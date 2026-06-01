const fs = require('fs');
const path = './src/components/v2/KelolaScreen.js';
let content = fs.readFileSync(path, 'utf8');

const matchOld = `  // Exact match via post_id (PostForMe internal ID)
  if (campaign.post_id) {
    const exactInternal = posts.find(p => String(p.id) === String(campaign.post_id) || String(p.post_id) === String(campaign.post_id));
    if (exactInternal) return exactInternal;
  }`;

const matchNew = `  // Exact match via post_id (PostForMe internal ID)
  if (campaign.post_id) {
    const exactInternal = posts.find(p => String(p.id) === String(campaign.post_id) || String(p.post_id) === String(campaign.post_id));
    if (exactInternal) return exactInternal;
  }
  // Exact match via post_url
  if (campaign.post_url) {
    const exactUrl = posts.find(p => p.post_url === campaign.post_url || p.permalink === campaign.post_url || p.platform_url === campaign.post_url);
    if (exactUrl) return exactUrl;
  }`;

content = content.replace(matchOld, matchNew);

fs.writeFileSync(path, content, 'utf8');

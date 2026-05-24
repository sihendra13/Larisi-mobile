// RADAR — reach.js
// Reach calculation and channel badge updates

function updateReach() {
  var areaFactor  = Math.PI * currentRadius * currentRadius;
  var densityBase = currentLocPop / (Math.PI * 5 * 5);
  var areaPop     = Math.round(densityBase * areaFactor);
  var popEl       = document.getElementById('popupReach');
  var footerEl    = document.getElementById('reachNum');

  if (!audLocal && !audTraveler) {
    if (popEl)    popEl.textContent    = 'Jangkauan: 0 orang';
    if (footerEl) footerEl.textContent = '0';
    updatePct('', []);
    _updateReachLocLabel(0);
    return;
  }

  // Bubble = total populasi
  var localPop = audLocal    ? areaPop                    : 0;
  var travPop  = audTraveler ? Math.round(areaPop * 0.22) : 0;
  var totalPop = localPop + travPop;
  if (popEl) popEl.textContent = 'Jangkauan: ' + totalPop.toLocaleString() + ' orang';

  var internetUsers = Math.round(totalPop * 0.795);

  // Ambil platform yang dipilih dari channel cycler (activeChannel)
  var selectedKeys = [];
  var unionPen = 1.0;

  // Selalu pakai activeChannel dari cycler (bukan chips lama)
  var chMap = {
    instagram: 'Instagram',
    meta:      'Meta',
    tiktok:    'TikTok',
    youtube:   'YouTube'
  };
  if (typeof activeChannel !== 'undefined' && activeChannel) {
    var key = chMap[activeChannel] || 'Instagram';
    selectedKeys = [key];
  } else {
    // Fallback ke Instagram kalau belum ada activeChannel
    selectedKeys = ['Instagram'];
  }

  // Hitung unionPen berdasarkan platform yang dipilih
  if (selectedKeys.length === 0) {
    unionPen = 1.0;
    updatePct('', []);
  } else if (selectedKeys.length === 1) {
    unionPen = PLATFORM_PENETRATION_RATES[selectedKeys[0]] || 0.73;
    updatePct(Math.round(unionPen * 100) + '%', selectedKeys);
  } else if (selectedKeys.length === 2) {
    unionPen = 0.90; updatePct('90%', selectedKeys);
  } else if (selectedKeys.length === 3) {
    unionPen = 0.94; updatePct('94%', selectedKeys);
  } else {
    unionPen = 0.98; updatePct('98%', selectedKeys);
  }

  var hi = Math.min(Math.round(internetUsers * unionPen), internetUsers);
  var lo = Math.round(hi * 0.65);

  function fmtReach(n) {
    if (n >= 10000) return Math.round(n/1000) + 'K';
    return n.toLocaleString();
  }
  if (footerEl) footerEl.textContent = fmtReach(lo) + ' – ' + fmtReach(hi);

  _updateReachLocLabel(totalPop);
}

function makePlatIcon(key) {
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '13');
  svg.setAttribute('height', '13');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.style.cssText = 'display:inline-block;vertical-align:middle;margin-right:3px;';
  var path = document.createElementNS(ns, 'path');
  path.setAttribute('d', PLAT_ICONS_SVG[key] || '');
  path.setAttribute('fill', 'currentColor');
  svg.appendChild(path);
  return svg;
}

function updatePct(pct, selectedKeys) {
  var el = document.getElementById('reachPct');
  if (!el) return;
  el.innerHTML = '';
  if (!selectedKeys || selectedKeys.length === 0) return;

  var platNames = {
    'Instagram': 'Instagram',
    'Meta':      'Facebook',
    'TikTok':    'TikTok',
    'YouTube':   'YouTube'
  };

  selectedKeys.forEach(function(k, idx) {
    if (idx > 0) {
      var sep = document.createElement('span');
      sep.textContent = ' · ';
      el.appendChild(sep);
    }
    var icon = makePlatIcon(k);
    el.appendChild(icon);
    var name = document.createElement('span');
    name.textContent = platNames[k] || k;
    name.style.cssText = 'font-size:11px;font-weight:600;color:var(--near-black);margin-left:2px;';
    el.appendChild(name);
  });
}

function _updateReachLocLabel(totalPop) {
  var el = document.getElementById('reachLocLabel');
  if (!el) return;

  var locEl = document.querySelector('.popup-loc');
  var locName = '';
  if (locEl && locEl.textContent.trim()) {
    locName = locEl.textContent.trim().split(',')[0].trim();
  } else if (typeof currentRegion !== 'undefined' && currentRegion) {
    locName = currentRegion.charAt(0).toUpperCase() + currentRegion.slice(1);
  }

  var divEl = document.getElementById('reachDivider');

  if (!locName) {
    el.textContent = '';
    if (divEl) divEl.style.display = 'none';
    return;
  }

  var audParts = [];
  if (typeof audLocal    !== 'undefined' && audLocal)    audParts.push('Warga');
  if (typeof audTraveler !== 'undefined' && audTraveler) audParts.push('Pengunjung');
  var audLabel = audParts.length > 0 ? audParts.join(' + ') : 'Warga';

  el.textContent = audLabel + ' ' + locName;

  // Tampilkan divider hanya kalau reachPct juga ada isinya
  if (divEl) {
    var pctEl = document.getElementById('reachPct');
    divEl.style.display = (pctEl && pctEl.children.length > 0) ? 'inline-block' : 'none';
  }
}

function updateChannelBadges(totalUsers) {
  PLATFORM_KEYS.forEach(function(key) {
    var badge = document.getElementById('badge-'+key);
    if (!badge) return;
    if (totalUsers === 0) { badge.textContent = ''; return; }
    var reach = Math.round(totalUsers * PLATFORM_PENETRATION_RATES[key]);
    badge.textContent = reach >= 1000 ? Math.round(reach/1000)+'K' : reach;
  });
}

var reachAnimTimer = null;

function animateReach(targetBase, targetHi) {
  if (reachAnimTimer) clearInterval(reachAnimTimer);
  var el = document.getElementById('reachNum');
  var startBase = parseInt((el.textContent.split('K')[0].replace(/[^0-9]/g,''))) * 1000 || 0;
  var startHi   = startBase * 1.5;
  var steps = 20;
  var step  = 0;
  reachAnimTimer = setInterval(function() {
    step++;
    var t    = step / steps;
    var base = Math.round(startBase + (targetBase - startBase) * t);
    var hi   = Math.round(startHi   + (targetHi   - startHi)  * t);
    /* ONLY update footer reachNum — bubble handled separately */
    if (base === 0 && hi === 0) {
      el.textContent = '0';
    } else {
      el.textContent = Math.round(base/1000) + 'K – ' + Math.round(hi/1000) + 'K';
    }
    if (step >= steps) clearInterval(reachAnimTimer);
  }, 30);
}

window.addEventListener('DOMContentLoaded', function() {
  updateReach();
});

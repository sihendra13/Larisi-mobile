// RADAR — map.js
// Map initialization, location search, radius control

var searchTimer = null;

function onSearchInput(val) {
  var dd  = document.getElementById('searchDropdown');
  var clr = document.getElementById('mapSearchClear');
  var inp = document.getElementById('mapSearchInput');
  if (clr) clr.style.display = val ? 'block' : 'none';
  if (inp) inp.style.paddingRight = val ? '28px' : '';
  if (!val || val.length < 2) { dd.style.display='none'; return; }
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(function() {
    fetchNominatim(val);
  }, 350);
}

function clearMapSearch() {
  var inp = document.getElementById('mapSearchInput');
  var dd  = document.getElementById('searchDropdown');
  var clr = document.getElementById('mapSearchClear');
  if (inp) { inp.value = ''; inp.style.paddingRight = ''; }
  if (dd)  dd.style.display  = 'none';
  if (clr) clr.style.display = 'none';
  if (map) map.flyTo([-7.7956, 110.3695], 13, {duration: 1.2});
}

function searchLocations(query) {
  var lower = query.toLowerCase();
  return ID_LOCATIONS.filter(function(loc) {
    return loc.n.toLowerCase().indexOf(lower) !== -1;
  }).slice(0, 7);
}

function fetchNominatim(query) {
  var dd = document.getElementById('searchDropdown');
  var results = searchLocations(query);
  dd.innerHTML = '';
  if (!results.length) {
    dd.innerHTML = '<div style="padding:10px 16px;font-size:12px;color:#6a6a6a;">Lokasi tidak ditemukan</div>';
    dd.style.display = 'block';
    return;
  }
  dd.style.display = 'block';
  results.forEach(function(loc) {
    var item = document.createElement('div');
    item.textContent = loc.n;
    item.style.cssText = 'padding:10px 16px;cursor:pointer;font-size:12px;color:#222;border-bottom:1px solid #f4f4f5;transition:background .1s;line-height:1.4;';
    item.onmouseover = function(){ this.style.background='#f3ebff'; };
    item.onmouseout  = function(){ this.style.background=''; };
    (function(l){ item.onclick = function(){ selectCity(l.lat, l.lng, l.n, l.pop); }; })(loc);
    dd.appendChild(item);
  });
}

function selectCity(lat, lng, name, pop) {
  document.getElementById('searchDropdown').style.display = 'none';
  document.getElementById('mapSearchInput').value = name.split(',')[0];
  currentLat = lat; currentLng = lng;
  if (pop) currentLocPop = pop;
  if (marker) marker.setLatLng([lat,lng]);
  if (circle) circle.setLatLng([lat,lng]);
  var shortName = name.split(',').slice(0,2).join(', ');
  var pl = document.querySelector('.popup-loc');
  if (pl) pl.textContent = shortName;
  if (map) {
    map.flyTo([lat,lng], 13, {duration:1.2});
    map.once('moveend', function(){ updatePopupPosition(); });
  }
  updateRadius(currentRadius);
  updateRegionAndRefresh(lat, lng);
  if (currentPersona) { generateCaptionAI(); updateStitch(); }
}

function updatePopupPosition() {
  if (!map || !marker) return;
  var popup = document.querySelector('.map-popup');
  if (!popup) return;
  var mapContainer = document.getElementById('map');
  var mapRect = mapContainer.getBoundingClientRect();
  var pt = map.latLngToContainerPoint(marker.getLatLng());
  popup.style.left = pt.x + 'px';
  popup.style.top  = (pt.y - 14) + 'px';
  popup.style.bottom = 'auto';
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('#mapSearchInput') && !e.target.closest('#searchDropdown')) {
    var dd = document.getElementById('searchDropdown');
    if (dd) dd.style.display = 'none';
  }
});

window.onload = function() {
  map = L.map('map', {zoomControl:true, attributionControl:false}).setView([currentLat, currentLng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(map);
  var icon = L.divIcon({
    html: '<div style="width:16px;height:16px;background:#791ADB;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(121,26,219,.5)"></div>',
    className:'', iconAnchor:[8,8]
  });
  marker = L.marker([currentLat, currentLng], {icon:icon}).addTo(map);
  circle = L.circle([currentLat, currentLng], {
    radius: 5000, color: '#791ADB',
    fillColor: '#791ADB', fillOpacity: 0.08, weight: 2
  }).addTo(map);

  /* ── Tombol "Locate Me" ── */
  var locBtn = L.control({ position: 'topleft' });
  locBtn.onAdd = function() {
    var btn = L.DomUtil.create('button', '');
    btn.title = 'Gunakan lokasi saya';
    btn.style.cssText =
      'width:34px;height:34px;background:#fff;border:2px solid rgba(0,0,0,.2);' +
      'border-radius:4px;cursor:pointer;font-size:16px;line-height:1;' +
      'display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.15);';
    btn.innerHTML = '📍';
    L.DomEvent.on(btn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      _moveToUserLocation();
    });
    return btn;
  };
  locBtn.addTo(map);

  /* ── Auto-detect lokasi user saat load ── */
  _moveToUserLocation();

  /* Update popup position on map move/zoom */
  map.on('move zoom moveend zoomend', function(){ updatePopupPosition(); });
  setTimeout(function(){ updatePopupPosition(); updateCaptionPlatformLabel(); }, 500);

  /* Click on map → move pin */
  map.on('click', function(e) {
    currentLat = e.latlng.lat; currentLng = e.latlng.lng;
    marker.setLatLng(e.latlng);
    circle.setLatLng(e.latlng);
    updatePopupPosition();
    updateRadius(currentRadius);
    /* Reverse geocode */
    fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat='+currentLat+'&lon='+currentLng+'&accept-language=id')
      .then(function(r){ return r.json(); })
      .then(function(d) {
        var a = d.address;
        var name = a.village||a.suburb||a.neighbourhood||a.city_district||a.city||a.county||'';
        var city = a.city||a.county||a.state||'';
        var loc = name + (city && name !== city ? ', '+city : '');
        var pl = document.querySelector('.popup-loc');
        if (pl && loc) pl.textContent = loc;
        updateRegionAndRefresh(currentLat, currentLng);
        if (currentPersona) { generateCaptionAI(); updateStitch(); }
      }).catch(function(){});
  });

  applyShell('ig-story');
  currentRegion = detectRegionFromCoords(currentLat, currentLng);
};

/* ── GPS: pindahkan marker ke lokasi real user ── */
function _moveToUserLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      currentLat = lat; currentLng = lng;
      if (marker) marker.setLatLng([lat, lng]);
      if (circle) circle.setLatLng([lat, lng]);
      if (map)    map.flyTo([lat, lng], 14, { duration: 1.2 });
      updatePopupPosition();
      updateRadius(currentRadius);
      /* Reverse geocode */
      fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=id')
        .then(function(r) { return r.json(); })
        .then(function(d) {
          var a = d.address || {};
          var name = a.village || a.suburb || a.neighbourhood || a.city_district || a.city || a.county || '';
          var city = a.city || a.county || a.state || '';
          var loc  = name + (city && name !== city ? ', ' + city : '');
          var pl = document.querySelector('.popup-loc');
          if (pl && loc) pl.textContent = loc;
          updateRegionAndRefresh(lat, lng);
          if (currentPersona) { generateCaptionAI(); updateStitch(); }
          console.log('[map] lokasi GPS:', loc, lat, lng);
        }).catch(function() {});
    },
    function(err) {
      console.warn('[map] geolocation error:', err.message);
    },
    { timeout: 8000, maximumAge: 60000 }
  );
}

function updateRadius(v) {
  currentRadius = parseFloat(v);
  document.getElementById('radiusVal').textContent = currentRadius.toFixed(1) + ' KM';
  if (circle) circle.setRadius(currentRadius * 1000);
  updateReach(); /* recalculate both bubble and footer based on new radius */
  updateStitch();
}

function updateRegionAndRefresh(lat, lng) {
  var newRegion = detectRegionFromCoords(lat, lng);
  if (newRegion !== currentRegion) {
    currentRegion = newRegion;
    /* Refresh caption dan stitch dengan dialek baru */
    if (currentPersona) {
      generateCaptionAI();
      updateStitch();
    }
  }
  // Update populasi dari lokasi terdekat di ID_LOCATIONS
  var nearest = _findNearestLocation(lat, lng);
  if (nearest && nearest.pop) currentLocPop = nearest.pop;
  // Update footer reach
  if (typeof updateReach === 'function') updateReach();
}

function _findNearestLocation(lat, lng) {
  if (typeof ID_LOCATIONS === 'undefined' || !ID_LOCATIONS.length)
    return null;

  var nearest = null;
  var minDist = Infinity;

  ID_LOCATIONS.forEach(function(loc) {
    // Hitung jarak Euclidean (cukup untuk radius kecil)
    var dLat = loc.lat - lat;
    var dLng = loc.lng - lng;
    var dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDist) {
      minDist = dist;
      nearest = loc;
    }
  });

  return nearest;
}

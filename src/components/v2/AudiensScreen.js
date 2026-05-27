'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ID_LOCATIONS } from '@/data/locations';

const DEFAULT_LAT = -7.7956;
const DEFAULT_LNG = 110.3695;

const PLATFORM_LABELS = { instagram:'Instagram', facebook:'Facebook', tiktok:'TikTok', youtube:'YouTube' };

function computeReach(locPop, radius, localOn, travelerOn) {
  if (!localOn && !travelerOn) return 0;
  const areaFactor  = Math.PI * radius * radius;
  const densityBase = locPop / (Math.PI * 5 * 5);
  const areaPop     = Math.round(densityBase * areaFactor);
  const localPop    = localOn    ? areaPop                    : 0;
  const travPop     = travelerOn ? Math.round(areaPop * 0.22) : 0;
  return localPop + travPop;
}

const Toggle = ({ on, onToggle }) => (
  <button onClick={onToggle} style={{
    width:'44px', height:'24px', borderRadius:'99px', border:'none',
    background: on ? 'var(--m-brand)' : '#D7D7DE',
    cursor:'pointer', position:'relative', flexShrink:0,
    transition:'background .2s', padding:0,
  }}>
    <div style={{
      position:'absolute', top:'3px',
      left: on ? 'calc(100% - 21px)' : '3px',
      width:'18px', height:'18px', borderRadius:'50%', background:'#fff',
      transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </button>
);

const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

export default function AudiensScreen({
  platform, onBack, onNext,
  locName, setLocName, locFull, setLocFull,
  locPop, setLocPop, radius, setRadius,
  localOn, setLocalOn, travelerOn, setTravelerOn,
}) {
  const [searchVal,     setSearchVal]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [showFullMap,   setShowFullMap]   = useState(false);
  const [fullMapReady,  setFullMapReady]  = useState(false);

  /* ── Mini map refs ── */
  const mapRef        = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef     = useRef(null);
  const circleRef     = useRef(null);

  /* ── Full-screen map refs ── */
  const fullMapRef    = useRef(null);
  const fullLeafRef   = useRef(null);
  const fullMarkerRef = useRef(null);
  const fullCircleRef = useRef(null);

  const searchTimer   = useRef(null);
  const snapRef       = useRef({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });

  /* ── Popup HTML ── */
  const popupHtml = useCallback((name, reach) => {
    const reachStr = reach > 0
      ? `<div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;color:#791AD4;margin-top:2px;">Jangkauan: ${reach.toLocaleString('id-ID')} orang</div>`
      : '';
    return `<div style="text-align:center;padding:4px 8px;min-width:130px;">
      <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;color:#1C1C28;">${name}</div>
      ${reachStr}
    </div>`;
  }, []);

  const findNearest = useCallback((lat, lng) => {
    let nearest = null, minDist = Infinity;
    ID_LOCATIONS.forEach(loc => {
      const d = Math.hypot(loc.lat - lat, loc.lng - lng);
      if (d < minDist) { minDist = d; nearest = loc; }
    });
    return nearest;
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`);
      const d = await r.json();
      const a = d.address || {};
      const village = a.village || a.suburb || a.neighbourhood || a.city_district || a.city || a.county || '';
      const city    = a.city    || a.county || a.state || '';
      const short   = village + (city && village !== city ? ', ' + city : '');
      if (short) { setLocName(village || short); setLocFull(short); }
    } catch (_) {}
  }, [setLocName, setLocFull]);

  const movePinTo = useCallback((lat, lng) => {
    snapRef.current = { lat, lng };
    if (markerRef.current)    markerRef.current.setLatLng([lat, lng]);
    if (circleRef.current)    circleRef.current.setLatLng([lat, lng]);
    if (leafletMapRef.current) leafletMapRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
    if (fullMarkerRef.current) fullMarkerRef.current.setLatLng([lat, lng]);
    if (fullCircleRef.current) fullCircleRef.current.setLatLng([lat, lng]);
    if (fullLeafRef.current)   fullLeafRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
    const nearest = findNearest(lat, lng);
    if (nearest?.pop) setLocPop(nearest.pop);
  }, [findNearest, setLocPop]);

  const moveToUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        movePinTo(pos.coords.latitude, pos.coords.longitude);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => console.warn('[map]', err.message),
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [movePinTo, reverseGeocode]);

  /* ── Build mini map ── */
  const buildMap = useCallback(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const L = window.L;
    const reach = computeReach(locPop, radius, localOn, travelerOn);
    const map = L.map(mapRef.current, {
      center: [DEFAULT_LAT, DEFAULT_LNG], zoom: 13,
      zoomControl: true, attributionControl: false,
    });
    L.tileLayer(LIGHT_TILES, { subdomains: 'abcd', maxZoom: 19 }).addTo(map);

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:14px;height:14px;border-radius:50%;background:#791AD4;border:2px solid #fff;box-shadow:0 0 0 4px rgba(121,26,219,0.25)"></div>`,
      iconSize:[14,14], iconAnchor:[7,7],
    });
    markerRef.current = L.marker([DEFAULT_LAT, DEFAULT_LNG], { icon })
      .addTo(map)
      .bindPopup(popupHtml(locName, reach), { closeButton:false, autoClose:false, closeOnClick:false, offset:[0,-4] })
      .openPopup();

    circleRef.current = L.circle([DEFAULT_LAT, DEFAULT_LNG], {
      radius: radius * 1000, color:'#791AD4',
      fillColor:'#791AD4', fillOpacity:0.12, weight:1.5,
    }).addTo(map);

    map.on('click', (e) => {
      movePinTo(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    /* Locate Me button */
    const locBtn = L.control({ position:'topleft' });
    locBtn.onAdd = () => {
      const btn = L.DomUtil.create('button', '');
      btn.innerHTML = '📍';
      btn.style.cssText = 'width:34px;height:34px;background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:4px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.15);';
      L.DomEvent.on(btn, 'click', (ev) => { L.DomEvent.stopPropagation(ev); moveToUserLocation(); });
      return btn;
    };
    locBtn.addTo(map);

    leafletMapRef.current = map;
    moveToUserLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Build full-screen map ── */
  const buildFullMap = useCallback(() => {
    if (!fullMapRef.current || fullLeafRef.current) return;
    const L = window.L;
    const { lat, lng } = snapRef.current;
    const reach = computeReach(locPop, radius, localOn, travelerOn);
    const map = L.map(fullMapRef.current, {
      center: [lat, lng], zoom: 14,
      zoomControl: true, attributionControl: false,
    });
    L.tileLayer(LIGHT_TILES, { subdomains:'abcd', maxZoom:19 }).addTo(map);

    const icon = L.divIcon({
      className:'',
      html:`<div style="width:16px;height:16px;border-radius:50%;background:#791AD4;border:2.5px solid #fff;box-shadow:0 0 0 5px rgba(121,26,219,0.25)"></div>`,
      iconSize:[16,16], iconAnchor:[8,8],
    });
    fullMarkerRef.current = L.marker([lat, lng], { icon })
      .addTo(map)
      .bindPopup(popupHtml(locName, reach), { closeButton:false, autoClose:false, closeOnClick:false, offset:[0,-5] })
      .openPopup();

    fullCircleRef.current = L.circle([lat, lng], {
      radius: radius * 1000, color:'#791AD4',
      fillColor:'#791AD4', fillOpacity:0.12, weight:1.5,
    }).addTo(map);

    map.on('click', (e) => {
      movePinTo(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    /* Locate Me */
    const locBtn = L.control({ position:'topleft' });
    locBtn.onAdd = () => {
      const btn = L.DomUtil.create('button','');
      btn.innerHTML = '📍';
      btn.style.cssText = 'width:38px;height:38px;background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:8px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.15);';
      L.DomEvent.on(btn,'click',(ev)=>{ L.DomEvent.stopPropagation(ev); moveToUserLocation(); });
      return btn;
    };
    locBtn.addTo(map);

    fullLeafRef.current = map;
    setFullMapReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Load Leaflet & build mini map ── */
  useEffect(() => {
    const init = () => buildMap();
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id='leaflet-css'; css.rel='stylesheet';
      css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    if (window.L) { init(); }
    else if (!document.getElementById('leaflet-js')) {
      const s = document.createElement('script');
      s.id='leaflet-js'; s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = init; document.head.appendChild(s);
    } else { document.getElementById('leaflet-js').addEventListener('load', init); }

    return () => {
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current=null; markerRef.current=null; circleRef.current=null; }
      if (fullLeafRef.current)   { fullLeafRef.current.remove();   fullLeafRef.current=null;   fullMarkerRef.current=null; fullCircleRef.current=null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Build full map when overlay opens ── */
  useEffect(() => {
    if (!showFullMap) return;
    const tryBuild = () => {
      if (window.L && fullMapRef.current) buildFullMap();
      else setTimeout(tryBuild, 100);
    };
    setTimeout(tryBuild, 50);
  }, [showFullMap, buildFullMap]);

  /* ── Invalidate size when full map is ready ── */
  useEffect(() => {
    if (fullMapReady && fullLeafRef.current) {
      setTimeout(() => fullLeafRef.current?.invalidateSize(), 100);
    }
  }, [fullMapReady]);

  /* ── Sync radius ── */
  useEffect(() => {
    if (circleRef.current)    circleRef.current.setRadius(radius * 1000);
    if (fullCircleRef.current) fullCircleRef.current.setRadius(radius * 1000);
  }, [radius]);

  /* ── Sync popup ── */
  useEffect(() => {
    const reach = computeReach(locPop, radius, localOn, travelerOn);
    if (markerRef.current)    markerRef.current.setPopupContent(popupHtml(locName, reach));
    if (fullMarkerRef.current) fullMarkerRef.current.setPopupContent(popupHtml(locName, reach));
  }, [locName, locPop, radius, localOn, travelerOn, popupHtml]);

  /* ── Destroy full map on close ── */
  useEffect(() => {
    if (!showFullMap && fullLeafRef.current) {
      fullLeafRef.current.remove();
      fullLeafRef.current=null; fullMarkerRef.current=null; fullCircleRef.current=null;
      setFullMapReady(false);
    }
  }, [showFullMap]);

  /* ── Search ── */
  const handleSearch = (val) => {
    setSearchVal(val);
    if (!val || val.length < 2) { setShowDropdown(false); setSearchResults([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const lower = val.toLowerCase();
      const res = ID_LOCATIONS.filter(l => l.n.toLowerCase().includes(lower)).slice(0, 7);
      setSearchResults(res); setShowDropdown(res.length > 0);
    }, 350);
  };

  const selectCity = (loc) => {
    setShowDropdown(false);
    setSearchVal(loc.n.split(',')[0]);
    const short = loc.n.split(',').slice(0, 2).join(', ');
    setLocName(loc.n.split(',')[0]); setLocFull(short);
    if (loc.pop) setLocPop(loc.pop);
    movePinTo(loc.lat, loc.lng);
  };

  const sliderPct = ((radius - 0.5) / 9.5) * 100;
  const reach = computeReach(locPop, radius, localOn, travelerOn);

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--m-bg)'}}>

      {/* ── Header (sama dengan PlatformScreen) ── */}
      <header style={{
        position:'sticky', top:0, zIndex:200,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 16px', background:'#fff',
      }}>
        <img src="/logo_larisi.svg" alt="Larisi" style={{height:'22px', width:'auto'}} />
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <button style={{width:'38px',height:'38px',borderRadius:'50%',background:'#fff',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button style={{width:'38px',height:'38px',borderRadius:'50%',background:'#fff',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
          <div style={{display:'flex',alignItems:'center',gap:'8px',background:'#F4F4F7',borderRadius:'999px',padding:'4px 4px 4px 12px',cursor:'pointer'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
              <span style={{fontFamily:'var(--m-font)',fontSize:'12px',fontWeight:'700',color:'var(--m-ink)',lineHeight:'1.2'}}>Nila Craft</span>
              <span style={{color:'var(--m-brand)',fontSize:'10px',fontWeight:'700',lineHeight:'1.2'}}>PRO</span>
            </div>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--m-ink)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{color:'#fff',fontFamily:'var(--m-font)',fontSize:'13px',fontWeight:'700'}}>N</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page title: back + judul ── */}
      <div style={{padding:'20px 16px 0', background:'var(--m-bg)'}}>
        <div style={{display:'flex', alignItems:'center', gap:'14px', marginBottom:'6px'}}>
          <button onClick={onBack} style={{
            width:'38px', height:'38px', borderRadius:'50%',
            background:'#fff', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 1px 4px rgba(0,0,0,0.10)', flexShrink:0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h1 style={{fontFamily:'var(--m-font)', fontSize:'26px', fontWeight:'800', color:'var(--m-ink)', lineHeight:'1.2'}}>
            Target Audiens
          </h1>
        </div>
        <p style={{fontFamily:'var(--m-font)', fontSize:'14px', color:'var(--m-ink-sub)', paddingLeft:'52px', marginBottom:'16px'}}>
          Tentukan siapa yang akan melihat iklanmu di {PLATFORM_LABELS[platform] || 'Instagram'}
        </p>
      </div>

      {/* ── Scrollable content ── */}
      <main style={{
        flex:1, overflowY:'auto', padding:'0 16px',
        paddingBottom:'calc(80px + env(safe-area-inset-bottom) + 60px)',
        display:'flex', flexDirection:'column', gap:'12px',
      }}>

        {/* Card: Siapa Target Audiens Kamu? */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'16px 16px 0'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'var(--m-brand-soft)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px',height:'16px'}}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{fontFamily:'var(--m-font)', fontSize:'15px', fontWeight:'700', color:'var(--m-ink)'}}>
              Siapa Target Audiens Kamu?
            </div>
          </div>
          <div style={{padding:'4px 16px 16px'}}>
            <div style={{display:'flex',alignItems:'center',padding:'14px 0',borderBottom:'1px solid #F0F0F5'}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--m-font)',fontSize:'14px',fontWeight:'600',color:'var(--m-ink)'}}>Warga Sekitar</div>
                <div style={{fontFamily:'var(--m-font)',fontSize:'12px',color:'var(--m-ink-sub)',marginTop:'2px'}}>Orang yang tinggal di area ini</div>
              </div>
              <Toggle on={localOn} onToggle={() => setLocalOn(v => !v)} />
            </div>
            <div style={{display:'flex',alignItems:'center',padding:'14px 0'}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--m-font)',fontSize:'14px',fontWeight:'600',color:'var(--m-ink)'}}>Pengunjung</div>
                <div style={{fontFamily:'var(--m-font)',fontSize:'12px',color:'var(--m-ink-sub)',marginTop:'2px'}}>Orang yang sedang berada di sini</div>
              </div>
              <Toggle on={travelerOn} onToggle={() => setTravelerOn(v => !v)} />
            </div>
          </div>
        </div>

        {/* Card: Tentukan Titik Target */}
        <div className="panel" style={{boxShadow:'none', border:'1px solid #E4E4EB', overflow:'hidden'}}>

          {/* Card header */}
          <div style={{padding:'16px 16px 12px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'var(--m-brand-soft)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px',height:'16px'}}>
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <div style={{fontFamily:'var(--m-font)',fontSize:'15px',fontWeight:'700',color:'var(--m-ink)'}}>Tentukan Titik Target Iklanmu</div>
                <div style={{fontFamily:'var(--m-font)',fontSize:'11px',color:'var(--m-ink-sub)'}}>Klik peta atau cari kecamatan / kota</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{padding:'0 16px 10px', position:'relative'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',background:'#F4F4F7',borderRadius:'8px',padding:'0 12px',height:'38px'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'13px',height:'13px',flexShrink:0}}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={searchVal}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                placeholder="Cari kecamatan atau kota..."
                style={{border:'none',background:'none',outline:'none',flex:1,fontFamily:'var(--m-font)',fontSize:'12px',color:'var(--m-ink)'}}
              />
              {searchVal && (
                <button onClick={() => { setSearchVal(''); setShowDropdown(false); setSearchResults([]); }}
                  style={{background:'none',border:'none',cursor:'pointer',color:'var(--m-ink-sub)',fontSize:'16px',padding:0,lineHeight:1}}>×</button>
              )}
            </div>
            {showDropdown && searchResults.length > 0 && (
              <div style={{position:'absolute',top:'100%',left:'16px',right:'16px',background:'#fff',borderRadius:'8px',boxShadow:'0 4px 16px rgba(0,0,0,0.12)',zIndex:500,overflow:'hidden',marginTop:'4px'}}>
                {searchResults.map((loc, i) => (
                  <div key={i} onClick={() => selectCity(loc)} style={{
                    padding:'10px 14px',fontSize:'12px',cursor:'pointer',
                    fontFamily:'var(--m-font)',color:'var(--m-ink)',
                    borderBottom: i < searchResults.length-1 ? '1px solid #F4F4F7' : 'none',
                  }}
                  onMouseOver={e => e.currentTarget.style.background='#F3EBFF'}
                  onMouseOut={e => e.currentTarget.style.background=''}
                  >{loc.n}</div>
                ))}
              </div>
            )}
          </div>

          {/* Map + expand button */}
          <div style={{padding:'0 16px 0', position:'relative'}}>
            <div ref={mapRef} style={{width:'100%', height:'220px', borderRadius:'12px', overflow:'hidden'}} />
            {/* Expand button */}
            <button
              onClick={() => setShowFullMap(true)}
              style={{
                position:'absolute', bottom:'12px', right:'28px',
                width:'34px', height:'34px', borderRadius:'50%',
                background:'#fff', border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 2px 8px rgba(0,0,0,0.2)', zIndex:100,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            </button>
          </div>

          {/* Radius slider */}
          <div style={{padding:'14px 16px 16px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
              <span style={{fontFamily:'var(--m-font)',fontSize:'13px',fontWeight:'600',color:'var(--m-ink)'}}>Target Radius</span>
              <span style={{fontFamily:'var(--m-font)',fontSize:'12px',fontWeight:'700',color:'var(--m-brand)',background:'var(--m-brand-soft)',padding:'3px 10px',borderRadius:'8px'}}>
                {radius.toFixed(1)} KM
              </span>
            </div>
            <input
              type="range" min="0.5" max="10" step="0.5"
              className="larisi-slider"
              value={radius}
              onChange={e => setRadius(parseFloat(e.target.value))}
              style={{width:'100%',background:`linear-gradient(to right, var(--m-brand) 0%, var(--m-brand) ${sliderPct}%, #E4E4EB ${sliderPct}%, #E4E4EB 100%)`}}
            />
            <div style={{fontFamily:'var(--m-font)',fontSize:'11px',color:'var(--m-ink-sub)',textAlign:'center',marginTop:'8px'}}>
              Geser untuk memperluas jangkauan
            </div>
          </div>
        </div>
      </main>

      {/* ── Sticky CTA ── */}
      <div style={{position:'fixed',bottom:'calc(60px + env(safe-area-inset-bottom) + 12px)',left:'16px',right:'16px',zIndex:300}}>
        <button onClick={onNext} style={{
          width:'100%',padding:'16px',borderRadius:'16px',
          background:'#1A1A1A',color:'#fff',border:'none',
          fontFamily:'var(--m-font)',fontSize:'15px',fontWeight:'700',
          cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',
        }}>
          Lanjut ke Konten
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      {/* ── Full-screen map overlay (slide down from top) ── */}
      <div style={{
        position:'fixed', inset:0, zIndex:600,
        background:'var(--m-bg)',
        transform: showFullMap ? 'translateY(0)' : 'translateY(-100%)',
        transition:'transform 0.38s cubic-bezier(0.32,0.72,0,1)',
        display:'flex', flexDirection:'column',
      }}>
        {/* Overlay header */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'12px 16px', background:'#fff',
          boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div>
            <div style={{fontFamily:'var(--m-font)',fontSize:'16px',fontWeight:'800',color:'var(--m-ink)'}}>Tentukan Titik Target Iklanmu</div>
            <div style={{fontFamily:'var(--m-font)',fontSize:'12px',color:'var(--m-ink-sub)'}}>Klik peta untuk pindahkan pin</div>
          </div>
          <button
            onClick={() => setShowFullMap(false)}
            style={{width:'36px',height:'36px',borderRadius:'50%',background:'#F5F5F7',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Full map */}
        <div ref={fullMapRef} style={{flex:1, width:'100%'}} />

        {/* Info bar */}
        <div style={{
          background:'#fff', padding:'12px 16px',
          boxShadow:'0 -1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2px'}}>
            <span style={{fontFamily:'var(--m-font)',fontSize:'14px',fontWeight:'700',color:'var(--m-ink)'}}>
              {locFull || locName}
            </span>
            <span style={{fontFamily:'var(--m-font)',fontSize:'13px',fontWeight:'700',color:'var(--m-brand)'}}>
              Jangkauan: {reach.toLocaleString('id-ID')} orang
            </span>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'10px'}}>
            <span style={{fontFamily:'var(--m-font)',fontSize:'13px',fontWeight:'600',color:'var(--m-ink)'}}>Target Radius</span>
            <span style={{fontFamily:'var(--m-font)',fontSize:'12px',fontWeight:'700',color:'var(--m-brand)',background:'var(--m-brand-soft)',padding:'3px 10px',borderRadius:'8px'}}>
              {radius.toFixed(1)} KM
            </span>
          </div>
          <input
            type="range" min="0.5" max="10" step="0.5"
            className="larisi-slider"
            value={radius}
            onChange={e => setRadius(parseFloat(e.target.value))}
            style={{width:'100%',marginTop:'8px',background:`linear-gradient(to right, var(--m-brand) 0%, var(--m-brand) ${sliderPct}%, #E4E4EB ${sliderPct}%, #E4E4EB 100%)`}}
          />
          <button
            onClick={() => setShowFullMap(false)}
            style={{
              width:'100%',marginTop:'12px',padding:'13px',borderRadius:'12px',
              background:'#1A1A1A',color:'#fff',border:'none',cursor:'pointer',
              fontFamily:'var(--m-font)',fontSize:'14px',fontWeight:'700',
            }}
          >
            Simpan Lokasi
          </button>
        </div>
      </div>

    </div>
  );
}

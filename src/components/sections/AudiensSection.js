'use client';
import { useState, useEffect, useRef } from 'react';

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

export default function AudiensSection() {
  const mapRef        = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef     = useRef(null);
  const circleRef     = useRef(null);
  const [radius, setRadius]           = useState(1.0);
  const [localOn, setLocalOn]         = useState(true);
  const [travelerOn, setTravelerOn]   = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  /* ── Load Leaflet once, init map ── */
  useEffect(() => {
    const DEFAULT_LAT = -7.7956;
    const DEFAULT_LNG = 110.3695;

    const buildMap = () => {
      if (!mapRef.current || leafletMapRef.current) return;
      const L = window.L;

      const map = L.map(mapRef.current, {
        center: [DEFAULT_LAT, DEFAULT_LNG],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      /* Light CartoDB tiles to match Image 3 */
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19 }
      ).addTo(map);

      /* Marker */
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:var(--m-brand,#6d28d9);border:2px solid #fff;box-shadow:0 0 0 3px rgba(109,40,217,0.35)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const popupHtml = `
        <div style="text-align: center; padding: 2px 4px; min-width: 130px;">
          <div style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; color: #1C1C28;">Sumbersari, Sleman</div>
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #6d28d9; margin-top: 2px;">Jangkauan: 0 orang</div>
        </div>
      `;
      markerRef.current = L.marker([DEFAULT_LAT, DEFAULT_LNG], { icon })
        .addTo(map)
        .bindPopup(popupHtml, { closeButton: false, autoClose: false, closeOnClick: false, offset: [0, -4] })
        .openPopup();

      /* Radius circle */
      circleRef.current = L.circle([DEFAULT_LAT, DEFAULT_LNG], {
        radius: 1 * 1000,
        color: '#6d28d9',
        fillColor: '#6d28d9',
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map);

      leafletMapRef.current = map;
    };

    const loadLeaflet = () => {
      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link');
        css.id   = 'leaflet-css';
        css.rel  = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }
      if (window.L) {
        buildMap();
      } else if (!document.getElementById('leaflet-js')) {
        const s    = document.createElement('script');
        s.id       = 'leaflet-js';
        s.src      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.onload   = buildMap;
        document.head.appendChild(s);
      } else {
        /* script tag exists but not yet loaded — wait */
        document.getElementById('leaflet-js').addEventListener('load', buildMap);
      }
    };

    loadLeaflet();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current     = null;
        circleRef.current     = null;
      }
    };
  }, []);

  /* ── Update circle when radius changes ── */
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius * 1000);
    }
  }, [radius]);

  const handleRadius = (e) => setRadius(parseFloat(e.target.value));

  /* ── Toggle button ── */
  const Toggle = ({ on, onToggle }) => (
    <button
      onClick={onToggle}
      style={{
        width: '40px', height: '22px',
        borderRadius: '99px', border: 'none',
        background: on ? 'var(--m-brand)' : '#D7D7DE',
        cursor: 'pointer', position: 'relative',
        flexShrink: 0, transition: 'background .2s',
        padding: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: '3px',
        left: on ? 'calc(100% - 19px)' : '3px',
        width: '16px', height: '16px',
        borderRadius: '50%', background: '#fff',
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );

  return (
    <>
      {/* ── Card: Siapa Target Audiens ── */}
      <div className="panel" id="panel-audiens-card">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--m-brand-soft)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            marginRight: '12px'
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:'var(--m-font)', fontSize:'16px', fontWeight:'700', color:'var(--m-ink)' }}>Siapa Target Audiens Kamu?</div>
            <div style={{ fontFamily: 'var(--m-font)', fontSize: '12px', color: 'var(--m-ink-sub)', marginTop: '2px' }}>Pilih siapa yang akan lihat iklanmu</div>
          </div>
        </div>

        <div>
          {/* Warga Sekitar */}
          <div className="audience-item" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 0', borderBottom: '1px solid #F0F0F5',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: '#F0F0F5', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '17px', height: '17px' }}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '600', color: 'var(--m-ink)' }}>Warga Sekitar</div>
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '12px', color: 'var(--m-ink-sub)', marginTop: '2px' }}>Penduduk lokal di sekitar lokasi yang kamu pilih</div>
            </div>
            <Toggle on={localOn} onToggle={() => setLocalOn(v => !v)} />
          </div>

          {/* Pengunjung */}
          <div className="audience-item" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 0',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: '#F0F0F5', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '17px', height: '17px' }}>
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '14px', fontWeight: '600', color: 'var(--m-ink)' }}>Pengunjung</div>
              <div style={{ fontFamily: 'var(--m-font)', fontSize: '12px', color: 'var(--m-ink-sub)', marginTop: '2px' }}>Pendatang atau orang yang baru saja melewati lokasi ini</div>
            </div>
            <Toggle on={travelerOn} onToggle={() => setTravelerOn(v => !v)} />
          </div>
        </div>
      </div>

      {/* ── Card: Lokasi Kampanye (map) ── */}
      <div 
        className="panel" 
        id="panel-map-mobile" 
        style={isMapFullscreen ? {
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          borderRadius: 0, border: 'none', padding: 0, display: 'flex', flexDirection: 'column'
        } : { 
          padding: '0', overflow: 'hidden', position: 'relative' 
        }}
      >
        
        {/* Expand/Collapse Button */}
        <button
          onClick={() => {
            setIsMapFullscreen(!isMapFullscreen);
            // Invalidate size slightly after transition so Leaflet recalculates bounds
            setTimeout(() => { if (leafletMapRef.current) leafletMapRef.current.invalidateSize(); }, 300);
          }}
          style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 400,
            width: '36px', height: '36px', borderRadius: '8px',
            background: '#fff', border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {isMapFullscreen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          )}
        </button>

        {/* Floating Search bar */}
        <div style={{
          position: 'absolute', top: '12px', left: '50px', right: '60px', zIndex: 400,
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#fff', borderRadius: '8px',
          padding: '0 12px', height: '36px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          <input
            id="mapSearchInput"
            placeholder="Tentukan titik target iklanmu"
            autoComplete="off"
            style={{
              border: 'none', background: 'none', outline: 'none',
              fontFamily: 'var(--m-font)', fontSize: '13px',
              color: 'var(--m-ink)', width: '100%',
            }}
          />
        </div>

        {/* Map */}
        <div
          ref={mapRef}
          id="map"
          style={isMapFullscreen ? { flex: 1, width: '100%' } : { width: '100%', height: '200px' }}
        />

        {/* Radius control */}
        <div style={{ padding: '16px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '12px', fontWeight: '600', color: 'var(--m-ink)' }}>
              Target Radius
            </span>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '12px', fontWeight: '700', color: 'var(--m-brand)' }}>
              {radius.toFixed(1)} KM
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={radius}
              onChange={handleRadius}
              style={{ flex: 1, accentColor: 'var(--m-brand)' }}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '11px', color: 'var(--m-ink-sub)' }}>
              Geser untuk memperluas jangkauan
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

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
        zoomControl: false,
        attributionControl: false,
      });

      /* Dark CartoDB tiles */
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19 }
      ).addTo(map);

      /* Marker */
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:var(--m-brand,#6d28d9);border:2px solid #fff;box-shadow:0 0 0 3px rgba(109,40,217,0.35)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      markerRef.current = L.marker([DEFAULT_LAT, DEFAULT_LNG], { icon }).addTo(map);

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
        <div className="panel-header" style={{ display: 'flex' }}>
          <div className="panel-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div className="panel-title">Siapa Target Audiens Kamu?</div>
            <div className="panel-sub">Pilih siapa yang akan lihat iklanmu</div>
          </div>
        </div>

        <div className="panel-body" style={{ padding: '0 16px 16px' }}>
          {/* Warga Sekitar */}
          <div className="audience-item" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 0', borderBottom: '1px solid #F0F0F5',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--m-brand-soft)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '17px', height: '17px' }}>
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
              background: 'var(--m-brand-soft)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--m-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '17px', height: '17px' }}>
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
      <div className="panel" id="panel-map-desktop" style={{ padding: '0', overflow: 'hidden' }}>

        {/* Card header */}
        <div className="panel-header" style={{ display: 'flex', padding: '14px 16px 12px' }}>
          <div className="panel-icon">
            <PinIcon />
          </div>
          <div>
            <div className="panel-title">Lokasi Kampanye</div>
            <div className="panel-sub">Tentukan titik target iklanmu di peta</div>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#F5F5F7', borderRadius: '12px',
            padding: '0 14px', height: '40px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--m-ink-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="mapSearchInput"
              placeholder="Cari kota atau kelurahan…"
              autoComplete="off"
              style={{
                border: 'none', background: 'none', outline: 'none',
                fontFamily: 'var(--m-font)', fontSize: '13px',
                color: 'var(--m-ink)', width: '100%',
              }}
            />
          </div>
        </div>

        {/* Map */}
        <div
          ref={mapRef}
          id="map"
          style={{ width: '100%', height: '220px' }}
        />

        {/* Radius control */}
        <div style={{ padding: '14px 16px 16px', background: 'var(--m-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '600', color: 'var(--m-ink)' }}>
              Target Radius
            </span>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '13px', fontWeight: '700', color: 'var(--m-brand)' }}>
              {radius.toFixed(1)} KM
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={radius}
            onChange={handleRadius}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '11px', color: 'var(--m-ink-sub)' }}>0.5 KM</span>
            <span style={{ fontFamily: 'var(--m-font)', fontSize: '11px', color: 'var(--m-ink-sub)' }}>10 KM</span>
          </div>
        </div>
      </div>
    </>
  );
}

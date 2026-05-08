import { useEffect, useRef, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { useISSData } from '../../hooks/useISSData';
import 'leaflet/dist/leaflet.css';

// ── Pulse animated ISS icon using DivIcon ─────────────────────
const issIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
      <span style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(6,182,212,0.25);animation:issping 1.5s ease-out infinite;"></span>
      <span style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(6,182,212,0.45);animation:issping 1.5s ease-out infinite 0.4s;"></span>
      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg" 
           style="width:32px;height:20px;position:relative;z-index:2;filter:brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(160deg);" />
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -24],
});

// ── Auto-center on ISS ─────────────────────────────────────────
const MapRecenter = memo(({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      map.setView([lat, lng], 3, { animate: false });
      firstRender.current = false;
    } else {
      map.flyTo([lat, lng], map.getZoom(), { duration: 1.4, easeLinearity: 0.5 });
    }
  }, [lat, lng, map]);
  return null;
});

// ── Trajectory fade: newer = brighter ─────────────────────────
const TrajectoryPoints = memo(({ points }: { points: [number, number][] }) => (
  <>
    {points.map((pos, i) => {
      const opacity = 0.15 + (i / points.length) * 0.6;
      const radius = i === points.length - 1 ? 4 : 2.5;
      return (
        <CircleMarker
          key={i}
          center={pos}
          radius={radius}
          pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: opacity, opacity, weight: 0 }}
        />
      );
    })}
  </>
));

// ── Pulse keyframe injected once ──────────────────────────────
const PULSE_STYLE = `
  @keyframes issping {
    0%   { transform: scale(0.5); opacity: 0.8; }
    100% { transform: scale(2);   opacity: 0; }
  }
`;

export const ISSMap = memo(() => {
  const { trajectory, currentData, loading } = useISSData();
  const isDark = useAppStore((s) => s.isDark);

  const trajectoryLine: [number, number][] = trajectory.map((p) => [p.latitude, p.longitude]);

  // Use vibrant satellite for dark mode, colorful street for light mode
  const tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const attribution = isDark
    ? '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
    : '&copy; <a href="https://carto.com/">CARTO</a>';

  return (
    <div className="relative w-full h-[400px] lg:h-[520px] rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-2xl shadow-cyan-500/10 transition-all duration-500">
      <style>{PULSE_STYLE}</style>

      {/* Loading skeleton */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-color)]/90 space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-cyan-500 tracking-widest uppercase font-bold">Acquiring Orbital Signal…</p>
        </div>
      )}

      <MapContainer
        center={[0, 0]}
        zoom={3}
        scrollWheelZoom
        zoomControl
        className="w-full h-full"
        style={{ background: 'var(--bg-color)' }}
      >
        <TileLayer attribution={attribution} url={tileUrl} />

        {currentData && (
          <>
            <MapRecenter lat={currentData.latitude} lng={currentData.longitude} />
            <Marker position={[currentData.latitude, currentData.longitude]} icon={issIcon}>
              <Popup className="iss-popup">
                <div className="text-xs space-y-1 min-w-[160px]">
                  <p className="font-bold text-cyan-500 text-sm flex items-center">
                    <Satellite className="w-3.5 h-3.5 mr-1.5" /> ISS Station
                  </p>
                  <p className="flex justify-between border-b border-[var(--border-color)] pb-1 mb-1">
                    <span className="text-[var(--text-muted)]">Position</span> 
                    <span className="font-mono text-[var(--text-primary)] font-bold">{currentData.latitude.toFixed(2)}°, {currentData.longitude.toFixed(2)}°</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Velocity</span> 
                    <span className="font-mono text-cyan-500 font-bold">{Math.round(currentData.speed).toLocaleString()} km/h</span>
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {trajectoryLine.length > 1 && (
          <>
            <Polyline
              positions={trajectoryLine}
              pathOptions={{ 
                color: isDark ? '#ec4899' : '#0891b2', 
                weight: 2, 
                opacity: 0.6, 
                dashArray: '8 6' 
              }}
            />
            <TrajectoryPoints points={trajectoryLine} />
          </>
        )}
      </MapContainer>

      {/* Overlay badge */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center space-x-3 px-4 py-2 bg-[var(--card-bg)] backdrop-blur-md border border-[var(--border-color)] rounded-xl pointer-events-none shadow-lg">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
        </span>
        <div>
          <p className="text-[10px] font-bold text-cyan-500 tracking-wider uppercase leading-none mb-0.5">Live Track</p>
          <p className="text-[9px] text-[var(--text-muted)] font-medium leading-none">Global Coverage active</p>
        </div>
      </div>

      {/* Speed badge */}
      {currentData && currentData.speed > 0 && (
        <div className="absolute bottom-4 right-4 z-[1000] px-4 py-3 bg-[var(--card-bg)] backdrop-blur-md border border-[var(--border-color)] rounded-xl pointer-events-none shadow-lg text-right">
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Orbital Velocity</p>
          <p className="text-xl font-black font-mono text-[var(--text-primary)] leading-none">
            {Math.round(currentData.speed).toLocaleString()} 
            <span className="text-cyan-500 text-xs ml-1 font-bold">KM/H</span>
          </p>
        </div>
      )}
    </div>
  );
});

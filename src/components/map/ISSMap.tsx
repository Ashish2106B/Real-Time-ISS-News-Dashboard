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
          pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: opacity, opacity, weight: 0 }}
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

  const trajectoryLine: [number, number][] = trajectory.map((p) => [p.latitude, p.longitude]);

  return (
    <div className="relative w-full h-[400px] lg:h-[520px] rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-cyan-900/10">
      <style>{PULSE_STYLE}</style>

      {/* Loading skeleton */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-cyan-400 tracking-widest uppercase">Acquiring Signal…</p>
        </div>
      )}

      <MapContainer
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom
        zoomControl
        className="w-full h-full"
        style={{ background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {currentData && (
          <>
            <MapRecenter lat={currentData.latitude} lng={currentData.longitude} />
            <Marker position={[currentData.latitude, currentData.longitude]} icon={issIcon}>
              <Popup className="iss-popup">
                <div className="text-xs space-y-1 min-w-[160px]">
                  <p className="font-bold text-cyan-400 text-sm">🛰 ISS</p>
                  <p><span className="text-slate-400">Lat</span> <span className="font-mono text-white">{currentData.latitude.toFixed(4)}°</span></p>
                  <p><span className="text-slate-400">Lon</span> <span className="font-mono text-white">{currentData.longitude.toFixed(4)}°</span></p>
                  <p><span className="text-slate-400">Speed</span> <span className="font-mono text-cyan-400">{Math.round(currentData.speed).toLocaleString()} km/h</span></p>
                  <p><span className="text-slate-400">At</span> <span className="font-mono text-slate-300">{new Date(currentData.timestamp * 1000).toUTCString().slice(17, 25)} UTC</span></p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {trajectoryLine.length > 1 && (
          <>
            <Polyline
              positions={trajectoryLine}
              pathOptions={{ color: '#06b6d4', weight: 1.5, opacity: 0.35, dashArray: '6 4' }}
            />
            <TrajectoryPoints points={trajectoryLine} />
          </>
        )}
      </MapContainer>

      {/* Overlay badge */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center space-x-2 px-3 py-1.5 bg-slate-950/80 backdrop-blur-sm border border-slate-700/50 rounded-lg pointer-events-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
        <p className="text-[11px] font-semibold text-cyan-400 tracking-wider uppercase">Live Orbital Track</p>
      </div>

      {/* Speed badge */}
      {currentData && currentData.speed > 0 && (
        <div className="absolute top-3 right-3 z-[1000] px-3 py-1.5 bg-slate-950/80 backdrop-blur-sm border border-slate-700/50 rounded-lg pointer-events-none">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Orbital Velocity</p>
          <p className="text-sm font-bold font-mono text-white">{Math.round(currentData.speed).toLocaleString()} <span className="text-cyan-400 text-xs">km/h</span></p>
        </div>
      )}
    </div>
  );
});

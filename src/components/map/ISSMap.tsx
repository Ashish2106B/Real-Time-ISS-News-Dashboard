import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useISSData } from '../../hooks/useISSData';
import 'leaflet/dist/leaflet.css';

// Custom ISS icon
const issIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [50, 30],
  iconAnchor: [25, 15],
  popupAnchor: [0, -15],
});

// Component to auto-pan map to ISS position
const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    if (isFirstRender.current) {
      map.setView([lat, lng], 3);
      isFirstRender.current = false;
    } else {
      map.flyTo([lat, lng], map.getZoom(), { duration: 1.5 });
    }
  }, [lat, lng, map]);

  return null;
};

export const ISSMap: React.FC = () => {
  const { trajectory, currentData } = useISSData();

  const trajectoryLine: [number, number][] = trajectory.map(p => [p.latitude, p.longitude]);

  return (
    <div className="w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden border border-slate-700/50 relative">
      <MapContainer
        center={currentData ? [currentData.latitude, currentData.longitude] : [0, 0]}
        zoom={3}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
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
              <Popup>
                <div className="text-sm">
                  <strong>International Space Station</strong><br />
                  Lat: {currentData.latitude.toFixed(4)}°<br />
                  Lon: {currentData.longitude.toFixed(4)}°<br />
                  Speed: {Math.round(currentData.speed).toLocaleString()} km/h
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {trajectoryLine.length > 1 && (
          <Polyline
            positions={trajectoryLine}
            pathOptions={{ color: '#06b6d4', weight: 2, opacity: 0.6, dashArray: '8 4' }}
          />
        )}
      </MapContainer>

      {/* Map Overlay Label */}
      <div className="absolute top-4 left-4 z-[1000] px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg">
        <p className="text-xs font-medium text-cyan-400 tracking-wider uppercase">Live Orbital Track</p>
      </div>
    </div>
  );
};

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Click-to-place marker child component
function ClickMarker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

/**
 * LocationMap component
 * - interactive=true: allows clicking to place marker (for complaint form)
 * - interactive=false: shows existing marker (for complaint detail)
 */
export default function LocationMap({ lat, lng, onLocationSelect, interactive = false, height = '280px' }) {
  const defaultCenter = [20.5937, 78.9629]; // India center
  const center = lat && lng ? [parseFloat(lat), parseFloat(lng)] : defaultCenter;

  if (!lat && !lng && !interactive) return null;

  return (
    <div style={{ height, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={center} zoom={lat ? 14 : 5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {interactive && <ClickMarker onLocationSelect={onLocationSelect} />}
        {lat && lng && (
          <Marker position={[parseFloat(lat), parseFloat(lng)]}>
            <Popup>📍 Complaint Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

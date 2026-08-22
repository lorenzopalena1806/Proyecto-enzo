'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet icons in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPickerProps {
  initialLat: number | null;
  initialLng: number | null;
  onChange: (lat: number, lng: number) => void;
}

function MapEvents({ setPosition, onChange }: { setPosition: any, onChange: any }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ initialLat, initialLng, onChange }: LocationPickerProps) {
  // Default to a central location (e.g., Buenos Aires) if none is provided
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  );

  const defaultCenter = L.latLng(-34.6037, -58.3816);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <MapPin className="h-4 w-4 text-violet-400" />
        <span>Hacé clic en el mapa para marcar tu ubicación exacta</span>
      </div>
      <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-700 relative z-0">
        <MapContainer 
          center={position || defaultCenter} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && (
            <Marker position={position} icon={customIcon} />
          )}
          <MapEvents setPosition={setPosition} onChange={onChange} />
        </MapContainer>
      </div>
      {position && (
        <p className="text-xs text-slate-500 font-mono">
          Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';

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

// Custom hook component to fly to a location
function FlyToLocation({ position }: { position: L.LatLng | null }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);
  return null;
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Focus map on current location
  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setSearchError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = L.latLng(pos.coords.latitude, pos.coords.longitude);
          setPosition(newPos);
          onChange(pos.coords.latitude, pos.coords.longitude);
          setIsLocating(false);
        },
        (err) => {
          console.error(err);
          setSearchError('No se pudo obtener tu ubicación. Revisá los permisos.');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setSearchError('Tu navegador no soporta geolocalización.');
      setIsLocating(false);
    }
  };

  // Search using Nominatim OpenStreetMap API
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    
    try {
      // Adding Argentina to the query to improve accuracy
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Argentina')}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const newPos = L.latLng(lat, lon);
        setPosition(newPos);
        onChange(lat, lon);
      } else {
        setSearchError('No se encontraron resultados para esa dirección.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('Hubo un error al buscar la dirección.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Location Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar calle y ciudad (Ej: Cabildo 2000, CABA)"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
          <button 
            type="submit" 
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-3 py-1 text-xs font-semibold disabled:opacity-50 transition-colors"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
          </button>
        </form>
        
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm text-white font-medium disabled:opacity-50 transition-colors shrink-0"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 text-violet-400" />
          )}
          Usar mi ubicación
        </button>
      </div>

      {searchError && (
        <p className="text-xs text-red-400">{searchError}</p>
      )}

      <div className="flex items-center gap-2 text-sm text-slate-300">
        <MapPin className="h-4 w-4 text-violet-400 shrink-0" />
        <span>O hacé clic en el mapa para marcar o ajustar el pin exacto</span>
      </div>
      
      <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-700 relative z-0 shadow-inner">
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
          {position && <FlyToLocation position={position} />}
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

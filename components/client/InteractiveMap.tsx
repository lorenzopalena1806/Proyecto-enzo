'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, Store, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Custom Map Pin Icon using Lazoo violet color
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Fix to apply CSS filter to default leaflet icons to make them violet
// We can't directly change the image color easily without custom SVG, 
// but for MVP this is fine. A custom SVG icon is better.

const svgIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #8b5cf6; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const createMerchantIcon = (avatarUrl: string | null) => {
  if (!avatarUrl) return svgIcon;
  return L.divIcon({
    className: 'custom-merchant-icon',
    html: `<div style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid #8b5cf6; box-shadow: 0 4px 10px rgba(0,0,0,0.4); overflow: hidden; background-color: #0f172a;"><img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" /></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44]
  });
};

interface MerchantLocation {
  id: string;
  business_name: string | null;
  avatar_url: string | null;
  category: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
}

interface MapProps {
  merchants: MerchantLocation[];
}

function LocateControl() {
  const map = useMap();
  useEffect(() => {
    map.locate().on('locationfound', function (e) {
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);
  return null;
}

export default function InteractiveMap({ merchants }: MapProps) {
  // Center in Buenos Aires by default
  const defaultCenter = L.latLng(-34.6037, -58.3816);

  // Calculate center based on merchants if any exist
  const center = merchants.length > 0 
    ? L.latLng(merchants[0].latitude, merchants[0].longitude) 
    : defaultCenter;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <LocateControl />

        {merchants.map((merchant) => (
          <Marker 
            key={merchant.id} 
            position={[merchant.latitude, merchant.longitude]}
            icon={createMerchantIcon(merchant.avatar_url)}
          >
            <Popup className="merchant-popup" closeButton={false}>
              <div className="p-1 min-w-[220px]">
                <div className="flex items-center gap-3 mb-3">
                  {merchant.avatar_url ? (
                    <img src={merchant.avatar_url} alt={merchant.business_name || 'Comercio'} className="w-14 h-14 rounded-2xl object-cover shadow-inner border border-white/10 bg-slate-800 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                      <Store className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-[15px] leading-tight truncate">{merchant.business_name || 'Comercio'}</h3>
                    <div className="mt-1">
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded uppercase tracking-wider inline-block truncate max-w-full">
                        {merchant.category || 'Local'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {merchant.address && (
                  <p className="text-[11px] text-slate-400 mb-4 leading-snug flex items-start gap-1.5 line-clamp-2">
                    <span className="mt-0.5 text-slate-500">📍</span> 
                    {merchant.address}
                  </p>
                )}

                <div className="flex gap-2">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${merchant.latitude},${merchant.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center flex-1 py-2 px-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[10px] font-semibold transition-colors border border-white/10"
                  >
                    <Navigation className="h-4 w-4 mb-0.5" />
                    Cómo llegar
                  </a>
                  <Link 
                    href={`/client/merchant/${merchant.id}`} 
                    className="flex flex-col items-center justify-center flex-1 py-2 px-1 bg-gradient-to-b from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl text-[10px] font-bold transition-colors shadow-lg border border-indigo-500/50"
                  >
                    <ExternalLink className="h-4 w-4 mb-0.5" />
                    Ver perfil
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Global styles for Leaflet Popup to look modern */}
      <style jsx global>{`
        .merchant-popup .leaflet-popup-content-wrapper {
          border-radius: 20px;
          padding: 4px;
          background-color: #0f172a;
          color: white;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .merchant-popup .leaflet-popup-content {
          margin: 8px;
        }
        .merchant-popup .leaflet-popup-tip {
          background-color: #0f172a;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        }
        /* Hide default zoom controls if we added zoomControl={false} but just in case */
        .leaflet-control-zoom {
          display: none;
        }
      `}</style>
    </div>
  );
}

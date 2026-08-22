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
            icon={svgIcon}
          >
            <Popup className="merchant-popup" closeButton={false}>
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-3 mb-3">
                  {merchant.avatar_url ? (
                    <img src={merchant.avatar_url} alt={merchant.business_name || 'Comercio'} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center border border-violet-200">
                      <Store className="h-6 w-6 text-violet-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{merchant.business_name || 'Comercio'}</h3>
                    <p className="text-xs font-medium text-violet-600 bg-violet-50 inline-block px-1.5 py-0.5 rounded mt-1">
                      {merchant.category || 'Local'}
                    </p>
                  </div>
                </div>
                
                {merchant.address && (
                  <p className="text-xs text-slate-500 mb-3 leading-snug flex items-start gap-1">
                    <span className="mt-0.5">📍</span> {merchant.address}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${merchant.latitude},${merchant.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Navigation className="h-3 w-3" />
                    Cómo llegar
                  </a>
                  {/* We can route to a merchant profile page if it exists. For now, we just link to dashboard or a placeholder */}
                  <Link 
                    href={`/dashboard`} 
                    className="flex items-center justify-center gap-1.5 py-2 px-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shadow-violet-200"
                  >
                    Ver ofertas <ExternalLink className="h-3 w-3" />
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
          border-radius: 16px;
          padding: 4px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .merchant-popup .leaflet-popup-content {
          margin: 8px;
        }
        .merchant-popup .leaflet-popup-tip {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
        }
        /* Hide default zoom controls if we added zoomControl={false} but just in case */
        .leaflet-control-zoom {
          display: none;
        }
      `}</style>
    </div>
  );
}

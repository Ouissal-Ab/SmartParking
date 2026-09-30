'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMemo } from 'react';
import type { Parking } from '@/types/parking';
import { formatCurrency } from '@/lib/utils';

interface Props {
  parkings: Parking[];
  center?: [number, number];
  onSelect?: (parking: Parking) => void;
}

function buildIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26s16-15 16-26C32 7.2 24.8 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="16" r="9" fill="white"/>
      <text x="16" y="21" text-anchor="middle" font-family="Inter, system-ui" font-weight="700" font-size="13" fill="${color}">P</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: 'parking-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -36],
  });
}

const iconAvailable = buildIcon('#10B981'); // green — places libres
const iconLow       = buildIcon('#F59E0B'); // amber — bientôt complet
const iconFull      = buildIcon('#DC2626'); // red — complet

function pickIcon(spots: number) {
  if (spots === 0) return iconFull;
  if (spots <= 5) return iconLow;
  return iconAvailable;
}

export default function ParkingMap({ parkings, center, onSelect }: Props) {
  const computedCenter: [number, number] = useMemo(() => {
    if (center) return center;
    if (parkings.length > 0) return [parkings[0].latitude, parkings[0].longitude];
    return [48.8566, 2.3522];
  }, [center, parkings]);

  return (
    <MapContainer
      center={computedCenter}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {parkings.map((p) => (
        <Marker
          key={p.id}
          position={[p.latitude, p.longitude]}
          icon={pickIcon(p.availableSpots)}
          eventHandlers={{ click: () => onSelect?.(p) }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="mt-1 text-xs text-gray-600">{p.address}</p>
              <p className="mt-2 text-xs">
                <strong>{p.availableSpots}</strong>/{p.totalSpots} places —{' '}
                {formatCurrency(p.hourlyRate)}/h
              </p>
              <a
                href={`/reserve/${p.id}`}
                style={{
                  color: '#FFFFFF',
                  backgroundColor: p.availableSpots === 0 ? '#DC2626' : '#10B981',
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginTop: '8px',
                  pointerEvents: p.availableSpots === 0 ? 'none' : 'auto',
                  opacity: p.availableSpots === 0 ? 0.6 : 1,
                }}
              >
                {p.availableSpots === 0 ? 'Complet' : 'Réserver'}
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

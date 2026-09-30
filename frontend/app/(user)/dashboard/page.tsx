'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Wifi } from 'lucide-react';
import api from '@/lib/api';
import { toParking, type BackendParking, type BackendPlace } from '@/lib/adapters';
import type { Parking } from '@/types/parking';
import { ParkingCard } from '@/components/parking/ParkingCard';
import { Input } from '@/components/ui/Input';
import { useLivePlaces } from '@/lib/hooks/useLivePlaces';
import type { PlaceUpdate } from '@/lib/realtime';

const ParkingMap = dynamic(() => import('@/components/parking/ParkingMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-sm text-text-secondary">Chargement de la carte...</p>
    </div>
  ),
});

export default function DashboardPage() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Parking | null>(null);
  // Track per-parking place status so we can recompute availability on WS events
  const [placesByParking, setPlacesByParking] = useState<Map<number, BackendPlace[]>>(
    new Map(),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<BackendParking[]>('/user/parkings');
        const enriched = await Promise.all(
          data.map(async (p) => {
            try {
              const { data: places } = await api.get<BackendPlace[]>(`/places/parking/${p.id}`);
              const free = places.filter((pl) => pl.statut === 'LIBRE').length;
              return { parking: toParking(p, free), places };
            } catch {
              return { parking: toParking(p, 0), places: [] as BackendPlace[] };
            }
          }),
        );
        if (cancelled) return;
        setParkings(enriched.map((e) => e.parking));
        const map = new Map<number, BackendPlace[]>();
        enriched.forEach((e) => map.set(e.parking.id, e.places));
        setPlacesByParking(map);
      } catch {
        if (!cancelled) setParkings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onLive = useCallback((u: PlaceUpdate) => {
    if (u.parkingId == null) return;
    setPlacesByParking((prev) => {
      const next = new Map(prev);
      const list = next.get(u.parkingId!);
      if (!list) return prev;
      const updated = list.map((p) =>
        p.id === u.id ? { ...p, statut: u.statut } : p,
      );
      next.set(u.parkingId!, updated);
      const freeCount = updated.filter((p) => p.statut === 'LIBRE').length;
      setParkings((parks) =>
        parks.map((pk) =>
          pk.id === u.parkingId ? { ...pk, availableSpots: freeCount } : pk,
        ),
      );
      return next;
    });
  }, []);
  useLivePlaces(onLive);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return parkings;
    return parkings.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.address.toLowerCase().includes(term),
    );
  }, [parkings, search]);

  const center = selected
    ? ([selected.latitude, selected.longitude] as [number, number])
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Trouvez une place
          </h1>
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            {parkings.length} parkings disponibles autour de vous
            <span className="flex items-center gap-1 text-xs text-[#7A4F0E]">
              <Wifi className="h-3.5 w-3.5 animate-pulse" />
              <span className="hidden sm:inline">temps réel</span>
            </span>
          </p>
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Rechercher un parking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-2">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-40 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-3 text-sm text-text-secondary">
                Aucun parking ne correspond à votre recherche.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <ParkingCard key={p.id} parking={p} onSelect={setSelected} />
              ))}
            </div>
          )}
        </div>

        <div className="h-[60vh] overflow-hidden rounded-2xl border border-white/55 bg-white/40 shadow-glass backdrop-blur-xl lg:col-span-3 lg:h-[calc(100vh-12rem)]">
          {!loading && (
            <ParkingMap parkings={filtered} center={center} onSelect={setSelected} />
          )}
        </div>
      </div>
    </div>
  );
}

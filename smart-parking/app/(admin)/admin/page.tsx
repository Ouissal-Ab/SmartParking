'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, Calendar, BarChart2, ParkingCircle, Wifi } from 'lucide-react';
import api from '@/lib/api';
import { toParking, type BackendParking, type BackendPlace } from '@/lib/adapters';
import type { Parking } from '@/types/parking';
import { StatCard } from '@/components/ui/StatCard';
import { OccupancyChart } from '@/components/charts/OccupancyChart';
import { ReservationTrend } from '@/components/charts/ReservationTrend';
import { useLivePlaces } from '@/lib/hooks/useLivePlaces';
import { useLiveReservations } from '@/lib/hooks/useLiveReservations';
import type { PlaceUpdate } from '@/lib/realtime';
import type { BackendReservation } from '@/lib/adapters';

interface BackendStats {
  totalParkings: number;
  totalPlaces: number;
  totalReservations: number;
  placesLibres: number;
  placesOccupees: number;
  tauxOccupation: number;
}

const fallbackTrend = [
  { day: 'Lun', count: 24 },
  { day: 'Mar', count: 31 },
  { day: 'Mer', count: 28 },
  { day: 'Jeu', count: 45 },
  { day: 'Ven', count: 52 },
  { day: 'Sam', count: 38 },
  { day: 'Dim', count: 22 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<BackendStats | null>(null);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [{ data: s }, { data: pArr }] = await Promise.all([
        api.get<BackendStats>('/admin/dashboard/stats'),
        api.get<BackendParking[]>('/admin/parkings'),
      ]);
      const withSpots = await Promise.all(
        pArr.slice(0, 5).map(async (p) => {
          try {
            const { data: places } = await api.get<BackendPlace[]>(`/places/parking/${p.id}`);
            return toParking(p, places.filter((x) => x.statut === 'LIBRE').length);
          } catch {
            return toParking(p, 0);
          }
        }),
      );
      setStats(s);
      setParkings(withSpots);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Debounced refresh on live events
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refresh();
    }, 400);
  }, [refresh]);

  const onLivePlace = useCallback((_u: PlaceUpdate) => {
    void _u;
    scheduleRefresh();
  }, [scheduleRefresh]);
  const onLiveReservation = useCallback((_r: BackendReservation) => {
    void _r;
    scheduleRefresh();
  }, [scheduleRefresh]);

  useLivePlaces(onLivePlace);
  useLiveReservations(onLiveReservation);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Tableau de bord
        </h1>
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          Vue d&apos;ensemble de l&apos;activité Smart Parking
          <span className="flex items-center gap-1 text-xs text-[#7A4F0E]">
            <Wifi className="h-3.5 w-3.5 animate-pulse" />
            mises à jour live
          </span>
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total parkings"
            value={stats?.totalParkings ?? 0}
            icon={MapPin}
            color="teal"
          />
          <StatCard
            title="Réservations totales"
            value={stats?.totalReservations ?? 0}
            icon={Calendar}
            color="indigo"
          />
          <StatCard
            title="Taux d'occupation"
            value={`${Math.round(stats?.tauxOccupation ?? 0)}%`}
            icon={BarChart2}
            color="amber"
          />
          <StatCard
            title="Places libres"
            value={stats?.placesLibres ?? 0}
            icon={ParkingCircle}
            trend={`${stats?.placesOccupees ?? 0} occupées`}
            color="rose"
          />
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="glass-card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Occupation par parking</h3>
            <p className="text-sm text-text-secondary">Places occupées vs total.</p>
          </div>
          <OccupancyChart parkings={parkings} />
        </div>

        <div className="glass-card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Tendance des réservations</h3>
            <p className="text-sm text-text-secondary">7 derniers jours (estimation).</p>
          </div>
          <ReservationTrend data={fallbackTrend} />
        </div>
      </div>
    </div>
  );
}

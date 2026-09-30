'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import api from '@/lib/api';
import { toReservation, type BackendReservation } from '@/lib/adapters';
import type { Reservation, ReservationStatus } from '@/types/reservation';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import { cn } from '@/lib/utils';

type Filter = 'ALL' | ReservationStatus;

const filterLabels: Record<Filter, string> = {
  ALL: 'Toutes',
  ACTIVE: 'Actives',
  COMPLETED: 'Terminées',
  CANCELLED: 'Annulées',
};

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => {
    let cancelled = false;
    api
      .get<BackendReservation[]>('/user/reservations')
      .then((res) => {
        if (!cancelled) setReservations(res.data.map(toReservation));
      })
      .catch(() => {
        if (!cancelled) setReservations([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return reservations;
    return reservations.filter((r) => r.status === filter);
  }, [reservations, filter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Mes réservations
        </h1>
        <p className="text-sm text-text-secondary">
          Consultez l&apos;historique et le statut de vos réservations.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(filterLabels) as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all',
              filter === f
                ? 'bg-[#FAB95B] text-[#1A1F2E] shadow-md shadow-[#FAB95B]/30'
                : 'glass-pill text-text-secondary hover:text-text-primary',
            )}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-44 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar className="mx-auto h-10 w-10 text-text-muted" />
          <p className="mt-4 text-base font-medium text-text-primary">
            Aucune réservation
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Vous n&apos;avez pas encore de réservation dans cette catégorie.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
}

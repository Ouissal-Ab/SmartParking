'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Wifi } from 'lucide-react';
import api from '@/lib/api';
import {
  toParking,
  toReservation,
  type BackendParking,
  type BackendReservation,
} from '@/lib/adapters';
import type { Reservation, ReservationStatus } from '@/types/reservation';
import type { Parking } from '@/types/parking';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useLiveReservations } from '@/lib/hooks/useLiveReservations';

const statusLabel: Record<ReservationStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const statusVariant: Record<ReservationStatus, 'success' | 'neutral' | 'danger'> = {
  ACTIVE: 'success',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [parkingFilter, setParkingFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r, p] = await Promise.all([
          api.get<BackendReservation[]>('/admin/reservations'),
          api.get<BackendParking[]>('/admin/parkings'),
        ]);
        if (cancelled) return;
        setReservations(r.data.map(toReservation));
        setParkings(p.data.map((x) => toParking(x, 0)));
      } catch {
        if (!cancelled) {
          setReservations([]);
          setParkings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live append on /topic/reservations
  const onLiveReservation = useCallback((b: BackendReservation) => {
    const r = toReservation(b);
    setReservations((prev) => {
      if (prev.some((x) => x.id === r.id)) return prev;
      return [r, ...prev];
    });
  }, []);
  useLiveReservations(onLiveReservation);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return reservations.filter((r) => {
      if (parkingFilter !== 'ALL' && String(r.parkingId) !== parkingFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (fromDate && new Date(r.startTime) < new Date(fromDate)) return false;
      if (toDate && new Date(r.startTime) > new Date(toDate + 'T23:59:59')) return false;
      if (term) {
        const haystack = `${r.id} ${r.userName} ${r.parkingName} ${r.spotNumber}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [reservations, parkingFilter, statusFilter, fromDate, toDate, query]);

  const columns: Column<Reservation>[] = [
    {
      key: 'id',
      header: 'Code',
      render: (r) => <span className="font-mono text-xs">#{r.id}</span>,
    },
    { key: 'userName', header: 'Utilisateur' },
    { key: 'parkingName', header: 'Parking' },
    { key: 'spotNumber', header: 'Place' },
    { key: 'date', header: 'Date', render: (r) => formatDate(r.startTime) },
    { key: 'time', header: 'Heure', render: (r) => formatTime(r.startTime) },
    { key: 'duration', header: 'Durée', render: (r) => `${r.duration} h` },
    { key: 'totalAmount', header: 'Montant', render: (r) => formatCurrency(r.totalAmount) },
    {
      key: 'status',
      header: 'Statut',
      render: (r) => <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge>,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Toutes les réservations
          </h1>
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            {reservations.length} réservations enregistrées
            <span className="flex items-center gap-1 text-xs text-[#7A4F0E]">
              <Wifi className="h-3.5 w-3.5 animate-pulse" />
              live
            </span>
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Rechercher utilisateur, parking, place..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </header>

      <div className="glass-card mb-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="text-xs font-medium text-text-secondary">Parking</label>
          <select
            value={parkingFilter}
            onChange={(e) => setParkingFilter(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-white/55 bg-white/55 px-3 text-sm text-text-primary backdrop-blur-md focus:border-[#FAB95B] focus:outline-none focus:ring-2 focus:ring-[#FAB95B]/30"
          >
            <option value="ALL">Tous les parkings</option>
            {parkings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-white/55 bg-white/55 px-3 text-sm text-text-primary backdrop-blur-md focus:border-[#FAB95B] focus:outline-none focus:ring-2 focus:ring-[#FAB95B]/30"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Terminée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </div>
        <Input label="Du" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <Input label="Au" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        rowKey={(r) => r.id}
        emptyMessage="Aucune réservation pour ces critères."
      />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  toBackendParking,
  toParking,
  type BackendParking,
  type BackendPlace,
} from '@/lib/adapters';
import type { Parking } from '@/types/parking';
import { Button } from '@/components/ui/Button';
import { Table, type Column } from '@/components/ui/Table';
import { ParkingModal, type ParkingFormValues } from '@/components/parking/ParkingModal';
import { formatCurrency, cn } from '@/lib/utils';

async function loadParkings(): Promise<Parking[]> {
  const { data } = await api.get<BackendParking[]>('/admin/parkings');
  return Promise.all(
    data.map(async (p) => {
      try {
        const { data: places } = await api.get<BackendPlace[]>(`/places/parking/${p.id}`);
        return toParking(p, places.filter((x) => x.statut === 'LIBRE').length);
      } catch {
        return toParking(p, 0);
      }
    }),
  );
}

function AvailabilityBar({ free, total }: { free: number; total: number }) {
  const pct = total > 0 ? Math.round((free / total) * 100) : 0;
  let barColor = 'bg-[#FAB95B]';
  let label = 'Disponible';
  let labelColor = 'text-[#7A4F0E]';
  if (free === 0) {
    barColor = 'bg-[#B85450]';
    label = 'Complet';
    labelColor = 'text-[#8B3A3A]';
  } else if (free <= 5 || pct < 15) {
    barColor = 'bg-[#D49543]';
    label = 'Presque complet';
    labelColor = 'text-[#7A4F0E]';
  }
  return (
    <div className="min-w-[180px] max-w-[240px]">
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold text-text-primary">
          {free}<span className="text-text-muted"> / {total}</span>
        </span>
        <span className={cn('font-medium', labelColor)}>{label}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#D4CCC2]/60">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminParkingsPage() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Parking | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setParkings(await loadParkings());
    } catch {
      setParkings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (parking: Parking) => {
    setEditing(parking);
    setModalOpen(true);
  };

  const remove = async (parking: Parking) => {
    if (!confirm(`Confirmer la suppression du parking « ${parking.name} » ?`)) return;
    try {
      await api.delete(`/admin/parkings/${parking.id}`);
      setParkings((prev) => prev.filter((p) => p.id !== parking.id));
      toast.success('Parking supprimé.');
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const submit = async (values: ParkingFormValues) => {
    const payload = toBackendParking(values);
    try {
      if (editing) {
        await api.put(`/admin/parkings/${editing.id}`, payload);
        toast.success('Parking modifié avec succès !');
      } else {
        await api.post('/admin/parkings', payload);
        toast.success('Parking ajouté avec succès !');
      }
      await refresh();
    } catch {
      toast.error('Erreur lors de l\'enregistrement.');
    } finally {
      setModalOpen(false);
      setEditing(null);
    }
  };

  const columns: Column<Parking>[] = [
    { key: 'name', header: 'Nom', render: (p) => <span className="font-medium">{p.name}</span> },
    { key: 'address', header: 'Adresse' },
    {
      key: 'totalSpots',
      header: 'Capacité',
      render: (p) => <span className="font-medium">{p.totalSpots}</span>,
    },
    {
      key: 'availableSpots',
      header: 'Disponibilité',
      render: (p) => <AvailabilityBar free={p.availableSpots} total={p.totalSpots} />,
    },
    {
      key: 'hourlyRate',
      header: 'Tarif / h',
      render: (p) => <span className="font-medium">{formatCurrency(p.hourlyRate)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(p)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#1A3263] transition-colors hover:bg-[#1A3263]/10"
          >
            Modifier
          </button>
          <span className="text-text-muted">·</span>
          <button
            onClick={() => remove(p)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#8B3A3A] transition-colors hover:bg-[#B85450]/12"
          >
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Gestion des parkings
          </h1>
          <p className="text-sm text-text-secondary">
            Ajoutez, modifiez ou supprimez des parkings.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="h-4 w-4" />
          Ajouter un parking
        </Button>
      </header>

      <Table
        columns={columns}
        data={parkings}
        loading={loading}
        rowKey={(p) => p.id}
        emptyMessage="Aucun parking enregistré."
      />

      <ParkingModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={submit}
        initialValue={editing}
        key={editing?.id ?? 'new'}
      />
    </div>
  );
}

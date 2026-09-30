'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Reservation } from '@/types/reservation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const statusLabel = {
  ACTIVE: 'Active',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
} as const;

const statusVariant = {
  ACTIVE: 'success',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
} as const;

interface Props {
  reservation: Reservation;
  onCancel?: (reservation: Reservation) => void;
}

export function ReservationCard({ reservation, onCancel }: Props) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold tracking-tight text-text-primary">
            {reservation.parkingName}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
            <MapPin className="h-3.5 w-3.5" />
            Place {reservation.spotNumber}
          </p>
        </div>
        <Badge variant={statusVariant[reservation.status]}>
          {statusLabel[reservation.status]}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDateTime(reservation.startTime)}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {reservation.duration} h
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/40 pt-3">
        <div>
          <p className="text-xs text-text-muted">Montant</p>
          <p className="text-xl font-bold tracking-tight text-text-primary">
            {formatCurrency(reservation.totalAmount)}
          </p>
        </div>
        {reservation.status === 'ACTIVE' && onCancel && (
          <Button variant="outline" size="sm" onClick={() => onCancel(reservation)}>
            Annuler
          </Button>
        )}
      </div>
    </motion.div>
  );
}

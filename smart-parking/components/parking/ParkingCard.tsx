'use client';

import Link from 'next/link';
import { MapPin, Clock, Car as CarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Parking } from '@/types/parking';
import { AvailabilityBadge } from './AvailabilityBadge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn } from '@/lib/utils';

interface Props {
  parking: Parking;
  onSelect?: (parking: Parking) => void;
}

export function ParkingCard({ parking, onSelect }: Props) {
  const isFull = parking.availableSpots === 0;
  const pct =
    parking.totalSpots > 0
      ? Math.round((parking.availableSpots / parking.totalSpots) * 100)
      : 0;

  let barColor = 'bg-[#FAB95B]';
  if (isFull) barColor = 'bg-[#B85450]';
  else if (parking.availableSpots <= 5 || pct < 15) barColor = 'bg-[#D49543]';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect?.(parking)}
      className="glass-card group cursor-pointer overflow-hidden p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold tracking-tight text-text-primary">
            {parking.name}
          </h3>
          <p className="mt-1 flex items-start gap-1 text-xs text-text-secondary">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{parking.address}</span>
          </p>
        </div>
        <AvailabilityBadge availableSpots={parking.availableSpots} />
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <CarIcon className="h-3.5 w-3.5" />
            {parking.availableSpots}/{parking.totalSpots} libres
          </span>
          <span className="flex items-center gap-1 text-text-muted">
            <Clock className="h-3.5 w-3.5" />
            {parking.openTime} – {parking.closeTime}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#D4CCC2]/60">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted">Tarif horaire</p>
          <p className="text-lg font-bold tracking-tight text-text-primary">
            {formatCurrency(parking.hourlyRate)}
            <span className="ml-1 text-xs font-normal text-text-muted">/heure</span>
          </p>
        </div>
        <Link href={`/reserve/${parking.id}`} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" disabled={isFull}>
            {isFull ? 'Complet' : 'Réserver'}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

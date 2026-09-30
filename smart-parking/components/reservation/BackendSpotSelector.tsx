'use client';

import { cn } from '@/lib/utils';
import type { BackendPlace } from '@/lib/adapters';

interface Props {
  places: BackendPlace[];
  selectedId: number | null;
  onSelect: (place: BackendPlace) => void;
}

export function BackendSpotSelector({ places, selectedId, onSelect }: Props) {
  const visible = places.slice(0, 60);
  const columns = visible.length > 30 ? 6 : 5;

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-white/40 bg-white/30 p-6 text-center text-sm text-text-secondary backdrop-blur-md">
        Aucune place n&apos;est encore configurée pour ce parking.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {visible.map((place) => {
          const occupied = place.statut !== 'LIBRE';
          const selected = selectedId === place.id;
          return (
            <button
              key={place.id}
              type="button"
              disabled={occupied}
              onClick={() => onSelect(place)}
              className={cn(
                'flex h-12 items-center justify-center rounded-xl border-2 text-xs font-semibold transition-all duration-150',
                occupied && 'cursor-not-allowed border-white/40 bg-beige-200/40 text-text-muted',
                !occupied && !selected && 'border-[#FAB95B]/45 bg-[#FAB95B]/12 text-[#7A4F0E] hover:bg-[#FAB95B]/25',
                selected && 'border-[#1A1F2E] bg-[#FAB95B] text-[#1A1F2E] shadow-md shadow-[#FAB95B]/40',
              )}
            >
              {place.numero}
            </button>
          );
        })}
      </div>
      {places.length > 60 && (
        <p className="text-xs text-text-muted">
          {places.length - 60} autres places non affichées.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-accent-teal/40 bg-accent-teal/10" />
          Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#FAB95B]" />
          Sélectionnée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-white/50 bg-beige-200/40" />
          Occupée / Réservée
        </span>
      </div>
    </div>
  );
}

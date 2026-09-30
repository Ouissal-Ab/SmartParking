'use client';

import { cn } from '@/lib/utils';

interface Props {
  totalSpots: number;
  occupiedSpots?: string[];
  selectedSpot: string | null;
  onSelect: (spot: string) => void;
  columns?: number;
}

function buildSpotLabels(total: number, columns: number): string[] {
  const labels: string[] = [];
  const rows = Math.ceil(total / columns);
  for (let r = 0; r < rows; r++) {
    const row = String.fromCharCode(65 + r);
    for (let c = 1; c <= columns; c++) {
      if (labels.length >= total) break;
      labels.push(`${row}${c.toString().padStart(2, '0')}`);
    }
  }
  return labels;
}

export function SpotSelector({
  totalSpots,
  occupiedSpots = [],
  selectedSpot,
  onSelect,
  columns = 5,
}: Props) {
  const labels = buildSpotLabels(Math.min(totalSpots, 30), columns);

  return (
    <div className="space-y-3">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {labels.map((label) => {
          const occupied = occupiedSpots.includes(label);
          const selected = selectedSpot === label;
          return (
            <button
              key={label}
              type="button"
              disabled={occupied}
              onClick={() => onSelect(label)}
              className={cn(
                'flex h-12 items-center justify-center rounded-xl border-2 text-xs font-semibold transition-all duration-150',
                occupied && 'cursor-not-allowed border-border bg-beige-200/60 text-text-muted',
                !occupied && !selected && 'border-accent-teal/40 bg-accent-teal/10 text-teal-700 hover:bg-accent-teal/20',
                selected && 'border-accent-teal bg-accent-teal text-white shadow-soft',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-accent-teal/40 bg-accent-teal/10" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-accent-teal" />
          Sélectionnée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-beige-200/60 border border-border" />
          Occupée
        </span>
      </div>
    </div>
  );
}

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Color = 'teal' | 'amber' | 'rose' | 'indigo';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: Color;
}

const iconStyle: Record<Color, string> = {
  teal:   'bg-[#FAB95B] text-[#1A1F2E]',
  amber:  'bg-[#D49543] text-white',
  rose:   'bg-[#B85450] text-white',
  indigo: 'bg-[#1A3263] text-white',
};

const trendColor: Record<Color, string> = {
  teal: 'text-[#7A4F0E]',
  amber: 'text-[#7A4F0E]',
  rose: 'text-[#8B3A3A]',
  indigo: 'text-[#1A3263]',
};

const glowColor: Record<Color, string> = {
  teal:   'bg-[#FAB95B]/25',
  amber:  'bg-[#D49543]/20',
  rose:   'bg-[#B85450]/18',
  indigo: 'bg-[#1A3263]/15',
};

export function StatCard({ title, value, icon: Icon, trend, color = 'teal' }: StatCardProps) {
  return (
    <div className="glass-card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5">
      <div
        className={cn(
          'pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-90',
          glowColor[color],
        )}
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            {title}
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-text-primary">
            {value}
          </p>
          {trend && <p className={cn('mt-1 text-xs font-medium', trendColor[color])}>{trend}</p>}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl shadow-md',
            iconStyle[color],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

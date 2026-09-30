import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  success: 'bg-[#FAB95B]/25 text-[#7A4F0E] ring-1 ring-[#FAB95B]/45',
  warning: 'bg-[#D49543]/20 text-[#7A4F0E] ring-1 ring-[#D49543]/35',
  danger:  'bg-[#B85450]/15 text-[#8B3A3A] ring-1 ring-[#B85450]/30',
  info:    'bg-[#1A3263]/12 text-[#1A3263] ring-1 ring-[#1A3263]/25',
  neutral: 'bg-white/55 text-text-secondary ring-1 ring-white/65',
};

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}

'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[#FAB95B] text-[#1A1F2E] shadow-gold hover:bg-[#F0AC42] hover:shadow-gold-lg active:scale-[0.98]',
  secondary:
    'bg-white/60 text-[#1A1F2E] backdrop-blur-md ring-1 ring-white/60 hover:bg-white/80',
  ghost:
    'bg-transparent text-[#1A1F2E] hover:bg-white/50',
  danger:
    'bg-[#B85450] text-white hover:bg-[#A04746] active:scale-[0.98]',
  outline:
    'border border-[#1A3263]/15 bg-white/35 text-[#1A1F2E] backdrop-blur-md hover:bg-white/55 hover:border-[#1A3263]/30',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-lg',
  md: 'h-10 px-5 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FAB95B]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

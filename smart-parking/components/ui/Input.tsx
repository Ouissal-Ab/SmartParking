'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg border border-white/55 bg-white/55 px-3.5 text-sm text-text-primary backdrop-blur-md',
            'placeholder:text-text-muted transition-all duration-200',
            'focus:border-[#FAB95B] focus:bg-white/75 focus:outline-none focus:ring-2 focus:ring-[#FAB95B]/30',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-[#B85450] focus:border-[#B85450] focus:ring-[#B85450]/30',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#B85450]">{error}</p>}
        {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

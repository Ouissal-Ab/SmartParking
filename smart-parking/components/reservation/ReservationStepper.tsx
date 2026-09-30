'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

export function ReservationStepper({ steps, currentStep }: Props) {
  return (
    <div className="w-full">
      <ol className="flex w-full items-center">
        {steps.map((step, idx) => {
          const status: 'done' | 'active' | 'pending' =
            idx < currentStep ? 'done' : idx === currentStep ? 'active' : 'pending';
          const isLast = idx === steps.length - 1;
          return (
            <li key={step.label} className={cn('flex items-center', !isLast && 'flex-1')}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    status === 'done' && 'border-accent-teal bg-accent-teal text-white',
                    status === 'active' && 'border-accent-teal bg-accent-teal/10 text-teal-700',
                    status === 'pending' && 'border-border bg-card text-text-muted',
                  )}
                >
                  {status === 'done' ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={cn(
                    'hidden text-sm font-medium sm:inline',
                    status === 'pending' ? 'text-text-muted' : 'text-text-primary',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'mx-3 h-0.5 flex-1 rounded-full transition-colors sm:mx-6',
                    idx < currentStep ? 'bg-accent-teal' : 'bg-border',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

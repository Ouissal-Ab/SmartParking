'use client';

import { useEffect } from 'react';
import { subscribeTopic } from '@/lib/realtime';
import type { BackendReservation } from '@/lib/adapters';

/**
 * Subscribe to `/topic/reservations`. Handler must be stable.
 */
export function useLiveReservations(handler: (r: BackendReservation) => void) {
  useEffect(() => {
    const unsub = subscribeTopic<BackendReservation>('/topic/reservations', handler);
    return unsub;
  }, [handler]);
}

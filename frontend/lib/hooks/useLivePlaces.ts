'use client';

import { useEffect } from 'react';
import { subscribeTopic, type PlaceUpdate } from '@/lib/realtime';

/**
 * Subscribe to `/topic/places`. Handler must be stable (use useCallback or
 * a ref pattern) to avoid resubscribing on every render.
 */
export function useLivePlaces(handler: (update: PlaceUpdate) => void) {
  useEffect(() => {
    const unsub = subscribeTopic<PlaceUpdate>('/topic/places', handler);
    return unsub;
  }, [handler]);
}

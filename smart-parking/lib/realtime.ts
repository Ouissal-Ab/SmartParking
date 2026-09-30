'use client';

import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface PlaceUpdate {
  id: number;
  numero: string;
  statut: 'LIBRE' | 'OCCUPE' | 'RESERVE';
  parkingId: number | null;
}

let client: Client | null = null;
const subscriptions = new Map<string, StompSubscription>();
const listeners = new Map<string, Set<(msg: unknown) => void>>();

function buildEndpoint(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `${protocol}//${host}:8080/ws`;
    }
  }
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return base.replace(/\/$/, '') + '/ws';
}

function ensureClient(): Client {
  if (client) return client;

  const c = new Client({
    webSocketFactory: () => new SockJS(buildEndpoint()) as unknown as WebSocket,
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
  });

  c.onConnect = () => {
    listeners.forEach((set, topic) => {
      if (set.size > 0 && !subscriptions.has(topic)) {
        const sub = c.subscribe(topic, (msg: IMessage) => {
          try {
            const data = JSON.parse(msg.body);
            listeners.get(topic)?.forEach((cb) => {
              try { cb(data); } catch {}
            });
          } catch {}
        });
        subscriptions.set(topic, sub);
      }
    });
  };

  c.onWebSocketClose = () => {
    subscriptions.clear();
  };

  c.activate();
  client = c;
  return c;
}

export function subscribeTopic<T = unknown>(
  topic: string,
  handler: (msg: T) => void,
): () => void {
  const c = ensureClient();

  if (!listeners.has(topic)) listeners.set(topic, new Set());
  listeners.get(topic)!.add(handler as (msg: unknown) => void);

  if (c.connected && !subscriptions.has(topic)) {
    const sub = c.subscribe(topic, (m: IMessage) => {
      try {
        const data = JSON.parse(m.body);
        listeners.get(topic)?.forEach((cb) => {
          try { cb(data); } catch {}
        });
      } catch {}
    });
    subscriptions.set(topic, sub);
  }

  return () => {
    const set = listeners.get(topic);
    if (!set) return;
    set.delete(handler as (msg: unknown) => void);
    if (set.size === 0) {
      listeners.delete(topic);
      const sub = subscriptions.get(topic);
      sub?.unsubscribe();
      subscriptions.delete(topic);
    }
  };
}

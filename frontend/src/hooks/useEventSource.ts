/**
 * useEventSource — connects to an SSE endpoint using the native EventSource API.
 *
 * - Exposes connection state (connecting / open / closed) so the UI can render
 *   the colored dot in the Header (green/yellow/red per SPEC §10).
 * - Maintains a per-ticker history buffer suitable for sparkline mini-charts.
 *   The buffer is a Map<ticker, number[]> with a max length so old points age out.
 *
 * Same-origin `/api/stream/*` is the only intended use (no CORS configuration).
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import type { PriceTick, ConnectionState } from '@/lib/types';

export interface UseEventSourceOptions {
  /** SSE URL to connect to. */
  url: string;
  /** Maximum number of price points retained per ticker for sparkline history. */
  maxHistory?: number;
  /** Whether the hook is allowed to open a connection. Set false to pause. */
  enabled?: boolean;
}

export interface UseEventSourceResult {
  /** Most recent tick per ticker. */
  latest: Map<string, PriceTick>;
  /** Per-ticker price history, oldest → newest, capped at `maxHistory`. */
  history: Map<string, number[]>;
  /** Connection state for the status dot. */
  connectionState: ConnectionState;
}

/**
 * Convert raw EventSource payload into a typed PriceTick.
 * The backend emits `{ ticker, price, previous_price, timestamp, direction }`.
 */
function parseTick(raw: string): PriceTick | null {
  try {
    const obj = JSON.parse(raw) as Partial<PriceTick>;
    if (
      typeof obj.ticker !== 'string' ||
      typeof obj.price !== 'number' ||
      typeof obj.timestamp !== 'string'
    ) {
      return null;
    }
    return {
      ticker: obj.ticker,
      price: obj.price,
      previous_price: typeof obj.previous_price === 'number' ? obj.previous_price : null,
      timestamp: obj.timestamp,
      direction: (obj.direction as PriceTick['direction']) ?? 'flat',
    };
  } catch {
    return null;
  }
}

export function useEventSource({
  url,
  maxHistory = 120,
  enabled = true,
}: UseEventSourceOptions): UseEventSourceResult {
  const [latest, setLatest] = useState<Map<string, PriceTick>>(() => new Map());
  const [history, setHistory] = useState<Map<string, number[]>>(() => new Map());
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');

  // Latest values held in refs so the message handler can read them without
  // forcing the effect to re-bind on every tick.
  const latestRef = useRef(latest);
  const historyRef = useRef(history);
  latestRef.current = latest;
  historyRef.current = history;

  useEffect(() => {
    if (!enabled) {
      setConnectionState('closed');
      return;
    }

    setConnectionState('connecting');
    const source = new EventSource(url);

    source.onopen = () => setConnectionState('open');
    source.onerror = () => setConnectionState('closed');

    source.onmessage = (event) => {
      const tick = parseTick(event.data);
      if (!tick) return;

      const newLatest = new Map(latestRef.current);
      newLatest.set(tick.ticker, tick);
      setLatest(newLatest);

      const newHistory = new Map(historyRef.current);
      const prev = newHistory.get(tick.ticker) ?? [];
      const next = prev.length >= maxHistory ? prev.slice(1) : prev.slice();
      next.push(tick.price);
      newHistory.set(tick.ticker, next);
      setHistory(newHistory);
    };

    return () => {
      source.close();
      setConnectionState('closed');
    };
  }, [url, maxHistory, enabled]);

  return { latest, history, connectionState };
}
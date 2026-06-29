"use client";

// SPEC §6/§10: useEventSource hook pointing at /api/stream/prices.
// Exposes connection-state (green/yellow/red) and a per-ticker history buffer.
// Buffer caps prevent unbounded memory growth on a long session.

import { useEffect, useRef, useState, useCallback } from "react";
import type { ConnectionState, PriceTick } from "@/types/api";

const DEFAULT_MAX_POINTS = 60;

type PriceStore = {
  /** Latest tick per ticker, keyed by ticker symbol. */
  latest: Map<string, PriceTick>;
  /** History buffer per ticker (oldest → newest). */
  history: Map<string, PriceTick[]>;
};

function emptyStore(): PriceStore {
  return { latest: new Map(), history: new Map() };
}

export type UseEventSourceOptions = {
  /** Path of the SSE endpoint (default /api/stream/prices). */
  url?: string;
  /** Max points kept per ticker for sparkline rendering. */
  maxPoints?: number;
  /** Whether the hook is enabled at all (e.g., pause when tab hidden). */
  enabled?: boolean;
};

export type UseEventSourceResult = {
  connection: ConnectionState;
  latest: ReadonlyMap<string, PriceTick>;
  history: ReadonlyMap<string, ReadonlyArray<PriceTick>>;
  /** Force a reconnect; resets the underlying EventSource. */
  reconnect: () => void;
};

export function useEventSource(
  options: UseEventSourceOptions = {},
): UseEventSourceResult {
  const {
    url = "/api/stream/prices",
    maxPoints = DEFAULT_MAX_POINTS,
    enabled = true,
  } = options;

  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [store, setStore] = useState<PriceStore>(emptyStore);

  // Latest handlers in refs so the EventSource effect doesn't churn on rerender.
  const maxPointsRef = useRef(maxPoints);
  maxPointsRef.current = maxPoints;

  // Tick-counting bump to trigger re-renders without exposing setters.
  const storeRef = useRef(store);
  storeRef.current = store;

  // Increment to force a reconnect without rebuilding handlers.
  const [reconnectNonce, setReconnectNonce] = useState(0);

  const reconnect = useCallback(() => {
    setReconnectNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setConnection("closed");
      return;
    }

    let es: EventSource | null = null;
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (cancelled) return;
      setConnection((prev) =>
        prev === "open" ? "reconnecting" : "connecting",
      );

      es = new EventSource(url);

      es.onopen = () => {
        if (cancelled) return;
        setConnection("open");
      };

      es.onmessage = (ev) => {
        if (cancelled) return;
        let tick: PriceTick;
        try {
          const data = JSON.parse(ev.data);
          tick = {
            ticker: String(data.ticker),
            price: Number(data.price),
            previous_price:
              data.previous_price == null ? null : Number(data.previous_price),
            timestamp: String(data.timestamp ?? new Date().toISOString()),
            direction:
              data.direction === "up" || data.direction === "down"
                ? data.direction
                : "flat",
          };
        } catch {
          // Malformed frame — skip without breaking the stream.
          return;
        }

        // Mutate the store in place, then bump state for re-render.
        const current = storeRef.current;
        current.latest.set(tick.ticker, tick);
        const buf = current.history.get(tick.ticker) ?? [];
        buf.push(tick);
        if (buf.length > maxPointsRef.current) {
          buf.splice(0, buf.length - maxPointsRef.current);
        }
        current.history.set(tick.ticker, buf);
        // Force re-render by replacing the Maps (preserves identity for keys).
        setStore({
          latest: new Map(current.latest),
          history: new Map(current.history),
        });
      };

      es.onerror = () => {
        if (cancelled) return;
        // EventSource auto-retries, but update state so the UI reflects loss.
        setConnection("reconnecting");
        // Some browsers fire onerror right before close — null out defensively.
        if (es && es.readyState === EventSource.CLOSED) {
          es.close();
          es = null;
          // Manual backoff retry (EventSource will also retry on its own,
          // but this guards against rare platforms that don't).
          reconnectTimer = setTimeout(connect, 2000);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (es) {
        es.close();
        es = null;
      }
      setConnection("closed");
    };
  }, [url, enabled, reconnectNonce]);

  return {
    connection,
    latest: store.latest,
    history: store.history,
    reconnect,
  };
}
/**
 * useWatchlist — manages the user's watchlist via the REST API.
 *
 * - GET /api/watchlist to populate the list.
 * - POST /api/watchlist to add a ticker.
 * - DELETE /api/watchlist/{ticker} to remove a ticker.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { WatchlistEntry } from '@/lib/types';

export interface UseWatchlistResult {
  entries: WatchlistEntry[];
  tickers: string[];
  loading: boolean;
  error: string | null;
  addTicker: (ticker: string) => Promise<void>;
  removeTicker: (ticker: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useWatchlist(): UseWatchlistResult {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/watchlist', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`watchlist fetch failed: ${res.status}`);
      }
      const data = (await res.json()) as { tickers: WatchlistEntry[] };
      setEntries(data.tickers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addTicker = useCallback(
    async (ticker: string) => {
      const normalized = ticker.trim().toUpperCase();
      if (!normalized) return;
      setError(null);
      try {
        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker: normalized }),
        });
        if (!res.ok) {
          throw new Error(`add ticker failed: ${res.status}`);
        }
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'unknown error');
      }
    },
    [refresh],
  );

  const removeTicker = useCallback(
    async (ticker: string) => {
      const normalized = ticker.trim().toUpperCase();
      if (!normalized) return;
      setError(null);
      try {
        const res = await fetch(`/api/watchlist/${encodeURIComponent(normalized)}`, {
          method: 'DELETE',
        });
        if (!res.ok && res.status !== 404) {
          throw new Error(`remove ticker failed: ${res.status}`);
        }
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'unknown error');
      }
    },
    [refresh],
  );

  return {
    entries,
    tickers: entries.map((e) => e.ticker),
    loading,
    error,
    addTicker,
    removeTicker,
    refresh,
  };
}
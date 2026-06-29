/**
 * usePortfolio — fetches the current portfolio summary.
 *
 * GET /api/portfolio → { cash_balance, total_value, unrealized_pnl, positions[] }
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Portfolio } from '@/lib/types';

export interface UsePortfolioResult {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePortfolio(pollMs = 5000): UsePortfolioResult {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`portfolio fetch failed: ${res.status}`);
      }
      const data = (await res.json()) as Portfolio;
      setPortfolio(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (pollMs > 0) {
      timerRef.current = setInterval(refresh, pollMs);
      return () => {
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [refresh, pollMs]);

  return { portfolio, loading, error, refresh };
}
"use client";

// SPEC §10: header (total portfolio value live, cash balance, connection dot)
// + dense grid layout for the watchlist and main chart area.

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { useEventSource } from "@/hooks/useEventSource";
import { getPortfolio } from "@/lib/api";
import type { Portfolio } from "@/types/api";

export function AppShell({ children }: { children: ReactNode }) {
  const { connection, latest } = useEventSource();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  // Load the initial portfolio, then refresh whenever any price updates
  // (totals depend on current prices for market_value / unrealized_pnl).
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const p = await getPortfolio();
        if (!cancelled) {
          setPortfolio(p);
          setPortfolioError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setPortfolioError(e instanceof Error ? e.message : "load failed");
        }
      }
    };
    refresh();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute market values client-side when prices tick (avoids a backend
  // round-trip per SSE frame). Backend remains source of truth on reload.
  useEffect(() => {
    if (!portfolio || latest.size === 0) return;
    let dirty = false;
    const nextPositions = portfolio.positions.map((pos) => {
      const tick = latest.get(pos.ticker);
      if (!tick || tick.price === pos.current_price) return pos;
      dirty = true;
      const market_value = pos.quantity * tick.price;
      const unrealized_pnl = market_value - pos.quantity * pos.avg_cost;
      const unrealized_pnl_pct =
        pos.avg_cost > 0
          ? ((tick.price - pos.avg_cost) / pos.avg_cost) * 100
          : 0;
      return {
        ...pos,
        current_price: tick.price,
        market_value,
        unrealized_pnl,
        unrealized_pnl_pct,
      };
    });
    if (!dirty) return;
    const positions_value = nextPositions.reduce(
      (acc, p) => acc + (p.market_value ?? 0),
      0,
    );
    const total_value = positions_value + portfolio.cash_balance;
    const unrealized_pnl = nextPositions.reduce(
      (acc, p) => acc + (p.unrealized_pnl ?? 0),
      0,
    );
    setPortfolio({
      ...portfolio,
      positions: nextPositions,
      total_value,
      unrealized_pnl,
    });
  }, [latest, portfolio]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        totalValue={portfolio?.total_value ?? null}
        cashBalance={portfolio?.cash_balance ?? null}
        connection={connection}
        portfolioError={portfolioError}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { WatchlistPanel } from '@/components/WatchlistPanel';
import { useEventSource } from '@/hooks/useEventSource';
import { useWatchlist } from '@/hooks/useWatchlist';
import { usePortfolio } from '@/hooks/usePortfolio';

/**
 * Root page — terminal-style grid layout.
 *
 * Top:    Header (portfolio total, cash, P&L, connection dot)
 * Left:   Watchlist (dense grid with sparklines + flashing prices)
 * Right:  placeholder for the rest of the workstation (chart, heatmap, trade bar,
 *         chat, etc.). Reserved by `fin-ftr` so this scaffold keeps the area
 *         visible without committing to a layout that's not in scope.
 */
export default function HomePage() {
  const watchlist = useWatchlist();
  const portfolio = usePortfolio();
  const { latest, history, connectionState } = useEventSource({
    url: '/api/stream/prices',
  });

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  return (
    <div className="flex h-screen flex-col">
      <Header
        portfolio={portfolio.portfolio}
        connectionState={connectionState}
      />

      <main className="grid flex-1 grid-cols-[320px_1fr] overflow-hidden">
        <WatchlistPanel
          tickers={watchlist.tickers}
          latest={latest}
          history={history}
          selectedTicker={selectedTicker}
          onSelect={(ticker) => setSelectedTicker(ticker)}
          onAdd={(ticker) => watchlist.addTicker(ticker)}
          onRemove={(ticker) => watchlist.removeTicker(ticker)}
        />

        <section
          className="flex flex-col items-center justify-center gap-3 bg-bg-base p-8 text-ink-dim"
          data-testid="workspace-placeholder"
        >
          <h3 className="font-mono text-xs uppercase tracking-wider text-ink-faint">
            Workspace
          </h3>
          {selectedTicker ? (
            <p className="font-mono text-sm text-accent-yellow">
              {selectedTicker} selected — detailed chart coming in fin-ftr.
            </p>
          ) : (
            <p className="text-xs text-ink-faint">
              Select a ticker from the watchlist to inspect its chart.
            </p>
          )}
          <p className="max-w-md text-center text-[11px] text-ink-faint">
            The detailed chart, heatmap, P&amp;L chart, positions table, trade
            bar, and AI chat panel land in the next milestone (fin-ftr). This
            scaffold focuses on the shell, header, and live watchlist.
          </p>
        </section>
      </main>
    </div>
  );
}
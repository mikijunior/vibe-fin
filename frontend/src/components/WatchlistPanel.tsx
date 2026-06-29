'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import type { PriceTick } from '@/lib/types';
import { Sparkline } from './Sparkline';
import { formatPrice, formatPercent } from '@/lib/format';
import { usePriceFlash } from '@/lib/priceFlash';

export interface WatchlistPanelProps {
  tickers: string[];
  latest: Map<string, PriceTick>;
  history: Map<string, number[]>;
  selectedTicker: string | null;
  onSelect: (ticker: string) => void;
  onAdd: (ticker: string) => void | Promise<void>;
  onRemove: (ticker: string) => void | Promise<void>;
}

interface WatchlistRowProps {
  ticker: string;
  tick: PriceTick | undefined;
  history: number[];
  selected: boolean;
  onSelect: (ticker: string) => void;
  onRemove: (ticker: string) => void;
}

function WatchlistRow({
  ticker,
  tick,
  history,
  selected,
  onSelect,
  onRemove,
}: WatchlistRowProps) {
  const { flashClass, flashPrice } = usePriceFlash();

  // Apply flash class whenever a new price arrives.
  if (tick) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    flashPrice(tick.price);
  }

  const previousClose = tick?.previous_price ?? null;
  const changePct =
    tick && previousClose && previousClose > 0
      ? ((tick.price - previousClose) / previousClose) * 100
      : 0;

  const positive = changePct >= 0;

  return (
    <tr
      onClick={() => onSelect(ticker)}
      className={clsx(
        'group cursor-pointer border-b border-muted-subtle transition-colors',
        selected ? 'bg-bg-elev' : 'hover:bg-bg-elev/60',
      )}
      data-testid={`watchlist-row-${ticker}`}
      data-selected={selected ? 'true' : 'false'}
    >
      <td className="px-3 py-2 font-mono text-sm font-semibold text-accent-blue">
        {ticker}
      </td>
      <td
        className={clsx(
          'px-3 py-2 text-right font-mono text-sm tabular-nums text-ink',
          flashClass,
        )}
        data-testid={`watchlist-price-${ticker}`}
      >
        {tick ? formatPrice(tick.price) : '—'}
      </td>
      <td
        className={clsx(
          'px-3 py-2 text-right font-mono text-xs tabular-nums',
          positive ? 'text-tick-up' : 'text-tick-down',
        )}
        data-testid={`watchlist-change-${ticker}`}
      >
        {tick ? formatPercent(changePct) : '—'}
      </td>
      <td className="px-3 py-2">
        <Sparkline
          data={history}
          color={positive ? '#16a34a' : '#dc2626'}
        />
      </td>
      <td className="w-8 px-2 py-2 text-right">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(ticker);
          }}
          className="invisible rounded p-1 text-ink-faint hover:bg-muted-strong hover:text-tick-down group-hover:visible"
          aria-label={`remove ${ticker}`}
          data-testid={`watchlist-remove-${ticker}`}
        >
          ×
        </button>
      </td>
    </tr>
  );
}

export function WatchlistPanel({
  tickers,
  latest,
  history,
  selectedTicker,
  onSelect,
  onAdd,
  onRemove,
}: WatchlistPanelProps) {
  const [draft, setDraft] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = draft.trim().toUpperCase();
    if (!value) return;
    void onAdd(value);
    setDraft('');
  };

  return (
    <section
      className="flex h-full flex-col border-r border-muted-strong bg-bg-panel"
      data-testid="watchlist-panel"
    >
      <div className="flex items-center justify-between border-b border-muted-strong px-4 py-2">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink-dim">
          Watchlist
        </h2>
        <span className="font-mono text-[10px] text-ink-faint">
          {tickers.length} {tickers.length === 1 ? 'ticker' : 'tickers'}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-b border-muted-subtle px-3 py-2"
        data-testid="watchlist-add-form"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add ticker (e.g. NVDA)"
          aria-label="add ticker"
          data-testid="watchlist-add-input"
          className="flex-1 rounded border border-muted bg-bg-base px-2 py-1 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-accent-blue focus:outline-none"
        />
        <button
          type="submit"
          className="rounded bg-accent-blue px-3 py-1 font-mono text-xs font-semibold text-bg-base hover:opacity-90"
          data-testid="watchlist-add-submit"
        >
          Add
        </button>
      </form>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-muted-strong text-left text-[10px] uppercase tracking-wider text-ink-faint">
              <th className="px-3 py-2">Symbol</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2 text-right">%</th>
              <th className="px-3 py-2 text-left">Trend</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {tickers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-xs text-ink-faint"
                  data-testid="watchlist-empty"
                >
                  No tickers yet. Add one above.
                </td>
              </tr>
            ) : (
              tickers.map((ticker) => (
                <WatchlistRow
                  key={ticker}
                  ticker={ticker}
                  tick={latest.get(ticker)}
                  history={history.get(ticker) ?? []}
                  selected={selectedTicker === ticker}
                  onSelect={onSelect}
                  onRemove={onRemove}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
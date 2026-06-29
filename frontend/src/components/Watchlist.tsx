"use client";

// SPEC §10: Watchlist panel — dense grid of ticker, current price (flashing),
// change %, sparkline mini-chart; clicking a row selects the ticker.

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Sparkline } from "@/components/Sparkline";
import { formatPct, formatPrice, pctColorClass } from "@/lib/format";
import { applyFlash, flashClassFromPrices } from "@/lib/priceFlash";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "@/lib/api";
import type { PriceTick, WatchlistEntry } from "@/types/api";

type WatchlistProps = {
  latest: ReadonlyMap<string, PriceTick>;
  history: ReadonlyMap<string, ReadonlyArray<PriceTick>>;
  selectedTicker: string | null;
  onSelect: (ticker: string) => void;
};

export function Watchlist({
  latest,
  history,
  selectedTicker,
  onSelect,
}: WatchlistProps) {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    getWatchlist()
      .then((data) => {
        if (!cancelled) {
          setEntries(data);
          setLoadError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "load failed");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = useCallback(async () => {
    const ticker = draft.trim().toUpperCase();
    if (!ticker) return;
    setBusy(true);
    try {
      const entry = await addToWatchlist(ticker);
      setEntries((prev) => {
        if (prev.some((e) => e.ticker === entry.ticker)) return prev;
        return [...prev, entry];
      });
      setDraft("");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "add failed");
    } finally {
      setBusy(false);
    }
  }, [draft]);

  const handleRemove = useCallback(async (ticker: string) => {
    setBusy(true);
    try {
      await removeFromWatchlist(ticker);
      setEntries((prev) => prev.filter((e) => e.ticker !== ticker));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "remove failed");
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <section
      className="flex h-full flex-col border-r border-border bg-bg-secondary"
      data-testid="watchlist-panel"
      aria-label="Watchlist"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Watchlist
        </h2>
        <span className="text-[10px] tabular-nums text-gray-500">
          {entries.length} symbols
        </span>
      </div>

      <form
        className="flex gap-2 border-b border-border px-3 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          void handleAdd();
        }}
        data-testid="watchlist-add-form"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          placeholder="Add ticker (e.g. AAPL)"
          aria-label="Add ticker"
          data-testid="watchlist-add-input"
          className="flex-1 rounded border border-border bg-bg-primary px-2 py-1 text-xs uppercase tabular-nums text-gray-100 placeholder:text-gray-600 focus:border-brand-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          data-testid="watchlist-add-button"
          className="rounded bg-brand-primary px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {loadError ? (
        <div
          className="border-b border-border bg-rose-900/30 px-3 py-2 text-xs text-rose-300"
          role="alert"
          data-testid="watchlist-error"
        >
          {loadError}
        </div>
      ) : null}

      <div className="grid grid-cols-[1.2fr_1fr_0.7fr_1.5fr_auto] gap-2 border-b border-border px-4 py-1 text-[10px] uppercase tracking-wider text-gray-500">
        <span>Symbol</span>
        <span className="text-right">Price</span>
        <span className="text-right">Change</span>
        <span>Trend</span>
        <span />
      </div>

      <div className="flex-1 overflow-y-auto" data-testid="watchlist-rows">
        {entries.length === 0 && !loadError ? (
          <div className="px-4 py-6 text-center text-xs text-gray-500">
            Loading watchlist…
          </div>
        ) : null}
        {entries.map((entry) => (
          <WatchlistRow
            key={entry.ticker}
            entry={entry}
            tick={latest.get(entry.ticker)}
            history={history.get(entry.ticker)}
            selected={selectedTicker === entry.ticker}
            onSelect={onSelect}
            onRemove={() => void handleRemove(entry.ticker)}
          />
        ))}
      </div>
    </section>
  );
}

type RowProps = {
  entry: WatchlistEntry;
  tick: PriceTick | undefined;
  history: ReadonlyArray<PriceTick> | undefined;
  selected: boolean;
  onSelect: (ticker: string) => void;
  onRemove: () => void;
};

function WatchlistRow({
  entry,
  tick,
  history,
  selected,
  onSelect,
  onRemove,
}: RowProps) {
  // Capture previous price for flash detection. We need access to the price
  // *just before* this render to compute "is this tick an uptick?" — the
  // server already reports `previous_price`, so use it.
  const priceRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = priceRef.current;
    if (!el || !tick) return;
    const direction = flashClassFromPrices(tick.previous_price, tick.price);
    if (direction === "up" || direction === "down") {
      applyFlash(el, direction);
    }
  }, [tick?.price, tick?.previous_price, tick]);

  const livePrice = tick?.price ?? entry.price;
  const liveDirection = tick?.direction ?? null;
  const historyPrices = (history ?? []).map((t) => t.price);
  if (historyPrices.length === 0 && livePrice != null) {
    historyPrices.push(livePrice);
  }
  const change = entry.change_pct;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(entry.ticker)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(entry.ticker);
        }
      }}
      data-testid={`watchlist-row-${entry.ticker}`}
      className={clsx(
        "grid cursor-pointer grid-cols-[1.2fr_1fr_0.7fr_1.5fr_auto] gap-2 border-b border-border-muted px-4 py-1.5 text-xs transition-colors hover:bg-bg-elevated",
        selected && "bg-bg-elevated",
      )}
    >
      <span className="font-semibold text-gray-100">{entry.ticker}</span>
      <span
        ref={priceRef}
        className="text-right tabular-nums text-gray-100"
        data-testid={`watchlist-price-${entry.ticker}`}
      >
        {formatPrice(livePrice)}
      </span>
      <span
        className={clsx(
          "text-right tabular-nums",
          pctColorClass(change),
        )}
        data-testid={`watchlist-change-${entry.ticker}`}
      >
        {formatPct(change)}
      </span>
      <span className="flex items-center">
        <Sparkline prices={historyPrices} direction={liveDirection} />
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${entry.ticker} from watchlist`}
        data-testid={`watchlist-remove-${entry.ticker}`}
        className="rounded px-2 py-0.5 text-[10px] text-gray-500 hover:bg-rose-900/30 hover:text-rose-300"
      >
        ×
      </button>
    </div>
  );
}
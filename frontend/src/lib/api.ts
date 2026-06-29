// Thin REST client. SPEC §8: all calls go to same origin /api/* — no CORS.

import type {
  Portfolio,
  TradeRequest,
  TradeResult,
  WatchlistEntry,
} from "@/types/api";

const API_BASE = "/api";

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error ?? body?.detail ?? "";
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(`HTTP ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  return (await res.json()) as T;
}

export async function getWatchlist(): Promise<WatchlistEntry[]> {
  const res = await fetch(`${API_BASE}/watchlist`, { cache: "no-store" });
  return jsonOrThrow<WatchlistEntry[]>(res);
}

export async function addToWatchlist(ticker: string): Promise<WatchlistEntry> {
  const res = await fetch(`${API_BASE}/watchlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker: ticker.toUpperCase() }),
  });
  return jsonOrThrow<WatchlistEntry>(res);
}

export async function removeFromWatchlist(ticker: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/watchlist/${encodeURIComponent(ticker.toUpperCase())}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
}

export async function getPortfolio(): Promise<Portfolio> {
  const res = await fetch(`${API_BASE}/portfolio`, { cache: "no-store" });
  return jsonOrThrow<Portfolio>(res);
}

export async function executeTrade(req: TradeRequest): Promise<TradeResult> {
  const res = await fetch(`${API_BASE}/portfolio/trade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return jsonOrThrow<TradeResult>(res);
}
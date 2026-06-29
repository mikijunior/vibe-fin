// Shape types derived from SPEC §6 (SSE), §7 (DB), §8 (API endpoints).
// The frontend is statically typed against these — the backend is the
// source of truth at runtime.

export type PriceTick = {
  ticker: string;
  price: number;
  previous_price: number | null;
  timestamp: string; // ISO
  direction: "up" | "down" | "flat";
};

export type WatchlistEntry = {
  ticker: string;
  price: number | null;
  change_pct: number | null; // % vs session open (null if unknown)
  added_at: string;
};

export type Position = {
  ticker: string;
  quantity: number;
  avg_cost: number;
  current_price: number | null;
  market_value: number | null;
  unrealized_pnl: number | null;
  unrealized_pnl_pct: number | null;
};

export type Portfolio = {
  cash_balance: number;
  total_value: number;
  positions: Position[];
  unrealized_pnl: number;
};

export type ConnectionState = "connecting" | "open" | "reconnecting" | "closed";

export type TradeSide = "buy" | "sell";

export type TradeRequest = {
  ticker: string;
  quantity: number;
  side: TradeSide;
};

export type TradeResult = {
  ok: boolean;
  trade_id?: string;
  ticker?: string;
  side?: TradeSide;
  quantity?: number;
  price?: number;
  error?: string;
};
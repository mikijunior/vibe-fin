/**
 * Type definitions for the FinAlly backend API.
 * Mirrors the schema in SPEC.md §7 and §8.
 */

export interface UserProfile {
  id: string;
  cash_balance: number;
  created_at: string;
}

export interface WatchlistEntry {
  id: string;
  user_id: string;
  ticker: string;
  added_at: string;
}

export interface Position {
  id: string;
  user_id: string;
  ticker: string;
  quantity: number;
  avg_cost: number;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  ticker: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  executed_at: string;
}

export interface PortfolioSnapshot {
  id: string;
  user_id: string;
  total_value: number;
  recorded_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  actions: string | null;
  created_at: string;
}

/**
 * Per-ticker price update pushed by the SSE stream (`/api/stream/prices`).
 * `direction` indicates which way the tick moved (used by the flash effect).
 */
export interface PriceTick {
  ticker: string;
  price: number;
  previous_price: number | null;
  timestamp: string;
  direction: 'up' | 'down' | 'flat';
}

export type ConnectionState = 'connecting' | 'open' | 'closed';

export interface Portfolio {
  cash_balance: number;
  total_value: number;
  unrealized_pnl: number;
  positions: Array<Position & { current_price: number; market_value: number; unrealized_pnl: number; change_pct: number }>;
}

export interface WatchlistResponse {
  tickers: WatchlistEntry[];
}

export interface TradeRequest {
  ticker: string;
  quantity: number;
  side: 'buy' | 'sell';
}

export interface AddWatchlistRequest {
  ticker: string;
}
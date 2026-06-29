'use client';

import { clsx } from 'clsx';
import type { ConnectionState, Portfolio } from '@/lib/types';
import { formatPriceCompact } from '@/lib/format';

export interface HeaderProps {
  portfolio: Portfolio | null;
  connectionState: ConnectionState;
}

/**
 * Header — top bar showing:
 *  - product name (left)
 *  - total portfolio value (live, updates from SSE-driven portfolio refresh)
 *  - cash balance
 *  - connection status dot (green/yellow/red) per SPEC §2
 */
export function Header({ portfolio, connectionState }: HeaderProps) {
  const dotColor =
    connectionState === 'open'
      ? 'bg-tick-up'
      : connectionState === 'connecting'
        ? 'bg-accent-yellow'
        : 'bg-tick-down';

  const totalValue = portfolio?.total_value ?? null;
  const unrealizedPnl = portfolio?.unrealized_pnl ?? 0;
  const cash = portfolio?.cash_balance ?? null;

  return (
    <header
      className="flex items-center justify-between border-b border-muted-strong bg-bg-panel/80 px-6 py-3 backdrop-blur"
      data-testid="header"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-lg font-semibold tracking-tight text-accent-yellow">
          FinAlly
        </span>
        <span className="text-xs text-ink-dim">AI Trading Workstation</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-ink-faint">
            Portfolio
          </span>
          <span
            className="font-mono text-sm font-semibold text-ink"
            data-testid="header-total"
          >
            {totalValue !== null ? formatPriceCompact(totalValue) : '—'}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-ink-faint">
            P&amp;L
          </span>
          <span
            className={clsx(
              'font-mono text-sm font-semibold',
              unrealizedPnl > 0
                ? 'text-tick-up'
                : unrealizedPnl < 0
                  ? 'text-tick-down'
                  : 'text-ink-dim',
            )}
            data-testid="header-pnl"
          >
            {portfolio
              ? `${unrealizedPnl >= 0 ? '+' : ''}${formatPriceCompact(unrealizedPnl)}`
              : '—'}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-ink-faint">
            Cash
          </span>
          <span
            className="font-mono text-sm text-ink-dim"
            data-testid="header-cash"
          >
            {cash !== null ? formatPriceCompact(cash) : '—'}
          </span>
        </div>

        <div
          className="flex items-center gap-2"
          data-testid="header-connection"
          aria-label={`connection-${connectionState}`}
        >
          <span
            className={clsx(
              'h-2.5 w-2.5 rounded-full',
              dotColor,
              connectionState !== 'closed' && 'animate-pulse-dot',
            )}
            data-testid="header-connection-dot"
          />
          <span className="font-mono text-[11px] uppercase text-ink-dim">
            {connectionState}
          </span>
        </div>
      </div>
    </header>
  );
}

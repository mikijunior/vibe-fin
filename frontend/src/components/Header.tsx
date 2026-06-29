"use client";

// SPEC §10: header shows total portfolio value (live), cash balance, and a
// small connection-status dot (green = connected, yellow = reconnecting,
// red = disconnected).

import clsx from "clsx";
import type { ConnectionState } from "@/types/api";
import { formatCurrency } from "@/lib/format";

type HeaderProps = {
  totalValue: number | null;
  cashBalance: number | null;
  connection: ConnectionState;
  portfolioError: string | null;
};

function dotClass(connection: ConnectionState): string {
  switch (connection) {
    case "open":
      return "bg-emerald-500";
    case "connecting":
    case "reconnecting":
      return "bg-yellow-400";
    case "closed":
    default:
      return "bg-rose-500";
  }
}

function dotLabel(connection: ConnectionState): string {
  switch (connection) {
    case "open":
      return "Live";
    case "connecting":
      return "Connecting";
    case "reconnecting":
      return "Reconnecting";
    case "closed":
      return "Disconnected";
  }
}

export function Header({
  totalValue,
  cashBalance,
  connection,
  portfolioError,
}: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between border-b border-border bg-bg-secondary px-6 py-3"
      data-testid="app-header"
    >
      <div className="flex items-baseline gap-3">
        <span className="text-lg font-bold tracking-tight text-accent">
          FinAlly
        </span>
        <span className="text-xs text-gray-500">AI Trading Workstation</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end" data-testid="header-total">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            Total Value
          </span>
          <span
            className="tabular-nums text-lg font-semibold text-gray-100"
            data-testid="header-total-value"
          >
            {totalValue == null ? "—" : formatCurrency(totalValue)}
          </span>
        </div>

        <div className="flex flex-col items-end" data-testid="header-cash">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            Cash
          </span>
          <span
            className="tabular-nums text-sm text-gray-300"
            data-testid="header-cash-value"
          >
            {cashBalance == null ? "—" : formatCurrency(cashBalance)}
          </span>
        </div>

        <div
          className="flex items-center gap-2"
          data-testid="header-connection"
          aria-label={`Connection status: ${dotLabel(connection)}`}
        >
          <span
            className={clsx(
              "inline-block h-2.5 w-2.5 rounded-full",
              dotClass(connection),
            )}
            data-testid="header-connection-dot"
          />
          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            {dotLabel(connection)}
          </span>
        </div>
      </div>

      {portfolioError ? (
        <div
          className="ml-4 text-xs text-rose-400"
          data-testid="header-portfolio-error"
          role="alert"
        >
          portfolio: {portfolioError}
        </div>
      ) : null}
    </header>
  );
}
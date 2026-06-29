# FinAlly Frontend

Next.js 14+ TypeScript app with a static export (`output: 'export'`), Tailwind,
and React Testing Library unit tests. See `../SPEC.md` for the full product
spec.

## Layout

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout, applies globals.css
│   │   ├── page.tsx          # Terminal layout (Header + Watchlist + workspace placeholder)
│   │   └── globals.css       # Tailwind layers + dark theme base
│   ├── components/
│   │   ├── Header.tsx        # Portfolio total, P&L, cash, connection dot
│   │   ├── Sparkline.tsx     # Canvas mini-chart (DPR-aware)
│   │   └── WatchlistPanel.tsx# Ticker grid + add/remove form
│   ├── hooks/
│   │   ├── useEventSource.ts # SSE client w/ per-ticker history + connection state
│   │   ├── useWatchlist.ts   # REST CRUD for /api/watchlist
│   │   └── usePortfolio.ts   # Polling fetch for /api/portfolio
│   └── lib/
│       ├── types.ts          # API/DB type definitions
│       ├── format.ts         # Currency/percent formatting helpers
│       └── priceFlash.ts     # 500ms up/down flash state machine
├── tailwind.config.js        # Dark palette per SPEC §2
├── next.config.js            # output: 'export', trailingSlash
├── jest.config.js            # ts-jest + jsdom
└── package.json
```

## Commands

```bash
npm install          # one-time setup
npm run dev          # Next.js dev server (http://localhost:3000)
npm run build        # static export → ./out
npm test             # Jest unit tests
npm run lint         # next lint
```

## Wire-up

- `useEventSource('/api/stream/prices')` — native EventSource, same-origin, no CORS.
- `useWatchlist()` — `GET/POST/DELETE /api/watchlist`.
- `usePortfolio()` — `GET /api/portfolio` (poll every 5 s).
- Price flash: `usePriceFlash()` returns a class applied for 500 ms.

## Out of scope (deferred to `fin-ftr`)

Main chart, heatmap, P&L chart, positions table, trade bar, AI chat panel.
The right pane in `src/app/page.tsx` is reserved as a placeholder so the shell
remains reviewable today.
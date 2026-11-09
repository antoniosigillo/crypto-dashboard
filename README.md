# Crypto Trading Dashboard

A responsive web app to follow real-time crypto prices, analyse the last 24 hours on a line chart and
practise with **simulated** trades. No real money, no backend database: the portfolio lives in the browser
(Redux state) and resets on page reload.

**Stack:** Next.js 15 (App Router) · React 19 (hooks) · Redux Toolkit · Recharts · Bootstrap 5 · Jest + React Testing Library · CoinGecko API

## Features

- **Coin selector** with live price and 24h change, plus a search box (debounced, 300 ms).
- **24h price chart** (line + soft area) for the selected coin (BTC, ETH, SOL, XRP, ADA, DOGE), with a "Prev close" reference line (price 24h ago) and a tag for the latest price.
- **Mock trading**: the "Trade" button opens a dialog with linked EUR / coin inputs and Buy / Sell buttons, with validation (amount > 0, enough cash, enough coins). Portfolio updates instantly.
- **Portfolio**: cash, crypto value, total value, holdings with average buy price and profit/loss (€ and %), and full transaction history. You start with 10,000 € of virtual cash.
- **Real-time updates**: prices refresh every 10 s, the chart every 60 s (paused while the tab is hidden).
- **Error handling**: API failures, rate limits (429), network errors and malformed data show a message with a Retry button; the last known data stays on screen.
- **Performance**: lazy-loaded chart (`next/dynamic`), debounced search, memoized selectors, server-side cache.

## Getting started

Requirements: Node.js 18.18+ (tested with Node 22) and npm.

```bash
npm install
npm run dev   # http://localhost:3000
```

Other commands:

```bash
npm test               # unit tests
npm run test:coverage  # tests + coverage report (open coverage/lcov-report/index.html)
npm run build    # production build
npm start        # run the production build
```

No API key or environment variable is needed.

## Design decisions

- **Next.js route handlers as a proxy.** The browser calls `/api/...` instead of CoinGecko directly. This hides the
  upstream API, avoids CORS issues and lets the server cache responses (10 s prices, 60 s charts), so many users
  do not hit the free API rate limit. If CoinGecko fails, the last cached data is served.
- **Redux Toolkit** keeps two small slices: `market` (server data) and `portfolio` (user data).
- **Profit/loss**: per position `current value - amount paid`; total `cash + holdings value - 10,000 €`.
  Selling keeps the average buy price of what is left.
- **Kept simple on purpose**: the project uses JavaScript to keep development lightweight. 
  Since it is a small prototype with no user accounts or persistent data, it does not need a database or authentication.

## Notes

- All prices are in EUR.
- Data comes from the free CoinGecko public API, which is rate limited and can return errors; the app handles this.
- The design follows the provided mobile mock-ups.

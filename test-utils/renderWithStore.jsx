import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore } from '@/lib/store';
import { marketInitialState } from '@/lib/slices/marketSlice';

export const coin = (id, symbol, name, price, change24h = 1) => ({
  id,
  symbol,
  name,
  image: null,
  current_price: price,
  change24h,
});

export function marketState({
  coins = [],
  selectedId = 'bitcoin',
  status,
  error = null,
  charts = {},
  chartStatus = 'idle',
  chartError = null,
} = {}) {
  return {
    ...marketInitialState,
    selectedId,
    charts,
    chartStatus,
    chartError,
    prices: {
      byId: Object.fromEntries(coins.map((c) => [c.id, c])),
      ids: coins.map((c) => c.id),
      status: status ?? (coins.length ? 'succeeded' : 'idle'),
      error,
      lastUpdated: coins.length ? 1 : null,
    },
  };
}

export function renderWithStore(ui, preloadedState) {
  const store = makeStore(preloadedState);
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

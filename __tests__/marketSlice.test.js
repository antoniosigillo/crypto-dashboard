import reducer, {
  fetchChart,
  fetchPrices,
  marketInitialState,
  selectCoin,
} from '@/lib/slices/marketSlice';
import { makeStore } from '@/lib/store';

const btc = { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: null, current_price: 50_000, change24h: 1 };
const withPrices = {
  ...marketInitialState,
  prices: { ...marketInitialState.prices, byId: { bitcoin: btc }, ids: ['bitcoin'], status: 'succeeded' },
};

describe('reducers', () => {
  it('selectCoin changes the selected coin and clears the chart error', () => {
    const state = reducer({ ...marketInitialState, chartError: 'old' }, selectCoin('ethereum'));
    expect(state.selectedId).toBe('ethereum');
    expect(state.chartError).toBeNull();
  });

  describe('prices', () => {
    it('shows a loading state only on the very first load', () => {
      expect(reducer(marketInitialState, fetchPrices.pending('r1')).prices.status).toBe('loading');
      expect(reducer(withPrices, fetchPrices.pending('r2')).prices.status).toBe('succeeded');
    });

    it('stores the coins when they arrive', () => {
      const state = reducer(
        { ...marketInitialState, prices: { ...marketInitialState.prices, error: 'old' } },
        fetchPrices.fulfilled({ coins: [btc], updatedAt: 123 }, 'r1')
      );
      expect(state.prices).toMatchObject({
        byId: { bitcoin: btc },
        ids: ['bitcoin'],
        status: 'succeeded',
        error: null,
        lastUpdated: 123,
      });
    });

    it('fails when there is nothing to show', () => {
      const state = reducer(marketInitialState, fetchPrices.rejected(new Error('boom'), 'r1'));
      expect(state.prices).toMatchObject({ status: 'failed', error: 'boom' });
    });

    it('keeps the last known prices when a refresh fails', () => {
      const state = reducer(withPrices, fetchPrices.rejected(new Error('boom'), 'r1'));
      expect(state.prices).toMatchObject({ status: 'succeeded', error: 'boom', ids: ['bitcoin'] });
    });
  });

  describe('chart', () => {
    it('shows a loading state only when that coin has no data yet', () => {
      expect(reducer(marketInitialState, fetchChart.pending('r1', 'bitcoin')).chartStatus).toBe('loading');

      const cached = { ...marketInitialState, charts: { bitcoin: [] }, chartStatus: 'succeeded' };
      expect(reducer(cached, fetchChart.pending('r2', 'bitcoin')).chartStatus).toBe('succeeded');
    });

    it('stores the points when they arrive', () => {
      const points = [{ t: 1, price: 1 }, { t: 2, price: 2 }];
      const state = reducer(
        { ...marketInitialState, chartError: 'old' },
        fetchChart.fulfilled({ id: 'bitcoin', points }, 'r1', 'bitcoin')
      );
      expect(state.charts.bitcoin).toEqual(points);
      expect(state).toMatchObject({ chartStatus: 'succeeded', chartError: null });
    });

    it('stores the error when the request fails', () => {
      const state = reducer(marketInitialState, fetchChart.rejected(new Error('boom'), 'r1', 'bitcoin'));
      expect(state).toMatchObject({ chartStatus: 'failed', chartError: 'boom' });
    });
  });
});

describe('thunks (with a mocked fetch)', () => {
  const respond = (body, { ok = true } = {}) => ({
    ok,
    json: async () => {
      if (body instanceof Error) throw body;
      return body;
    },
  });
  const mockFetch = (...responses) => {
    global.fetch = jest.fn();
    responses.forEach((r) => global.fetch.mockResolvedValueOnce(r));
  };
  const run = (thunk) => makeStore().dispatch(thunk);

  afterEach(() => {
    delete global.fetch;
  });

  describe('fetchPrices', () => {
    it('returns the coins on success', async () => {
      mockFetch(respond([btc]));
      const action = await run(fetchPrices());
      expect(global.fetch).toHaveBeenCalledWith('/api/prices');
      expect(action.type).toBe('market/fetchPrices/fulfilled');
      expect(action.payload.coins).toEqual([btc]);
      expect(typeof action.payload.updatedAt).toBe('number');
    });

    it('reports a network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new TypeError('offline'));
      const action = await run(fetchPrices());
      expect(action.error.message).toBe('Network error, check your connection');
    });

    it('uses the error message sent by the API', async () => {
      mockFetch(respond({ error: 'Rate limit reached, retrying shortly' }, { ok: false }));
      const action = await run(fetchPrices());
      expect(action.error.message).toBe('Rate limit reached, retrying shortly');
    });

    it.each([
      ['an error response with no message', respond({}, { ok: false })],
      ['an error response that is not JSON', respond(new SyntaxError('bad'), { ok: false })],
      ['a success response that is not JSON', respond(new SyntaxError('bad'))],
    ])('falls back to a generic message for %s', async (_label, response) => {
      mockFetch(response);
      const action = await run(fetchPrices());
      expect(action.error.message).toBe('Could not load prices');
    });

    it.each([
      ['an object', {}],
      ['an empty list', []],
    ])('rejects %s as invalid price data', async (_label, body) => {
      mockFetch(respond(body));
      const action = await run(fetchPrices());
      expect(action.error.message).toBe('Invalid price data received');
    });
  });

  describe('fetchChart', () => {
    const points = [{ t: 1, price: 1 }, { t: 2, price: 2 }];

    it('returns the coin id and its points on success', async () => {
      mockFetch(respond(points));
      const action = await run(fetchChart('bitcoin'));
      expect(global.fetch).toHaveBeenCalledWith('/api/chart?id=bitcoin');
      expect(action.type).toBe('market/fetchChart/fulfilled');
      expect(action.payload).toEqual({ id: 'bitcoin', points });
    });

    it('uses a chart specific fallback message', async () => {
      mockFetch(respond({}, { ok: false }));
      const action = await run(fetchChart('bitcoin'));
      expect(action.error.message).toBe('Could not load chart');
    });

    it.each([
      ['an object', {}],
      ['a single point', [{ t: 1, price: 1 }]],
    ])('rejects %s as invalid chart data', async (_label, body) => {
      mockFetch(respond(body));
      const action = await run(fetchChart('bitcoin'));
      expect(action.error.message).toBe('Invalid chart data received');
    });

    it('updates the store end to end', async () => {
      mockFetch(respond(points));
      const store = makeStore();
      await store.dispatch(fetchChart('bitcoin'));
      expect(store.getState().market.charts.bitcoin).toEqual(points);
    });
  });
});

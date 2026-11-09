import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { DEFAULT_COIN_ID } from '@/lib/coins';

async function getJson(url, fallbackMessage) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('Network error, check your connection');
  }
  let body = null;
  try {
    body = await res.json();
  } catch {
  }
  if (!res.ok) throw new Error(body?.error || fallbackMessage);
  if (body == null) throw new Error(fallbackMessage);
  return body;
}

export const fetchPrices = createAsyncThunk('market/fetchPrices', async () => {
  const coins = await getJson('/api/prices', 'Could not load prices');
  if (!Array.isArray(coins) || coins.length === 0) throw new Error('Invalid price data received');
  return { coins, updatedAt: Date.now() };
});

export const fetchChart = createAsyncThunk('market/fetchChart', async (id) => {
  const points = await getJson(`/api/chart?id=${encodeURIComponent(id)}`, 'Could not load chart');
  if (!Array.isArray(points) || points.length < 2) throw new Error('Invalid chart data received');
  return { id, points };
});

export const marketInitialState = {
  prices: { byId: {}, ids: [], status: 'idle', error: null, lastUpdated: null },
  selectedId: DEFAULT_COIN_ID,
  charts: {},
  chartStatus: 'idle',
  chartError: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState: marketInitialState,
  reducers: {
    selectCoin(state, action) {
      state.selectedId = action.payload;
      state.chartError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrices.pending, (state) => {
        if (state.prices.ids.length === 0) state.prices.status = 'loading';
      })
      .addCase(fetchPrices.fulfilled, (state, { payload }) => {
        state.prices.byId = Object.fromEntries(payload.coins.map((c) => [c.id, c]));
        state.prices.ids = payload.coins.map((c) => c.id);
        state.prices.status = 'succeeded';
        state.prices.error = null;
        state.prices.lastUpdated = payload.updatedAt;
      })
      .addCase(fetchPrices.rejected, (state, action) => {
        state.prices.status = state.prices.ids.length ? 'succeeded' : 'failed';
        state.prices.error = action.error.message;
      })
      .addCase(fetchChart.pending, (state, action) => {
        if (!state.charts[action.meta.arg]) state.chartStatus = 'loading';
      })
      .addCase(fetchChart.fulfilled, (state, { payload }) => {
        state.charts[payload.id] = payload.points;
        state.chartStatus = 'succeeded';
        state.chartError = null;
      })
      .addCase(fetchChart.rejected, (state, action) => {
        state.chartStatus = 'failed';
        state.chartError = action.error.message;
      });
  },
});

export const { selectCoin } = marketSlice.actions;
export default marketSlice.reducer;

import { createSlice, nanoid } from '@reduxjs/toolkit';

export const INITIAL_CASH = 10_000;
const EPSILON = 1e-12;

export const portfolioInitialState = {
  cash: INITIAL_CASH,
  holdings: {},
  transactions: [],
};

export function validateTrade(portfolio, { id, side, amount, price }) {
  if (!Number.isFinite(amount) || amount <= 0) return 'Enter an amount greater than 0';
  if (!Number.isFinite(price) || price <= 0) return 'Price not available right now';
  if (side === 'buy' && amount * price > portfolio.cash + 1e-9) return 'Not enough cash';
  if (side === 'sell') {
    const held = portfolio.holdings[id]?.amount ?? 0;
    if (amount > held + EPSILON) return 'You do not hold enough of this coin';
  }
  return null;
}

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: portfolioInitialState,
  reducers: {
    executeTrade: {
      prepare(trade) {
        return { payload: { ...trade, txId: nanoid(), timestamp: Date.now() } };
      },
      reducer(state, { payload }) {
        if (validateTrade(state, payload)) return;

        const { id, symbol, side, amount, price } = payload;
        const total = amount * price;
        const position = state.holdings[id] ?? { symbol, amount: 0, cost: 0 };

        if (side === 'buy') {
          state.cash -= total;
          position.amount += amount;
          position.cost += total;
        } else {
          const avgPrice = position.cost / position.amount;
          state.cash += total;
          position.cost -= avgPrice * amount;
          position.amount -= amount;
        }

        if (position.amount <= EPSILON) delete state.holdings[id];
        else state.holdings[id] = position;

        state.transactions.unshift({
          id: payload.txId,
          coinId: id,
          symbol,
          side,
          amount,
          price,
          total,
          timestamp: payload.timestamp,
        });
      },
    },
  },
});

export const { executeTrade } = portfolioSlice.actions;
export default portfolioSlice.reducer;

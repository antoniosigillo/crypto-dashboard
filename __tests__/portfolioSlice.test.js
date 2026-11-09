import reducer, {
  executeTrade,
  INITIAL_CASH,
  portfolioInitialState,
  validateTrade,
} from '@/lib/slices/portfolioSlice';

const trade = (overrides) => ({
  id: 'bitcoin',
  symbol: 'btc',
  side: 'buy',
  amount: 0.1,
  price: 50_000,
  ...overrides,
});

const run = (state, t) => reducer(state, executeTrade(trade(t)));

describe('portfolioSlice', () => {
  it('starts with the initial cash and no holdings', () => {
    expect(portfolioInitialState.cash).toBe(INITIAL_CASH);
    expect(portfolioInitialState.holdings).toEqual({});
  });

  it('buy: reduces cash, adds the holding and records the transaction', () => {
    const state = run(portfolioInitialState, {});
    expect(state.cash).toBe(INITIAL_CASH - 5_000);
    expect(state.holdings.bitcoin).toEqual({ symbol: 'btc', amount: 0.1, cost: 5_000 });
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0]).toMatchObject({ side: 'buy', total: 5_000, coinId: 'bitcoin' });
  });

  it('buy twice: keeps the total cost so the average price is correct', () => {
    let state = run(portfolioInitialState, { amount: 0.1, price: 50_000 });
    state = run(state, { amount: 0.1, price: 40_000 });
    const h = state.holdings.bitcoin;
    expect(h.amount).toBeCloseTo(0.2);
    expect(h.cost / h.amount).toBeCloseTo(45_000);
  });

  it('sell part of a position: adds cash and keeps the average buy price', () => {
    let state = run(portfolioInitialState, { amount: 0.1, price: 50_000 });
    state = run(state, { side: 'sell', amount: 0.05, price: 60_000 });
    expect(state.cash).toBe(INITIAL_CASH - 5_000 + 3_000);
    expect(state.holdings.bitcoin.amount).toBeCloseTo(0.05);
    expect(state.holdings.bitcoin.cost).toBeCloseTo(2_500);
    expect(state.transactions[0].side).toBe('sell');
  });

  it('sell everything: removes the holding', () => {
    let state = run(portfolioInitialState, { amount: 0.1 });
    state = run(state, { side: 'sell', amount: 0.1 });
    expect(state.holdings.bitcoin).toBeUndefined();
  });

  it('ignores a buy that costs more than the available cash', () => {
    const state = run(portfolioInitialState, { amount: 1, price: 50_000 });
    expect(state).toEqual(portfolioInitialState);
  });

  it('ignores a sell of more than what is held', () => {
    const state = run(portfolioInitialState, { side: 'sell', amount: 1 });
    expect(state).toEqual(portfolioInitialState);
  });

  describe('validateTrade', () => {
    it.each([
      [{ amount: 0 }, 'Enter an amount greater than 0'],
      [{ amount: NaN }, 'Enter an amount greater than 0'],
      [{ price: 0 }, 'Price not available right now'],
      [{ amount: 1 }, 'Not enough cash'],
      [{ side: 'sell' }, 'You do not hold enough of this coin'],
    ])('rejects %j', (overrides, message) => {
      expect(validateTrade(portfolioInitialState, trade(overrides))).toBe(message);
    });

    it('accepts a valid trade', () => {
      expect(validateTrade(portfolioInitialState, trade({}))).toBeNull();
    });
  });
});

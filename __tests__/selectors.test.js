import { buildSummary, selectPortfolioSummary } from '@/lib/selectors';
import { INITIAL_CASH } from '@/lib/slices/portfolioSlice';

describe('buildSummary (profit / loss)', () => {
  const portfolio = {
    cash: 5_000,
    holdings: { bitcoin: { symbol: 'btc', amount: 0.1, cost: 5_000 } },
    transactions: [],
  };

  it('shows a profit when the price went up', () => {
    const s = buildSummary(portfolio, { bitcoin: { current_price: 60_000 } });
    expect(s.positions[0]).toMatchObject({ value: 6_000, pnl: 1_000, pnlPct: 20 });
    expect(s.totalValue).toBe(11_000);
    expect(s.totalPnl).toBe(11_000 - INITIAL_CASH);
    expect(s.totalPnlPct).toBeCloseTo(10);
  });

  it('shows a loss when the price went down', () => {
    const s = buildSummary(portfolio, { bitcoin: { current_price: 40_000 } });
    expect(s.positions[0].pnl).toBe(-1_000);
    expect(s.totalPnl).toBe(-1_000);
  });

  it('treats a position as break-even when its price is missing', () => {
    const s = buildSummary(portfolio, {});
    expect(s.positions[0]).toMatchObject({ price: null, pnl: 0 });
    expect(s.totalPnl).toBe(0);
  });

  it('has no profit or loss with no trades', () => {
    const s = buildSummary({ cash: INITIAL_CASH, holdings: {}, transactions: [] }, {});
    expect(s.positions).toEqual([]);
    expect(s.totalPnl).toBe(0);
  });

  it('sorts positions by value, biggest first', () => {
    const s = buildSummary(
      {
        cash: 0,
        holdings: {
          ethereum: { symbol: 'eth', amount: 1, cost: 2_000 },
          bitcoin: { symbol: 'btc', amount: 1, cost: 5_000 },
        },
        transactions: [],
      },
      { ethereum: { current_price: 3_000 }, bitcoin: { current_price: 50_000 } }
    );
    expect(s.positions.map((p) => p.id)).toEqual(['bitcoin', 'ethereum']);
  });

  it('reports 0% for a position that cost nothing (no division by zero)', () => {
    const s = buildSummary(
      { cash: 0, holdings: { bitcoin: { symbol: 'btc', amount: 1, cost: 0 } }, transactions: [] },
      { bitcoin: { current_price: 100 } }
    );
    expect(s.positions[0]).toMatchObject({ pnl: 100, pnlPct: 0 });
  });
});

describe('selectPortfolioSummary', () => {
  it('combines the portfolio and the latest prices from the store state', () => {
    const state = {
      portfolio: {
        cash: 5_000,
        holdings: { bitcoin: { symbol: 'btc', amount: 0.1, cost: 5_000 } },
        transactions: [],
      },
      market: { prices: { byId: { bitcoin: { current_price: 60_000 } } } },
    };
    expect(selectPortfolioSummary(state).totalValue).toBe(11_000);
  });
});

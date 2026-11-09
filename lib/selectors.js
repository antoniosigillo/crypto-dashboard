import { createSelector } from '@reduxjs/toolkit';
import { INITIAL_CASH } from '@/lib/slices/portfolioSlice';

export function buildSummary(portfolio, pricesById) {
  const positions = Object.entries(portfolio.holdings)
    .map(([id, h]) => {
      const price = pricesById[id]?.current_price;
      const hasPrice = Number.isFinite(price);
      const value = hasPrice ? h.amount * price : h.cost;
      const pnl = value - h.cost;
      return {
        id,
        symbol: h.symbol,
        amount: h.amount,
        avgPrice: h.cost / h.amount,
        price: hasPrice ? price : null,
        cost: h.cost,
        value,
        pnl,
        pnlPct: h.cost > 0 ? (pnl / h.cost) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  const holdingsValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalValue = portfolio.cash + holdingsValue;
  const totalPnl = totalValue - INITIAL_CASH;

  return {
    positions,
    cash: portfolio.cash,
    holdingsValue,
    totalValue,
    totalPnl,
    totalPnlPct: (totalPnl / INITIAL_CASH) * 100,
  };
}

export const selectPortfolioSummary = createSelector(
  [(state) => state.portfolio, (state) => state.market.prices.byId],
  buildSummary
);

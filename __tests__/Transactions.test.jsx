import { screen } from '@testing-library/react';
import Transactions from '@/components/Transactions';
import { portfolioInitialState } from '@/lib/slices/portfolioSlice';
import { renderWithStore } from '@/test-utils/renderWithStore';

const tx = (id, side, amount, total) => ({
  id,
  coinId: 'bitcoin',
  symbol: 'btc',
  side,
  amount,
  price: total / amount,
  total,
  timestamp: Date.UTC(2026, 10, 7, 10, 0, 0),
});

describe('Transactions', () => {
  it('tells the user when there is nothing yet', () => {
    renderWithStore(<Transactions />);
    expect(screen.getByText('No transactions yet.')).toBeInTheDocument();
  });

  it('lists buys and sells with the signs used in the design', () => {
    renderWithStore(<Transactions />, {
      portfolio: {
        ...portfolioInitialState,
        transactions: [tx('2', 'sell', 0.05, 3_000), tx('1', 'buy', 0.1, 5_000)],
      },
    });

    expect(screen.getByText('Buy')).toBeInTheDocument();
    expect(screen.getByText('Sell')).toBeInTheDocument();
    expect(screen.getByText('+0.1 BTC / -5,000.00 €')).toBeInTheDocument();
    expect(screen.getByText('-0.05 BTC / +3,000.00 €')).toBeInTheDocument();
    expect(screen.getAllByText(/^\d{2}:\d{2}:\d{2}$/)).toHaveLength(2);
  });
});

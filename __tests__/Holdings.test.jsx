import { screen } from '@testing-library/react';
import Holdings from '@/components/Holdings';
import { portfolioInitialState } from '@/lib/slices/portfolioSlice';
import { coin, marketState, renderWithStore } from '@/test-utils/renderWithStore';

describe('Holdings', () => {
  it('invites the user to trade when nothing is owned', () => {
    renderWithStore(<Holdings />);
    expect(screen.getByText(/do not own any crypto yet/i)).toBeInTheDocument();
  });

  it('shows each position with its value and profit / loss', () => {
    renderWithStore(<Holdings />, {
      market: marketState({ coins: [coin('bitcoin', 'btc', 'Bitcoin', 60_000)] }),
      portfolio: {
        ...portfolioInitialState,
        cash: 5_000,
        holdings: { bitcoin: { symbol: 'btc', amount: 0.1, cost: 5_000 } },
      },
    });

    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('0.1')).toBeInTheDocument();
    expect(screen.getByText('50,000.00 €')).toBeInTheDocument();
    expect(screen.getByText('6,000.00 €')).toBeInTheDocument();
    expect(screen.getByText('+1,000.00 €')).toBeInTheDocument();
    expect(screen.getByText('(+20.00%)')).toBeInTheDocument();
  });
});

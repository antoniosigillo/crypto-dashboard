import { screen } from '@testing-library/react';
import PortfolioSummary from '@/components/PortfolioSummary';
import { portfolioInitialState } from '@/lib/slices/portfolioSlice';
import { coin, marketState, renderWithStore } from '@/test-utils/renderWithStore';

describe('PortfolioSummary', () => {
  it('starts with the initial cash and no profit or loss', () => {
    renderWithStore(<PortfolioSummary />);

    const summary = screen.getByRole('region', { name: 'Portfolio summary' });
    expect(summary).toHaveTextContent('Total value10,000.00 €');
    expect(summary).toHaveTextContent('Total profit / loss0.00 € (+0.00%)');
  });

  it('adds the value of the crypto and the profit when prices go up', () => {
    renderWithStore(<PortfolioSummary />, {
      market: marketState({ coins: [coin('bitcoin', 'btc', 'Bitcoin', 60_000)] }),
      portfolio: {
        ...portfolioInitialState,
        cash: 5_000,
        holdings: { bitcoin: { symbol: 'btc', amount: 0.1, cost: 5_000 } },
      },
    });

    expect(screen.getByText('11,000.00 €')).toBeInTheDocument();
    expect(screen.getByText('5,000.00 €')).toBeInTheDocument();
    expect(screen.getByText('6,000.00 €')).toBeInTheDocument();
    expect(screen.getByText('+1,000.00 €')).toBeInTheDocument();
    expect(screen.getByText('(+10.00%)')).toBeInTheDocument();
  });
});

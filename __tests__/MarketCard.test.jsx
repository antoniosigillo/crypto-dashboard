import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarketCard from '@/components/MarketCard';
import { fetchPrices } from '@/lib/slices/marketSlice';
import { portfolioInitialState } from '@/lib/slices/portfolioSlice';
import { coin, marketState, renderWithStore } from '@/test-utils/renderWithStore';

jest.mock('next/dynamic', () => (loader, options) => {
  loader();
  return function DynamicStub() {
    return options.loading();
  };
});

const btc = coin('bitcoin', 'btc', 'Bitcoin', 50_000);
const eth = coin('ethereum', 'eth', 'Ethereum', 3_000);

describe('MarketCard', () => {
  it('shows the symbol, the price and a neutral PnL when nothing is owned', () => {
    renderWithStore(<MarketCard />, { market: marketState({ coins: [btc] }) });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BTC');
    expect(screen.getByText('50,000.00 €')).toBeInTheDocument();
    expect(screen.getByText('0.00 €')).toBeInTheDocument();
    expect(screen.getByText('Loading chart…')).toBeInTheDocument();
  });

  it('shows the profit of the position in the selected coin', () => {
    renderWithStore(<MarketCard />, {
      market: marketState({ coins: [coin('bitcoin', 'btc', 'Bitcoin', 60_000)] }),
      portfolio: {
        ...portfolioInitialState,
        cash: 5_000,
        holdings: { bitcoin: { symbol: 'btc', amount: 0.1, cost: 5_000 } },
      },
    });

    expect(screen.getByText('+1,000.00 €')).toHaveClass('pos');
  });

  it('opens the trade dialog and closes it again', async () => {
    const user = userEvent.setup();
    renderWithStore(<MarketCard />, { market: marketState({ coins: [btc] }) });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Trade' }));
    expect(screen.getByRole('dialog', { name: 'Trade Bitcoin' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the dialog if the selected coin disappears from the prices', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<MarketCard />, { market: marketState({ coins: [btc] }) });
    await user.click(screen.getByRole('button', { name: 'Trade' }));

    act(() => {
      store.dispatch(fetchPrices.fulfilled({ coins: [eth], updatedAt: 1 }, 'req'));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trade' })).toBeDisabled();
  });

  it('shows dashes and disables Trade while there is no price', () => {
    renderWithStore(<MarketCard />);

    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Trade' })).toBeDisabled();
  });
});

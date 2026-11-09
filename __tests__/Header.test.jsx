import { act, screen } from '@testing-library/react';
import Header from '@/components/Header';
import { executeTrade } from '@/lib/slices/portfolioSlice';
import { coin, marketState, renderWithStore } from '@/test-utils/renderWithStore';

const btc = coin('bitcoin', 'btc', 'Bitcoin', 50_000, 1.2);

describe('Header', () => {
  it('shows the brand, selected coin balance and remaining cash', () => {
    const { store } = renderWithStore(<Header />, {
      market: marketState({ coins: [btc] }),
    });
    
    act(() => {
      store.dispatch(
          executeTrade({
            id: 'bitcoin',
            symbol: 'btc',
            side: 'buy',
            amount: 0.1,
            price: 50_000,
          })
      );
    });
    
    expect(
        screen.getByRole('img', { name: 'Crypto Trading Dashboard' })
    ).toBeInTheDocument();
    expect(screen.getByText('Crypto Trading Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Available').parentElement).toHaveTextContent(
        '0.10000000 BTC'
    );
    expect(screen.getByText('Available').parentElement).toHaveTextContent(
        '5,000.00 €'
    );
  });
  
  it('shows zero balance and no symbol when the selected coin is unavailable', () => {
    renderWithStore(<Header />, {
      market: marketState({ coins: [] }),
    });
    
    expect(screen.getByText('Available').parentElement).toHaveTextContent(
        '0.00000000'
    );
    expect(screen.getByText('Available').parentElement).not.toHaveTextContent(
        'BTC'
    );
    expect(screen.getByText('Available').parentElement).toHaveTextContent(
        '10,000.00 €'
    );
  });
});
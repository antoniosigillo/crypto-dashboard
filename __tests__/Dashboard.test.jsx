import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '@/components/Dashboard';
import { coin, renderWithStore } from '@/test-utils/renderWithStore';

jest.mock('next/dynamic', () => (loader, options) => {
  loader();
  
  return function DynamicStub() {
    return options.loading();
  };
});

const btc = coin('bitcoin', 'btc', 'Bitcoin', 50_000, 1.2);
const eth = coin('ethereum', 'eth', 'Ethereum', 3_000, -0.4);
const points = [
  { t: 1, price: 1 },
  { t: 2, price: 2 },
];

const response = (body, ok = true) => ({
  ok,
  json: async () => body,
});

const callsTo = (url) =>
    global.fetch.mock.calls.filter(([requestedUrl]) => requestedUrl === url).length;

const openMarkets = async (user) => {
  const markets = screen.getByRole('region', { name: 'Markets' });
  await user.click(within(markets).getByRole('button', { expanded: false }));
};

beforeEach(() => {
  global.fetch = jest.fn((url) =>
      Promise.resolve(response(url === '/api/prices' ? [btc, eth] : points))
  );
});

afterEach(() => {
  delete global.fetch;
});

describe('Dashboard', () => {
  it('loads prices and the chart on start and shows the selected coin', async () => {
    renderWithStore(<Dashboard />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/prices');
      expect(global.fetch).toHaveBeenCalledWith('/api/chart?id=bitcoin');
    });
    
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('BTC');
    expect(screen.getByText('Transaction history')).toBeInTheDocument();
    expect(screen.getByText('Holdings')).toBeInTheDocument();
  });
  
  it('loads the chart for another coin after it is selected', async () => {
    const user = userEvent.setup();
    renderWithStore(<Dashboard />);
    
    await openMarkets(user);
    await user.click(await screen.findByRole('button', { name: /ethereum/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/chart?id=ethereum');
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ETH');
  });
  
  it('shows an error banner and retries when requested', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockRejectedValue(new TypeError('offline'));
    
    renderWithStore(<Dashboard />);
    
    expect(await screen.findByRole('alert')).toHaveTextContent(
        'Network error, check your connection'
    );
    expect(callsTo('/api/prices')).toBe(1);
    
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    
    await waitFor(() => {
      expect(callsTo('/api/prices')).toBe(2);
    });
  });
});
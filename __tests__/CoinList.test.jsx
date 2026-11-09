import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoinList from '@/components/CoinList';
import { coin, marketState, renderWithStore } from '@/test-utils/renderWithStore';

const btc = coin('bitcoin', 'btc', 'Bitcoin', 50_000, 2.5);
const eth = coin('ethereum', 'eth', 'Ethereum', 3_000, -1.5);

const setup = (state = marketState({ coins: [btc, eth] })) => {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });
  
  return {
    user,
    ...renderWithStore(<CoinList />, { market: state }),
  };
};

const openDropdown = async (user) => {
  await user.click(screen.getByRole('button', { expanded: false }));
};

const dropdownItems = () => {
  const searchInput = screen.getByLabelText('Search coin');
  return within(searchInput.parentElement);
};

const search = async (user, value) => {
  await user.type(screen.getByLabelText('Search coin'), value);
  act(() => jest.advanceTimersByTime(300));
};

describe('CoinList', () => {
  beforeEach(() => jest.useFakeTimers());
  
  afterEach(() => jest.useRealTimers());
  
  it('shows the selected coin and opens and closes the dropdown', async () => {
    const { user } = setup();
    
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent(
        'Bitcoin'
    );
    
    await openDropdown(user);
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { expanded: true }));
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });
  
  it('shows a fallback when no coin is selected', async () => {
    const { user } = setup(marketState({ coins: [], status: 'idle' }));
    
    expect(screen.getByRole('button', { name: 'Select coin' })).toBeInTheDocument();
    
    await openDropdown(user);
    expect(screen.getByLabelText('Search coin')).toBeInTheDocument();
  });
  
  it('shows coin prices, 24-hour changes and the selected state', async () => {
    const { user } = setup();
    await openDropdown(user);
    
    const items = dropdownItems();
    const bitcoin = items.getByRole('button', { name: /bitcoin/i });
    const ethereum = items.getByRole('button', { name: /ethereum/i });
    
    expect(bitcoin).toHaveTextContent('50,000.00 €');
    expect(bitcoin).toHaveTextContent('+2.50%');
    expect(bitcoin).toHaveAttribute('aria-current', 'true');
    
    expect(ethereum).toHaveTextContent('3,000.00 €');
    expect(ethereum).toHaveTextContent('-1.50%');
    expect(ethereum).not.toHaveAttribute('aria-current');
  });
  
  it('filters coins by name after the debounce delay', async () => {
    const { user } = setup();
    await openDropdown(user);
    
    await user.type(screen.getByLabelText('Search coin'), 'eth');
    expect(dropdownItems().getByText('Bitcoin')).toBeInTheDocument();
    
    act(() => jest.advanceTimersByTime(300));
    
    expect(dropdownItems().queryByText('Bitcoin')).not.toBeInTheDocument();
    expect(dropdownItems().getByText('Ethereum')).toBeInTheDocument();
  });
  
  it('filters coins by symbol', async () => {
    const { user } = setup();
    await openDropdown(user);
    await search(user, 'btc');
    
    expect(dropdownItems().getByText('Bitcoin')).toBeInTheDocument();
    expect(dropdownItems().queryByText('Ethereum')).not.toBeInTheDocument();
  });
  
  it('shows a message when no coin matches the search', async () => {
    const { user } = setup();
    await openDropdown(user);
    await search(user, 'zzz');
    
    expect(screen.getByText('No coin found.')).toBeInTheDocument();
  });
  
  it('shows the loading message', async () => {
    const { user } = setup(marketState({ status: 'loading' }));
    await openDropdown(user);
    
    expect(screen.getByText('Loading prices…')).toBeInTheDocument();
  });
  
  it('shows an unavailable message when the initial price load fails', async () => {
    const { user } = setup(marketState({ status: 'failed' }));
    await openDropdown(user);
    
    expect(
        screen.getByText('Prices are not available at the moment.')
    ).toBeInTheDocument();
  });
  
  it('keeps existing coins visible if a refresh fails', async () => {
    const { user } = setup(
        marketState({ coins: [btc], status: 'failed' })
    );
    await openDropdown(user);
    
    expect(
        screen.queryByText('Prices are not available at the moment.')
    ).not.toBeInTheDocument();
    expect(dropdownItems().getByText('Bitcoin')).toBeInTheDocument();
  });
  
  it('closes on an outside click and stays open on an inside click', async () => {
    const { user } = setup();
    await openDropdown(user);
    
    fireEvent.mouseDown(screen.getByLabelText('Search coin'));
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
    
    fireEvent.mouseDown(document.body);
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });
  
  it('closes when Escape is pressed', async () => {
    const { user } = setup();
    await openDropdown(user);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });
  
  it('selects a coin, closes the dropdown and clears the search', async () => {
    const { user, store } = setup();
    await openDropdown(user);
    await search(user, 'eth');
    
    await user.click(dropdownItems().getByRole('button', { name: /ethereum/i }));
    
    expect(store.getState().market.selectedId).toBe('ethereum');
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent(
        'Ethereum'
    );
    
    await openDropdown(user);
    expect(screen.getByLabelText('Search coin')).toHaveValue('');
    
    act(() => jest.advanceTimersByTime(300));
    
    expect(dropdownItems().getByText('Bitcoin')).toBeInTheDocument();
  });
});
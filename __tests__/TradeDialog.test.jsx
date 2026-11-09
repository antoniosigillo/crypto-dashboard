import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { makeStore } from '@/lib/store';
import { INITIAL_CASH, portfolioInitialState } from '@/lib/slices/portfolioSlice';
import TradeDialog from '@/components/TradeDialog';

const btc = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: null,
  current_price: 50_000,
  change24h: 1.2,
};

function setup(portfolio) {
  const store = makeStore(portfolio ? { portfolio } : undefined);
  const onClose = jest.fn();
  render(
    <Provider store={store}>
      <TradeDialog coin={btc} onClose={onClose} />
    </Provider>
  );
  return { store, onClose, user: userEvent.setup() };
}

const eurInput = () => screen.getByLabelText('Amount in EUR');
const btcInput = () => screen.getByLabelText('Amount in BTC');

describe('TradeDialog', () => {
  describe('linked inputs', () => {
    it('converts EUR to coin and back using the current price', async () => {
      const { user } = setup();

      await user.type(eurInput(), '5000');
      expect(btcInput()).toHaveValue('0.1');

      await user.clear(btcInput());
      expect(eurInput()).toHaveValue('');

      await user.type(btcInput(), '0.02');
      expect(eurInput()).toHaveValue('1000.00');
    });

    it('accepts a comma as the decimal separator', async () => {
      const { user } = setup();
      await user.type(eurInput(), '1,5');

      expect(eurInput()).toHaveValue('1.5');
      expect(btcInput()).toHaveValue('0.00003');
    });

    it('clears the other field when the amount is not a positive number', async () => {
      const { user } = setup();

      await user.type(btcInput(), '0.1');
      await user.clear(eurInput());
      expect(btcInput()).toHaveValue('');

      await user.type(eurInput(), '.');
      expect(eurInput()).toHaveValue('.');
      expect(btcInput()).toHaveValue('');
    });

    it('ignores anything that is not a number, in both fields', async () => {
      const { user } = setup();

      await user.type(eurInput(), 'abc');
      await user.type(btcInput(), 'abc');

      expect(eurInput()).toHaveValue('');
      expect(btcInput()).toHaveValue('');
    });
  });

  describe('trading', () => {
    it('buys, updates the portfolio immediately and closes', async () => {
      const { store, onClose, user } = setup();

      await user.type(eurInput(), '5000');
      await user.click(screen.getByRole('button', { name: 'Buy' }));

      const { portfolio } = store.getState();
      expect(portfolio.cash).toBeCloseTo(INITIAL_CASH - 5_000);
      expect(portfolio.holdings.bitcoin.amount).toBeCloseTo(0.1);
      expect(portfolio.transactions).toHaveLength(1);
      expect(onClose).toHaveBeenCalled();
    });

    it('sells what is owned', async () => {
      const { store, onClose, user } = setup({
        ...portfolioInitialState,
        cash: 5_000,
        holdings: { bitcoin: { symbol: 'btc', amount: 0.1, cost: 5_000 } },
      });

      await user.type(btcInput(), '0.05');
      expect(eurInput()).toHaveValue('2500.00');
      await user.click(screen.getByRole('button', { name: 'Sell' }));

      const { portfolio } = store.getState();
      expect(portfolio.cash).toBeCloseTo(7_500);
      expect(portfolio.holdings.bitcoin.amount).toBeCloseTo(0.05);
      expect(onClose).toHaveBeenCalled();
    });

    it('shows an error and does not trade when there is not enough cash', async () => {
      const { store, onClose, user } = setup();

      await user.type(eurInput(), '20000');
      await user.click(screen.getByRole('button', { name: 'Buy' }));

      expect(screen.getByRole('alert')).toHaveTextContent('Not enough cash');
      expect(store.getState().portfolio.transactions).toHaveLength(0);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not allow selling a coin that is not held', async () => {
      const { store, user } = setup();

      await user.type(btcInput(), '0.1');
      await user.click(screen.getByRole('button', { name: 'Sell' }));

      expect(screen.getByRole('alert')).toHaveTextContent('You do not hold enough');
      expect(store.getState().portfolio.transactions).toHaveLength(0);
    });

    it('asks for an amount when both inputs are empty, then clears the error on typing', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: 'Buy' }));
      expect(screen.getByRole('alert')).toHaveTextContent('Enter an amount greater than 0');

      await user.type(eurInput(), '1');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('closing', () => {
    it('closes with the X button', async () => {
      const { onClose, user } = setup();
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes with the Escape key but not with other keys', async () => {
      const { onClose, user } = setup();

      await user.keyboard('a');
      expect(onClose).not.toHaveBeenCalled();

      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes when clicking outside the dialog, not inside it', async () => {
      const { onClose, user } = setup();
      const dialog = screen.getByRole('dialog');

      await user.click(dialog);
      expect(onClose).not.toHaveBeenCalled();

      await user.click(dialog.parentElement);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});

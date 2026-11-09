import { screen } from '@testing-library/react';
import PriceChart from '@/components/PriceChart';
import { marketState, renderWithStore } from '@/test-utils/renderWithStore';

const points = [
  { t: 1_000, price: 100.4 },
  { t: 2_000, price: 200.6 },
];

describe('PriceChart', () => {
  it('shows a loading message until the data arrives', () => {
    renderWithStore(<PriceChart />, { market: marketState() });
    expect(screen.getByText('Loading chart…')).toBeInTheDocument();
  });

  it('shows the error when there is no data to draw', () => {
    renderWithStore(<PriceChart />, { market: marketState({ chartError: 'Could not load chart' }) });
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load chart');
  });

  it('draws the chart with the "Prev close" and latest price tags', () => {
    renderWithStore(<PriceChart />, { market: marketState({ charts: { bitcoin: points } }) });

    expect(screen.getByRole('img', { name: /last 24 hours/i })).toBeInTheDocument();
    expect(screen.getByText('Prev close')).toBeInTheDocument();
    expect(screen.getByText('201')).toBeInTheDocument();
    expect(screen.queryByText(/could not refresh/i)).not.toBeInTheDocument();
  });

  it('formats the axis ticks: whole numbers for big prices, 4 significant digits for small ones', () => {
    renderWithStore(<PriceChart />, { market: marketState({ charts: { bitcoin: points } }) });

    expect(screen.getByText('1235')).toBeInTheDocument();
    expect(screen.getByText('0.1235')).toBeInTheDocument();
  });

  it('formats the tooltip in euros', () => {
    renderWithStore(<PriceChart />, { market: marketState({ charts: { bitcoin: points } }) });

    expect(screen.getByTestId('tooltip-value')).toHaveTextContent('1,234.50 €|Price');
    expect(screen.getByTestId('tooltip-label')).toHaveTextContent(/^\d{2}\/\d{2}\/\d{4}, /);
  });

  it('keeps the old data and warns when a refresh fails', () => {
    renderWithStore(<PriceChart />, {
      market: marketState({ charts: { bitcoin: points }, chartError: 'Rate limit reached' }),
    });

    expect(screen.getByRole('img', { name: /last 24 hours/i })).toBeInTheDocument();
    expect(screen.getByText(/could not refresh the chart/i)).toBeInTheDocument();
  });
});

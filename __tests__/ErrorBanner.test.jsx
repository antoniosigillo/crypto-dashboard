import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBanner from '@/components/ErrorBanner';

describe('ErrorBanner', () => {
  it('shows just the message when there is no older data', () => {
    render(<ErrorBanner message="Boom" stale={false} onRetry={() => {}} />);
    expect(screen.getByText('Boom')).toBeInTheDocument();
    expect(screen.queryByText(/last known prices/i)).not.toBeInTheDocument();
  });

  it('says that the last known prices are still shown when data is stale', () => {
    render(<ErrorBanner message="Boom" stale onRetry={() => {}} />);
    expect(screen.getByText('Boom. Showing the last known prices.')).toBeInTheDocument();
  });

  it('calls onRetry when Retry is clicked', async () => {
    const onRetry = jest.fn();
    render(<ErrorBanner message="Boom" stale={false} onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

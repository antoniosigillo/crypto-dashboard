import { render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import Providers from '@/components/Providers';

function Probe() {
  const cash = useSelector((s) => s.portfolio.cash);
  return <p>cash: {cash}</p>;
}

describe('Providers', () => {
  it('gives its children access to the Redux store', () => {
    render(
      <Providers>
        <Probe />
      </Providers>
    );
    expect(screen.getByText('cash: 10000')).toBeInTheDocument();
  });
});

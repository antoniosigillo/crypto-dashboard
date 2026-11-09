'use client';

import { useDispatch, useSelector } from 'react-redux';
import { fetchChart, fetchPrices } from '@/lib/slices/marketSlice';
import { CHART_REFRESH_MS, PRICE_REFRESH_MS } from '@/lib/coins';
import { usePolling } from '@/hooks/usePolling';
import Header from './Header';
import CoinList from './CoinList';
import MarketCard from './MarketCard';
import Transactions from './Transactions';
import PortfolioSummary from './PortfolioSummary';
import Holdings from './Holdings';
import ErrorBanner from './ErrorBanner';

export default function Dashboard() {
  const dispatch = useDispatch();
  const selectedId = useSelector((s) => s.market.selectedId);
  const { error, ids } = useSelector((s) => s.market.prices);

  usePolling(() => dispatch(fetchPrices()), PRICE_REFRESH_MS);
  usePolling(() => dispatch(fetchChart(selectedId)), CHART_REFRESH_MS, selectedId);

  return (
    <main className="container py-3 py-lg-4 d-flex flex-column gap-4">
      <Header />

      {error && (
        <ErrorBanner message={error} stale={ids.length > 0} onRetry={() => dispatch(fetchPrices())} />
      )}

      <CoinList />

      <div className="row g-4">
        <div className="col-xl-7">
          <MarketCard />
        </div>
        <div className="col-xl-5">
          <Transactions />
        </div>
      </div>

      <PortfolioSummary />
      <Holdings />
    </main>
  );
}

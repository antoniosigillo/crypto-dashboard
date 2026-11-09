'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { selectPortfolioSummary } from '@/lib/selectors';
import { formatEur, formatEurSigned, pnlClass } from '@/lib/format';
import TradeDialog from './TradeDialog';

const PriceChart = dynamic(() => import('./PriceChart'), {
  ssr: false,
  loading: () => <p className="text-body-secondary text-center py-5 mb-0">Loading chart…</p>,
});

export default function MarketCard() {
  const coin = useSelector((s) => s.market.prices.byId[s.market.selectedId]);
  const position = useSelector((s) =>
    selectPortfolioSummary(s).positions.find((p) => p.id === s.market.selectedId)
  );
  const [open, setOpen] = useState(false);

  const pnl = position ? position.pnl : 0;

  return (
    <section className="d-flex flex-column gap-3">
      <div className="text-center">
        <h1 className="h3 fw-semibold mb-0">{coin ? coin.symbol.toUpperCase() : '—'}</h1>
        <p className="display-6 fw-semibold mb-0">{coin ? formatEur(coin.current_price) : '—'}</p>
        <p className="small mt-1 mb-0">
          PnL: <span className={`fw-semibold ${pnlClass(pnl)}`}>{formatEurSigned(pnl)}</span>
        </p>
      </div>

      <PriceChart />

      <button type="button" className="btn btn-primary btn-lg w-100" disabled={!coin} onClick={() => setOpen(true)}>
        Trade
      </button>

      {open && coin && <TradeDialog coin={coin} onClose={() => setOpen(false)} />}
    </section>
  );
}

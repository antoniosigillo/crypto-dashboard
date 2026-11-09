'use client';

import { useSelector } from 'react-redux';
import { selectPortfolioSummary } from '@/lib/selectors';
import { formatEur, formatEurSigned, formatPct, pnlClass } from '@/lib/format';

function Stat({ label, valueClass = '', children }) {
  return (
    <div className="col-6 col-md-3">
      <div className="bg-light rounded-4 p-3 h-100 d-flex flex-column">
        <span className="text-body-secondary small">{label}</span>
        <strong className={`fs-5 ${valueClass}`}>{children}</strong>
      </div>
    </div>
  );
}

export default function PortfolioSummary() {
  const s = useSelector(selectPortfolioSummary);

  return (
    <section className="row g-3" aria-label="Portfolio summary">
      <Stat label="Total value">{formatEur(s.totalValue)}</Stat>
      <Stat label="Cash">{formatEur(s.cash)}</Stat>
      <Stat label="Crypto value">{formatEur(s.holdingsValue)}</Stat>
      <Stat label="Total profit / loss" valueClass={pnlClass(s.totalPnl)}>
        {formatEurSigned(s.totalPnl)} <span className="small">({formatPct(s.totalPnlPct)})</span>
      </Stat>
    </section>
  );
}

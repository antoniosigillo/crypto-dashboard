'use client';

import { useSelector } from 'react-redux';
import { selectPortfolioSummary } from '@/lib/selectors';
import { formatAmount, formatEur, formatEurSigned, formatPct, pnlClass } from '@/lib/format';

export default function Holdings() {
  const { positions } = useSelector(selectPortfolioSummary);

  return (
    <section className="bg-light rounded-4 p-3">
      <h2 className="h6 fw-bold mb-3">Holdings</h2>
      {positions.length === 0 ? (
        <p className="text-body-secondary mb-0">You do not own any crypto yet. Make your first trade!</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle text-nowrap mb-0">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Amount</th>
                <th>Avg. buy</th>
                <th>Value</th>
                <th>P/L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.symbol.toUpperCase()}</strong>
                  </td>
                  <td>{formatAmount(p.amount)}</td>
                  <td>{formatEur(p.avgPrice)}</td>
                  <td>{formatEur(p.value)}</td>
                  <td className={pnlClass(p.pnl)}>
                    {formatEurSigned(p.pnl)} <span className="small">({formatPct(p.pnlPct)})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

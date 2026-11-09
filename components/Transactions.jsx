'use client';

import { useSelector } from 'react-redux';
import { formatAmount, formatEur, formatTimeSec } from '@/lib/format';

export default function Transactions() {
  const transactions = useSelector((s) => s.portfolio.transactions);

  return (
    <section className="bg-light rounded-4 p-3">
      <h2 className="h4 fw-bold mb-3 text-center">Transaction history</h2>
      {transactions.length === 0 ? (
        <p className="text-body-secondary mb-0">No transactions yet.</p>
      ) : (
        <ul className="list-unstyled small mb-0 overflow-y-auto overflow-x-hidden" style={{ maxHeight: 420 }}>
          {transactions.map((t) => {
            const buy = t.side === 'buy';
            return (
              <li key={t.id} className="row gx-2 py-1">
                <span className="col-1">{buy ? 'Buy' : 'Sell'}</span>
                <strong className="col text-end fw-semibold">
                  {buy ? '+' : '-'}
                  {formatAmount(t.amount)} {t.symbol.toUpperCase()} / {buy ? '-' : '+'}
                  {formatEur(t.total)}
                </strong>
                <time className="col-auto" dateTime={new Date(t.timestamp).toISOString()}>
                  {formatTimeSec(t.timestamp)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

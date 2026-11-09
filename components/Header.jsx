'use client';

import { useSelector } from 'react-redux';
import { formatEur } from '@/lib/format';
import Image from "next/image";

export default function Header() {
  const symbol = useSelector((s) => s.market.prices.byId[s.market.selectedId]?.symbol);
  const held = useSelector((s) => s.portfolio.holdings[s.market.selectedId]?.amount ?? 0);
  const cash = useSelector((s) => s.portfolio.cash);

  return (
    <header className="d-flex justify-content-between align-items-start gap-3">
      <div className="d-flex align-items-center gap-2">
          <Image
              src="/bison.svg"
              alt="Crypto Trading Dashboard"
              width={44}
              height={36}
              priority
          />
        <span className="brand-name d-none d-md-inline fw-bold">Crypto Trading Dashboard</span>
      </div>
      <dl className="text-end small mb-0">
        <dt className="fw-normal">Available</dt>
        <dd className="mb-0">
          {held.toFixed(8)} <strong>{symbol ? symbol.toUpperCase() : ''}</strong>
        </dd>
        <dd className="mb-0">{formatEur(cash)}</dd>
      </dl>
    </header>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { executeTrade, validateTrade } from '@/lib/slices/portfolioSlice';

const parseNumeric = (raw) => {
  const v = raw.replace(',', '.');
  return /^\d*\.?\d*$/.test(v) ? v : null;
};
const trimAmount = (n) => n.toFixed(8).replace(/\.?0+$/, '');

export default function TradeDialog({ coin, onClose }) {
  const dispatch = useDispatch();
  const portfolio = useSelector((s) => s.portfolio);

  const [eur, setEur] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  const symbol = coin.symbol.toUpperCase();
  const price = coin.current_price;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const changeEur = (e) => {
    const v = parseNumeric(e.target.value);
    if (v === null) return;
    setEur(v);
    setError(null);
    const n = Number(v);
    setAmount(n > 0 ? trimAmount(Math.floor((n / price) * 1e8 + 1e-7) / 1e8) : '');
  };

  const changeAmount = (e) => {
    const v = parseNumeric(e.target.value);
    if (v === null) return;
    setAmount(v);
    setError(null);
    const n = Number(v);
    setEur(n > 0 ? (n * price).toFixed(2) : '');
  };

  const submit = (side) => {
    const trade = { id: coin.id, symbol: coin.symbol, side, amount: Number(amount), price };
    const problem = validateTrade(portfolio, trade);
    if (problem) {
      setError(problem);
      return;
    }
    dispatch(executeTrade(trade));
    onClose();
  };

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          role="dialog"
          aria-modal="true"
          aria-label={`Trade ${coin.name}`}
        >
          <div className="modal-content rounded-4 border-0 shadow">
            <div className="modal-body position-relative p-4 pt-5">
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-3"
                aria-label="Close"
                onClick={onClose}
              />

              <div className="mb-3 field">
                <input
                  className="text-end"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  autoFocus
                  placeholder="0.00"
                  aria-label="Amount in EUR"
                  value={eur}
                  onChange={changeEur}
                />
                <span className="text-center unit">EUR</span>
              </div>

              <div className="mb-3 field">
                <input
                  className="text-end"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00000000"
                  aria-label={`Amount in ${symbol}`}
                  value={amount}
                  onChange={changeAmount}
                />
                <span className="text-center unit">{symbol}</span>
              </div>

              {error && (
                <p className="text-danger text-center small mb-2" role="alert">
                  {error}
                </p>
              )}

              <div className="row g-3 mt-1">
                <div className="col-6">
                  <button type="button" className="btn btn-primary w-100" onClick={() => submit('buy')}>
                    Buy
                  </button>
                </div>
                <div className="col-6">
                  <button type="button" className="btn btn-primary w-100" onClick={() => submit('sell')}>
                    Sell
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}

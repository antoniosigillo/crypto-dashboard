'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCoin } from '@/lib/slices/marketSlice';
import { useDebounce } from '@/hooks/useDebounce';
import { formatEur, formatPct, pnlClass } from '@/lib/format';

export default function CoinList() {
    const dispatch = useDispatch();
    const { ids, byId, status } = useSelector((s) => s.market.prices);
    const selectedId = useSelector((s) => s.market.selectedId);
    const selected = byId[selectedId];
    
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const rootRef = useRef(null);
    
    const coins = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        return ids
            .map((id) => byId[id])
            .filter((c) => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }, [ids, byId, debouncedQuery]);
    
    useEffect(() => {
        if (!open) return undefined;
        const onMouseDown = (e) => {
            if (!rootRef.current.contains(e.target)) setOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);
    
    const choose = (id) => {
        dispatch(selectCoin(id));
        setOpen(false);
        setQuery('');
    };
    
    return (
        <section className="dropdown col-12 col-md-6 col-lg-3" ref={rootRef} aria-label="Markets">
            <button
                type="button"
                className="btn btn-lg btn-light dropdown-toggle w-100 d-flex align-items-center gap-2 text-start"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                {selected ? (
                    <>
                        <strong>{selected.name}</strong>
                        <span className="text-body-secondary">{selected.symbol.toUpperCase()}</span>
                        <span className="ms-auto">{formatEur(selected.current_price)}</span>
                    </>
                ) : (
                    <span className="me-auto">Select coin</span>
                )}
            </button>
            
            {open && (
                <div className="dropdown-menu show w-100 p-2">
                    <input
                        className="form-control mb-2"
                        type="search"
                        placeholder="Search coin…"
                        aria-label="Search coin"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    
                    {status === 'loading' && <p className="text-body-secondary small px-2 mb-0">Loading prices…</p>}
                    {status === 'failed' && ids.length === 0 && (
                        <p className="text-body-secondary small px-2 mb-0">Prices are not available at the moment.</p>
                    )}
                    {status === 'succeeded' && coins.length === 0 && (
                        <p className="text-body-secondary small px-2 mb-0">No coin found.</p>
                    )}
                    
                    <ul className="list-unstyled mb-0 overflow-auto" style={{ maxHeight: 280 }}>
                        {coins.map((c) => (
                            <li key={c.id}>
                                <button
                                    type="button"
                                    className={`dropdown-item rounded d-flex justify-content-between align-items-center gap-3 ${
                                        c.id === selectedId ? 'active' : ''
                                    }`}
                                    aria-current={c.id === selectedId ? 'true' : undefined}
                                    onClick={() => choose(c.id)}
                                >
                  <span>
                    <strong className="d-block">{c.name}</strong>
                    <small>{c.symbol.toUpperCase()}</small>
                  </span>
                                    <span className="text-end">
                    <span className="d-block">{formatEur(c.current_price)}</span>
                    <small className={pnlClass(c.change24h)}>{formatPct(c.change24h)}</small>
                  </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
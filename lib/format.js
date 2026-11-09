const eur = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const eurSmall = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
const amountFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 });

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

export const formatEur = (v) => (isNum(v) ? `${(Math.abs(v) < 1 ? eurSmall : eur).format(v)} €` : '—');
export const formatEurSigned = (v) => (isNum(v) ? `${v > 0 ? '+' : ''}${formatEur(v)}` : '—');
export const formatAmount = (v) => (isNum(v) ? amountFmt.format(v) : '—');
export const formatPct = (v) => (isNum(v) ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '—');
export const formatTimeSec = (ts) =>
  new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
export const formatDateTime = (ts) =>
  new Date(ts).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' });

export const pnlClass = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : '');

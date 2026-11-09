import {
  formatAmount,
  formatDateTime,
  formatEur,
  formatEurSigned,
  formatPct,
  formatTimeSec,
  pnlClass,
} from '@/lib/format';

const INVALID = [null, undefined, NaN, Infinity, '5'];

describe('formatEur', () => {
  it('uses 2 decimals, thousands separators and a trailing euro sign', () => {
    expect(formatEur(69820.12)).toBe('69,820.12 €');
    expect(formatEur(5)).toBe('5.00 €');
  });

  it('keeps more decimals for values below 1 (cheap coins)', () => {
    expect(formatEur(0.123456)).toBe('0.123456 €');
    expect(formatEur(0)).toBe('0.00 €');
  });

  it.each(INVALID)('returns a dash for %p', (value) => {
    expect(formatEur(value)).toBe('—');
  });
});

describe('formatEurSigned', () => {
  it('adds a plus sign to positive values only', () => {
    expect(formatEurSigned(12.3)).toBe('+12.30 €');
    expect(formatEurSigned(-5)).toBe('-5.00 €');
    expect(formatEurSigned(0)).toBe('0.00 €');
  });

  it.each(INVALID)('returns a dash for %p', (value) => {
    expect(formatEurSigned(value)).toBe('—');
  });
});

describe('formatAmount', () => {
  it('shows up to 8 decimals', () => {
    expect(formatAmount(0.12345678)).toBe('0.12345678');
    expect(formatAmount(1234.5)).toBe('1,234.5');
  });

  it.each(INVALID)('returns a dash for %p', (value) => {
    expect(formatAmount(value)).toBe('—');
  });
});

describe('formatPct', () => {
  it('shows the sign and 2 decimals', () => {
    expect(formatPct(12.3)).toBe('+12.30%');
    expect(formatPct(-4.567)).toBe('-4.57%');
    expect(formatPct(0)).toBe('+0.00%');
  });

  it.each(INVALID)('returns a dash for %p', (value) => {
    expect(formatPct(value)).toBe('—');
  });
});

describe('date helpers', () => {
  it('formatTimeSec shows hours, minutes and seconds', () => {
    expect(formatTimeSec(Date.UTC(2026, 10, 7, 10, 5, 9))).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('formatDateTime shows date and time', () => {
    expect(formatDateTime(Date.UTC(2026, 10, 7, 10, 5, 9))).toMatch(
      /^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/
    );
  });
});

describe('pnlClass', () => {
  it('maps the sign of the value to a CSS class', () => {
    expect(pnlClass(1)).toBe('pos');
    expect(pnlClass(-1)).toBe('neg');
    expect(pnlClass(0)).toBe('');
  });
});

import { isValidCoin, parseChartPoints, toCoin } from '@/lib/validate';

describe('isValidCoin', () => {
  const ok = { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 50_000 };

  it('accepts a well-formed coin', () => {
    expect(isValidCoin(ok)).toBe(true);
  });

  it.each([
    ['null', null],
    ['id missing', { ...ok, id: undefined }],
    ['symbol not a string', { ...ok, symbol: 1 }],
    ['name not a string', { ...ok, name: null }],
    ['price as a string', { ...ok, current_price: '50000' }],
    ['price null', { ...ok, current_price: null }],
    ['price zero', { ...ok, current_price: 0 }],
    ['price not finite', { ...ok, current_price: Infinity }],
  ])('rejects a coin with %s', (_label, coin) => {
    expect(isValidCoin(coin)).toBe(false);
  });
});

describe('toCoin', () => {
  const base = { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 1, market_cap: 123 };

  it('keeps only the fields the UI needs and tolerates missing optional ones', () => {
    expect(toCoin({ ...base, price_change_percentage_24h: undefined })).toEqual({
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: null,
      current_price: 1,
      change24h: null,
    });
  });

  it('keeps the image and the 24h change when they are valid', () => {
    expect(toCoin({ ...base, image: 'https://x/btc.png', price_change_percentage_24h: -2.5 })).toMatchObject({
      image: 'https://x/btc.png',
      change24h: -2.5,
    });
  });
});

describe('parseChartPoints', () => {
  it('maps valid pairs and drops invalid ones', () => {
    const points = parseChartPoints({ prices: [[1, 10], [2, null], 'x', ['a', 5], [3, 12]] });
    expect(points).toEqual([
      { t: 1, price: 10 },
      { t: 3, price: 12 },
    ]);
  });

  it('returns an empty list for a malformed response', () => {
    expect(parseChartPoints(null)).toEqual([]);
    expect(parseChartPoints({})).toEqual([]);
    expect(parseChartPoints({ prices: 'nope' })).toEqual([]);
  });
});

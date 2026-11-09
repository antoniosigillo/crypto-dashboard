/** @jest-environment node */
import { GET, dynamic } from '@/app/api/chart/route';
import { coingecko, UpstreamError } from '@/lib/coingecko';

jest.mock('@/lib/coingecko', () => {
  class UpstreamError extends Error {}
  return { coingecko: jest.fn(), UpstreamError };
});

const call = (query = '?id=bitcoin') => GET(new Request(`http://localhost/api/chart${query}`));

beforeEach(() => coingecko.mockReset());

describe('GET /api/chart', () => {
  it.each([
    ['is missing', ''],
    ['is not one of the supported coins', '?id=not-a-coin'],
  ])('answers 400 when the coin id %s', async (_label, query) => {
    const res = await call(query);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Unknown coin' });
    expect(coingecko).not.toHaveBeenCalled();
  });

  it('returns the 24h points of the coin', async () => {
    coingecko.mockResolvedValue({ prices: [[1, 10], [2, 11], [3, null]] });

    const res = await call();
    expect(coingecko).toHaveBeenCalledWith('/coins/bitcoin/market_chart?vs_currency=eur&days=1', 60_000);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { t: 1, price: 10 },
      { t: 2, price: 11 },
    ]);
  });

  it('answers 502 when there are not enough valid points', async () => {
    coingecko.mockResolvedValue({ prices: [[1, 10]] });

    const res = await call();
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'Invalid chart data received' });
  });

  it('forwards the message of an upstream error', async () => {
    coingecko.mockRejectedValue(new UpstreamError('Could not reach the market data provider'));

    const res = await call();
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'Could not reach the market data provider' });
  });

  it('hides the details of unexpected errors', async () => {
    coingecko.mockRejectedValue(new Error('secret internal detail'));

    const res = await call();
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'Unexpected server error' });
  });
  
  it('exports the dynamic rendering configuration', () => {
    expect(dynamic).toBe('force-dynamic');
  });
});

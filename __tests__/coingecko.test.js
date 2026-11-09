/** @jest-environment node */
import { coingecko, UpstreamError } from '@/lib/coingecko';

const ok = (data) => ({ ok: true, status: 200, json: async () => data });
const failure = (status) => ({ ok: false, status, json: async () => ({}) });

let now;

beforeEach(() => {
  now = 1_000_000;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

describe('coingecko', () => {
  it('fetches from the CoinGecko API and returns the JSON', async () => {
    fetch.mockResolvedValue(ok({ a: 1 }));

    await expect(coingecko('/success', 1000)).resolves.toEqual({ a: 1 });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.coingecko.com/api/v3/success',
      expect.objectContaining({ headers: { accept: 'application/json' } })
    );
  });

  it('serves the cached value until the TTL has passed', async () => {
    fetch.mockResolvedValue(ok({ v: 1 }));

    await coingecko('/cached', 1000);
    now += 999;
    await expect(coingecko('/cached', 1000)).resolves.toEqual({ v: 1 });
    expect(fetch).toHaveBeenCalledTimes(1);

    fetch.mockResolvedValue(ok({ v: 2 }));
    now += 2;
    await expect(coingecko('/cached', 1000)).resolves.toEqual({ v: 2 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  describe('when the upstream fails and nothing is cached', () => {
    const fail = async (path) => coingecko(path, 1000).catch((e) => e);

    it('reports an unreachable provider', async () => {
      fetch.mockRejectedValue(new TypeError('offline'));
      const err = await fail('/network');
      expect(err).toBeInstanceOf(UpstreamError);
      expect(err.message).toBe('Could not reach the market data provider');
    });

    it('reports the rate limit (429)', async () => {
      fetch.mockResolvedValue(failure(429));
      const err = await fail('/limit');
      expect(err).toBeInstanceOf(UpstreamError);
      expect(err.message).toBe('Rate limit reached, retrying shortly');
    });

    it('reports other HTTP errors with their status', async () => {
      fetch.mockResolvedValue(failure(500));
      const err = await fail('/server-error');
      expect(err.message).toBe('Market data provider error (500)');
    });

    it('reports a response that is not valid JSON', async () => {
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('bad json');
        },
      });
      const err = await fail('/bad-json');
      expect(err.message).toBe('Invalid response from the market data provider');
    });
  });

  it('serves the stale value when a refresh fails', async () => {
    fetch.mockResolvedValue(ok({ old: true }));
    await coingecko('/stale', 1000);

    now += 5000;
    fetch.mockRejectedValue(new TypeError('offline'));
    await expect(coingecko('/stale', 1000)).resolves.toEqual({ old: true });

    fetch.mockResolvedValue(failure(500));
    await expect(coingecko('/stale', 1000)).resolves.toEqual({ old: true });
  });
});

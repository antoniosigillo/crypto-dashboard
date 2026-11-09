const BASE = 'https://api.coingecko.com/api/v3';
const cache = new Map();

export class UpstreamError extends Error {}

export async function coingecko(path, ttlMs) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data;

  try {
    let res;
    try {
      res = await fetch(`${BASE}${path}`, {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
    } catch {
      throw new UpstreamError('Could not reach the market data provider');
    }
    if (res.status === 429) throw new UpstreamError('Rate limit reached, retrying shortly');
    if (!res.ok) throw new UpstreamError(`Market data provider error (${res.status})`);

    let data;
    try {
      data = await res.json();
    } catch {
      throw new UpstreamError('Invalid response from the market data provider');
    }
    cache.set(path, { at: Date.now(), data });
    return data;
  } catch (err) {
    if (hit) return hit.data;
    throw err;
  }
}

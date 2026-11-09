/** @jest-environment node */

import { GET, dynamic } from '@/app/api/prices/route';
import { COIN_IDS } from '@/lib/coins';
import { coingecko, UpstreamError } from '@/lib/coingecko';

jest.mock('@/lib/coingecko', () => {
  class UpstreamError extends Error {}
  
  return { coingecko: jest.fn(), UpstreamError };
});

const raw = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://x/btc.png',
  current_price: 50_000,
  price_change_percentage_24h: 2.5,
  market_cap: 999,
};

beforeEach(() => coingecko.mockReset());

describe('GET /api/prices', () => {
  it('asks CoinGecko for the configured coins in EUR', async () => {
    coingecko.mockResolvedValue([raw]);
    
    await GET();
    
    expect(coingecko).toHaveBeenCalledWith(
        `/coins/markets?vs_currency=eur&ids=${COIN_IDS.join(',')}&price_change_percentage=24h`,
        10_000
    );
  });
  
  it('returns only valid coins with the fields required by the UI', async () => {
    coingecko.mockResolvedValue([
      raw,
      { id: 'broken', symbol: 'x', name: 'Broken', current_price: null },
    ]);
    
    const response = await GET();
    
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://x/btc.png',
        current_price: 50_000,
        change24h: 2.5,
      },
    ]);
  });
  
  it.each([
    ['is not a list', { not: 'a list' }],
    ['has no valid coin', [{ id: 'broken' }]],
  ])('returns 502 when the data %s', async (_label, data) => {
    coingecko.mockResolvedValue(data);
    
    const response = await GET();
    
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid price data received',
    });
  });
  
  it('forwards the message of an upstream error', async () => {
    coingecko.mockRejectedValue(
        new UpstreamError('Rate limit reached, retrying shortly')
    );
    
    const response = await GET();
    
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'Rate limit reached, retrying shortly',
    });
  });
  
  it('hides the details of unexpected errors', async () => {
    coingecko.mockRejectedValue(new Error('secret internal detail'));
    
    const response = await GET();
    
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'Unexpected server error',
    });
  });
  
  it('exports the dynamic rendering configuration', () => {
    expect(dynamic).toBe('force-dynamic');
  });
});
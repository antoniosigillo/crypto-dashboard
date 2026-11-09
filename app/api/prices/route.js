import { NextResponse } from 'next/server';
import { COIN_IDS } from '@/lib/coins';
import { coingecko, UpstreamError } from '@/lib/coingecko';
import { isValidCoin, toCoin } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await coingecko(
      `/coins/markets?vs_currency=eur&ids=${COIN_IDS.join(',')}&price_change_percentage=24h`,
      10_000
    );
    const coins = Array.isArray(data) ? data.filter(isValidCoin).map(toCoin) : [];
    if (coins.length === 0) throw new UpstreamError('Invalid price data received');
    return NextResponse.json(coins);
  } catch (err) {
    const message = err instanceof UpstreamError ? err.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

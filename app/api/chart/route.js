import { NextResponse } from 'next/server';
import { COIN_IDS } from '@/lib/coins';
import { coingecko, UpstreamError } from '@/lib/coingecko';
import { parseChartPoints } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const id = new URL(request.url).searchParams.get('id');

  if (!id || !COIN_IDS.includes(id)) {
    return NextResponse.json({ error: 'Unknown coin' }, { status: 400 });
  }

  try {
    const data = await coingecko(`/coins/${id}/market_chart?vs_currency=eur&days=1`, 60_000);
    const points = parseChartPoints(data);
    if (points.length < 2) throw new UpstreamError('Invalid chart data received');
    return NextResponse.json(points);
  } catch (err) {
    const message = err instanceof UpstreamError ? err.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

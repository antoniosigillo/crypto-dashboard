const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

export function isValidCoin(c) {
  return (
    !!c &&
    typeof c.id === 'string' &&
    typeof c.symbol === 'string' &&
    typeof c.name === 'string' &&
    isNum(c.current_price) &&
    c.current_price > 0
  );
}

export function toCoin(c) {
  return {
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: typeof c.image === 'string' ? c.image : null,
    current_price: c.current_price,
    change24h: isNum(c.price_change_percentage_24h) ? c.price_change_percentage_24h : null,
  };
}

export function parseChartPoints(data) {
  if (!data || !Array.isArray(data.prices)) return [];
  return data.prices
    .filter((p) => Array.isArray(p) && isNum(p[0]) && isNum(p[1]))
    .map(([t, price]) => ({ t, price }));
}

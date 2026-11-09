'use client';

import {
  Area,
  AreaChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSelector } from 'react-redux';
import { formatDateTime, formatEur } from '@/lib/format';

const TAG_WIDTH = 64;

function Tag({ viewBox, text, fill }) {
  const { x, y, width } = viewBox;
  const left = x + width + 4;
  return (
    <g>
      <rect x={left} y={y - 9} width={TAG_WIDTH} height={18} fill={fill} />
      <text x={left + TAG_WIDTH / 2} y={y + 4} textAnchor="middle" fill="#fff" fontSize={11}>
        {text}
      </text>
    </g>
  );
}

const axisTick = (v) => (Math.abs(v) >= 100 ? Math.round(v) : Number(v.toPrecision(4)));

export default function PriceChart() {
  const selectedId = useSelector((s) => s.market.selectedId);
  const points = useSelector((s) => s.market.charts[selectedId]);
  const chartError = useSelector((s) => s.market.chartError);

  if (!points) {
    return chartError ? (
      <p className="text-danger text-center py-5 mb-0" role="alert">
        {chartError}
      </p>
    ) : (
      <p className="text-body-secondary text-center py-5 mb-0">Loading chart…</p>
    );
  }

  const first = points[0];
  const last = points[points.length - 1];

  return (
    <>
      {chartError && (
        <p className="text-body-secondary small text-center mb-0">
          Could not refresh the chart: showing older data.
        </p>
      )}
      <div className="chart-box" aria-label="Price chart, last 24 hours" role="img">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 12, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#27a6a1" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#27a6a1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} hide />
            <YAxis
              orientation="right"
              domain={['auto', 'auto']}
              tickCount={5}
              tickFormatter={axisTick}
              axisLine={false}
              tickLine={false}
              width={TAG_WIDTH + 8}
              tick={{ fontSize: 11, fill: 'var(--teal-dark)' }}
            />
            <Tooltip
              formatter={(v) => [formatEur(v), 'Price']}
              labelFormatter={formatDateTime}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--line)' }}
            />
            <Area
              type="linear"
              dataKey="price"
              stroke="var(--teal)"
              strokeWidth={1.6}
              fill="url(#areaFill)"
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceLine
              y={first.price}
              stroke="var(--teal-light)"
              strokeDasharray="2 3"
              label={(props) => <Tag {...props} text="Prev close" fill="var(--teal-light)" />}
            />
            <ReferenceLine
              y={last.price}
              stroke="transparent"
              label={(props) => <Tag {...props} text={axisTick(last.price)} fill="var(--teal-dark)" />}
            />
            <ReferenceDot x={last.t} y={last.price} r={3.5} fill="var(--teal)" stroke="#fff" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

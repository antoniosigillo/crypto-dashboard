const { createElement: h } = require('react');

const Passthrough = ({ children }) => h('div', null, children);

module.exports = {
  ResponsiveContainer: Passthrough,
  AreaChart: ({ children }) => h('svg', null, children),
  Area: () => null,
  XAxis: () => null,
  ReferenceDot: () => null,
  YAxis: ({ tickFormatter }) =>
    h('g', null, h('text', null, tickFormatter(1234.5)), h('text', null, tickFormatter(0.123456))),
  Tooltip: ({ formatter, labelFormatter }) =>
    h(
      'g',
      null,
      h('text', { 'data-testid': 'tooltip-value' }, formatter(1234.5).join('|')),
      h('text', { 'data-testid': 'tooltip-label' }, labelFormatter(0))
    ),
  ReferenceLine: ({ label, y }) =>
    h('g', { 'data-testid': `ref-${y}` }, label({ viewBox: { x: 10, y: 20, width: 100, height: 0 } })),
};

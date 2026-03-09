import {
  PieChart, Pie, Cell, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";

const COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa",
  "#c4b5fd", "#4f46e5", "#7c3aed",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs">
      <p className="text-white font-bold">{d.name}</p>
      <p className="text-indigo-400">${d.value.toLocaleString()}</p>
      <p className="text-gray-400">{d.payload.pct}% of portfolio</p>
    </div>
  );
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, pct }) => {
  if (pct < 8) return null; // skip tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle"
          dominantBaseline="central" fontSize={11} fontWeight="bold">
      {name}
    </text>
  );
};

export default function PortfolioPieChart({ holdings = [] }) {
  if (holdings.length === 0) return null;

  const data = holdings
    .filter((h) => h.currentValue)
    .map((h) => ({
      name: h.ticker,
      value: h.currentValue,
      pct: 0,
    }));

  const total = data.reduce((s, d) => s + d.value, 0);
  data.forEach((d) => {
    d.pct = parseFloat(((d.value / total) * 100).toFixed(1));
  });

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span>🥧</span>
        <h2 className="text-sm font-semibold text-white">Portfolio Allocation</h2>
        <span className="ml-auto text-xs text-gray-500">
          ${total.toLocaleString()} total
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={COLORS[i % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-gray-400 text-xs">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceDot,
} from "recharts";

// Custom tooltip that shows OHLC
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white">Close: <span className="text-indigo-400 font-bold">${d.close?.toFixed(2)}</span></p>
      <p className="text-gray-400">Open: ${d.open?.toFixed(2)}</p>
      <p className="text-green-400">High: ${d.high?.toFixed(2)}</p>
      <p className="text-red-400">Low: ${d.low?.toFixed(2)}</p>
      <p className="text-gray-500">Vol: {d.volume?.toLocaleString()}</p>
    </div>
  );
};

export default function StockChart({ prices = [], anomalies = [], ticker }) {
  // Format date to short label (Oct 10)
  const chartData = prices.map((p) => ({
    ...p,
    label: new Date(p.date).toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    }),
  }));

  // Set of anomaly dates for quick lookup
  const anomalyDates = new Set(anomalies.map((a) => a.date));

  // Min/max for YAxis domain with padding
  const closes = prices.map((p) => p.close);
  const minClose = Math.min(...closes) * 0.98;
  const maxClose = Math.max(...closes) * 1.02;

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">{ticker} — Price Chart</h2>
          <p className="text-xs text-gray-500">Last 30 trading days · Red dots = anomalies</p>
        </div>
        {anomalies.length > 0 && (
          <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full">
            ⚠ {anomalies.length} anomal{anomalies.length > 1 ? "ies" : "y"} detected
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 10 }}
            interval="preserveStartEnd"
            tickLine={false}
          />
          <YAxis
            domain={[minClose, maxClose]}
            tick={{ fill: "#64748b", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#6366f1" }}
          />
          {/* Red anomaly dots */}
          {chartData
            .filter((d) => anomalyDates.has(d.date))
            .map((d) => (
              <ReferenceDot
                key={d.date}
                x={d.label}
                y={d.close}
                r={6}
                fill="#ef4444"
                stroke="#fff"
                strokeWidth={1.5}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
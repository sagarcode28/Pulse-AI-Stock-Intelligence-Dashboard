const trendColors = {
  Bullish: "text-green-400 bg-green-400/10 border-green-400/30",
  Bearish: "text-red-400 bg-red-400/10 border-red-400/30",
  Neutral: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
};

const riskColors = {
  Low: "text-green-400",
  Medium: "text-yellow-400",
  High: "text-red-400",
};

const trendEmoji = { Bullish: "📈", Bearish: "📉", Neutral: "➡️" };

export default function AIInsightCard({ insight, loading, ticker }) {
  if (loading) {
    return (
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-indigo-400">🧠</span>
          <h2 className="text-sm font-semibold text-white">AI Market Insight</h2>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-indigo-400">🧠</span>
          <h2 className="text-sm font-semibold text-white">AI Market Insight</h2>
        </div>
        <p className="text-gray-500 text-sm">Search a ticker to generate insight.</p>
      </div>
    );
  }

  const { trend, risk_level, summary, price_target_hint, key_observation, source } = insight;

  return (
    <div className="bg-gray-800/60 border border-indigo-500/20 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400">🧠</span>
          <h2 className="text-sm font-semibold text-white">AI Market Insight — {ticker}</h2>
        </div>
        {source === "computed" && (
          <span className="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded-full">
            rule-based
          </span>
        )}
      </div>

      {/* Trend + Risk badges */}
      <div className="flex gap-2 mb-4">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${trendColors[trend] || trendColors.Neutral}`}>
          {trendEmoji[trend]} {trend}
        </span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gray-700/50 border border-gray-600 ${riskColors[risk_level] || "text-gray-400"}`}>
          Risk: {risk_level}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-300 leading-relaxed mb-3">{summary}</p>

      {/* Key observation */}
      {key_observation && (
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-3 mb-3">
          <p className="text-xs text-indigo-400 font-semibold mb-1">KEY OBSERVATION</p>
          <p className="text-xs text-gray-400">{key_observation}</p>
        </div>
      )}

      {/* Price target */}
      {price_target_hint && (
        <p className="text-xs text-gray-500">
          🎯 <span className="text-gray-400">{price_target_hint}</span>
        </p>
      )}
    </div>
  );
}
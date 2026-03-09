import { useState, useEffect } from "react";
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from "../utils/api";
import { Sparklines, SparklinesLine } from "react-sparklines";

export default function WatchlistSidebar({ onSelectTicker, activeTicker }) {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchWatchlist();
      setWatchlist(data.watchlist);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const t = input.trim().toUpperCase();
    if (!t) return;
    setAdding(true);
    try {
      await addToWatchlist(t);
      setInput("");
      await load();
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (e, ticker) => {
    e.stopPropagation(); // don't trigger onSelectTicker
    await removeFromWatchlist(ticker);
    await load();
  };

  return (
    <aside className="w-56 shrink-0 bg-gray-800/40 border border-gray-700/50
                      rounded-xl p-4 flex flex-col gap-3 h-fit">

      {/* Header */}
      <div className="flex items-center gap-2">
        <span>⭐</span>
        <h2 className="text-sm font-semibold text-white">Watchlist</h2>
      </div>

      {/* Add input */}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add ticker…"
          className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded-lg
                     px-2.5 py-1.5 text-xs text-white placeholder-gray-600
                     focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={adding}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                     px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
        >
          +
        </button>
      </div>

      {/* Watchlist items */}
      <div className="flex flex-col gap-1">
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-700/50 rounded-lg" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-4">
            No tickers saved yet
          </p>
        ) : (
          watchlist.map((item) => (
            <button
              key={item.ticker}
              onClick={() => onSelectTicker(item.ticker)}
              className={`flex flex-col w-full px-3 py-2.5 rounded-lg text-xs
                transition-colors group text-left
                ${activeTicker === item.ticker
                  ? "bg-indigo-600/20 border border-indigo-500/40"
                  : "hover:bg-gray-700/50 border border-transparent"
                }`}
            >
              {/* Top row: ticker + change + remove */}
              <div className="flex items-center justify-between w-full mb-1.5">
                <div>
                  <span className={`font-bold text-sm ${activeTicker === item.ticker ? "text-indigo-400" : "text-white"
                    }`}>
                    {item.ticker}
                  </span>
                  {item.price && (
                    <span className="text-gray-500 ml-1.5 text-xs">
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {item.change !== null && (
                    <span className={`font-semibold text-xs ${item.change >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                      {item.change >= 0 ? "+" : ""}{item.change}%
                    </span>
                  )}
                  <span
                    onClick={(e) => handleRemove(e, item.ticker)}
                    className="text-gray-700 hover:text-red-400 transition-colors
                     opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </span>
                </div>
              </div>

              {/* Sparkline */}
              {item.sparkline && item.sparkline.length > 1 && (
                <Sparklines data={item.sparkline} height={28} margin={2}>
                  <SparklinesLine
                    color={item.change >= 0 ? "#4ade80" : "#f87171"}
                    style={{ fill: "none", strokeWidth: 1.5 }}
                  />
                </Sparklines>
              )}
            </button>
          ))
        )}
      </div>

      {watchlist.length > 0 && (
        <p className="text-xs text-gray-700 text-center">
          {watchlist.length} ticker{watchlist.length > 1 ? "s" : ""} tracked
        </p>
      )}
    </aside>
  );
}
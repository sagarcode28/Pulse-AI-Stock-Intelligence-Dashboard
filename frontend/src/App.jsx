import { useState } from "react";
import { fetchStockData, fetchInsight } from "./utils/api";
import StockChart from "./components/StockChart";
import AIInsightCard from "./components/AIInsightCard";
import AnomalyTable from "./components/AnomalyTable";
import KPICard from "./components/KPICard";
import PortfolioTracker from "./components/PortfolioTracker";
import WatchlistSidebar from "./components/WatchlistSidebar";

const DEFAULT_TICKERS = ["AAPL", "TSLA", "GOOGL", "MSFT", "DAWN"];

export default function App() {
  const [ticker, setTicker] = useState("");
  const [input, setInput] = useState("");
  const [stockData, setStockData] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const handleSearch = async (symbol) => {
    const t = (symbol || input).toUpperCase().trim();
    if (!t) return;

    setTicker(t);
    setInput(t);
    setError(null);
    setStockData(null);
    setInsight(null);
    setActiveTab("Dashboard");

    setLoadingStock(true);
    try {
      const data = await fetchStockData(t);
      setStockData(data);
    } catch {
      setError(`Could not fetch data for "${t}". Check the ticker and try again.`);
    } finally {
      setLoadingStock(false);
    }

    setLoadingInsight(true);
    try {
      const ins = await fetchInsight(t);
      setInsight(ins.insight);
    } catch {
      setInsight(null);
    } finally {
      setLoadingInsight(false);
    }
  };

  const prices = stockData?.prices || [];
  const anomalies = stockData?.anomalies || [];
  const latestClose = prices.at(-1)?.close ?? 0;
  const prevClose = prices.at(-2)?.close ?? latestClose;
  const dayChange = latestClose - prevClose;
  const dayChangePct = prevClose ? (dayChange / prevClose) * 100 : 0;

  return (
    <div className="min-h-screen bg-base text-white">

      {/* ── Navbar ── */}
      <nav className="border-b border-gray-800 px-6 py-4
                      flex items-center justify-between sticky top-0
                      bg-base/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <span className="text-lg font-bold text-white">Pulse AI</span>
          <span className="text-xs text-gray-500 ml-1 border border-gray-700
                           px-2 py-0.5 rounded-full">
            Stock Intelligence
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-600 hidden md:block">
            Powered by Alpha Vantage + Gemini
          </span>
          {ticker && (
            <span className="text-xs bg-indigo-600/20 text-indigo-400
                             border border-indigo-500/30 px-3 py-1 rounded-full font-semibold">
              {ticker}
            </span>
          )}
        </div>
      </nav>

      {stockData?.source === "demo" && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20
                  px-6 py-2 text-xs text-yellow-400 text-center">
          🎭 Showing simulated data — Alpha Vantage API quota reached.
          Data resets daily. Cache persists for 1 hour.
        </div>
      )}

      <div className="flex gap-6 max-w-7xl mx-auto px-6 py-8">

        <WatchlistSidebar
          onSelectTicker={handleSearch}
          activeTicker={ticker}
        />

        <div className="flex-1 min-w-0">

          <div className="mb-6">
            <div className="flex gap-3 max-w-lg">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter ticker (e.g. AAPL, TSLA, GOOGL)"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg
                           px-4 py-2.5 text-white placeholder-gray-500 text-sm
                           focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loadingStock}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                           px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                {loadingStock ? "Loading…" : "Analyze"}
              </button>
            </div>

            {/* Quick chips */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {DEFAULT_TICKERS.map((t) => (
                <button
                  key={t}
                  onClick={() => handleSearch(t)}
                  className={`text-xs border px-3 py-1 rounded-full transition-colors ${ticker === t
                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                    : "border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-400"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-800/40 p-1 rounded-lg
                          w-fit border border-gray-700/50">
            {["Dashboard", "Portfolio"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                {tab === "Dashboard" ? "📊 Dashboard" : "💼 Portfolio"}
              </button>
            ))}
          </div>

          {/* ── Dashboard Tab ── */}
          {activeTab === "Dashboard" && (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400
                                rounded-lg px-4 py-3 text-sm mb-6">
                  ❌ {error}
                </div>
              )}

              {loadingStock && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-pulse">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-gray-800 rounded-xl" />
                  ))}
                </div>
              )}

              {stockData && !loadingStock && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="fade-in fade-in-delay-1">
                    <KPICard title="Current Price" value={`$${latestClose.toFixed(2)}`} subtitle={ticker} accent={true} />
                  </div>
                  <div className="fade-in fade-in-delay-2">
                    <KPICard title="Day Change" value={`${dayChange >= 0 ? "+" : ""}${dayChange.toFixed(2)}`} subtitle={`${dayChangePct >= 0 ? "+" : ""}${dayChangePct.toFixed(2)}% vs prev close`} />
                  </div>
                  <div className="fade-in fade-in-delay-3">
                    <KPICard title="Anomalies (30d)" value={anomalies.length} subtitle={anomalies.length > 0 ? "⚠ Unusual activity" : "✅ Clean price action"} />
                  </div>
                  <div className="fade-in fade-in-delay-4">
                    <KPICard title="Data Source" value={stockData.source === "cache" ? "⚡ Cached" : stockData.source === "demo" ? "🎭 Demo" : "🌐 Live"} subtitle={`${stockData.count} days analyzed`} />
                  </div>
                </div>
              )}

              {(stockData || loadingStock) && (
                <div className="space-y-5">
                  {stockData && (
                    <StockChart
                      prices={prices}
                      anomalies={anomalies}
                      ticker={ticker}
                    />
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AIInsightCard
                      insight={insight}
                      loading={loadingInsight}
                      ticker={ticker}
                    />
                    <AnomalyTable anomalies={anomalies} />
                  </div>
                </div>
              )}

              {!stockData && !loadingStock && !error && (
                <div className="text-center py-32 text-gray-700">
                  <p className="text-6xl mb-4">📊</p>
                  <p className="text-lg font-semibold text-gray-500">
                    Search any stock ticker to begin
                  </p>
                  <p className="text-sm mt-2 text-gray-600">
                    Real-time prices · AI insights · Anomaly detection
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── Portfolio Tab ── */}
          {activeTab === "Portfolio" && <PortfolioTracker />}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 px-6 py-6
                   text-center text-xs text-gray-700">
        <p>
          Pulse AI · Built with React, Express, FastAPI, MongoDB + Gemini
        </p>
        <p className="mt-1">
          Market data provided by{" "}
          <a href="https://www.alphavantage.co"
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 hover:text-indigo-400 transition-colors">
            Alpha Vantage
          </a>
          {" "}· For educational purposes only. Not financial advice.
        </p>
      </footer>
    </div>
  );
}
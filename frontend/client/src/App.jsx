import { useState } from "react";
import { fetchStockData, fetchInsight } from "./utils/api";
import StockChart from "./components/StockChart";
import AIInsightCard from "./components/AIInsightCard";
import AnomalyTable from "./components/AnomalyTable";
import KPICard from "./components/KPICard";
import PortfolioTracker from "./components/PortfolioTracker";

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
    setError(null);
    setStockData(null);
    setInsight(null);

    setLoadingStock(true);
    try {
      const data = await fetchStockData(t);
      console.log(data);
      setStockData(data);
    } catch (err) {
      setError(`Could not fetch data for "${t}". Check the ticker and try again.`);
    } finally {
      setLoadingStock(false);
    }

    setLoadingInsight(true);
    try {
      const ins = await fetchInsight(t);
      console.log(ins);
      setInsight(ins.insight);
    } catch {
      setInsight(null);
    } finally {
      setLoadingInsight(false);
    }
  };

  // KPI calculations from stock data
  const prices = stockData?.prices || [];
  const latestClose = prices.at(-1)?.close ?? 0;
  const prevClose = prices.at(-2)?.close ?? latestClose;
  const dayChange = latestClose - prevClose;
  const dayChangePct = prevClose ? (dayChange / prevClose) * 100 : 0;
  const anomalies = stockData?.anomalies || [];

  return (
    <div className="min-h-screen bg-base text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <span className="text-lg font-bold text-white">Pulse AI</span>
          <span className="text-xs text-gray-500 ml-2 border border-gray-700 px-2 py-0.5 rounded-full">
            Stock Intelligence
          </span>
        </div>
        <span className="text-xs text-gray-600">
          Powered by Alpha Vantage + Gemini
        </span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Search bar */}
        <div className="mb-8">
          <div className="flex gap-3 max-w-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter ticker (e.g. AAPL, TSLA, GOOGL)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white placeholder-gray-500 text-sm focus:outline-none
                         focus:border-indigo-500 transition-colors"
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

          {/* Quick ticker chips */}
          <div className="flex gap-2 mt-3">
            {DEFAULT_TICKERS.map((t) => (
              <button
                key={t}
                onClick={() => { setInput(t); handleSearch(t); }}
                className="text-xs border border-gray-700 text-gray-400 hover:border-indigo-500
                           hover:text-indigo-400 px-3 py-1 rounded-full transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-6 bg-gray-800/40 p-1 rounded-lg w-fit border border-gray-700/50">
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

        {/* Tab content */}
        {activeTab === "Dashboard" ? (
          <>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400
                              rounded-lg px-4 py-3 text-sm mb-6">
                ❌ {error}
              </div>
            )}

            {loadingStock && (
              <div className="grid grid-cols-3 gap-4 mb-6 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-800 rounded-xl" />
                ))}
              </div>
            )}

            {stockData && !loadingStock && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <KPICard title="Current Price" value={`$${latestClose.toFixed(2)}`} subtitle={ticker} accent={true} />
                <KPICard title="Day Change" value={`${dayChange >= 0 ? "+" : ""}${dayChange.toFixed(2)}`} subtitle={`${dayChangePct >= 0 ? "+" : ""}${dayChangePct.toFixed(2)}% vs prev close`} />
                <KPICard title="Anomalies (30d)" value={anomalies.length} subtitle={anomalies.length > 0 ? "Unusual activity detected" : "Clean price action"} />
                <KPICard title="Data Source" value={stockData.source === "cache" ? "⚡ Cached" : "🌐 Live"} subtitle={`${stockData.count} days analyzed`} />
              </div>
            )}

            {(stockData || loadingStock) && (
              <div className="space-y-5">
                {stockData && <StockChart prices={prices} anomalies={anomalies} ticker={ticker} />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <AIInsightCard insight={insight} loading={loadingInsight} ticker={ticker} />
                  <AnomalyTable anomalies={anomalies} />
                </div>
              </div>
            )}

            {!stockData && !loadingStock && !error && (
              <div className="text-center py-24 text-gray-600">
                <p className="text-5xl mb-4">📊</p>
                <p className="text-lg font-semibold text-gray-500">Search any stock ticker to begin</p>
                <p className="text-sm mt-2">Real-time prices · AI insights · Anomaly detection</p>
              </div>
            )}
          </>
        ) : (
          <PortfolioTracker />
        )}
      </div>
    </div>
  );
}
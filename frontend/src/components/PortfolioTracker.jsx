import { useState, useEffect } from "react";
import { fetchPortfolio, addHolding, deleteHolding } from "../utils/api";
import PortfolioPieChart from "./PortfolioPieChart";

export default function PortfolioTracker() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ticker: "", shares: "", buyPrice: "", buyDate: ""
  });
  const [error, setError] = useState(null);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const data = await fetchPortfolio();
      setPortfolio(data);
    } catch {
      setError("Could not load portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPortfolio(); }, []);

  const handleAdd = async () => {
    if (!form.ticker || !form.shares || !form.buyPrice || !form.buyDate) {
      setError("All fields are required"); return;
    }
    setAdding(true);
    setError(null);
    try {
      console.log(form);
      await addHolding(form);
      setForm({ ticker: "", shares: "", buyPrice: "", buyDate: "" });
      setShowForm(false);
      await loadPortfolio();
    } catch {
      setError("Failed to add holding");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHolding(id);
      await loadPortfolio();
    } catch {
      setError("Failed to remove holding");
    }
  };

  const summary = portfolio?.summary;
  const holdings = portfolio?.holdings || [];

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Portfolio Tracker</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5
                     rounded-lg transition-colors font-semibold"
        >
          {showForm ? "Cancel" : "+ Add Holding"}
        </button>
      </div>

      {/* Add holding form */}
      {showForm && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 mb-5">
          <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">
            New Holding
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {[
              { key: "ticker", placeholder: "Ticker (AAPL)", type: "text" },
              { key: "shares", placeholder: "Shares (10)", type: "number" },
              { key: "buyPrice", placeholder: "Buy Price ($180)", type: "number" },
              { key: "buyDate", placeholder: "Buy Date", type: "date" },
            ].map(({ key, placeholder, type }) => (
              <input
                key={key}
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                           text-sm text-white placeholder-gray-600 focus:outline-none
                           focus:border-indigo-500 transition-colors"
              />
            ))}
          </div>
          {error && <p className="text-xs text-red-400 mb-2">❌ {error}</p>}
          <button
            onClick={handleAdd}
            disabled={adding}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                       px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {adding ? "Adding…" : "Add to Portfolio"}
          </button>
        </div>
      )}

      {/* Portfolio summary bar */}
      {summary && holdings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Invested", value: `$${summary.totalCost.toLocaleString()}` },
            { label: "Current Value", value: `$${summary.totalValue.toLocaleString()}` },
            {
              label: "Total P&L",
              value: `${summary.totalPnl >= 0 ? "+" : ""}$${summary.totalPnl.toLocaleString()}`,
              color: summary.totalPnl >= 0 ? "text-green-400" : "text-red-400",
            },
            {
              label: "Return",
              value: `${summary.totalPnlPct >= 0 ? "+" : ""}${summary.totalPnlPct}%`,
              color: summary.totalPnlPct >= 0 ? "text-green-400" : "text-red-400",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-sm font-bold ${color || "text-white"}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {holdings.length >= 2 && (
        <div className="mb-5">
          <PortfolioPieChart holdings={holdings} />
        </div>
      )}

      {/* Holdings table */}
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-700 rounded" />)}
        </div>
      ) : holdings.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
          <p className="text-sm">No holdings yet. Add your first stock above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="text-left pb-2">Ticker</th>
                <th className="text-right pb-2">Shares</th>
                <th className="text-right pb-2">Buy Price</th>
                <th className="text-right pb-2">Current</th>
                <th className="text-right pb-2">Value</th>
                <th className="text-right pb-2">P&L</th>
                <th className="text-right pb-2">Return</th>
                <th className="text-center pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h._id}
                  className="border-b border-gray-700/40 hover:bg-gray-700/20 transition-colors">
                  <td className="py-3 font-bold text-indigo-400">{h.ticker}</td>
                  <td className="py-3 text-right text-gray-300">{h.shares}</td>
                  <td className="py-3 text-right text-gray-400">${h.buyPrice.toFixed(2)}</td>
                  <td className="py-3 text-right text-white font-semibold">
                    {h.currentPrice ? `$${h.currentPrice}` : "—"}
                  </td>
                  <td className="py-3 text-right text-gray-300">
                    {h.currentValue ? `$${h.currentValue.toLocaleString()}` : "—"}
                  </td>
                  <td className={`py-3 text-right font-semibold ${h.pnl === null ? "text-gray-500"
                      : h.pnl >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                    {h.pnl === null ? "—"
                      : `${h.pnl >= 0 ? "+" : ""}$${Math.abs(h.pnl).toLocaleString()}`}
                  </td>
                  <td className={`py-3 text-right font-bold ${h.pnlPct === null ? "text-gray-500"
                      : h.pnlPct >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                    {h.pnlPct === null ? "—"
                      : `${h.pnlPct >= 0 ? "+" : ""}${h.pnlPct}%`}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => handleDelete(h._id)}
                      className="text-gray-600 hover:text-red-400 transition-colors px-2"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
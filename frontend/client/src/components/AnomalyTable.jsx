const severityStyle = {
  HIGH: "text-red-400 bg-red-400/10 border-red-400/20",
  MEDIUM: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

export default function AnomalyTable({ anomalies = [] }) {

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span>⚠️</span>
        <h2 className="text-sm font-semibold text-white">Anomaly Detection</h2>
        <span className="ml-auto text-xs text-gray-500">{anomalies.length} flagged</span>
      </div>

      {anomalies.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          ✅ No anomalies detected in the last 30 days
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="text-left pb-2">Date</th>
                <th className="text-right pb-2">Close</th>
                <th className="text-right pb-2">Change</th>
                <th className="text-right pb-2">Z-Score</th>
                <th className="text-center pb-2">Severity</th>
                <th className="text-left pb-2 pl-3">Direction</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a) => (
                <tr key={a.date} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="py-2 text-gray-300">{a.date}</td>
                  <td className="py-2 text-right text-gray-300">${a.close?.toFixed(2)}</td>
                  <td className={`py-2 text-right font-semibold ${a.pct_change > 0 ? "text-green-400" : "text-red-400"}`}>
                    {a.pct_change > 0 ? "+" : ""}{a.pct_change?.toFixed(2)}%
                  </td>
                  <td className="py-2 text-right text-gray-400">{a.z_score?.toFixed(2)}</td>
                  <td className="py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full border text-xs ${severityStyle[a.severity]}`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-2 pl-3 text-gray-400">{a.direction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
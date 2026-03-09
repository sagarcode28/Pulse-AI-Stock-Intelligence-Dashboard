export default function KPICard({ title, value, subtitle, accent = false }) {
    return (
        <div className={`rounded-xl p-5 border ${accent ? "bg-indigo-600/10 border-indigo-500/30" : "bg-gray-800/60 border-gray-700/50"}`}>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                {title}
            </p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
    )
}
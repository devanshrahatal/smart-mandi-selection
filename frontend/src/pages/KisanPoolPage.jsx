import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../hooks/useLanguage";

export default function KisanPoolPage() {
  const { t } = useLanguage();
  const [activePools, setActivePools] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculator State
  const [soloQty, setSoloQty] = useState(12);
  const [totalQty, setTotalQty] = useState(36);
  const [distanceKm, setDistanceKm] = useState(248);
  const [targetMandi, setTargetMandi] = useState("Kota Mandi");
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get("/api/pooling/active-pools")
      .then((res) => {
        if (res.data && res.data.pools) {
          setActivePools(res.data.pools);
        }
      })
      .catch((err) => console.error("Error loading pools:", err))
      .finally(() => setLoading(false));

    handleCalculate();
  }, []);

  const handleCalculate = async () => {
    try {
      const res = await axios.post("/api/pooling/calculate", {
        solo_quantity_quintals: Number(soloQty),
        total_pooled_quantity_quintals: Number(totalQty),
        distance_km: Number(distanceKm),
        target_mandi_name: targetMandi,
      });
      setCalcResult(res.data);
    } catch (err) {
      console.error("Error calculating pool savings:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-teal-950/80 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">
            🚜 SIH 2026 Innovation
          </span>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">
            {t.poolTitle || "Kisan Pool — Shared Agricultural Logistics"}
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            {t.poolSubtitle || "Group smallholder farmer harvests (5-25q) into pooled commercial truckloads to slash freight costs by 45-60%."}
          </p>
        </div>
      </div>

      {/* Interactive Savings Calculator */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-6">
          {t.poolCalculatorTitle || "Shared Freight Savings Calculator"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t.poolSoloQty || "Your Harvest (Quintals)"}: <b className="text-emerald-400">{soloQty}q</b>
            </label>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={soloQty}
              onChange={(e) => setSoloQty(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t.poolTotalQty || "Total Village Load (Quintals)"}: <b className="text-teal-400">{totalQty}q</b>
            </label>
            <input
              type="range"
              min={soloQty}
              max="90"
              step="2"
              value={totalQty}
              onChange={(e) => setTotalQty(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t.poolDistance || "Distance (KM)"}: <b className="text-blue-400">{distanceKm} km</b>
            </label>
            <input
              type="range"
              min="30"
              max="600"
              step="10"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCalculate}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-700/30 transition-all flex items-center justify-center gap-2"
            >
              {t.poolCalculateBtn || "Calculate Savings"}
            </button>
          </div>
        </div>

        {/* Calculator Output KPI Card */}
        {calcResult && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-900/90 border border-emerald-500/30 rounded-2xl">
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase">Matched Fleet Vehicle</span>
              <div className="text-lg font-bold text-slate-100 mt-1">{calcResult.matched_vehicle}</div>
              <span className="text-[11px] text-teal-400 font-bold">{calcResult.capacity_filled_percent}% Capacity Filled</span>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase">Solo Transport Cost</span>
              <div className="text-xl font-bold text-rose-400 mt-1">₹{calcResult.solo_cost_per_quintal}/q</div>
              <span className="text-[11px] text-slate-400">Solo hiring cost</span>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase">Kisan Pooled Cost</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">₹{calcResult.pooled_cost_per_quintal}/q</div>
              <span className="text-[11px] text-emerald-400 font-bold">-{calcResult.savings_percentage}% Freight Slashed</span>
            </div>

            <div className="p-4 bg-emerald-950/70 rounded-xl border border-emerald-500/60">
              <span className="text-xs text-emerald-300 font-bold uppercase">Your Total Cash Savings</span>
              <div className="text-2xl font-black text-emerald-300 mt-1">
                +₹{calcResult.total_farmer_savings?.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-400">Extra profit in your pocket</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Village Pools */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
          {t.poolActiveBatches || "Live Village Aggregation Batches"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePools.map((pool) => (
            <div
              key={pool.pool_id}
              className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="bg-slate-900 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                    {pool.pool_id}
                  </span>
                  <span className="bg-emerald-900/60 text-emerald-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                    🟢 {pool.status}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-100 mt-3">{pool.cluster_name}</h3>
                <p className="text-xs text-slate-400">Destination: <b className="text-slate-200">{pool.target_mandi_name}</b> ({pool.distance_km} km)</p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Capacity Filled</span>
                    <span className="font-bold text-emerald-400">{pool.current_quantity_quintals}q / {pool.vehicle_capacity_quintals}q ({pool.capacity_filled_percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${pool.capacity_filled_percent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-900/60 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Vehicle Type:</span>
                    <span className="font-semibold text-slate-200">{pool.vehicle_type}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Active Farmers:</span>
                    <span className="font-semibold text-slate-200">{pool.participants_count} Farmers</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Departure:</span>
                    <span className="font-bold text-amber-400">{pool.estimated_departure}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1.5 mt-1.5">
                    <span>Savings:</span>
                    <span className="font-extrabold text-emerald-400">₹{pool.savings_per_quintal}/q saved</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60">
                <div className="text-[11px] text-slate-400 mb-2 truncate">Coordinator: {pool.contact_fpo}</div>
                <button
                  onClick={() => alert(`Joined ${pool.pool_id}! Coordinator ${pool.contact_fpo} has been notified via WhatsApp.`)}
                  className="w-full bg-slate-700 hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  🤝 Join Pool via WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

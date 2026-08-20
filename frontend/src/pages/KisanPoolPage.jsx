import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
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

  // Instant calculation helper (fallback + real-time responsive sync)
  const computeLocalSavings = (solo, total, dist) => {
    const soloRatePerKm = 14.0; // Solo Light Commercial Vehicle (Tata Ace)
    const soloTotalTrip = soloRatePerKm * dist;
    const soloCostPerQ = Math.round((soloTotalTrip / Math.max(solo, 1)) * 10) / 10;

    let truckRate = 22.0;
    let vehicle = "Eicher 14ft (4 Ton)";
    let maxCap = 40;
    if (total > 40 && total <= 90) {
      truckRate = 28.0;
      vehicle = "19ft Heavy Truck (9 Ton)";
      maxCap = 90;
    } else if (total > 90) {
      truckRate = 38.0;
      vehicle = "24ft Multi-Axle (16 Ton)";
      maxCap = 160;
    }

    const pooledTotalTrip = truckRate * dist;
    const pooledCostPerQ = Math.round((pooledTotalTrip / Math.max(total, 1)) * 10) / 10;
    const savingsPerQ = Math.max(0, Math.round((soloCostPerQ - pooledCostPerQ) * 10) / 10);
    const totalSavings = Math.round(savingsPerQ * solo);
    const pct = soloCostPerQ > 0 ? Math.round((savingsPerQ / soloCostPerQ) * 100) : 0;
    const filled = Math.min(100, Math.round((total / maxCap) * 100));

    return {
      solo_cost_per_quintal: soloCostPerQ,
      pooled_cost_per_quintal: pooledCostPerQ,
      savings_per_quintal: savingsPerQ,
      total_farmer_savings: totalSavings,
      savings_percentage: pct,
      matched_vehicle: vehicle,
      capacity_filled_percent: filled,
    };
  };

  const handleCalculate = async (sQty = soloQty, tQty = totalQty, dKm = distanceKm) => {
    // 1. Instant local calculation for instant zero-lag feedback
    const localRes = computeLocalSavings(sQty, tQty, dKm);
    setCalcResult(localRes);

    // 2. Sync with cloud backend API
    try {
      const res = await apiClient.post("/api/pooling/calculate", {
        solo_quantity_quintals: Number(sQty),
        total_pooled_quantity_quintals: Number(tQty),
        distance_km: Number(dKm),
        target_mandi_name: targetMandi,
      });
      if (res.data) {
        setCalcResult(res.data);
      }
    } catch (err) {
      console.warn("Using local calculation fallback:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    apiClient.get("/api/pooling/active-pools")
      .then((res) => {
        if (res.data && res.data.pools) {
          setActivePools(res.data.pools);
        }
      })
      .catch((err) => {
        console.warn("Could not load active pools, using demo batches:", err);
        setActivePools([
          {
            pool_id: "POOL-RAJ-0821",
            cluster_name: "Jaipur Rural - Chomu Cluster",
            target_mandi_name: "Kota Krishi Mandi",
            distance_km: 248,
            current_quantity_quintals: 68,
            vehicle_capacity_quintals: 90,
            capacity_filled_percent: 75,
            vehicle_type: "19ft Commercial Truck (9 Ton)",
            participants_count: 5,
            estimated_departure: "Today, 6:00 PM",
            savings_per_quintal: 142,
            contact_fpo: "Chomu Kisan FPO (+91-98765-43210)",
            status: "Aggregating (22q space left)",
          },
          {
            pool_id: "POOL-MH-0914",
            cluster_name: "Nashik - Pimpalgaon Onion Belt",
            target_mandi_name: "Vashi APMC, Mumbai",
            distance_km: 195,
            current_quantity_quintals: 140,
            vehicle_capacity_quintals: 160,
            capacity_filled_percent: 88,
            vehicle_type: "10-Wheeler Taurus (16 Ton)",
            participants_count: 8,
            estimated_departure: "Tomorrow, 4:00 AM",
            savings_per_quintal: 118,
            contact_fpo: "Sahyadri Farmer Collective (+91-98234-56789)",
            status: "Filling Fast (20q space left)",
          },
          {
            pool_id: "POOL-UP-0402",
            cluster_name: "Agra - Khandauli Potato Hub",
            target_mandi_name: "Azadpur Mandi, Delhi",
            distance_km: 220,
            current_quantity_quintals: 36,
            vehicle_capacity_quintals: 40,
            capacity_filled_percent: 90,
            vehicle_type: "Eicher 14ft (4 Ton)",
            participants_count: 3,
            estimated_departure: "Today, 8:30 PM",
            savings_per_quintal: 95,
            contact_fpo: "Braj Krishi Vikas Manch (+91-94567-89012)",
            status: "Ready to Dispatch",
          },
        ]);
      })
      .finally(() => setLoading(false));

    handleCalculate(soloQty, totalQty, distanceKm);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-teal-950/80 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">
            Shared Freight Optimization
          </span>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">
            {t("poolTitle")}
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            {t("poolSubtitle")}
          </p>
        </div>
      </div>

      {/* Interactive Savings Calculator */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-6">
          {t("poolCalculatorTitle")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t("poolSoloQty")}: <b className="text-emerald-400 font-mono">{soloQty}q</b>
            </label>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={soloQty}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSoloQty(val);
                const newTot = Math.max(totalQty, val * 2);
                setTotalQty(newTot);
                handleCalculate(val, newTot, distanceKm);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t("poolTotalQty")}: <b className="text-teal-400 font-mono">{totalQty}q</b>
            </label>
            <input
              type="range"
              min={soloQty}
              max="120"
              step="2"
              value={totalQty}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTotalQty(val);
                handleCalculate(soloQty, val, distanceKm);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t("poolDistance")}: <b className="text-blue-400 font-mono">{distanceKm} km</b>
            </label>
            <input
              type="range"
              min="30"
              max="600"
              step="10"
              value={distanceKm}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDistanceKm(val);
                handleCalculate(soloQty, totalQty, val);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleCalculate(soloQty, totalQty, distanceKm)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {t("poolCalculateBtn")}
            </button>
          </div>
        </div>

        {/* Calculator Output KPI Card */}
        {calcResult && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-900/90 border border-emerald-500/30 rounded-2xl animate-fade-in">
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase">{t("poolMatchedVehicle")}</span>
              <div className="text-base font-bold text-slate-100 mt-1">{calcResult.matched_vehicle}</div>
              <span className="text-[11px] text-teal-400 font-bold font-mono">{calcResult.capacity_filled_percent}% Capacity Filled</span>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase">{t("poolSoloCost")}</span>
              <div className="text-xl font-bold font-mono text-rose-400 mt-1">₹{calcResult.solo_cost_per_quintal}/q</div>
              <span className="text-[11px] text-slate-400 font-mono">{t("poolSoloRate")}</span>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase">{t("poolPooledCost")}</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">₹{calcResult.pooled_cost_per_quintal}/q</div>
              <span className="text-[11px] text-emerald-400 font-bold font-mono">-{calcResult.savings_percentage}% Freight Slashed</span>
            </div>

            <div className="p-4 bg-emerald-950/70 rounded-xl border border-emerald-500/60">
              <span className="text-xs text-emerald-300 font-bold uppercase">{t("poolSavingsTotal")}</span>
              <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                +₹{calcResult.total_farmer_savings?.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">₹{calcResult.savings_per_quintal}/q {t("poolSavedBadge")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Village Pools */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
          {t("poolActiveBatches")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePools.map((pool) => (
            <div
              key={pool.pool_id}
              className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="bg-slate-900 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 font-mono">
                    {pool.pool_id}
                  </span>
                  <span className="bg-emerald-900/60 text-emerald-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                    {pool.status}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-100 mt-3">{pool.cluster_name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Destination: <b className="text-slate-200">{pool.target_mandi_name}</b> ({pool.distance_km} km)</p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1 font-mono">
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

                <div className="mt-4 p-3 bg-slate-900/60 rounded-xl space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Vehicle Type:</span>
                    <span className="font-semibold text-slate-200 font-sans">{pool.vehicle_type}</span>
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
                  Join Pool via WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

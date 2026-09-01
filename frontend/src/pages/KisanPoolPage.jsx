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
      <div
        className="rounded-3xl p-8 border shadow-2xl relative overflow-hidden"
        style={{
          background: "var(--whatsapp-card-bg)",
          borderColor: "var(--gradient-card-border)"
        }}
      >
        <div className="relative z-10 max-w-3xl">
          <span className="bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">
            Shared Freight Optimization
          </span>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
            {t("poolTitle")}
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-2 leading-relaxed">
            {t("poolSubtitle")}
          </p>
        </div>
      </div>

      {/* Interactive Savings Calculator */}
      <div className="surface-card p-6 md:p-8 border border-[var(--color-border-subtle)] shadow-xl">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-6">
          {t("poolCalculatorTitle")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Slider 1: Solo Quantity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {t("poolSoloQty")}
              </label>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                {soloQty} Quintals
              </span>
            </div>
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
              className="custom-range-slider"
              style={{
                background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((soloQty - 2) / 23) * 100}%, var(--slider-track) ${((soloQty - 2) / 23) * 100}%, var(--slider-track) 100%)`
              }}
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">
              <span>2q (Min)</span>
              <span>12q</span>
              <span>25q (Max Solo)</span>
            </div>
          </div>

          {/* Slider 2: Total Pooled Quantity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {t("poolTotalQty")}
              </label>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-teal-500/10 text-teal-600 border border-teal-500/30">
                {totalQty} Quintals
              </span>
            </div>
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
              className="custom-range-slider"
              style={{
                background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${((totalQty - soloQty) / (120 - soloQty || 1)) * 100}%, var(--slider-track) ${((totalQty - soloQty) / (120 - soloQty || 1)) * 100}%, var(--slider-track) 100%)`
              }}
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">
              <span>{soloQty}q (Solo)</span>
              <span>60q (Medium)</span>
              <span>120q (Heavy Truck)</span>
            </div>
          </div>

          {/* Slider 3: Distance */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {t("poolDistance")}
              </label>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-600 border border-blue-500/30">
                {distanceKm} km
              </span>
            </div>
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
              className="custom-range-slider"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((distanceKm - 30) / 570) * 100}%, var(--slider-track) ${((distanceKm - 30) / 570) * 100}%, var(--slider-track) 100%)`
              }}
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">
              <span>30 km</span>
              <span>300 km</span>
              <span>600 km (Far)</span>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleCalculate(soloQty, totalQty, distanceKm)}
              className="w-full bg-[var(--color-accent)] hover:brightness-110 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              {t("poolCalculateBtn")}
            </button>
          </div>
        </div>

        {/* Calculator Output KPI Card */}
        {calcResult && (
          <div
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl border animate-fade-in"
            style={{
              background: "var(--calc-result-bg)",
              borderColor: "var(--calc-result-border)"
            }}
          >
            <div
              className="p-4 rounded-xl border"
              style={{ background: "var(--calc-kpi-bg)", borderColor: "var(--calc-kpi-border)" }}
            >
              <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase">{t("poolMatchedVehicle")}</span>
              <div className="text-base font-bold text-[var(--color-text-primary)] mt-1">{calcResult.matched_vehicle}</div>
              <span className="text-[11px] text-teal-600 font-bold font-mono">{calcResult.capacity_filled_percent}% Capacity Filled</span>
            </div>

            <div
              className="p-4 rounded-xl border"
              style={{ background: "var(--calc-kpi-bg)", borderColor: "var(--calc-kpi-border)" }}
            >
              <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase">{t("poolSoloCost")}</span>
              <div className="text-xl font-bold font-mono text-red-500 mt-1">₹{calcResult.solo_cost_per_quintal}/q</div>
              <span className="text-[11px] text-[var(--color-text-muted)] font-mono">{t("poolSoloRate")}</span>
            </div>

            <div
              className="p-4 rounded-xl border"
              style={{ background: "var(--calc-kpi-bg)", borderColor: "var(--calc-kpi-border)" }}
            >
              <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase">{t("poolPooledCost")}</span>
              <div className="text-xl font-bold font-mono text-[var(--color-accent)] mt-1">₹{calcResult.pooled_cost_per_quintal}/q</div>
              <span className="text-[11px] text-[var(--color-accent)] font-bold font-mono">-{calcResult.savings_percentage}% Freight Slashed</span>
            </div>

            <div
              className="p-4 rounded-xl border"
              style={{ background: "var(--calc-savings-bg)", borderColor: "var(--calc-savings-border)" }}
            >
              <span className="text-xs text-emerald-600 font-bold uppercase">{t("poolSavingsTotal")}</span>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                +₹{calcResult.total_farmer_savings?.toLocaleString()}
              </div>
              <span className="text-[11px] text-[var(--color-accent)] font-mono">₹{calcResult.savings_per_quintal}/q {t("poolSavedBadge")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Village Pools */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
          {t("poolActiveBatches")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePools.map((pool) => (
            <div
              key={pool.pool_id}
              className="rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between border"
              style={{
                background: "var(--pool-card-bg)",
                borderColor: "var(--pool-card-border)"
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border font-mono" style={{ background: "var(--color-surface-overlay)", color: "var(--color-text-secondary)", borderColor: "var(--color-border-subtle)" }}>
                    {pool.pool_id}
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-600 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {pool.status}
                  </span>
                </div>

                <h3 className="text-lg font-black text-[var(--color-text-primary)] mt-3">{pool.cluster_name}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Destination: <b className="text-[var(--color-text-primary)]">{pool.target_mandi_name}</b> ({pool.distance_km} km)</p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-[var(--color-text-muted)]">Capacity Filled</span>
                    <span className="font-bold text-[var(--color-accent)]">{pool.current_quantity_quintals}q / {pool.vehicle_capacity_quintals}q ({pool.capacity_filled_percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden border" style={{ background: "var(--pool-progress-bg)", borderColor: "var(--color-border-subtle)" }}>
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${pool.capacity_filled_percent}%` }}
                    ></div>
                  </div>
                </div>

                <div
                  className="mt-4 p-3 rounded-xl space-y-1.5 text-xs font-mono border"
                  style={{ background: "var(--pool-detail-bg)", borderColor: "var(--pool-detail-border)" }}
                >
                  <div className="flex justify-between text-[var(--color-text-secondary)]">
                    <span>Vehicle Type:</span>
                    <span className="font-semibold text-[var(--color-text-primary)] font-sans">{pool.vehicle_type}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-secondary)]">
                    <span>Active Farmers:</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">{pool.participants_count} Farmers</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-secondary)]">
                    <span>Departure:</span>
                    <span className="font-bold text-amber-600">{pool.estimated_departure}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-secondary)] border-t pt-1.5 mt-1.5" style={{ borderColor: "var(--color-border-subtle)" }}>
                    <span>Savings:</span>
                    <span className="font-extrabold text-[var(--color-accent)]">₹{pool.savings_per_quintal}/q saved</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
                <div className="text-[11px] text-[var(--color-text-muted)] mb-2 truncate">Coordinator: {pool.contact_fpo}</div>
                <button
                  onClick={() => alert(`Joined ${pool.pool_id}! Coordinator ${pool.contact_fpo} has been notified via WhatsApp.`)}
                  className="w-full bg-[var(--color-surface-overlay)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] hover:text-white border border-[var(--color-border)] font-bold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
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

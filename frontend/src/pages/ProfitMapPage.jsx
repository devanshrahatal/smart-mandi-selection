import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import ProfitMap from "../components/ProfitMap";
import { useLanguage } from "../hooks/useLanguage";

const POPULAR_ORIGINS = [
  { name: "Vadodara, Gujarat", lat: 22.3072, lon: 73.1812 },
  { name: "Surat, Gujarat", lat: 21.1702, lon: 72.8311 },
  { name: "Rajkot, Gujarat", lat: 22.3039, lon: 70.8022 },
  { name: "Ahmedabad, Gujarat", lat: 23.0225, lon: 72.5714 },
  { name: "Pune, Maharashtra", lat: 18.5204, lon: 73.8567 },
  { name: "Nashik, Maharashtra", lat: 19.9975, lon: 73.7898 },
  { name: "Jaipur, Rajasthan", lat: 26.9124, lon: 75.7873 },
  { name: "Indore, Madhya Pradesh", lat: 22.7196, lon: 75.8577 },
  { name: "Delhi NCR", lat: 28.7165, lon: 77.1724 },
];

const QUALITY_GRADES = [
  { id: "A", label: "Grade A — Premium / Export Quality (+10%)", multiplier: 1.10, badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
  { id: "B", label: "Grade B — Fair Average Quality / FAQ (Standard)", multiplier: 1.00, badgeColor: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  { id: "C", label: "Grade C — Processing / Distressed (-20%)", multiplier: 0.80, badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
];

export default function ProfitMapPage() {
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [quantity, setQuantity] = useState(20);
  const [selectedOrigin, setSelectedOrigin] = useState(POPULAR_ORIGINS[0]);
  const [qualityGrade, setQualityGrade] = useState("B");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [saleWindow, setSaleWindow] = useState(null);

  useEffect(() => {
    // Fetch crops via apiClient
    apiClient.get("/api/crops").then((res) => {
      if (res.data && res.data.length > 0) {
        setCrops(res.data);
      }
    }).catch(() => {});
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const payload = {
        crop_name: selectedCrop,
        quantity_quintals: Number(quantity),
        farmer_latitude: selectedOrigin.lat,
        farmer_longitude: selectedOrigin.lon,
        quality_grade: qualityGrade,
      };
      const res = await apiClient.post("/api/recommendations", payload);
      const rawList = res.data?.recommendations || res.data?.ranked_mandis || [];
      if (res.data?.sale_window_recommendation) {
        setSaleWindow(res.data.sale_window_recommendation);
      }
      if (rawList.length > 0) {
        const mapped = rawList.map((m) => ({
          mandi_id: m.mandi_id,
          mandi_name: m.mandi_name,
          district: m.district,
          state: m.state,
          latitude: m.latitude || (m.mandi_id === 1 ? 25.2138 : m.mandi_id === 2 ? 19.076 : m.mandi_id === 3 ? 28.7165 : m.mandi_id === 4 ? 23.0225 : 22.7196),
          longitude: m.longitude || (m.mandi_id === 1 ? 75.8648 : m.mandi_id === 2 ? 72.8777 : m.mandi_id === 3 ? 77.1724 : m.mandi_id === 4 ? 72.5714 : 75.8577),
          distance_km: m.distance_km,
          travel_time_hours: m.travel_time_hours,
          modal_price: m.cost_breakdown?.modal_price_per_quintal || m.modal_price || 0,
          raw_modal_price: m.cost_breakdown?.raw_modal_price || m.modal_price || 0,
          net_profit_per_quintal: m.cost_breakdown?.net_profit_per_quintal || 0,
          deductions: m.cost_breakdown?.total_deductions_per_quintal || 0,
          total_net_profit: m.cost_breakdown?.total_net_profit || 0,
          sale_window: m.sale_window,
          badges: m.badges || [],
        }));
        setRecommendations(mapped);
      }
    } catch (err) {
      console.error("Error fetching map recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCrop, selectedOrigin, quantity, qualityGrade]);

  const activeGradeObj = QUALITY_GRADES.find((g) => g.id === qualityGrade) || QUALITY_GRADES[1];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Controls Card */}
      <div className="surface-card p-6 border border-[var(--color-border-subtle)] shadow-xl">
        <h1 className="text-2xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
          {t("mapTitle")}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {t("mapSubtitle")}
        </p>

        {/* 4-Column Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Origin */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              {t("mapOriginLabel")}
            </label>
            <select
              value={selectedOrigin.name}
              onChange={(e) => {
                const found = POPULAR_ORIGINS.find((o) => o.name === e.target.value);
                if (found) setSelectedOrigin(found);
              }}
              className="w-full rounded-xl px-4 py-2.5 text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
            >
              {POPULAR_ORIGINS.map((orig) => (
                <option key={orig.name} value={orig.name}>
                  {orig.name}
                </option>
              ))}
            </select>
          </div>

          {/* Crop */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              {t("mapCropLabel")}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
            >
              {crops.length > 0 ? (
                crops.map((c) => (
                  <option key={c.id} value={c.name}>
                    {t(c.name) || c.name} ({c.category})
                  </option>
                ))
              ) : (
                <>
                  <option value="Tomato">{t("Tomato") || "Tomato"}</option>
                  <option value="Onion">{t("Onion") || "Onion"}</option>
                  <option value="Potato">{t("Potato") || "Potato"}</option>
                  <option value="Wheat">{t("Wheat") || "Wheat"}</option>
                  <option value="Banana">{t("Banana") || "Banana"}</option>
                </>
              )}
            </select>
          </div>

          {/* Quality Grade Selector */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Quality Grade Specification
            </label>
            <select
              value={qualityGrade}
              onChange={(e) => setQualityGrade(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-xs font-semibold border focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
            >
              {QUALITY_GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {t("mapQuantityLabel")}
              </label>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                {quantity} Quintals
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="custom-range-slider"
              style={{
                background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((quantity - 5) / 95) * 100}%, var(--slider-track) ${((quantity - 5) / 95) * 100}%, var(--slider-track) 100%)`
              }}
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">
              <span>5q (Small)</span>
              <span>50q</span>
              <span>100q (Bulk)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sale-Window AI Harvest Timing Recommendation Banner */}
      {saleWindow && (
        <div
          className="rounded-2xl p-5 border shadow-xl relative overflow-hidden animate-fade-in"
          style={{
            background: "linear-gradient(135deg, var(--gradient-card-from) 0%, var(--color-surface-raised) 60%, var(--gradient-card2-from) 100%)",
            borderColor: "var(--gradient-card-border)"
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  AI Sale-Window Timing
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {saleWindow.confidence_score_percent}% Confidence
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  saleWindow.urgency === "CRITICAL" ? "bg-red-500/20 text-red-500 border border-red-500/30" :
                  saleWindow.urgency === "HIGH" ? "bg-amber-500/20 text-amber-600 border border-amber-500/30" :
                  "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                }`}>
                  {saleWindow.urgency} Urgency
                </span>
              </div>
              <h3 className="text-lg font-black text-[var(--color-text-primary)] flex items-center gap-2">
                ⏳ Optimal Sale Window: <span className="text-[var(--color-accent)]">{saleWindow.recommended_window}</span>
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {saleWindow.rationale}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border shrink-0 text-right font-mono" style={{ background: "var(--color-surface-overlay)", borderColor: "var(--color-border-subtle)" }}>
              <span className="text-[10px] uppercase text-[var(--color-text-muted)] block font-sans font-semibold">Price Momentum Projection</span>
              <span className="text-sm font-black text-[var(--color-accent)] block mt-0.5">{saleWindow.price_forecast}</span>
              <span className="text-[11px] text-[var(--color-text-secondary)] block mt-0.5">
                Quality: Grade {qualityGrade} ({activeGradeObj.multiplier}× rate)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map View */}
      <ProfitMap
        farmerLocation={{
          lat: selectedOrigin.lat,
          lon: selectedOrigin.lon,
          name: selectedOrigin.name,
        }}
        mandis={recommendations}
        cropName={t(selectedCrop) || selectedCrop}
        quantity={quantity}
      />

      {/* Ranked Table */}
      <div className="surface-card p-6 border border-[var(--color-border-subtle)] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            {t("mapRankedHeading")} ({t(selectedCrop) || selectedCrop} — {quantity}q)
          </h2>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${activeGradeObj.badgeColor}`}>
            Active Tier: Grade {qualityGrade} ({activeGradeObj.multiplier}×)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[var(--color-text-muted)] font-semibold border-b border-[var(--color-border-subtle)]" style={{ background: "var(--table-header-bg)" }}>
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Mandi</th>
                <th className="py-3 px-4">Distance & Time</th>
                <th className="py-3 px-4 text-right">Modal Price (Grade {qualityGrade})</th>
                <th className="py-3 px-4 text-right">Deductions/q</th>
                <th className="py-3 px-4 text-right">Net Profit/q</th>
                <th className="py-3 px-4 text-right">Total Take-Home</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)] font-mono">
              {recommendations.map((m, idx) => (
                <tr
                  key={m.mandi_id}
                  className={`hover:bg-[var(--color-surface-overlay)] transition-colors ${
                    idx === 0 ? "bg-[var(--ranked-best-bg)] font-bold" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        idx === 0
                          ? "bg-[var(--color-accent)] text-white"
                          : idx === 1
                          ? "bg-amber-500/20 text-amber-600 border border-amber-500/40"
                          : "bg-[var(--badge-muted-bg)] text-[var(--badge-muted-text)]"
                      }`}
                    >
                      #{idx + 1} {idx === 0 ? "BEST" : ""}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-[var(--color-text-primary)]">
                    <div className="flex items-center gap-1.5">
                      <span>{m.mandi_name}</span>
                      {m.sale_window?.action_badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                          {m.sale_window.action_badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)] font-normal">{m.state}</div>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                    {m.distance_km} km ({m.travel_time_hours}h)
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--color-text-primary)]">
                    <span>₹{m.modal_price}</span>
                    {activeGradeObj.multiplier !== 1.0 && (
                      <span className="text-[10px] text-[var(--color-text-muted)] block line-through">
                        ₹{m.raw_modal_price}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-red-500 font-medium">-₹{m.deductions}</td>
                  <td
                    className={`py-3 px-4 text-right text-sm font-black ${
                      idx === 0 ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"
                    }`}
                  >
                    ₹{m.net_profit_per_quintal}
                  </td>
                  <td
                    className={`py-3 px-4 text-right text-sm font-black ${
                      idx === 0 ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"
                    }`}
                  >
                    ₹{m.total_net_profit?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

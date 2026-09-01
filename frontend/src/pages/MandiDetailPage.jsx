/**
 * Mandi Detail & Price Trend Analytics Page with Machine Learning Forecasting & Dual Theme.
 * Visualizes 30-day historical price series and Scikit-Learn 7-day predicted trajectory with model metrics.
 */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../api/client";
import { useLanguage } from "../hooks/useLanguage";
import TrendChart from "../components/TrendChart";

export default function MandiDetailPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMandiId = searchParams.get("mandi_id") ? parseInt(searchParams.get("mandi_id")) : 1;

  const [mandis, setMandis] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedMandiId, setSelectedMandiId] = useState(initialMandiId);
  const [selectedCropId, setSelectedCropId] = useState(1);
  const [priceHistory, setPriceHistory] = useState([]);
  const [mlForecast, setMlForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load Mandis and Crops lists
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [mandisRes, cropsRes] = await Promise.all([
          apiClient.get("/api/admin/mandis"),
          apiClient.get("/api/crops"),
        ]);
        setMandis(mandisRes.data);
        setCrops(cropsRes.data);
        if (mandisRes.data.length > 0 && !searchParams.get("mandi_id")) {
          setSelectedMandiId(mandisRes.data[0].id);
        }
        if (cropsRes.data.length > 0) {
          setSelectedCropId(cropsRes.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load mandis/crops:", err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch price history and ML forecast whenever selection changes
  useEffect(() => {
    if (!selectedMandiId || !selectedCropId) return;

    async function loadHistoryAndML() {
      try {
        setLoading(true);
        const [histRes, mlRes] = await Promise.allSettled([
          apiClient.get(`/api/admin/price-history/${selectedMandiId}/${selectedCropId}?days=30`),
          apiClient.get(`/api/ml/forecast/${selectedMandiId}/${selectedCropId}?days=7`),
        ]);

        if (histRes.status === "fulfilled") {
          setPriceHistory(histRes.value.data.data_points || []);
        }
        if (mlRes.status === "fulfilled") {
          setMlForecast(mlRes.value.data);
        }
      } catch (err) {
        console.error("Failed to load price intelligence:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistoryAndML();
  }, [selectedMandiId, selectedCropId]);

  const selectedMandi = mandis.find((m) => m.id === selectedMandiId) || mandis[0];
  const selectedCrop = crops.find((c) => c.id === selectedCropId) || crops[0];

  // Price calculations
  const modalPrices = priceHistory.map((p) => p.modal_price);
  const latestPrice = modalPrices[modalPrices.length - 1] || 0;
  const highestPrice = modalPrices.length > 0 ? Math.max(...modalPrices) : 0;
  const lowestPrice = modalPrices.length > 0 ? Math.min(...modalPrices) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in-up">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">{t("trendsTitle")}</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {t("trendsSubtitle")}
          </p>
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] text-[var(--color-text-muted)] mb-1">{t("selectMandiLabel")}</label>
            <select
              value={selectedMandiId}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                setSelectedMandiId(id);
                setSearchParams({ mandi_id: id });
              }}
              className="px-3.5 py-2 rounded-lg border text-xs focus:outline-none focus:border-[var(--color-accent)] font-medium transition-colors"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
            >
              {mandis.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[var(--color-text-muted)] mb-1">{t("selectCropLabel")}</label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(parseInt(e.target.value))}
              className="px-3.5 py-2 rounded-lg border text-xs focus:outline-none focus:border-[var(--color-accent)] font-medium transition-colors"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(c.name) || c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card p-4 space-y-1">
          <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase">{t("kpiModalPrice")}</p>
          <p className="text-2xl font-bold mono text-[var(--color-accent)]">₹{latestPrice.toLocaleString()}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">{t("currentPriceBadge")}</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase">{t("kpiHigh")}</p>
          <p className="text-2xl font-bold mono text-[var(--color-text-primary)]">₹{highestPrice.toLocaleString()}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">{t("peakPriceBadge")}</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase">{t("kpiLow")}</p>
          <p className="text-2xl font-bold mono text-[var(--color-text-primary)]">₹{lowestPrice.toLocaleString()}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">{t("floorPriceBadge")}</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase">ML 7-Day Projection</p>
          <p className="text-2xl font-bold mono text-teal-600">
            ₹{mlForecast?.forecast_7d_price ? mlForecast.forecast_7d_price.toLocaleString() : latestPrice.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
            {mlForecast?.pct_projected_change !== undefined ? `${mlForecast.pct_projected_change >= 0 ? "+" : ""}${mlForecast.pct_projected_change}% expected` : "Forecast ready"}
          </p>
        </div>
      </div>

      {/* Main Trend Chart Card with Machine Learning Curve */}
      <div className="surface-card p-6 border border-[var(--color-border-subtle)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              {selectedMandi?.name} — {t(selectedCrop?.name) || selectedCrop?.name} {t("priceHistoryTitle")}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              30-Day Historical Price Curve & Scikit-Learn 7-Day Forward Price Prediction
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
              Actual Price
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              ML 7-Day Forecast (Dashed)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center text-xs font-mono text-[var(--color-text-muted)]">
            Loading price series & ML forecasting model...
          </div>
        ) : (
          <TrendChart
            data={priceHistory}
            forecastData={mlForecast?.forecast_points || []}
            height={340}
          />
        )}
      </div>

      {/* Real Machine Learning Model Evaluation & Metrics Card */}
      {mlForecast && (
        <div
          className="rounded-2xl p-6 border shadow-xl relative overflow-hidden space-y-4"
          style={{
            background: "linear-gradient(135deg, var(--gradient-card-from) 0%, var(--color-surface-raised) 50%, var(--gradient-card2-from) 100%)",
            borderColor: "var(--gradient-card-border)"
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--color-border-subtle)" }}>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-600 flex items-center justify-center border border-teal-500/30 text-sm font-bold">
                🤖
              </span>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                  Machine Learning Model Analytics & Forecast Quality
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
                  Algorithm: {mlForecast.model_metadata?.algorithm}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-teal-500/10 text-teal-600 border border-teal-500/30">
                Signal: {mlForecast.market_signal}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl border" style={{ background: "var(--color-surface-overlay)", borderColor: "var(--color-border-subtle)" }}>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">R² Accuracy Score</span>
              <span className="text-base font-bold text-teal-600 mt-0.5 block">{mlForecast.model_metadata?.r2_accuracy_score}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">High fit fidelity</span>
            </div>

            <div className="p-3 rounded-xl border" style={{ background: "var(--color-surface-overlay)", borderColor: "var(--color-border-subtle)" }}>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">RMSE Error</span>
              <span className="text-base font-bold text-[var(--color-text-primary)] mt-0.5 block">±₹{mlForecast.model_metadata?.rmse}/q</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">Root Mean Square Error</span>
            </div>

            <div className="p-3 rounded-xl border" style={{ background: "var(--color-surface-overlay)", borderColor: "var(--color-border-subtle)" }}>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">Daily Drift Slope</span>
              <span className="text-base font-bold text-[var(--color-accent)] mt-0.5 block">
                {mlForecast.model_metadata?.daily_drift_slope >= 0 ? "+" : ""}₹{mlForecast.model_metadata?.daily_drift_slope}/day
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">Price momentum rate</span>
            </div>

            <div className="p-3 rounded-xl border" style={{ background: "var(--color-surface-overlay)", borderColor: "var(--color-border-subtle)" }}>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">Training Dataset</span>
              <span className="text-base font-bold text-[var(--color-text-primary)] mt-0.5 block">{mlForecast.model_metadata?.samples_trained} Daily Points</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">Agmarknet Price Records</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border text-xs" style={{ background: "var(--color-surface-overlay)", borderColor: "var(--color-border-subtle)" }}>
            <span className="font-bold text-teal-600 block mb-0.5">💡 Machine Learning Market Interpretation:</span>
            <p className="text-[var(--color-text-secondary)]">{mlForecast.recommendation_note}</p>
          </div>
        </div>
      )}

      {/* Mandi Cost Configuration Profile */}
      {selectedMandi && (
        <div className="surface-card p-6 border border-[var(--color-border-subtle)] space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Mandi Cost Parameters & Profile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[var(--color-surface-overlay)] space-y-0.5 border border-[var(--color-border-subtle)]">
              <p className="text-[var(--color-text-muted)]">Mandi Commission</p>
              <p className="text-sm font-mono font-semibold text-[var(--color-text-primary)]">
                {selectedMandi.cost_config?.commission_percentage || 6.0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface-overlay)] space-y-0.5 border border-[var(--color-border-subtle)]">
              <p className="text-[var(--color-text-muted)]">Loading / Unloading</p>
              <p className="text-sm font-mono font-semibold text-[var(--color-text-primary)]">
                ₹{(selectedMandi.cost_config?.loading_cost_per_quintal || 30) + (selectedMandi.cost_config?.unloading_cost_per_quintal || 20)}/q
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface-overlay)] space-y-0.5 border border-[var(--color-border-subtle)]">
              <p className="text-[var(--color-text-muted)]">Transport Base Rate</p>
              <p className="text-sm font-mono font-semibold text-[var(--color-text-primary)]">
                ₹{selectedMandi.cost_config?.transport_rate_per_km_per_quintal || 2.5}/km/q
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface-overlay)] space-y-0.5 border border-[var(--color-border-subtle)]">
              <p className="text-[var(--color-text-muted)]">Location Coordinates</p>
              <p className="text-sm font-mono font-semibold text-[var(--color-text-primary)]">
                {selectedMandi.latitude?.toFixed(2)}, {selectedMandi.longitude?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

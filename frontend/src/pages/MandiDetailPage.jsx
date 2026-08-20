/**
 * Mandi Detail & Price Trend Analytics Page with Multi-Lingual Regional Support.
 * Allows filtering by Mandi and Crop, and renders 30-day price curves with summary metrics.
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

  // Fetch price history whenever selection changes
  useEffect(() => {
    if (!selectedMandiId || !selectedCropId) return;

    async function loadHistory() {
      try {
        setLoading(true);
        const res = await apiClient.get(
          `/api/admin/price-history/${selectedMandiId}/${selectedCropId}?days=30`
        );
        setPriceHistory(res.data.data_points || []);
      } catch (err) {
        console.error("Failed to load price history:", err);
        setPriceHistory([]);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
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
          <h1 className="text-2xl font-bold tracking-tight text-white">{t("trendsTitle")}</h1>
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
              className="px-3.5 py-2 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] font-medium"
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
              className="px-3.5 py-2 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] font-medium"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
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
          <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">per quintal</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase">{t("kpiHigh")}</p>
          <p className="text-2xl font-bold mono text-white">₹{highestPrice.toLocaleString()}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">Peak transaction</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase">{t("kpiLow")}</p>
          <p className="text-2xl font-bold mono text-white">₹{lowestPrice.toLocaleString()}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">Floor transaction</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase">{t("kpiPerishability")}</p>
          <p className="text-2xl font-bold mono text-[var(--color-warning)]">{selectedCrop?.perishability_index || 0.5}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
            {selectedCrop?.perishability_index > 0.6 ? "High spoilage risk" : "Low spoilage risk"}
          </p>
        </div>
      </div>

      {/* Main Trend Chart Card */}
      <div className="surface-card p-6 border border-[var(--color-border-subtle)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white">
              {selectedMandi?.name} — {selectedCrop?.name} Price History
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Daily modal price movements over the last 30 trading sessions.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
              Modal Price Trend
            </span>
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center text-xs font-mono text-[var(--color-text-muted)]">
            Loading price series...
          </div>
        ) : (
          <TrendChart data={priceHistory} height={320} />
        )}
      </div>

      {/* Mandi Cost Configuration Profile */}
      {selectedMandi && (
        <div className="surface-card p-6 border border-[var(--color-border-subtle)] space-y-4">
          <h2 className="text-sm font-semibold text-white">Mandi Cost Parameters & Profile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[var(--color-surface-overlay)] space-y-0.5">
              <p className="text-[var(--color-text-muted)]">Mandi Commission</p>
              <p className="text-sm font-mono font-semibold text-white">
                {selectedMandi.cost_config?.commission_percentage || 6.0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface-overlay)] space-y-0.5">
              <p className="text-[var(--color-text-muted)]">Loading / Unloading</p>
              <p className="text-sm font-mono font-semibold text-white">
                ₹{(selectedMandi.cost_config?.loading_cost_per_quintal || 30) + (selectedMandi.cost_config?.unloading_cost_per_quintal || 20)}/q
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface-overlay)] space-y-0.5">
              <p className="text-[var(--color-text-muted)]">Transport Base Rate</p>
              <p className="text-sm font-mono font-semibold text-white">
                ₹{selectedMandi.cost_config?.transport_rate_per_km_per_quintal || 2.5}/km/q
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface-overlay)] space-y-0.5">
              <p className="text-[var(--color-text-muted)]">Location Coordinates</p>
              <p className="text-sm font-mono font-semibold text-white">
                {selectedMandi.latitude?.toFixed(2)}, {selectedMandi.longitude?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Warehouse & Cold Storage Finder Page with Dual Theme Support.
 * Maps WDRA-accredited warehouses and cold storages to prevent distress sales.
 */

import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { useLanguage } from "../hooks/useLanguage";

const POPULAR_LOCATIONS = [
  { name: "Jaipur, Rajasthan", lat: 26.9124, lon: 75.7873 },
  { name: "Kota, Rajasthan", lat: 25.2138, lon: 75.8648 },
  { name: "Vadodara, Gujarat", lat: 22.3072, lon: 73.1812 },
  { name: "Ahmedabad, Gujarat", lat: 23.0225, lon: 72.5714 },
  { name: "Nashik, Maharashtra", lat: 19.9975, lon: 73.7898 },
  { name: "Pune, Maharashtra", lat: 18.5204, lon: 73.8567 },
  { name: "Indore, Madhya Pradesh", lat: 22.7196, lon: 75.8577 },
  { name: "Delhi NCR", lat: 28.7165, lon: 77.1724 },
];

export default function WarehouseStoragePage() {
  const { t } = useLanguage();
  const [warehouses, setWarehouses] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState(POPULAR_LOCATIONS[0]);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [cropFilter, setCropFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Storage Cost vs Price Gain Calculator state
  const [calcCrop, setCalcCrop] = useState("Tomato");
  const [calcQuantity, setCalcQuantity] = useState(25);
  const [calcDays, setCalcDays] = useState(7);
  const [expectedGainPerQ, setExpectedGainPerQ] = useState(180);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `/api/linkages/warehouses?farmer_lat=${selectedOrigin.lat}&farmer_lon=${selectedOrigin.lon}`
      );
      setWarehouses(res.data || []);
    } catch (err) {
      console.error("Failed to load warehouses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, [selectedOrigin]);

  const filteredWarehouses = warehouses.filter((w) => {
    const matchesType = typeFilter === "ALL" || w.facility_type === typeFilter;
    const matchesCrop = cropFilter === "ALL" || w.suitable_crops.toLowerCase().includes(cropFilter.toLowerCase());
    return matchesType && matchesCrop;
  });

  // Calculate Net Benefit of Storing
  const storageRatePerDayPerQ = 35.0 / 30.0; // ~₹1.16/day/q
  const totalStorageCost = calcQuantity * storageRatePerDayPerQ * calcDays;
  const totalGrossGain = calcQuantity * expectedGainPerQ;
  const netStorageProfit = totalGrossGain - totalStorageCost;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in-up">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-600 border border-blue-500/30">
              WDRA Accredited & Cold Storage Network
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Zero Distress Sale
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            Nearby Storage & Cold Storage Linkages
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-3xl">
            Avoid selling during harvest gluts and price crashes. Store perishable and non-perishable produce in WDRA certified
            cold storages and dry warehouses to capture off-peak price surges.
          </p>
        </div>

        {/* Origin Selector */}
        <div className="p-3 rounded-xl border shrink-0" style={{ background: "var(--color-surface-overlay)", borderColor: "var(--color-border-subtle)" }}>
          <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
            Your Farm / Cluster Location
          </label>
          <select
            value={selectedOrigin.name}
            onChange={(e) => {
              const found = POPULAR_LOCATIONS.find((l) => l.name === e.target.value);
              if (found) setSelectedOrigin(found);
            }}
            className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none focus:border-[var(--color-accent)]"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                📍 {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Storage vs Immediate Sale Benefit Calculator */}
      <div
        className="rounded-2xl p-6 border shadow-xl relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--gradient-card-from) 0%, var(--color-surface-raised) 50%, var(--gradient-card2-from) 100%)",
          borderColor: "var(--gradient-card-border)"
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
              📊 Storage Return on Investment (ROI) Calculator
            </span>
            <h3 className="text-lg font-black text-[var(--color-text-primary)]">
              Should you Sell Today or Store for Next Week's Price Surge?
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              When market arrivals are heavy, mandi prices drop by ₹150–₹250/q. Storing produce in a nearby cold storage costs just ~₹1.16/quintal/day.
            </p>

            {/* Micro Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">Crop</label>
                <select
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold border mt-1"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Onion">Onion</option>
                  <option value="Wheat">Wheat</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">Quantity (q)</label>
                <input
                  type="number"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border mt-1"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">Storage Days</label>
                <input
                  type="number"
                  value={calcDays}
                  onChange={(e) => setCalcDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border mt-1"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">Expected Surge (₹/q)</label>
                <input
                  type="number"
                  value={expectedGainPerQ}
                  onChange={(e) => setExpectedGainPerQ(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border mt-1"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                />
              </div>
            </div>
          </div>

          {/* ROI Metric Card */}
          <div className="p-4 rounded-xl border shrink-0 text-right font-mono space-y-1.5 min-w-[240px]" style={{ background: "var(--color-surface-overlay)", borderColor: "var(--color-border-subtle)" }}>
            <span className="text-[10px] uppercase text-[var(--color-text-muted)] block">Storage Cost ({calcDays} Days)</span>
            <span className="text-sm font-bold text-red-500 block">-₹{Math.round(totalStorageCost).toLocaleString()}</span>

            <span className="text-[10px] uppercase text-[var(--color-text-muted)] block pt-1 border-t border-[var(--color-border-subtle)]">
              Gross Price Surge Gain
            </span>
            <span className="text-sm font-bold text-emerald-600 block">+₹{Math.round(totalGrossGain).toLocaleString()}</span>

            <span className="text-[10px] uppercase text-[var(--color-text-muted)] block pt-1 border-t border-[var(--color-border-subtle)]">
              Net Extra Profit in Pocket
            </span>
            <span className="text-xl font-black text-[var(--color-accent)] block">
              +₹{Math.round(netStorageProfit).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 surface-card p-4 border border-[var(--color-border-subtle)]">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mr-2">Facility Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
            >
              <option value="ALL">All Facilities</option>
              <option value="Cold Storage">Cold Storage (Temperature-Controlled)</option>
              <option value="Dry Warehouse">Dry Warehouse / Silo</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mr-2">Crop Compatibility:</label>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
            >
              <option value="ALL">All Crops</option>
              <option value="Tomato">Tomato</option>
              <option value="Potato">Potato</option>
              <option value="Onion">Onion</option>
              <option value="Wheat">Wheat</option>
              <option value="Banana">Banana</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-mono text-[var(--color-text-muted)]">
          Showing {filteredWarehouses.length} storage facilities sorted by road distance
        </span>
      </div>

      {/* Warehouses Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-[var(--color-text-muted)]">
          Calculating distance to nearby WDRA cold storages...
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <div className="py-16 text-center surface-card border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)]">
          No storage facilities found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWarehouses.map((w, idx) => (
            <div
              key={w.id}
              className={`surface-card p-5 border shadow-xl rounded-2xl flex flex-col justify-between space-y-4 hover:border-[var(--color-accent)]/50 transition-all ${
                idx === 0 ? "border-[var(--color-accent)]/40 ring-1 ring-[var(--color-accent)]/20" : "border-[var(--color-border-subtle)]"
              }`}
            >
              <div className="space-y-3">
                {/* Top Tags */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                    w.facility_type === "Cold Storage"
                      ? "bg-blue-500/15 text-blue-600 border border-blue-500/30"
                      : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                  }`}>
                    {w.facility_type} ({w.temperature_range})
                  </span>

                  {w.distance_km && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {w.distance_km} km away
                    </span>
                  )}
                </div>

                {/* Facility Name & WDRA Badge */}
                <div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                    {w.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    <span>📍 {w.district}, {w.state}</span>
                    {w.is_wdra_registered && (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-0.5">
                        ✓ WDRA Certified
                      </span>
                    )}
                  </div>
                </div>

                {/* Capacity & Pricing Box */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[var(--color-surface-overlay)] border border-[var(--color-border-subtle)] font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--color-text-muted)] block">Storage Rate</span>
                    <span className="text-sm font-bold text-emerald-600">₹{w.storage_rate_per_quintal_per_month}/q/mo</span>
                    <span className="text-[9px] text-[var(--color-text-muted)] block">~₹{(w.storage_rate_per_quintal_per_month / 30).toFixed(2)}/day</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-text-muted)] block">Available Space</span>
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{w.available_capacity_mt} MT</span>
                    <span className="text-[9px] text-[var(--color-text-muted)] block">Total: {w.capacity_mt} MT</span>
                  </div>
                </div>

                {/* Crops */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-mono">Suitable Crops:</span>
                  <p className="text-xs text-[var(--color-text-secondary)]">{w.suitable_crops}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
                <div className="text-[11px] font-mono">
                  <span className="text-[var(--color-text-muted)] block">Contact: {w.contact_person}</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{w.contact_phone}</span>
                </div>
                <a
                  href={`tel:${w.contact_phone}`}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm shrink-0"
                >
                  📞 Call & Reserve
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

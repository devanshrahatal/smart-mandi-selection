/**
 * Marketplace & Direct Buyer Linkages Page with Dual Theme Support.
 * Features:
 *  1. Searchable Verified Institutional Buyers Directory (GST verified, Payment terms, Rating).
 *  2. Farmer Harvest Lot Creator with Quality Grading (A/B/C) and Expected Price.
 *  3. Live Digital Bidding Table with 1-Click "Accept Offer & Lock Deal" workflow.
 */

import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { useLanguage } from "../hooks/useLanguage";

export default function MarketplacePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("buyers"); // "buyers" | "lots"

  // Buyers State
  const [buyers, setBuyers] = useState([]);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyerCropFilter, setBuyerCropFilter] = useState("ALL");
  const [buyerTypeFilter, setBuyerTypeFilter] = useState("ALL");
  const [buyersLoading, setBuyersLoading] = useState(true);

  // Lots & Offers State
  const [lots, setLots] = useState([]);
  const [lotsLoading, setLotsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  // Lot Form State
  const [formFarmerName, setFormFarmerName] = useState("");
  const [formPhone, setFormPhone] = useState("+91");
  const [formCrop, setFormCrop] = useState("Tomato");
  const [formQuantity, setFormQuantity] = useState(25);
  const [formGrade, setFormGrade] = useState("A");
  const [formExpectedPrice, setFormExpectedPrice] = useState(2400);
  const [formLocation, setFormLocation] = useState("Chomu, Jaipur, Rajasthan");
  const [formHarvestDate, setFormHarvestDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [submittingLot, setSubmittingLot] = useState(false);

  // Load Buyers
  const loadBuyers = async () => {
    try {
      setBuyersLoading(true);
      const res = await apiClient.get("/api/marketplace/buyers");
      setBuyers(res.data || []);
    } catch (err) {
      console.error("Failed to load buyers:", err);
    } finally {
      setBuyersLoading(false);
    }
  };

  // Load Lots & Offers
  const loadLots = async () => {
    try {
      setLotsLoading(true);
      const res = await apiClient.get("/api/marketplace/lots");
      setLots(res.data || []);
    } catch (err) {
      console.error("Failed to load lots:", err);
    } finally {
      setLotsLoading(false);
    }
  };

  useEffect(() => {
    loadBuyers();
    loadLots();
  }, []);

  // Handle Lot Submission
  const handleCreateLot = async (e) => {
    e.preventDefault();
    if (!formFarmerName || !formPhone || !formQuantity || !formExpectedPrice) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSubmittingLot(true);
      const payload = {
        farmer_name: formFarmerName,
        phone_number: formPhone,
        crop_name: formCrop,
        quantity_quintals: Number(formQuantity),
        quality_grade: formGrade,
        expected_price_per_q: Number(formExpectedPrice),
        origin_location: formLocation,
        harvest_date: formHarvestDate,
      };

      const res = await apiClient.post("/api/marketplace/lots", payload);
      setActionMessage({
        type: "success",
        text: `Harvest Lot ${res.data.lot_id} listed successfully! Verified buyers in your cluster are being notified.`,
      });
      setFormFarmerName("");
      loadLots();
      setActiveTab("lots");
    } catch (err) {
      console.error("Failed to create lot:", err);
      setActionMessage({ type: "error", text: "Failed to publish harvest lot. Try again." });
    } finally {
      setSubmittingLot(false);
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  // Handle Offer Action (Accept / Reject)
  const handleOfferAction = async (offerId, action) => {
    try {
      const res = await apiClient.patch(`/api/marketplace/offers/${offerId}/action`, { action });
      setActionMessage({
        type: action === "accept" ? "success" : "info",
        text: res.data.message || `Offer ${action}ed successfully!`,
      });
      loadLots();
    } catch (err) {
      console.error("Offer action failed:", err);
      setActionMessage({ type: "error", text: "Action failed. Please retry." });
    } finally {
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  // Filtered Buyers
  const filteredBuyers = buyers.filter((b) => {
    const matchesSearch =
      b.business_name.toLowerCase().includes(buyerSearch.toLowerCase()) ||
      b.district.toLowerCase().includes(buyerSearch.toLowerCase()) ||
      b.state.toLowerCase().includes(buyerSearch.toLowerCase());
    const matchesCrop =
      buyerCropFilter === "ALL" ||
      b.preferred_crops.toLowerCase().includes(buyerCropFilter.toLowerCase());
    const matchesType =
      buyerTypeFilter === "ALL" ||
      b.buyer_type.toLowerCase().includes(buyerTypeFilter.toLowerCase());
    return matchesSearch && matchesCrop && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in-up">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
              SIH 2026 • PS 26132 Market Linkage
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/10 text-blue-600 border border-blue-500/20">
              Verified Buyer Escrow
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            Direct Farmer-Buyer Marketplace & Bidding
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-3xl">
            Eliminate intermediary markups. Connect directly with institutional food processors, retail chains, and exporters.
            Aggregate lots, receive competitive digital offers, and lock guaranteed prices with verified payment terms.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl border shrink-0" style={{ background: "var(--color-surface-overlay)", borderColor: "var(--color-border-subtle)" }}>
          <button
            onClick={() => setActiveTab("buyers")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "buyers"
                ? "bg-[var(--color-accent)] text-white shadow-md"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            🏢 Verified Buyers Directory ({buyers.length})
          </button>
          <button
            onClick={() => setActiveTab("lots")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "lots"
                ? "bg-[var(--color-accent)] text-white shadow-md"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            🌾 Farmer Lots & Bids ({lots.length})
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold font-mono border flex items-center justify-between animate-fade-in ${
            actionMessage.type === "success"
              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
              : actionMessage.type === "error"
              ? "bg-red-500/15 text-red-500 border-red-500/30"
              : "bg-blue-500/15 text-blue-600 border-blue-500/30"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-base font-bold ml-4">×</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: VERIFIED BUYERS DIRECTORY                                         */}
      {/* ========================================================================= */}
      {activeTab === "buyers" && (
        <div className="space-y-6 animate-fade-in">
          {/* Search & Filter Toolbar */}
          <div className="surface-card p-5 border border-[var(--color-border-subtle)] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                  Search Buyer / District / State
                </label>
                <input
                  type="text"
                  placeholder="e.g. BigBasket, ITC, Mother Dairy, Jaipur..."
                  value={buyerSearch}
                  onChange={(e) => setBuyerSearch(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-medium transition-colors"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                  Crop Demand Filter
                </label>
                <select
                  value={buyerCropFilter}
                  onChange={(e) => setBuyerCropFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-medium transition-colors"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                >
                  <option value="ALL">All Crops</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Potato">Potato</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Banana">Banana</option>
                  <option value="Soybean">Soybean</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                  Buyer Type
                </label>
                <select
                  value={buyerTypeFilter}
                  onChange={(e) => setBuyerTypeFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-medium transition-colors"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                >
                  <option value="ALL">All Buyer Types</option>
                  <option value="Food Processor">Food Processors</option>
                  <option value="Retail Chain">Retail Chains / Quick-Commerce</option>
                  <option value="Institutional Buyer">Institutional Buyers</option>
                  <option value="Exporter">Exporters</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border-subtle)]">
              <span>Showing {filteredBuyers.length} verified procurement entities</span>
              <span className="text-emerald-600 font-bold">100% GST & KYC Verified</span>
            </div>
          </div>

          {/* Buyers Grid */}
          {buyersLoading ? (
            <div className="py-16 text-center text-xs font-mono text-[var(--color-text-muted)]">
              Loading verified institutional buyers...
            </div>
          ) : filteredBuyers.length === 0 ? (
            <div className="py-16 text-center surface-card border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)]">
              No buyers found matching your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBuyers.map((b) => (
                <div
                  key={b.id}
                  className="surface-card p-5 border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)]/50 transition-all shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {b.buyer_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded text-[11px] font-bold font-mono text-amber-600 border border-amber-500/20">
                        ★ {b.rating}
                      </div>
                    </div>

                    {/* Business Name */}
                    <div>
                      <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                        {b.business_name}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        📍 {b.district}, {b.state}
                      </p>
                    </div>

                    {/* GST & Verification */}
                    <div className="flex items-center justify-between text-[11px] font-mono p-2 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border-subtle)]">
                      <span className="text-[var(--color-text-muted)]">GST: {b.gst_number}</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        ✓ Verified
                      </span>
                    </div>

                    {/* Demands & Min Volume */}
                    <div className="space-y-1 text-xs">
                      <div className="text-[11px] text-[var(--color-text-muted)]">Crops Procured:</div>
                      <div className="flex flex-wrap gap-1">
                        {b.preferred_crops.split(",").map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]"
                          >
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--color-border-subtle)] space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--color-text-muted)]">Min Volume:</span>
                        <span className="font-bold text-[var(--color-text-primary)]">{b.min_volume_quintals} Quintals</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--color-text-muted)]">Payment Terms:</span>
                        <span className="font-semibold text-emerald-600">{b.payment_terms}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Direct Connect Action */}
                  <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
                    <div className="text-[11px]">
                      <span className="text-[var(--color-text-muted)] block">Contact: {b.contact_person}</span>
                      <span className="font-mono text-[var(--color-text-primary)] font-semibold">{b.contact_phone}</span>
                    </div>
                    <a
                      href={`https://wa.me/${b.contact_phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(b.business_name)},%20I%20am%20a%20farmer%20interested%20in%20direct%20crop%20supply.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm shrink-0"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FARMER LOT CREATOR & LIVE DIGITAL BIDS                            */}
      {/* ========================================================================= */}
      {activeTab === "lots" && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Form: List Your Harvest Lot */}
          <div className="surface-card p-6 border border-[var(--color-border-subtle)] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  🌾 List Your Harvest Lot for Corporate Bidding
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Publish your lot to receive digital purchase offers from verified buyers across nearby clusters.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Direct Farmgate Sourcing
              </span>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Farmer Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                    Farmer / FPO Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Patel"
                    value={formFarmerName}
                    onChange={(e) => setFormFarmerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-medium transition-colors"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-mono transition-colors"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                  />
                </div>

                {/* Crop */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                    Crop *
                  </label>
                  <select
                    value={formCrop}
                    onChange={(e) => setFormCrop(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-medium transition-colors"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Potato">Potato</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Banana">Banana</option>
                    <option value="Soybean">Soybean</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                    Quantity (Quintals) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-mono transition-colors"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                  />
                </div>

                {/* Quality Grade */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                    Quality Grade *
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-medium transition-colors"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                  >
                    <option value="A">Grade A (Premium / Export Quality)</option>
                    <option value="B">Grade B (Standard / Fair Average Quality)</option>
                    <option value="C">Grade C (Processing / Second Quality)</option>
                  </select>
                </div>

                {/* Expected Price */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                    Expected Price (₹/Quintal) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={formExpectedPrice}
                    onChange={(e) => setFormExpectedPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-mono font-bold text-emerald-600 transition-colors"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)" }}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                    Farm Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chomu, Jaipur"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-medium transition-colors"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                  />
                </div>

                {/* Harvest Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                    Harvest Ready Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formHarvestDate}
                    onChange={(e) => setFormHarvestDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-mono transition-colors"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingLot}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity shadow-lg"
                >
                  {submittingLot ? "Publishing..." : "Publish Harvest Lot for Buyer Bidding →"}
                </button>
              </div>
            </form>
          </div>

          {/* Active Lots & Live Offers List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Active Harvest Lots & Digital Bids ({lots.length})
              </h2>
              <button
                onClick={loadLots}
                className="text-xs font-mono text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                🔄 Refresh Bids
              </button>
            </div>

            {lotsLoading ? (
              <div className="py-12 text-center text-xs font-mono text-[var(--color-text-muted)]">
                Loading active harvest lots...
              </div>
            ) : lots.length === 0 ? (
              <div className="py-12 text-center surface-card border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)]">
                No active harvest lots listed yet. List your crop above to receive bids!
              </div>
            ) : (
              <div className="space-y-5">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="surface-card p-6 border border-[var(--color-border-subtle)] shadow-xl rounded-2xl space-y-4"
                  >
                    {/* Lot Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--color-border-subtle)" }}>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-[var(--color-surface-overlay)] border border-[var(--color-border-subtle)]">
                          {lot.lot_id}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                            {lot.crop_name} — {lot.quantity_quintals} Quintals (Grade {lot.quality_grade})
                          </h3>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            Farmer: <span className="font-semibold">{lot.farmer_name}</span> ({lot.phone_number}) • 📍 {lot.origin_location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <div className="text-right">
                          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">Expected Rate</span>
                          <span className="text-sm font-bold text-[var(--color-accent)]">₹{lot.expected_price_per_q}/q</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            lot.status === "Sold"
                              ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                              : lot.status === "Offer Received"
                              ? "bg-blue-500/20 text-blue-600 border border-blue-500/30 animate-pulse"
                              : "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                          }`}
                        >
                          {lot.status === "Sold" ? "✓ SOLD & LOCKED" : lot.status}
                        </span>
                      </div>
                    </div>

                    {/* Offers Section */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-mono">
                        Incoming Buyer Offers ({lot.offers.length})
                      </h4>

                      {lot.offers.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[var(--color-surface-overlay)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)] font-mono text-center">
                          Waiting for verified buyers to place bids on this lot...
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {lot.offers.map((off) => {
                            const isAccepted = off.status === "Accepted";
                            const isRejected = off.status === "Rejected";
                            const isPending = off.status === "Pending";
                            const totalDeal = off.offered_price_per_q * lot.quantity_quintals;

                            return (
                              <div
                                key={off.id}
                                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                                  isAccepted
                                    ? "bg-emerald-500/10 border-emerald-500/40"
                                    : isRejected
                                    ? "opacity-40 bg-[var(--color-surface-overlay)] border-[var(--color-border-subtle)]"
                                    : "bg-[var(--color-surface-overlay)] border-[var(--color-border-subtle)] hover:border-[var(--color-accent)]"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{off.offer_id}</span>
                                    <h5 className="text-sm font-bold text-[var(--color-text-primary)]">
                                      {off.buyer_name}
                                    </h5>
                                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                                      {off.buyer_type} • 🚚 {off.pickup_option}
                                    </p>
                                  </div>

                                  <div className="text-right font-mono">
                                    <span className="text-sm font-black text-emerald-600 block">
                                      ₹{off.offered_price_per_q}/q
                                    </span>
                                    <span className="text-[11px] text-[var(--color-text-muted)] block">
                                      Total: ₹{totalDeal.toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                {/* Offer Action Buttons */}
                                <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                                    Status: <strong className={isAccepted ? "text-emerald-600" : isRejected ? "text-red-500" : "text-blue-600"}>{off.status}</strong>
                                  </span>

                                  {isPending && lot.status !== "Sold" && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleOfferAction(off.id, "reject")}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                      >
                                        Decline
                                      </button>
                                      <button
                                        onClick={() => handleOfferAction(off.id, "accept")}
                                        className="px-3.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                      >
                                        Accept & Lock Deal ✓
                                      </button>
                                    </div>
                                  )}

                                  {isAccepted && (
                                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                                      Deal Confirmed & In Escrow
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

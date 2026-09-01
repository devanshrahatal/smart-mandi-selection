/**
 * Cost Configuration Page with Multi-Lingual Regional Support & Dual Theme.
 * Admin interface to update mandi commission %, loading/unloading rates, and transport coefficients.
 */

import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { useLanguage } from "../hooks/useLanguage";
import MandiTable from "../components/MandiTable";

export default function CostConfigPage() {
  const { t } = useLanguage();
  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMandi, setEditingMandi] = useState(null);
  const [formData, setFormData] = useState({
    commission_percentage: 6.0,
    loading_cost_per_quintal: 30.0,
    unloading_cost_per_quintal: 20.0,
    transport_rate_per_km_per_quintal: 2.5,
  });
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchMandis = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/admin/mandis");
      setMandis(res.data);
    } catch (err) {
      console.error("Failed to load mandis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandis();
  }, []);

  const handleEditClick = (mandi) => {
    const cfg = mandi.cost_config || {
      commission_percentage: 6.0,
      loading_cost_per_quintal: 30.0,
      unloading_cost_per_quintal: 20.0,
      transport_rate_per_km_per_quintal: 2.5,
    };
    setEditingMandi(mandi);
    setFormData({
      commission_percentage: cfg.commission_percentage,
      loading_cost_per_quintal: cfg.loading_cost_per_quintal,
      unloading_cost_per_quintal: cfg.unloading_cost_per_quintal,
      transport_rate_per_km_per_quintal: cfg.transport_rate_per_km_per_quintal,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingMandi) return;

    try {
      setSaving(true);
      await apiClient.put(`/api/admin/mandis/${editingMandi.id}/cost-config`, {
        commission_percentage: parseFloat(formData.commission_percentage),
        loading_cost_per_quintal: parseFloat(formData.loading_cost_per_quintal),
        unloading_cost_per_quintal: parseFloat(formData.unloading_cost_per_quintal),
        transport_rate_per_km_per_quintal: parseFloat(formData.transport_rate_per_km_per_quintal),
      });

      setToastMessage(`✓ Cost configuration for ${editingMandi.name} updated successfully!`);
      setTimeout(() => setToastMessage(""), 4000);
      setEditingMandi(null);
      await fetchMandis();
    } catch (err) {
      console.error("Failed to update cost config:", err);
      alert("Failed to save changes. Please check input values.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">{t("costTitle")}</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          {t("costSubtitle")}
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-mono animate-fade-in-up">
          {toastMessage}
        </div>
      )}

      {/* Mandis Table with Edit Buttons */}
      <MandiTable mandis={mandis} onEditCost={handleEditClick} />

      {/* Edit Modal Dialog */}
      {editingMandi && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up"
          style={{ background: "var(--modal-overlay)" }}
        >
          <div className="surface-card w-full max-w-lg p-6 border border-[var(--color-border)] shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">Edit Cost Parameters</h2>
                <p className="text-xs text-[var(--color-accent)] font-medium mt-0.5">
                  {editingMandi.name} ({editingMandi.district}, {editingMandi.state})
                </p>
              </div>
              <button
                onClick={() => setEditingMandi(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[var(--color-text-secondary)] mb-1">
                  Mandi Commission (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  required
                  value={formData.commission_percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, commission_percentage: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-[var(--color-accent)] font-mono"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                />
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  Deducted as a percentage of gross crop modal sale price (typical 3% to 8%).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--color-text-secondary)] mb-1">
                    Loading Cost (₹/q)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={formData.loading_cost_per_quintal}
                    onChange={(e) =>
                      setFormData({ ...formData, loading_cost_per_quintal: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-[var(--color-accent)] font-mono"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--color-text-secondary)] mb-1">
                    Unloading Cost (₹/q)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={formData.unloading_cost_per_quintal}
                    onChange={(e) =>
                      setFormData({ ...formData, unloading_cost_per_quintal: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-[var(--color-accent)] font-mono"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[var(--color-text-secondary)] mb-1">
                  Transport Rate (₹ / km / quintal)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  required
                  value={formData.transport_rate_per_km_per_quintal}
                  onChange={(e) =>
                    setFormData({ ...formData, transport_rate_per_km_per_quintal: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-[var(--color-accent)] font-mono"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                />
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  Multiplied by distance to calculate transit haulage costs.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingMandi(null)}
                  className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-overlay)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-semibold text-xs hover:brightness-110 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

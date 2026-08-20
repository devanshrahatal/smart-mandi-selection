/**
 * Filterable Mandi Table component.
 * Displays all active mandis with search filter and cost parameters.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";

export default function MandiTable({ mandis = [], onEditCost }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = mandis.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="surface-card overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder={t("searchMandiPlaceholder") || "Search by mandi, state, or district..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-xs text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
        <span className="text-xs text-[var(--color-text-muted)] font-mono self-end sm:self-center">
          {t("showingMandisCount")
            ? t("showingMandisCount").replace("{count}", filtered.length).replace("{total}", mandis.length)
            : `Showing ${filtered.length} of ${mandis.length} mandis`}
        </span>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
            <tr>
              <th className="py-3.5 px-4">{t("thMandiName")}</th>
              <th className="py-3.5 px-4">{t("thStateDistrict")}</th>
              <th className="py-3.5 px-4 text-right">{t("thCommissionPct")}</th>
              <th className="py-3.5 px-4 text-right">{t("thLoadingCost")}</th>
              <th className="py-3.5 px-4 text-right">{t("thTransportRate")}</th>
              <th className="py-3.5 px-4 text-center">{t("thActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {filtered.map((mandi) => {
              const cfg = mandi.cost_config || {
                commission_percentage: 6.0,
                loading_cost_per_quintal: 30.0,
                unloading_cost_per_quintal: 20.0,
                transport_rate_per_km_per_quintal: 2.5,
              };

              return (
                <tr
                  key={mandi.id}
                  className="hover:bg-[var(--color-surface-overlay)] transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white text-[13px]">{mandi.name}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
                      {mandi.latitude.toFixed(4)}, {mandi.longitude.toFixed(4)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[var(--color-text-secondary)]">{mandi.district}, </span>
                    <span className="text-white font-medium">{mandi.state}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-white">
                    {cfg.commission_percentage}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[var(--color-text-secondary)]">
                    ₹{cfg.loading_cost_per_quintal + cfg.unloading_cost_per_quintal}/q
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[var(--color-text-secondary)]">
                    ₹{cfg.transport_rate_per_km_per_quintal}/km/q
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/admin/mandis?mandi_id=${mandi.id}`}
                        className="px-2.5 py-1 rounded bg-[var(--color-surface-overlay)] hover:bg-[var(--color-border)] text-white text-[11px] font-medium transition-colors"
                      >
                        {t("priceTrendsTab") || "Trends"}
                      </Link>
                      {onEditCost && (
                        <button
                          onClick={() => onEditCost(mandi)}
                          className="px-2.5 py-1 rounded border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 text-[11px] font-medium transition-colors"
                        >
                          {t("editCostsBtn") || "Edit Costs"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

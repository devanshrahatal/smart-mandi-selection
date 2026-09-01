/**
 * Admin Dashboard Overview Page with Multi-Lingual Regional Support & Dual Theme.
 * Visualizes core platform analytics: query volume, top crops, top recommended mandis, and query stream.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/client";
import { useLanguage } from "../hooks/useLanguage";
import ExportButton from "../components/ExportButton";

export default function DashboardOverview() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/admin/overview");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load overview data:", err);
      setError("Failed to connect to backend analytics. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="text-sm font-mono text-[var(--color-text-secondary)] animate-pulse">
          Loading platform intelligence...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">{t("overviewTitle")}</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {t("overviewSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            className="px-3 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)] transition-colors"
          >
            {t("refreshBtn")}
          </button>
          <ExportButton />
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.metrics?.map((m) => (
          <div
            key={m.label}
            className="surface-card p-5 border border-[var(--color-border-subtle)] space-y-1"
          >
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              {t(m.label) || m.label}
            </p>
            <p className="text-2xl font-bold mono tracking-tight text-[var(--color-text-primary)]">
              {m.value}
            </p>
            {m.change && (
              <p className="text-[11px] text-[var(--color-accent)] flex items-center gap-1 font-mono">
                <span>↑</span>
                <span>{t(m.change) || m.change}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Platform Innovation Feature Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          to="/map"
          className="p-5 rounded-2xl border transition-all flex items-center justify-between group shadow-lg"
          style={{
            background: "linear-gradient(to right, var(--gradient-card-from), var(--gradient-card-to))",
            borderColor: "var(--gradient-card-border)"
          }}
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {t("mapBannerTag")}
            </span>
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mt-1 group-hover:text-[var(--color-accent)] transition-colors">
              {t("mapBannerTitle")}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {t("mapBannerDesc")}
            </p>
          </div>
        </Link>

        <Link
          to="/pooling"
          className="p-5 rounded-2xl border transition-all flex items-center justify-between group shadow-lg"
          style={{
            background: "linear-gradient(to right, var(--gradient-card2-from), var(--gradient-card2-to))",
            borderColor: "var(--gradient-card2-border)"
          }}
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {t("poolBannerTag")}
            </span>
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mt-1 group-hover:text-teal-600 transition-colors">
              {t("poolBannerTitle")}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {t("poolBannerDesc")}
            </p>
          </div>
        </Link>
      </div>

      {/* Analytics Grid: Top Crops & Top Mandis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Queried Crops */}
        <div className="surface-card p-6 border border-[var(--color-border-subtle)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("topCropsTitle")}</h2>
            <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{t("byVolume")}</span>
          </div>

          <div className="space-y-3">
            {data?.top_crops && data.top_crops.length > 0 ? (
              data.top_crops.map((c) => (
                <div key={c.crop_name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--color-text-primary)]">{t(c.crop_name) || c.crop_name}</span>
                    <span className="font-mono text-[var(--color-text-secondary)]">
                      {c.query_count} queries ({c.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--color-surface-overlay)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                      style={{ width: `${Math.max(c.percentage, 10)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[var(--color-text-muted)] py-4 text-center">
                {t("noQueriesYet")}
              </div>
            )}
          </div>
        </div>

        {/* Top Recommended Mandis */}
        <div className="surface-card p-6 border border-[var(--color-border-subtle)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("topMandisTitle")}</h2>
            <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{t("highestProfitRank")}</span>
          </div>

          <div className="space-y-2.5">
            {data?.top_mandis && data.top_mandis.length > 0 ? (
              data.top_mandis.map((m, idx) => (
                <div
                  key={m.mandi_name}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border-subtle)] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center font-mono font-bold text-[10px] text-[var(--color-accent)]">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--color-text-primary)]">{m.mandi_name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{m.state}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-[var(--color-accent)] font-medium">{m.recommendation_count} times #1</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Avg modal ₹{m.avg_modal_price}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[var(--color-text-muted)] py-4 text-center">
                {t("noRecsYet")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Farmer Query Stream */}
      <div className="surface-card p-6 border border-[var(--color-border-subtle)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{t("liveStreamTitle")}</h2>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
              {t("liveStreamSubtitle")}
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
            {t("totalQueriesLabel")}: {data?.total_queries || 0}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                <th className="pb-3 font-medium">{t("thPhone")}</th>
                <th className="pb-3 font-medium">{t("thCrop")}</th>
                <th className="pb-3 font-medium">{t("thQuantity")}</th>
                <th className="pb-3 font-medium">{t("thTimestamp")}</th>
                <th className="pb-3 font-medium">{t("thOutcome")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)] font-mono">
              {data?.recent_queries && data.recent_queries.length > 0 ? (
                data.recent_queries.map((q, idx) => (
                  <tr key={idx} className="hover:bg-[var(--color-surface-overlay)] transition-colors">
                    <td className="py-3 text-[var(--color-text-primary)]">{q.phone_number}</td>
                    <td className="py-3 text-[var(--color-accent)] font-semibold">{t(q.crop_name) || q.crop_name}</td>
                    <td className="py-3 text-[var(--color-text-secondary)]">{q.quantity_quintals} q</td>
                    <td className="py-3 text-[var(--color-text-muted)]">{q.created_at}</td>
                    <td className="py-3 text-[var(--color-text-secondary)] font-sans text-xs">{q.response_preview}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[var(--color-text-muted)] font-sans">
                    {t("noQueriesYet")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Root Application Router and Shell with Multi-Lingual Regional Support.
 * Configures routes for Public Landing Page and Protected Admin Dashboard.
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { useAuth } from "./hooks/useAuth";
import { useLanguage } from "./hooks/useLanguage";

import Navbar from "./components/Navbar";
import LanguageSelector from "./components/LanguageSelector";
import LoginPage from "./pages/LoginPage";
import DashboardOverview from "./pages/DashboardOverview";
import MandiDetailPage from "./pages/MandiDetailPage";
import CostConfigPage from "./pages/CostConfigPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] text-sm font-mono text-[var(--color-text-muted)] animate-pulse">
        Verifying admin session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}

// Public Landing Page with dynamic translations
function LandingPage() {
  const { t } = useLanguage();

  const MOCK_STATS = [
    { label: t("statMandis"), value: "2,847", change: "+124 this month" },
    { label: t("statFarmers"), value: "18.2K", change: "across 6 states" },
    { label: t("statSavings"), value: "₹312", change: "per quintal" },
    { label: t("statQueries"), value: "4,091", change: "via WhatsApp" },
  ];

  const FEATURES = [
    {
      title: t("f1Title"),
      description: t("f1Desc"),
      detail: "modal_price - transport - loading - commission - spoilage",
      icon: "₹",
    },
    {
      title: t("f2Title"),
      description: t("f2Desc"),
      detail: "distance_km × rate_per_km × quantity",
      icon: "◎",
    },
    {
      title: t("f3Title"),
      description: t("f3Desc"),
      detail: "perishability_index × travel_hours × base_rate",
      icon: "⏱",
    },
    {
      title: t("f4Title"),
      description: t("f4Desc"),
      detail: "crop → quantity → location → ranked results",
      icon: "↗",
    },
  ];

  const SAMPLE_COMPARISON = [
    {
      mandi: "Kota Krishi Mandi",
      price: 2450,
      transport: 484,
      commission: 110,
      loading: 40,
      spoilage: 79,
      net: 1737,
      rank: 1,
      best: true,
    },
    {
      mandi: "Azadpur, Delhi",
      price: 2901,
      transport: 927,
      commission: 218,
      loading: 70,
      spoilage: 119,
      net: 1568,
      rank: 2,
    },
    {
      mandi: "Vashi, Mumbai",
      price: 2820,
      transport: 2347,
      commission: 197,
      loading: 90,
      spoilage: 420,
      net: 0,
      rank: 3,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-[var(--color-border-subtle)] sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Smart Mandi Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white/5 p-0.5 border border-emerald-500/30 shadow-md shadow-emerald-500/10"
            />
            <div>
              <div className="flex items-center">
                <span className="font-bold text-base tracking-tight text-white">{t("appName")}</span>
                <span className="text-[10px] text-emerald-400 ml-1.5 font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  SIH 2026
                </span>
              </div>
              <p className="text-[9px] text-[var(--color-text-muted)] font-medium leading-none mt-0.5 hidden sm:block">
                Better Prices • Lower Costs • Higher Profits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
            <LanguageSelector />
            <Link
              to="/admin/dashboard"
              className="px-3.5 py-2 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-white font-medium hover:bg-[var(--color-border)] transition-colors"
            >
              {t("adminDashboardBtn")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 mb-6">
              <span className="status-dot bg-emerald-400" />
              {t("heroTag")}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5 text-white">
              {t("heroTitleLine1")}
              <br />
              <span className="text-emerald-400">{t("heroTitleLine2")}</span>
            </h1>

            <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl mb-8">
              {t("heroSubtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="px-5 py-2.5 rounded-lg bg-emerald-400 text-black font-semibold text-sm hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-500/20"
              >
                {t("openAdminBtn")}
              </Link>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-text-muted)] transition-colors"
              >
                {t("swaggerDocsBtn")}
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center animate-fade-in-up">
            <div className="relative p-3 rounded-3xl bg-gradient-to-b from-emerald-500/20 via-slate-800/40 to-slate-900/60 border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 group">
              <img
                src="/logo.jpg"
                alt="Smart Mandi Selection Brand"
                className="w-72 sm:w-80 rounded-2xl shadow-xl object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-slate-950/90 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 shadow-md whitespace-nowrap flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Smart Mandi Selection Platform
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-[var(--color-border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {MOCK_STATS.map((stat) => (
            <div key={stat.label} className="space-y-0.5">
              <p className="text-2xl font-bold mono tracking-tight text-white">{stat.value}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{stat.label}</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">{stat.change}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Demo */}
      <section id="comparison" className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-2 font-mono">
            {t("scenarioTag")}
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white">{t("scenarioTitle")}</h2>
          <p className="text-[var(--color-text-secondary)] mt-2 max-w-xl text-xs leading-relaxed">
            {t("scenarioDesc")}
          </p>
        </div>

        <div className="surface-card overflow-hidden border border-[var(--color-border-subtle)]">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                <tr>
                  <th className="py-3 px-4">{t("thMandi")}</th>
                  <th className="py-3 px-4 text-right">{t("thGrossPrice")}</th>
                  <th className="py-3 px-4 text-right">{t("thTransport")}</th>
                  <th className="py-3 px-4 text-right">{t("thCommission")}</th>
                  <th className="py-3 px-4 text-right">{t("thLoading")}</th>
                  <th className="py-3 px-4 text-right">{t("thSpoilage")}</th>
                  <th className="py-3 px-4 text-right font-bold">{t("thNetProfit")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {SAMPLE_COMPARISON.map((row) => (
                  <tr key={row.mandi} className={row.best ? "bg-[var(--color-accent-glow)]" : ""}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {row.best && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded">
                            {t("badgeBest")}
                          </span>
                        )}
                        <span className={`text-[13px] ${row.best ? "font-semibold text-white" : "text-[var(--color-text-secondary)]"}`}>
                          {row.mandi}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right mono font-medium text-white">₹{row.price}</td>
                    <td className="py-3.5 px-4 text-right mono text-[var(--color-text-muted)]">-₹{row.transport}</td>
                    <td className="py-3.5 px-4 text-right mono text-[var(--color-text-muted)]">-₹{row.commission}</td>
                    <td className="py-3.5 px-4 text-right mono text-[var(--color-text-muted)]">-₹{row.loading}</td>
                    <td className="py-3.5 px-4 text-right mono text-[var(--color-text-muted)]">-₹{row.spoilage}</td>
                    <td
                      className={`py-3.5 px-4 text-right mono font-bold text-sm ${
                        row.best ? "text-[var(--color-accent)]" : "text-white"
                      }`}
                    >
                      ₹{row.net}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div>
            <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-1 font-mono">
              {t("featuresTag")}
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-white">{t("featuresTitle")}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="surface-card-hover p-6 border border-[var(--color-border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white">{f.title}</h3>
                  <span className="text-lg text-[var(--color-text-muted)]">{f.icon}</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{f.description}</p>
                <code className="text-[11px] mono text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2.5 py-1 rounded-md border border-[var(--color-border-subtle)] inline-block">
                  {f.detail}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-subtle)] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{t("appName")}</span>
            <span>·</span>
            <span>SIH 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="hover:text-white transition-colors">
              {t("adminDashboardBtn")}
            </Link>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              {t("swaggerDocsBtn")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import ProfitMapPage from "./pages/ProfitMapPage";
import KisanPoolPage from "./pages/KisanPoolPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Public/Protected Feature Routes */}
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                      <ProfitMapPage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pooling"
                element={
                  <ProtectedRoute>
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                      <KisanPoolPage />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Admin Auth Route */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/mandis"
                element={
                  <ProtectedRoute>
                    <MandiDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/costs"
                element={
                  <ProtectedRoute>
                    <CostConfigPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

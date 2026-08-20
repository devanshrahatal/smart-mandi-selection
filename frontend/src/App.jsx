/**
 * Root Application Router and Shell with Multi-Lingual Regional Support.
 * Configures routes for Public Landing Page and Protected Admin Dashboard.
 */

import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { useAuth } from "./hooks/useAuth";
import { useLanguage } from "./hooks/useLanguage";

import Navbar from "./components/Navbar";
import LanguageSelector from "./components/LanguageSelector";
import VoiceDemoModal from "./components/VoiceDemoModal";
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
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/logo.jpg"
              alt="Smart Mandi Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain bg-white/5 p-0.5 border border-emerald-500/30 shadow-md shadow-emerald-500/10 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">{t("appName")}</span>
              </div>
              <p className="text-[9px] text-[var(--color-text-muted)] font-medium leading-none mt-0.5 hidden md:block truncate">
                Better Prices • Lower Costs • Higher Profits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs shrink-0">
            <LanguageSelector />
            <Link
              to="/admin/dashboard"
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-white font-semibold hover:bg-[var(--color-border)] transition-colors whitespace-nowrap text-xs flex items-center gap-1"
            >
              <span className="hidden sm:inline">{t("adminDashboardBtn")}</span>
              <span className="sm:hidden">Admin →</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-12 sm:pb-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Logo Brand Card — Appears 1st on Mobile, 2nd on Desktop */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center animate-fade-in-up">
            <div className="relative p-2.5 sm:p-3 rounded-3xl bg-gradient-to-b from-emerald-500/20 via-slate-800/40 to-slate-900/60 border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 group">
              <img
                src="/logo.jpg"
                alt="Smart Mandi Selection Brand"
                className="w-52 sm:w-72 lg:w-80 rounded-2xl shadow-xl object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 rounded-full bg-slate-950/90 border border-emerald-500/40 text-[10px] sm:text-[11px] font-bold text-emerald-300 shadow-md whitespace-nowrap flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Smart Mandi Selection Platform
              </div>
            </div>
          </div>

          {/* Text Content & Headings — Appears 2nd on Mobile, 1st on Desktop */}
          <div className="order-2 lg:order-1 lg:col-span-7 animate-fade-in-up flex flex-col items-center lg:items-start text-center lg:text-left mt-2 lg:mt-0">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4 text-white">
              {t("heroTitleLine1")}
              <br />
              <span className="text-emerald-400">{t("heroTitleLine2")}</span>
            </h1>

            <p className="text-sm sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl mb-7">
              {t("heroSubtitle")}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                to="/admin/dashboard"
                className="px-5 py-2.5 rounded-lg bg-emerald-400 text-black font-semibold text-sm hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-500/20"
              >
                {t("openAdminBtn")}
              </Link>
              <a
                href={`${import.meta.env.VITE_API_BASE_URL || "https://smart-mandi-selection.onrender.com"}/docs`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-text-muted)] transition-colors"
              >
                {t("swaggerDocsBtn")}
              </a>
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

      {/* WhatsApp Voice & Text Bot Live Sandbox Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/90 via-slate-900/95 to-teal-950/90 border border-emerald-500/40 shadow-2xl shadow-emerald-950/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Tag & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live WhatsApp AI Assistant
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Try the Zero-App Voice & Text Bot on WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Farmers don't need to install any app. Send a regional voice note, location pin, or crop name directly on WhatsApp for instant net profit recommendations.
              </p>
            </div>

            <button
              onClick={() => setVoiceModalOpen(true)}
              className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg whitespace-nowrap"
            >
              <span>🎙️</span>
              <span>Try In-Browser Simulator</span>
            </button>
          </div>

          {/* 3 Step Interactive Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Step 1: Open Bot Gateway
                </span>
                <h3 className="text-sm font-bold text-white mt-2">Connect to WhatsApp Sandbox</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Number: <b className="text-slate-200">+1 (415) 523-8886</b>
                </p>
              </div>
              <a
                href="https://wa.me/14155238886?text=join%20unusual-sea"
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span>💬</span>
                <span>Open in WhatsApp</span>
              </a>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  Step 2: Activate Session
                </span>
                <h3 className="text-sm font-bold text-white mt-2">Send Sandbox Join Code</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Send this one-time message to start:
                </p>
                <div className="mt-2 p-2 rounded-lg bg-slate-900 border border-emerald-500/30 flex items-center justify-between font-mono text-xs text-emerald-300">
                  <span>join unusual-sea</span>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText("join unusual-sea");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="mt-4 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>📋</span>
                <span>{copied ? "✓ Copied!" : "Copy Code"}</span>
              </button>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Step 3: Ask Any Query
                </span>
                <h3 className="text-sm font-bold text-white mt-2">Voice, Text or Location</h3>
                <div className="space-y-1.5 mt-2 text-[11px] font-mono text-slate-300">
                  <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 truncate">
                    🎙️ "भैया 20 क्विंटल टमाटर बेचना है"
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 truncate">
                    💬 "Tomato 20q from Jaipur"
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 truncate">
                    📍 Drop WhatsApp Location Pin
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-emerald-400/90 font-medium">
                ⚡ Instant net profit & voice note reply!
              </div>
            </div>
          </div>

          {/* Prototype Evaluation Disclaimer Banner */}
          <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">ℹ️ Prototype Notice:</span>
              <span>
                Connected to the official <b>Twilio WhatsApp Sandbox Gateway</b> for live interactive evaluation.
              </span>
            </div>
            <span className="text-slate-500 font-mono text-[10px] whitespace-nowrap">
              Gov shortcode deployment ready (+91)
            </span>
          </div>
        </div>
      </section>

      {/* Comparison Demo */}
      <section id="comparison" className="max-w-7xl mx-auto px-3 sm:px-6 py-12 sm:py-20 w-full overflow-hidden">
        <div className="mb-6 sm:mb-10">
          <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-widest mb-2 font-mono">
            {t("scenarioTag")}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{t("scenarioTitle")}</h2>
          <p className="text-[var(--color-text-secondary)] mt-2 max-w-xl text-xs leading-relaxed">
            {t("scenarioDesc")}
          </p>
        </div>

        <div className="surface-card overflow-hidden border border-[var(--color-border-subtle)] rounded-2xl w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left min-w-[580px]">
              <thead className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                <tr>
                  <th className="py-3 px-3 sm:px-4 whitespace-nowrap">{t("thMandi")}</th>
                  <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">{t("thGrossPrice")}</th>
                  <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">{t("thTransport")}</th>
                  <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">{t("thCommission")}</th>
                  <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">{t("thLoading")}</th>
                  <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">{t("thSpoilage")}</th>
                  <th className="py-3 px-3 sm:px-4 text-right font-bold whitespace-nowrap">{t("thNetProfit")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {SAMPLE_COMPARISON.map((row) => (
                  <tr key={row.mandi} className={row.best ? "bg-[var(--color-accent-glow)]" : ""}>
                    <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {row.best && (
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-1.5 py-0.5 rounded">
                            {t("badgeBest")}
                          </span>
                        )}
                        <span className={`text-xs sm:text-[13px] ${row.best ? "font-semibold text-white" : "text-[var(--color-text-secondary)]"}`}>
                          {row.mandi}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right mono font-medium text-white whitespace-nowrap">₹{row.price}</td>
                    <td className="py-3.5 px-3 sm:px-4 text-right mono text-[var(--color-text-muted)] whitespace-nowrap">-₹{row.transport}</td>
                    <td className="py-3.5 px-4 text-right mono text-[var(--color-text-muted)] whitespace-nowrap">-₹{row.commission}</td>
                    <td className="py-3.5 px-4 text-right mono text-[var(--color-text-muted)] whitespace-nowrap">-₹{row.loading}</td>
                    <td className="py-3.5 px-4 text-right mono text-[var(--color-text-muted)] whitespace-nowrap">-₹{row.spoilage}</td>
                    <td
                      className={`py-3.5 px-3 sm:px-4 text-right mono font-bold text-xs sm:text-sm whitespace-nowrap ${
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
            <span>Smart Agriculture Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="hover:text-white transition-colors">
              {t("adminDashboardBtn")}
            </Link>
            <a href={`${import.meta.env.VITE_API_BASE_URL || "https://smart-mandi-selection.onrender.com"}/docs`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              {t("swaggerDocsBtn")}
            </a>
          </div>
        </div>
      </footer>

      {/* Voice AI Demo Modal */}
      <VoiceDemoModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
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

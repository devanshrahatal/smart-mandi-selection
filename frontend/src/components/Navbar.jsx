/**
 * Admin Dashboard Top Navigation Bar with Language Selector & Voice AI Demo.
 * Clean, dark professional header with route tabs, multi-lingual toggle, and user session actions.
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import LanguageSelector from "./LanguageSelector";
import VoiceDemoModal from "./VoiceDemoModal";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navLinks = [
    { label: t("overviewTab"), path: "/admin/dashboard" },
    { label: t("mapTab") || "Profit Map", path: "/map" },
    { label: t("poolingTab") || "Kisan Pool", path: "/pooling" },
    { label: t("priceTrendsTab"), path: "/admin/mandis" },
    { label: t("costParamsTab"), path: "/admin/costs" },
  ];

  return (
    <>
      <header className="border-b border-[var(--color-border-subtle)] sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.jpg"
                alt="Smart Mandi Logo"
                className="w-10 h-10 rounded-xl object-contain bg-white/5 p-0.5 border border-emerald-500/30 transition-transform group-hover:scale-105 shadow-md shadow-emerald-500/10"
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
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Voice AI Demo, Language Switcher & Auth */}
          <div className="flex items-center gap-2.5 md:gap-3 text-sm">
            {/* Voice AI Demo Modal Trigger */}
            <button
              onClick={() => setVoiceModalOpen(true)}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="hidden sm:inline">Voice AI</span>
            </button>

            {/* Language Switcher */}
            <LanguageSelector />

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{user?.username || "Admin"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {t("signOutBtn")}
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors"
              >
                {t("signInBtn")}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Voice Demo Modal */}
      <VoiceDemoModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </>
  );
}

/**
 * Admin Dashboard Top Navigation Bar with Language Selector & Voice AI Demo.
 * Fully responsive header with mobile hamburger drawer, multi-lingual toggle, and route links.
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: t("overviewTab") || "Overview", path: "/admin/dashboard" },
    { label: t("mapTab") || "Profit Map", path: "/map" },
    { label: t("poolingTab") || "Kisan Pool", path: "/pooling" },
    { label: t("priceTrendsTab") || "Price Trends", path: "/admin/mandis" },
    { label: t("costParamsTab") || "Cost Params", path: "/admin/costs" },
  ];

  return (
    <>
      <header className="border-b border-[var(--color-border-subtle)] sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 md:gap-6">
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <img
                src="/logo.jpg"
                alt="Smart Mandi Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain bg-white/5 p-0.5 border border-emerald-500/30 transition-transform group-hover:scale-105 shadow-md shadow-emerald-500/10"
              />
              <div>
                <div className="flex items-center">
                  <span className="font-bold text-sm sm:text-base tracking-tight text-white">{t("appName")}</span>
                  <span className="text-[9px] sm:text-[10px] text-emerald-400 ml-1.5 font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    SIH 2026
                  </span>
                </div>
                <p className="text-[9px] text-[var(--color-text-muted)] font-medium leading-none mt-0.5 hidden sm:block">
                  Better Prices • Lower Costs • Higher Profits
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
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
          <div className="flex items-center gap-2 sm:gap-3 text-sm">
            {/* Voice AI Demo Trigger */}
            <button
              onClick={() => setVoiceModalOpen(true)}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
              title="Voice AI Simulator"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="hidden sm:inline">Voice AI</span>
            </button>

            {/* Language Switcher */}
            <LanguageSelector />

            {/* Desktop Auth */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{user?.username || "Admin"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {t("signOutBtn")}
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="hidden sm:inline-block px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors"
              >
                {t("signInBtn")}
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 px-4 py-3 space-y-1.5 shadow-2xl animate-fade-in-up">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-3 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  {t("signOutBtn")} ({user?.username || "Admin"})
                </button>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center block px-3 py-2 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors"
                >
                  {t("signInBtn")}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Voice Demo Modal */}
      <VoiceDemoModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </>
  );
}

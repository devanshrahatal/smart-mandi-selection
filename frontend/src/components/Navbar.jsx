/**
 * Admin Dashboard Top Navigation Bar with Language Selector & Voice AI Demo.
 * Fully responsive header with mobile hamburger drawer, multi-lingual toggle, and route links.
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
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
    { label: t("marketplaceTab") || "Marketplace", path: "/marketplace" },
    { label: t("storageTab") || "Storage & Cold Chain", path: "/storage" },
    { label: t("ordersTab") || "Escrow & Orders", path: "/orders" },
    { label: t("poolingTab") || "Kisan Pool", path: "/pooling" },
    { label: t("priceTrendsTab") || "Price Trends", path: "/admin/mandis" },
    { label: t("grievanceTab") || "Grievance Portal", path: "/grievance" },
  ];

  return (
    <>
      <header className="border-b border-[var(--color-border-subtle)] sticky top-0 z-50 backdrop-blur-md" style={{ background: "var(--nav-bg)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
              <img
                src="/logo.jpg"
                alt="Smart Mandi Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain p-0.5 border border-emerald-500/30 transition-transform group-hover:scale-105 shadow-md shadow-emerald-500/10 shrink-0"
                style={{ background: "var(--color-surface-overlay)" }}
              />
              <div className="min-w-0">
                <div className="flex items-center">
                  <span className="font-bold text-sm sm:text-base tracking-tight text-[var(--color-text-primary)] whitespace-nowrap">{t("appName")}</span>
                </div>
                <p className="text-[9px] text-[var(--color-text-muted)] font-medium leading-none mt-0.5 hidden md:block truncate">
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
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/30"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-overlay)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Theme, Voice AI Demo, Language Switcher & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-sm shrink-0">
            {/* Voice AI Demo Trigger */}
            <button
              onClick={() => setVoiceModalOpen(true)}
              className="bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30 text-xs font-semibold px-2 py-1.5 sm:px-3 rounded-lg transition-all flex items-center gap-1 shadow-sm"
              title="Voice AI Simulator"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="hidden md:inline">Voice AI</span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Switcher */}
            <LanguageSelector />

            {/* Desktop Auth */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{user?.username || "Admin"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-overlay)] transition-colors"
                >
                  {t("signOutBtn")}
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="hidden sm:inline-block px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold hover:brightness-110 transition-colors"
              >
                {t("signInBtn")}
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus:outline-none"
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
          <div className="lg:hidden border-t px-4 py-3 space-y-1.5 shadow-2xl animate-fade-in-up" style={{ background: "var(--mobile-menu-bg)", borderColor: "var(--mobile-menu-border)" }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/30"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-overlay)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t flex items-center justify-between" style={{ borderColor: "var(--color-border-subtle)" }}>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-3 py-2 rounded-lg border border-red-500/30 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  {t("signOutBtn")} ({user?.username || "Admin"})
                </button>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center block px-3 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold hover:brightness-110 transition-colors"
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

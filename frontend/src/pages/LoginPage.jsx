/**
 * Admin Login Page.
 * Themed login card with instant authentication feedback.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      const msg = err.response?.data?.detail || "Invalid username or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-[var(--color-surface)]">
      {/* Theme toggle in top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md surface-card p-8 border border-[var(--color-border)] shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <img
              src="/logo.jpg"
              alt="Smart Mandi Logo"
              className="w-16 h-16 rounded-2xl object-contain p-1 border border-emerald-500/30 mx-auto mb-3 shadow-xl shadow-emerald-500/20 transition-transform group-hover:scale-105"
              style={{ background: "var(--color-surface-overlay)" }}
            />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Smart Mandi Admin Portal</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">
            Sign in to manage mandis, cost parameters, and view price intelligence.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-500">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors font-mono"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors font-mono"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-semibold text-sm hover:brightness-110 transition-colors disabled:opacity-50 mt-2 shadow-lg"
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-6 pt-5 border-t border-[var(--color-border-subtle)] text-center text-xs text-[var(--color-text-muted)] space-y-1 font-mono">
          <p>Demo credentials pre-filled:</p>
          <p className="text-[var(--color-text-secondary)]">
            Username: <span className="text-[var(--color-text-primary)]">admin</span> | Password: <span className="text-[var(--color-text-primary)]">admin123</span>
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}

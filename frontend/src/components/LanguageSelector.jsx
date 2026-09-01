/**
 * Language Selector Dropdown component with Dual Theme.
 * Allows instant language switching between English, Hindi, Marathi, and Gujarati.
 */

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] transition-colors"
      >
        <span className="text-sm leading-none">{activeLang.icon}</span>
        <span className="hidden md:inline">{activeLang.label}</span>
        <span className="text-[9px] text-[var(--color-text-muted)]">▼</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl surface-card border border-[var(--color-border)] shadow-2xl py-1.5 z-50 animate-fade-in-up">
          <div className="px-3 py-1 text-[10px] uppercase font-mono text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)] mb-1">
            Select Language
          </div>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                language === l.code
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-overlay)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>{l.icon}</span>
                <span>{l.label}</span>
              </div>
              {language === l.code && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

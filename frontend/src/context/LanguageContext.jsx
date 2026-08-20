/**
 * Language Context Provider for multi-lingual state across the application.
 * Supports: 'en' (English), 'hi' (Hindi), 'mr' (Marathi), 'gu' (Gujarati).
 */

import React, { createContext, useState, useEffect } from "react";
import { TRANSLATIONS } from "../utils/i18n";

export const LanguageContext = createContext(null);

export const LANGUAGES = [
  { code: "en", label: "English", icon: "🌐" },
  { code: "hi", label: "हिंदी (Hindi)", icon: "🇮🇳" },
  { code: "mr", label: "मराठी (Marathi)", icon: "🌾" },
  { code: "gu", label: "ગુજરાતી (Gujarati)", icon: "🥜" },
];

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("smart_mandi_lang");
    if (saved && TRANSLATIONS[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setLanguageState(langCode);
      localStorage.setItem("smart_mandi_lang", langCode);
    }
  };

  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS["en"];
    return dict[key] || TRANSLATIONS["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

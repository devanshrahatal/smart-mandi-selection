import React, { useState, useRef } from "react";
import { apiClient } from "../api/client";
import { useLanguage } from "../hooks/useLanguage";

const SAMPLE_VOICE_QUERIES = [
  {
    lang: "hi",
    label: "हिंदी (Hindi)",
    transcript: "भैया 20 क्विंटल टमाटर बेचना है जयपुर से",
  },
  {
    lang: "mr",
    label: "मराठी (Marathi)",
    transcript: "नमस्कार, 15 क्विंटल कांदा नाशिकमधून विकायचा आहे",
  },
  {
    lang: "gu",
    label: "ગુજરાતી (Gujarati)",
    transcript: "નમસ્તે, 20 ક્વિન્ટલ ડુંગળી રાજકોટથી વેચવી છે",
  },
  {
    lang: "en",
    label: "English",
    transcript: "I want to sell 25 quintals of tomato from Jaipur",
  },
];

export default function VoiceDemoModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [selectedSample, setSelectedSample] = useState(SAMPLE_VOICE_QUERIES[0]);
  const [customText, setCustomText] = useState(SAMPLE_VOICE_QUERIES[0].transcript);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  if (!isOpen) return null;

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setCustomText(sample.transcript);
    setResult(null);
    setIsPlaying(false);
  };

  const resolveAudioUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("https://") || (url.startsWith("http://") && !url.includes("localhost"))) {
      return url;
    }
    const clean = url.replace(/^https?:\/\/[^\/]+/, "");
    const base = (apiClient.defaults.baseURL || "https://smart-mandi-selection.onrender.com").replace(/\/$/, "");
    return `${base}${clean.startsWith("/") ? "" : "/"}${clean}`;
  };

  const playBrowserVoice = (text, lang) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = { hi: "hi-IN", mr: "mr-IN", gu: "gu-IN", en: "en-IN" };
      utterance.lang = langMap[lang] || "hi-IN";
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlayVoiceNote = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback to client-side speech synthesis if MP3 is blocked by browser
        if (result?.spoken_summary) {
          playBrowserVoice(result.spoken_summary, result.language);
        }
      });
    } else if (result?.spoken_summary) {
      playBrowserVoice(result.spoken_summary, result.language);
    }
  };

  const handleRunVoiceSimulation = async () => {
    setLoading(true);
    setResult(null);
    setIsPlaying(false);
    try {
      const res = await apiClient.post("/api/whatsapp/simulate-voice", {
        phone_number: "+919876543210",
        spoken_query: customText,
        language: selectedSample.lang,
      });
      setResult(res.data);
    } catch (err) {
      console.error("Error in voice simulation:", err);
    } finally {
      setLoading(false);
    }
  };

  const audioUrl = result ? resolveAudioUrl(result.audio_url) : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md animate-fadeIn"
      style={{ background: "var(--modal-overlay)" }}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-8 shadow-2xl relative border"
        style={{ background: "var(--voice-modal-bg)", borderColor: "var(--voice-modal-border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: "var(--color-border-subtle)" }}>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-[var(--color-accent)] flex items-center justify-center border border-emerald-500/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </span>
            <div>
              <h2 className="text-xl font-black text-[var(--color-text-primary)]">
                Voice AI Speech-to-Speech Simulator
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Test regional speech queries & generated audio note replies (100% Free)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-overlay)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center justify-center text-lg transition-all"
          >
            ✕
          </button>
        </div>

        {/* Language Tabs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              1. Choose Regional Language Dialect:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SAMPLE_VOICE_QUERIES.map((sample) => (
                <button
                  key={sample.lang}
                  onClick={() => handleSelectSample(sample)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedSample.lang === sample.lang
                      ? "bg-[var(--color-accent)] text-white shadow-md border border-[var(--color-accent)]"
                      : "bg-[var(--voice-tab-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--voice-tab-border)]"
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Input Textarea */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              2. Spoken Voice Note Transcript:
            </label>
            <div className="relative">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                placeholder="Speak or type query..."
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunVoiceSimulation}
            disabled={loading}
            className="w-full bg-[var(--color-accent)] hover:brightness-110 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Synthesizing Regional Audio..." : "Process Voice Query & Generate Audio Reply"}
          </button>

          {/* Simulation Output Card */}
          {result && (
            <div
              className="mt-6 p-5 rounded-2xl space-y-4 animate-fadeIn border"
              style={{ background: "var(--voice-result-bg)", borderColor: "var(--voice-result-border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-accent)] uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Audio Reply Ready ({result.language?.toUpperCase()})
                </span>
                <button
                  onClick={handlePlayVoiceNote}
                  className="px-3 py-1 bg-[var(--color-accent)] hover:brightness-110 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1"
                >
                  <span>🔊</span>
                  <span>Play Aloud</span>
                </button>
              </div>

              {/* Native Audio Player */}
              {audioUrl && (
                <div
                  className="p-3 rounded-xl border flex flex-col gap-2"
                  style={{ background: "var(--voice-audio-bg)", borderColor: "var(--voice-audio-border)" }}
                >
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-semibold">
                    <span>🔊 WhatsApp Voice Note Stream:</span>
                    <a
                      href={audioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-accent)] hover:underline text-[11px]"
                    >
                      Download MP3 ↗
                    </a>
                  </div>
                  <audio
                    ref={audioRef}
                    controls
                    preload="auto"
                    src={audioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onEnded={() => setIsPlaying(false)}
                    onError={() => {
                      console.warn("Audio file streaming error, web speech fallback active.");
                    }}
                    className="w-full h-10 accent-emerald-500"
                  />
                </div>
              )}

              {/* Bot Spoken Message */}
              <div
                className="text-xs p-3 rounded-xl border"
                style={{
                  background: "var(--voice-audio-bg)",
                  borderColor: "var(--voice-audio-border)",
                  color: "var(--color-text-secondary)"
                }}
              >
                <span className="font-bold text-[var(--color-accent)] block mb-1">Spoken Summary:</span>
                <p className="leading-relaxed">{result.spoken_summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

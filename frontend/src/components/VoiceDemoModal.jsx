import React, { useState } from "react";
import axios from "axios";
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
  const { t, language } = useLanguage();
  const [selectedSample, setSelectedSample] = useState(SAMPLE_VOICE_QUERIES[0]);
  const [customText, setCustomText] = useState(SAMPLE_VOICE_QUERIES[0].transcript);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  if (!isOpen) return null;

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setCustomText(sample.transcript);
    setResult(null);
  };

  const handleRunVoiceSimulation = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("/api/whatsapp/simulate-voice", {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-100">
                Voice AI Speech-to-Speech Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Test regional speech queries & generated audio note replies (100% Free)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-lg transition-all"
          >
            ✕
          </button>
        </div>

        {/* Language Tabs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              1. Choose Regional Language Dialect:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SAMPLE_VOICE_QUERIES.map((sample) => (
                <button
                  key={sample.lang}
                  onClick={() => handleSelectSample(sample)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedSample.lang === sample.lang
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/40 border border-emerald-400"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Input Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              2. Spoken Voice Note Transcript:
            </label>
            <div className="relative">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Speak or type query..."
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunVoiceSimulation}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Synthesizing Regional Audio..." : "Process Voice Query & Generate Audio Reply"}
          </button>

          {/* Simulation Output Card */}
          {result && (
            <div className="mt-6 p-5 bg-slate-950/90 border border-emerald-500/40 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Audio Reply Ready ({result.language?.toUpperCase()})
                </span>
                <span className="text-[11px] text-slate-400">100% Free AI TTS Engine</span>
              </div>

              {/* Native Audio Player */}
              {result.audio_url && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span>🔊 WhatsApp Voice Note Stream:</span>
                    <a
                      href={result.audio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline text-[11px]"
                    >
                      Download MP3 ↗
                    </a>
                  </div>
                  <audio
                    controls
                    autoPlay
                    src={result.audio_url}
                    className="w-full h-10 accent-emerald-500"
                  />
                </div>
              )}

              {/* Bot Spoken Message */}
              <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-300 block mb-1">Spoken Summary:</span>
                <p className="leading-relaxed">{result.spoken_summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

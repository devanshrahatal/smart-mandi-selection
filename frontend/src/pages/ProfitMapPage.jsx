import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfitMap from "../components/ProfitMap";
import { useLanguage } from "../hooks/useLanguage";

const POPULAR_ORIGINS = [
  { name: "Jaipur, Rajasthan", lat: 26.9124, lon: 75.7873 },
  { name: "Nashik, Maharashtra", lat: 19.9975, lon: 73.7898 },
  { name: "Ahmedabad, Gujarat", lat: 23.0225, lon: 72.5714 },
  { name: "Indore, Madhya Pradesh", lat: 22.7196, lon: 75.8577 },
  { name: "Delhi NCR", lat: 28.7165, lon: 77.1724 },
];

export default function ProfitMapPage() {
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [quantity, setQuantity] = useState(20);
  const [selectedOrigin, setSelectedOrigin] = useState(POPULAR_ORIGINS[0]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Fetch crops
    axios.get("/api/crops").then((res) => {
      if (res.data && res.data.length > 0) {
        setCrops(res.data);
      }
    }).catch(() => {});
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const payload = {
        crop_name: selectedCrop,
        quantity_quintals: Number(quantity),
        farmer_latitude: selectedOrigin.lat,
        farmer_longitude: selectedOrigin.lon,
      };
      const res = await axios.post("/api/recommendations", payload);
      if (res.data && res.data.ranked_mandis) {
        const mapped = res.data.ranked_mandis.map((m) => ({
          mandi_id: m.mandi_id,
          mandi_name: m.mandi_name,
          district: m.district,
          state: m.state,
          latitude: m.mandi_id === 1 ? 25.2138 : m.mandi_id === 2 ? 19.076 : m.mandi_id === 3 ? 28.7165 : m.mandi_id === 4 ? 23.0225 : 22.7196,
          longitude: m.mandi_id === 1 ? 75.8648 : m.mandi_id === 2 ? 72.8777 : m.mandi_id === 3 ? 77.1724 : m.mandi_id === 4 ? 72.5714 : 75.8577,
          distance_km: m.distance_km,
          travel_time_hours: m.travel_time_hours,
          modal_price: m.modal_price,
          net_profit_per_quintal: m.cost_breakdown?.net_profit_per_quintal,
          deductions: m.cost_breakdown?.total_deductions_per_quintal,
          total_net_profit: m.cost_breakdown?.total_net_profit,
        }));
        setRecommendations(mapped);
      }
    } catch (err) {
      console.error("Error fetching map recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCrop, selectedOrigin, quantity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/60 backdrop-blur-md rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          {t.mapTitle || "Geospatial Mandi Net Profit Map"}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t.mapSubtitle || "Interactive road haulage and net take-home profit routing comparison."}
        </p>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.mapOriginLabel || "Farmer Origin"}
            </label>
            <select
              value={selectedOrigin.name}
              onChange={(e) => {
                const found = POPULAR_ORIGINS.find((o) => o.name === e.target.value);
                if (found) setSelectedOrigin(found);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {POPULAR_ORIGINS.map((orig) => (
                <option key={orig.name} value={orig.name}>
                  {orig.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.mapCropLabel || "Crop"}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {crops.length > 0 ? (
                crops.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.category})
                  </option>
                ))
              ) : (
                <>
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Potato">Potato</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Banana">Banana</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.mapQuantityLabel || "Quantity (Quintals)"}: <b className="text-emerald-400">{quantity}q</b>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Map View */}
      <ProfitMap
        farmerLocation={{
          lat: selectedOrigin.lat,
          lon: selectedOrigin.lon,
          name: selectedOrigin.name,
        }}
        mandis={recommendations}
        cropName={selectedCrop}
        quantity={quantity}
      />

      {/* Ranked Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((mandi, idx) => (
          <div
            key={mandi.mandi_id}
            className={`p-5 rounded-2xl border transition-all ${
              idx === 0
                ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-900/20"
                : "bg-slate-800/60 border-slate-700/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                idx === 0
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-900/80 text-slate-300"
              }`}>
                {idx === 0 ? "Rank #1 • Top Choice" : idx === 1 ? "Rank #2 • Option" : "Rank #3 • Option"}
              </span>
              <span className="text-xs text-slate-400">
                {mandi.distance_km?.toFixed(0)} km
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-100 mt-2">{mandi.mandi_name}</h3>
            <p className="text-xs text-slate-400">{mandi.district}, {mandi.state}</p>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase">Net Take-Home:</span>
                <div className="text-xl font-black text-emerald-400">
                  ₹{mandi.net_profit_per_quintal?.toLocaleString()}<span className="text-xs text-slate-400">/q</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase">Total Cash:</span>
                <div className="text-sm font-bold text-slate-200">
                  ₹{mandi.total_net_profit?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import ProfitMap from "../components/ProfitMap";
import { useLanguage } from "../hooks/useLanguage";

const POPULAR_ORIGINS = [
  { name: "Vadodara, Gujarat", lat: 22.3072, lon: 73.1812 },
  { name: "Surat, Gujarat", lat: 21.1702, lon: 72.8311 },
  { name: "Rajkot, Gujarat", lat: 22.3039, lon: 70.8022 },
  { name: "Ahmedabad, Gujarat", lat: 23.0225, lon: 72.5714 },
  { name: "Pune, Maharashtra", lat: 18.5204, lon: 73.8567 },
  { name: "Nashik, Maharashtra", lat: 19.9975, lon: 73.7898 },
  { name: "Jaipur, Rajasthan", lat: 26.9124, lon: 75.7873 },
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
    // Fetch crops via apiClient
    apiClient.get("/api/crops").then((res) => {
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
      const res = await apiClient.post("/api/recommendations", payload);
      const rawList = res.data?.recommendations || res.data?.ranked_mandis || [];
      if (rawList.length > 0) {
        const mapped = rawList.map((m) => ({
          mandi_id: m.mandi_id,
          mandi_name: m.mandi_name,
          district: m.district,
          state: m.state,
          latitude: m.latitude || (m.mandi_id === 1 ? 25.2138 : m.mandi_id === 2 ? 19.076 : m.mandi_id === 3 ? 28.7165 : m.mandi_id === 4 ? 23.0225 : 22.7196),
          longitude: m.longitude || (m.mandi_id === 1 ? 75.8648 : m.mandi_id === 2 ? 72.8777 : m.mandi_id === 3 ? 77.1724 : m.mandi_id === 4 ? 72.5714 : 75.8577),
          distance_km: m.distance_km,
          travel_time_hours: m.travel_time_hours,
          modal_price: m.cost_breakdown?.modal_price_per_quintal || m.modal_price || 0,
          net_profit_per_quintal: m.cost_breakdown?.net_profit_per_quintal || 0,
          deductions: m.cost_breakdown?.total_deductions_per_quintal || 0,
          total_net_profit: m.cost_breakdown?.total_net_profit || 0,
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/60 backdrop-blur-md rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          {t("mapTitle")}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t("mapSubtitle")}
        </p>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t("mapOriginLabel")}
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
              {t("mapCropLabel")}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {crops.length > 0 ? (
                crops.map((c) => (
                  <option key={c.id} value={c.name}>
                    {t(c.name) || c.name} ({c.category})
                  </option>
                ))
              ) : (
                <>
                  <option value="Tomato">{t("Tomato") || "Tomato"}</option>
                  <option value="Onion">{t("Onion") || "Onion"}</option>
                  <option value="Potato">{t("Potato") || "Potato"}</option>
                  <option value="Wheat">{t("Wheat") || "Wheat"}</option>
                  <option value="Banana">{t("Banana") || "Banana"}</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t("mapQuantityLabel")}: <b className="text-emerald-400 font-mono">{quantity}q</b>
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
        cropName={t(selectedCrop) || selectedCrop}
        quantity={quantity}
      />

      {/* Ranked Table */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 mb-4">
          {t("mapRankedHeading")} ({t(selectedCrop) || selectedCrop} — {quantity}q)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Mandi</th>
                <th className="py-3 px-4">Distance & Time</th>
                <th className="py-3 px-4 text-right">Modal Price</th>
                <th className="py-3 px-4 text-right">Deductions/q</th>
                <th className="py-3 px-4 text-right">Net Profit/q</th>
                <th className="py-3 px-4 text-right">Total Take-Home</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-mono">
              {recommendations.map((m, idx) => (
                <tr
                  key={m.mandi_id}
                  className={`hover:bg-slate-700/40 transition-colors ${
                    idx === 0 ? "bg-emerald-950/20 font-bold" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        idx === 0
                          ? "bg-emerald-500 text-slate-950"
                          : idx === 1
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      #{idx + 1} {idx === 0 ? "BEST" : ""}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-100">
                    {m.mandi_name}
                    <div className="text-[10px] text-slate-400 font-normal">{m.state}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {m.distance_km} km ({m.travel_time_hours}h)
                  </td>
                  <td className="py-3 px-4 text-right text-slate-200">₹{m.modal_price}</td>
                  <td className="py-3 px-4 text-right text-rose-400 font-medium">-₹{m.deductions}</td>
                  <td
                    className={`py-3 px-4 text-right text-sm font-black ${
                      idx === 0 ? "text-emerald-400" : "text-slate-200"
                    }`}
                  >
                    ₹{m.net_profit_per_quintal}
                  </td>
                  <td
                    className={`py-3 px-4 text-right text-sm font-black ${
                      idx === 0 ? "text-emerald-300" : "text-slate-100"
                    }`}
                  >
                    ₹{m.total_net_profit?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

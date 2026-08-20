import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Create custom SVG Leaflet icons for farmer and color-coded profit tiers
const createCustomIcon = (color, label = "", isGold = false) => {
  const pulseClass = isGold ? "ring-4 ring-amber-400 ring-offset-2 animate-pulse" : "";
  const html = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 13px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      border: 2px solid white;
    " class="${pulseClass}">
      ${label}
    </div>
  `;
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const farmerIcon = createCustomIcon("#2563eb", "●");
const goldMandiIcon = createCustomIcon("#16a34a", "1", true);
const silverMandiIcon = createCustomIcon("#0d9488", "2");
const bronzeMandiIcon = createCustomIcon("#ca8a04", "3");
const redMandiIcon = createCustomIcon("#dc2626", "•");

export default function ProfitMap({
  farmerLocation = { lat: 26.9124, lon: 75.7873, name: "Jaipur" },
  mandis = [],
  cropName = "Tomato",
  quantity = 20,
}) {
  const centerPosition = [farmerLocation.lat, farmerLocation.lon];

  return (
    <div className="w-full h-[540px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl relative">
      <MapContainer
        center={centerPosition}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ background: "#0f172a" }}
      >
        {/* OpenStreetMap / CartoDB dark-mode friendly free tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Farmer Location Pin */}
        <Marker position={[farmerLocation.lat, farmerLocation.lon]} icon={farmerIcon}>
          <Popup>
            <div className="p-2 text-slate-900">
              <h3 className="font-bold text-sm text-blue-700">Farmer Origin ({farmerLocation.name})</h3>
              <p className="text-xs text-slate-600 mt-1">
                Selling: <b>{quantity} Quintals</b> of <b>{cropName}</b>
              </p>
            </div>
          </Popup>
          <Tooltip permanent direction="top" offset={[0, -16]}>
            <span className="font-semibold text-xs text-blue-900">Farmer: {farmerLocation.name}</span>
          </Tooltip>
        </Marker>

        {/* Mandi Pins and Route Polylines */}
        {mandis.map((mandi, idx) => {
          const isBest = idx === 0;
          let icon = isBest ? goldMandiIcon : idx === 1 ? silverMandiIcon : idx === 2 ? bronzeMandiIcon : redMandiIcon;
          let routeColor = isBest ? "#16a34a" : idx === 1 ? "#0d9488" : idx === 2 ? "#ca8a04" : "#94a3b8";
          let routeDash = isBest ? "solid" : "6, 6";

          return (
            <React.Fragment key={mandi.mandi_id || idx}>
              {/* Route Line from Farmer to Mandi */}
              <Polyline
                positions={[
                  [farmerLocation.lat, farmerLocation.lon],
                  [mandi.latitude, mandi.longitude],
                ]}
                pathOptions={{
                  color: routeColor,
                  weight: isBest ? 4 : 2,
                  opacity: isBest ? 0.9 : 0.6,
                  dashArray: isBest ? undefined : "6, 6",
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-semibold text-slate-900">
                    Route to {mandi.mandi_name}: {mandi.distance_km?.toFixed(1)} km (~{mandi.travel_time_hours?.toFixed(1)} hrs)
                  </div>
                </Tooltip>
              </Polyline>

              {/* Mandi Pin */}
              <Marker position={[mandi.latitude, mandi.longitude]} icon={icon}>
                <Popup>
                  <div className="p-3 text-slate-900 min-w-[200px]">
                    <div className="flex items-center justify-between gap-2 border-b pb-1.5 mb-2">
                      <span className="font-bold text-sm text-slate-900">
                        #{idx + 1} {mandi.mandi_name}
                      </span>
                      {isBest && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                          BEST PROFIT
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Net Take-Home:</span>
                        <b className="text-emerald-700">₹{mandi.net_profit_per_quintal?.toLocaleString()}/q</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Modal Price:</span>
                        <span>₹{mandi.modal_price?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Deductions:</span>
                        <span className="text-rose-600">-₹{mandi.deductions?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Distance:</span>
                        <span>{mandi.distance_km?.toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl z-[1000] text-xs text-slate-200">
        <h4 className="font-bold text-slate-100 mb-1.5">Profit Route Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-300"></span>
            <span>#1 Max Net Profit (Optimal)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500 inline-block"></span>
            <span>#2 Moderate Net Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>#3 Lower Net Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
            <span>Farmer Origin Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}

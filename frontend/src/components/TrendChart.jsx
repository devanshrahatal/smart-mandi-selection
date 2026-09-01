/**
 * Interactive Price Trend & ML Forecast Chart component using Recharts.
 * Visualizes 30-day historical modal prices and Scikit-Learn 7-day predicted price trajectory.
 */

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isForecast = data.is_forecast;

    return (
      <div className="surface-card p-3 border border-[var(--color-border)] shadow-2xl text-xs space-y-1">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-1 mb-1 font-mono">
          <span className="text-[var(--color-text-muted)]">{data.displayDate || label}</span>
          {isForecast && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/20 text-teal-600 border border-teal-500/30">
              ML PREDICTION
            </span>
          )}
        </div>

        {isForecast ? (
          <>
            <p className="text-teal-600 font-semibold font-mono text-sm">
              Predicted: ₹{data.predicted_price?.toLocaleString()}
            </p>
            <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--color-text-muted)] font-mono">
              <span>95% Bounds:</span>
              <span>₹{data.lower_bound_95} – ₹{data.upper_bound_95}</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-[var(--color-accent)] font-semibold font-mono text-sm">
              Modal Price: ₹{data.modal_price?.toLocaleString()}
            </p>
            {(data.min_price || data.max_price) && (
              <div className="flex items-center gap-3 text-[var(--color-text-secondary)] font-mono pt-1">
                <span>Min: ₹{data.min_price?.toLocaleString()}</span>
                <span>Max: ₹{data.max_price?.toLocaleString()}</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data = [], forecastData = [], height = 320 }) {
  if ((!data || data.length === 0) && (!forecastData || forecastData.length === 0)) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center surface-card text-[var(--color-text-muted)] text-sm"
      >
        No historical price records found.
      </div>
    );
  }

  // Format historical points
  const formattedHistorical = (data || []).map((d) => {
    const dateObj = new Date(d.date);
    const dateLabel = isNaN(dateObj)
      ? d.date
      : dateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    return {
      ...d,
      displayDate: dateLabel,
      is_forecast: false,
    };
  });

  // Format forecast points
  const formattedForecast = (forecastData || []).map((f) => {
    return {
      date: f.date,
      displayDate: f.display_date || f.date,
      modal_price: null, // Keep historical blank on future dates
      predicted_price: f.predicted_price,
      lower_bound_95: f.lower_bound_95,
      upper_bound_95: f.upper_bound_95,
      is_forecast: true,
    };
  });

  // Combine series
  const combinedData = [...formattedHistorical, ...formattedForecast];

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={combinedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-subtle)"
            vertical={false}
          />

          <XAxis
            dataKey="displayDate"
            stroke="var(--color-text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border-subtle)" }}
            minTickGap={15}
          />

          <YAxis
            stroke="var(--color-text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val}`}
            domain={["auto", "auto"]}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Historical Price Curve */}
          <Area
            type="monotone"
            dataKey="modal_price"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#priceGradient)"
            name="Actual Price"
            connectNulls={false}
          />

          {/* ML Predicted Price Curve (Dashed) */}
          <Area
            type="monotone"
            dataKey="predicted_price"
            stroke="#0d9488"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#forecastGradient)"
            name="ML 7-Day Forecast"
            connectNulls={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

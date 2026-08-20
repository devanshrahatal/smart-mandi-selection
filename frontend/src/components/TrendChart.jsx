/**
 * Interactive Price Trend Chart component using Recharts.
 * Visualizes 30-day historical modal price, min price, and max price boundaries.
 */

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--color-surface-overlay)] border border-[var(--color-border)] p-3 rounded-xl shadow-2xl text-xs space-y-1">
        <p className="text-[var(--color-text-muted)] font-mono">{label}</p>
        <p className="text-[var(--color-accent)] font-semibold font-mono text-sm">
          Modal: ₹{data.modal_price?.toLocaleString()}
        </p>
        <div className="flex items-center gap-3 text-[var(--color-text-secondary)] font-mono pt-1 border-t border-[var(--color-border-subtle)]">
          <span>Min: ₹{data.min_price?.toLocaleString()}</span>
          <span>Max: ₹{data.max_price?.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data = [], height = 300 }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center surface-card text-[var(--color-text-muted)] text-sm"
      >
        No historical price records found.
      </div>
    );
  }

  // Format dates for X-axis (e.g. "Aug 12")
  const formattedData = data.map((d) => {
    const dateObj = new Date(d.date);
    const dateLabel = isNaN(dateObj)
      ? d.date
      : dateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    return {
      ...d,
      displayDate: dateLabel,
    };
  });

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.0} />
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
            minTickGap={20}
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

          <Area
            type="monotone"
            dataKey="modal_price"
            stroke="var(--color-accent)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#priceGradient)"
            name="Modal Price"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

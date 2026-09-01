/**
 * CSV Export Button component with Dual Theme.
 * Calls /api/admin/export-report and triggers browser file download.
 */

import React, { useState } from "react";
import { apiClient } from "../api/client";

export default function ExportButton() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    try {
      setDownloading(true);
      const response = await apiClient.get("/api/admin/export-report", {
        responseType: "blob",
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `smart_mandi_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={downloading}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
    >
      <span>📥</span>
      <span>{downloading ? "Generating CSV..." : "Export Report (CSV)"}</span>
    </button>
  );
}

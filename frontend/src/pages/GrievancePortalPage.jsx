/**
 * Dispute & Grievance Redressal Portal Page with Dual Theme Support.
 * Enables farmers to file actionable tickets for weight discrepancies, excessive commission, or payment delays.
 */

import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { useLanguage } from "../hooks/useLanguage";

export default function GrievancePortalPage() {
  const { t } = useLanguage();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  // Form State
  const [complainantName, setComplainantName] = useState("");
  const [complainantPhone, setComplainantPhone] = useState("+91");
  const [targetEntity, setTargetEntity] = useState("Azadpur Mandi Weigher #4");
  const [category, setCategory] = useState("Weight Discrepancy");
  const [severity, setSeverity] = useState("HIGH");
  const [amount, setAmount] = useState("₹5,000");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/linkages/disputes");
      setDisputes(res.data || []);
    } catch (err) {
      console.error("Failed to load disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleFileDispute = async (e) => {
    e.preventDefault();
    if (!complainantName || !complainantPhone || !description) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        complainant_name: complainantName,
        complainant_phone: complainantPhone,
        target_entity_name: targetEntity,
        dispute_category: category,
        severity,
        description,
        disputed_amount: amount,
      };

      const res = await apiClient.post("/api/linkages/disputes", payload);
      setActionMessage({
        type: "success",
        text: `Grievance Ticket #${res.data.ticket_id} registered! APMC Grievance Officer & Buyer Escalation Desk assigned.`,
      });
      setComplainantName("");
      setDescription("");
      loadDisputes();
    } catch (err) {
      console.error("Failed to file dispute:", err);
      setActionMessage({ type: "error", text: "Failed to file ticket. Please try again." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in-up">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/30">
              Farmer Redressal & APMC Ombudsman
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Guaranteed SLA (48 Hours)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            Farmer Dispute & Grievance Redressal
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-3xl">
            Protecting farmers against unauthorized commission deductions, weighbridge tampering, quality downgrade penalties,
            and delayed payments. File actionable complaints with direct escalation to APMC administrators.
          </p>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold font-mono border flex items-center justify-between animate-fade-in ${
            actionMessage.type === "success"
              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
              : "bg-red-500/15 text-red-500 border-red-500/30"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-base font-bold ml-4">×</button>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: File Grievance Ticket */}
        <div className="lg:col-span-5 surface-card p-6 border border-[var(--color-border-subtle)] shadow-xl rounded-2xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              📝 File a New Grievance Ticket
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Submit your dispute details for immediate review by the APMC Arbitration Desk.
            </p>
          </div>

          <form onSubmit={handleFileDispute} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ram Lal Meena"
                value={complainantName}
                onChange={(e) => setComplainantName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-medium"
                style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={complainantPhone}
                onChange={(e) => setComplainantPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] font-mono"
                style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                Mandi Name / Buyer Entity Involved *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Azadpur Mandi Weigher #4 or Buyer Name"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)]"
                style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                  Dispute Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border font-medium"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
                >
                  <option value="Weight Discrepancy">Weight Discrepancy</option>
                  <option value="Excessive Commission">Excessive Commission</option>
                  <option value="Quality Downgrade">Quality Downgrade Dispute</option>
                  <option value="Delayed Payment">Delayed Payment (48+ hrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                  Disputed Amount (₹)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹5,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border font-mono font-bold text-red-500"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase mb-1">
                Detailed Incident Description *
              </label>
              <textarea
                rows="3"
                required
                placeholder="Explain what occurred, vehicle plate number, weigh slip details, or unauthorized deductions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-[var(--color-accent)] leading-relaxed"
                style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg"
            >
              {submitting ? "Registering..." : "Submit Grievance Ticket for Investigation →"}
            </button>
          </form>
        </div>

        {/* Right Column: Active Disputes & Resolution Tracker */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              Active Grievance Tickets ({disputes.length})
            </h2>
            <button
              onClick={loadDisputes}
              className="text-xs font-mono text-[var(--color-accent)] hover:underline flex items-center gap-1"
            >
              🔄 Refresh Status
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-[var(--color-text-muted)]">
              Loading grievance registry...
            </div>
          ) : disputes.length === 0 ? (
            <div className="py-16 text-center surface-card border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)]">
              No disputes logged in this cluster.
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map((d) => {
                const isResolved = d.status === "RESOLVED";
                const isInvestigating = d.status === "INVESTIGATING";

                return (
                  <div
                    key={d.id}
                    className={`surface-card p-5 border shadow-xl rounded-2xl space-y-3 transition-all ${
                      isResolved
                        ? "border-emerald-500/30"
                        : isInvestigating
                        ? "border-amber-500/30 ring-1 ring-amber-500/20"
                        : "border-[var(--color-border-subtle)]"
                    }`}
                  >
                    {/* Ticket Top */}
                    <div className="flex items-start justify-between gap-2 border-b pb-2.5" style={{ borderColor: "var(--color-border-subtle)" }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[var(--color-surface-overlay)] border border-[var(--color-border-subtle)]">
                            {d.ticket_id}
                          </span>
                          <span className="text-xs font-bold text-[var(--color-text-primary)]">
                            {d.dispute_category}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          Filed by <span className="font-semibold">{d.complainant_name}</span> ({d.complainant_phone}) against <strong className="text-[var(--color-text-primary)]">{d.target_entity_name}</strong>
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isResolved
                            ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                            : isInvestigating
                            ? "bg-amber-500/15 text-amber-600 border border-amber-500/30 animate-pulse"
                            : "bg-red-500/15 text-red-500 border border-red-500/30"
                        }`}>
                          {d.status}
                        </span>
                        {d.disputed_amount && (
                          <span className="text-xs font-bold text-red-500 block mt-1">
                            {d.disputed_amount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      "{d.description}"
                    </p>

                    {/* Resolution Summary Box if resolved */}
                    {isResolved && d.resolution_summary && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono space-y-1">
                        <span className="font-bold text-emerald-600 block">✓ Official Resolution Summary:</span>
                        <p className="text-[var(--color-text-primary)] font-sans text-xs">{d.resolution_summary}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

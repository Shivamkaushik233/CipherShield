import React from "react";

export function riskTier(score) {
  if (score >= 85)
    return { label: "Critical", bg: "bg-critical/15", text: "text-critical", border: "border-critical/40", glow: "shadow-[0_0_14px_-3px_#FF2D95]" };
  if (score >= 60)
    return { label: "High", bg: "bg-danger/15", text: "text-danger", border: "border-danger/40", glow: "shadow-[0_0_12px_-3px_#FF5470]" };
  if (score >= 40)
    return { label: "Medium", bg: "bg-warning/15", text: "text-warning", border: "border-warning/40", glow: "" };
  return { label: "Low", bg: "bg-safe/15", text: "text-safe", border: "border-safe/40", glow: "" };
}

export default function RiskBadge({ score, showScore = true }) {
  const tier = riskTier(score);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-shadow ${tier.bg} ${tier.text} ${tier.border} ${tier.glow}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${score >= 60 ? "animate-pulse" : ""}`} />
      {tier.label}
      {showScore && <span className="font-mono opacity-80">· {Math.round(score)}%</span>}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    approved: { text: "text-safe", bg: "bg-safe/15", border: "border-safe/40", label: "Approved" },
    blocked: {
      text: "text-danger",
      bg: "bg-danger/15",
      border: "border-danger/40",
      label: "Blocked",
      glow: "shadow-[0_0_14px_-3px_#FF5470]",
    },
    pending_review: { text: "text-warning", bg: "bg-warning/15", border: "border-warning/40", label: "Pending Review" },
    open: { text: "text-danger", bg: "bg-danger/15", border: "border-danger/40", label: "Open" },
    investigating: { text: "text-warning", bg: "bg-warning/15", border: "border-warning/40", label: "Investigating" },
    resolved: { text: "text-safe", bg: "bg-safe/15", border: "border-safe/40", label: "Resolved" },
    closed: { text: "text-muted", bg: "bg-white/5", border: "border-border", label: "Closed" },
    reopened: { text: "text-accent2", bg: "bg-accent2/15", border: "border-accent2/40", label: "Reopened" },
  };
  const s = map[status] || map.closed;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text} ${s.border} ${s.glow || ""}`}>
      {s.label}
    </span>
  );
}

import React from "react";

const ACCENT_CLASSES = {
  accent: "bg-accent/15 text-accent",
  danger: "bg-danger/15 text-danger",
  warning: "bg-warning/15 text-warning",
  safe: "bg-safe/15 text-safe",
  critical: "bg-critical/15 text-critical",
};

export default function KpiCard({ label, value, icon: Icon, accent = "accent", sub }) {
  const iconClasses = ACCENT_CLASSES[accent] || ACCENT_CLASSES.accent;
  return (
    <div className="panel p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
        {Icon && (
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconClasses}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="font-mono text-3xl font-semibold text-ink">{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}

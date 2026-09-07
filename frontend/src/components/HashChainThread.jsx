import React from "react";
import { Check, ShieldAlert } from "lucide-react";

// The recurring visual motif of the app: every provable record (a login
// event, an audit action, a block) is drawn as a node chained to the one
// before it via its hash - literally illustrating "each entry commits to
// the one before it," which is the actual property the backend enforces.
export default function HashChainThread({ items }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-accent via-accent2 to-accent3 opacity-40" />
      <div className="flex flex-col gap-5">
        {items.map((item, i) => (
          <div key={i} className="relative">
            <div
              className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 ${
                item.broken
                  ? "border-danger bg-danger/20 shadow-[0_0_10px_-2px_#FF5470]"
                  : "border-accent2 bg-accent2/20 shadow-[0_0_10px_-2px_#EC4899]"
              }`}
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-ink font-medium">{item.title}</div>
                {item.subtitle && <div className="text-xs text-muted mt-0.5">{item.subtitle}</div>}
                {item.hash && (
                  <div className="mt-1 font-mono text-[11px] brand-text">
                    0x{item.hash.slice(0, 8)}…{item.hash.slice(-6)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.time && <span className="text-xs text-muted font-mono">{item.time}</span>}
                {item.verified !== undefined &&
                  (item.verified ? (
                    <Check size={14} className="text-safe" />
                  ) : (
                    <ShieldAlert size={14} className="text-danger" />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  FolderKanban,
  ShieldCheck,
  FlaskConical,
  ScrollText,
  Blocks,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo.jsx";

const NAV = {
  customer: [
    { to: "/portal", label: "Transaction Portal", icon: Send },
    { to: "/security", label: "Security Center", icon: ShieldCheck },
    { to: "/simulator", label: "Fraud Simulator", icon: FlaskConical },
  ],
  analyst: [
    { to: "/dashboard", label: "Analyst Dashboard", icon: LayoutDashboard },
    { to: "/cases", label: "Case Management", icon: FolderKanban },
    { to: "/security", label: "Security Center", icon: ShieldCheck },
    { to: "/simulator", label: "Fraud Simulator", icon: FlaskConical },
  ],
  admin: [
    { to: "/dashboard", label: "Analyst Dashboard", icon: LayoutDashboard },
    { to: "/cases", label: "Case Management", icon: FolderKanban },
    { to: "/security", label: "Security Center", icon: ShieldCheck },
    { to: "/simulator", label: "Fraud Simulator", icon: FlaskConical },
    { to: "/audit", label: "Audit & Blockchain", icon: ScrollText },
  ],
  auditor: [
    { to: "/dashboard", label: "Analyst Dashboard", icon: LayoutDashboard },
    { to: "/cases", label: "Case Management", icon: FolderKanban },
    { to: "/audit", label: "Audit & Blockchain", icon: ScrollText },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = NAV[user?.role] || [];
  const homePath = user?.role === "customer" ? "/portal" : "/dashboard";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-border bg-surface/95 md:bg-surface/80 backdrop-blur-md flex flex-col transition-transform duration-300 md:static md:translate-x-0 md:w-60 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-16 flex items-center justify-between gap-2.5 px-5 border-b border-border">
        <Link to={homePath} className="flex items-center gap-2.5" onClick={onClose}>
          <Logo size={26} />
          <span className="font-display font-bold tracking-wide text-[15px] brand-text">CIPHERSHIELD</span>
        </Link>
        <button className="md:hidden text-muted hover:text-ink" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                isActive
                  ? "text-ink bg-gradient-to-r from-accent/20 via-accent2/10 to-transparent"
                  : "text-muted hover:text-ink hover:bg-white/5 hover:translate-x-0.5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-gradient" />}
                <Icon size={16} className={isActive ? "text-accent" : "group-hover:text-accent2 transition-colors"} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border flex items-center gap-2 text-xs text-muted">
        <Blocks size={13} className="text-accent3" />
        Hash-chain audit trail active
      </div>
    </aside>
  );
}

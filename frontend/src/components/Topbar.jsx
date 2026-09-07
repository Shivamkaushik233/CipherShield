import React, { useEffect, useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../services/socket";
import NotificationBell from "./NotificationBell";

const ROLE_LABELS = {
  customer: "Customer",
  analyst: "Fraud Analyst",
  admin: "Security Admin",
  auditor: "Auditor",
};

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    setConnected(socket.connected);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden h-9 w-9 -ml-1 shrink-0 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-white/5"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-base font-semibold text-ink truncate">{title}</h1>
        <span
          className={`hidden sm:flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border shrink-0 ${
            connected ? "text-safe border-safe/30 bg-safe/10" : "text-muted border-border bg-white/5"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-safe" : "bg-muted"}`} />
          {connected ? "Live" : "Offline"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="text-right hidden md:block">
            <div className="text-sm text-ink leading-tight">{user?.name}</div>
            <div className="text-xs text-muted leading-tight">{ROLE_LABELS[user?.role]}</div>
          </div>
          <button
            onClick={logout}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

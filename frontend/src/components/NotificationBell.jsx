import React, { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import api from "../services/api";
import { getSocket } from "../services/socket";

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get("/notifications");
      setItems(data.items);
      setUnread(data.unreadCount);
    } catch {
      /* silent - non-critical */
    }
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    const onNotif = () => load();
    socket?.on("notification:new", onNotif);
    socket?.on("alert:new", onNotif);
    socket?.on("transaction:new", onNotif);
    return () => {
      socket?.off("notification:new", onNotif);
      socket?.off("alert:new", onNotif);
      socket?.off("transaction:new", onNotif);
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative h-9 w-9 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-white/5"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-raised shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-accent hover:underline">
              Mark all read
            </button>
          </div>
          {items.length === 0 ? (
            <div className="p-4 text-sm text-muted">Nothing yet — you're all caught up.</div>
          ) : (
            items.map((n) => (
              <div key={n._id} className={`px-4 py-3 border-b border-border/60 text-sm ${!n.read ? "bg-white/[0.02]" : ""}`}>
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                      n.severity === "critical" ? "bg-danger" : n.severity === "warning" ? "bg-warning" : "bg-accent"
                    }`}
                  />
                  <div>
                    <div className="text-ink">{n.message}</div>
                    <div className="text-xs text-muted mt-1 font-mono">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

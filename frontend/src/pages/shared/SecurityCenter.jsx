import React, { useEffect, useState } from "react";
import { Laptop, Smartphone, ShieldCheck, ShieldAlert, XCircle } from "lucide-react";
import api from "../../services/api";

function DeviceIcon({ os }) {
  return /Android|iOS/.test(os) ? <Smartphone size={16} /> : <Laptop size={16} />;
}

function trustColor(score) {
  if (score >= 70) return "text-safe";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

export default function SecurityCenter() {
  const [devices, setDevices] = useState([]);
  const [sessions, setSessions] = useState([]);

  const load = async () => {
    const [d, s] = await Promise.all([api.get("/devices/me"), api.get("/devices/me/sessions")]);
    setDevices(d.data.items);
    setSessions(s.data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const revoke = async (id) => {
    await api.patch(`/devices/sessions/${id}/revoke`);
    load();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="panel p-5">
        <h3 className="text-sm font-medium text-ink mb-4">Devices &amp; Trust Score</h3>
        <div className="flex flex-col gap-3">
          {devices.length === 0 && <div className="text-sm text-muted">No devices recorded yet.</div>}
          {devices.map((d) => (
            <div key={d._id} className="chip-row flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-raised flex items-center justify-center text-muted">
                  <DeviceIcon os={d.os} />
                </div>
                <div>
                  <div className="text-sm text-ink">{d.deviceName}</div>
                  <div className="text-xs text-muted">
                    {d.location?.city}, {d.location?.country} · last seen {new Date(d.lastSeen).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-mono text-sm font-semibold ${trustColor(d.trustScore)}`}>{Math.round(d.trustScore)}%</div>
                <div className="text-xs text-muted flex items-center gap-1 justify-end">
                  {d.isTrusted ? <ShieldCheck size={11} className="text-safe" /> : <ShieldAlert size={11} className="text-warning" />}
                  {d.isTrusted ? "Trusted" : "Unverified"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-5">
        <h3 className="text-sm font-medium text-ink mb-4">Active Sessions &amp; Login History</h3>
        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
          {sessions.length === 0 && <div className="text-sm text-muted">No login history yet.</div>}
          {sessions.map((s) => (
            <div key={s._id} className="chip-row flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm text-ink flex items-center gap-2">
                  {s.failed ? (
                    <span className="text-danger text-xs font-medium">Failed login</span>
                  ) : (
                    <span className={s.active ? "text-safe text-xs font-medium" : "text-muted text-xs"}>
                      {s.active ? "Active session" : "Ended session"}
                    </span>
                  )}
                  {s.isNewDevice && <span className="text-xs text-warning">· new device</span>}
                </div>
                <div className="text-xs text-muted font-mono mt-0.5">
                  {s.ip} · {new Date(s.loginAt).toLocaleString()}
                </div>
              </div>
              {s.active && !s.failed && (
                <button onClick={() => revoke(s._id)} className="text-muted hover:text-danger" title="Revoke session">
                  <XCircle size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

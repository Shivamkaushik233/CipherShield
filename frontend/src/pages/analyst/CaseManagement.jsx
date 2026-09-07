import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { StatusBadge } from "../../components/RiskBadge.jsx";
import RiskBadge from "../../components/RiskBadge.jsx";
import { getSocket } from "../../services/socket";

const STATUS_FILTERS = ["all", "open", "investigating", "resolved", "closed", "reopened"];
const PRIORITY_STYLES = {
  low: "text-muted",
  medium: "text-warning",
  high: "text-danger",
  critical: "text-critical font-semibold",
};

export default function CaseManagement() {
  const [cases, setCases] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/cases", { params: statusFilter !== "all" ? { status: statusFilter } : {} });
    setCases(data.items);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    const socket = getSocket();
    const onUpdate = () => load();
    socket?.on("case:new", onUpdate);
    socket?.on("case:update", onUpdate);
    return () => {
      socket?.off("case:new", onUpdate);
      socket?.off("case:update", onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs rounded-full px-3 py-1.5 border capitalize ${
              statusFilter === s ? "bg-accent/15 text-accent border-accent/40" : "text-muted border-border hover:text-ink"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="panel-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Case</th>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Risk</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Assigned</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {!loading && cases.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-muted">
                  No cases match this filter.
                </td>
              </tr>
            )}
            {cases.map((c) => (
              <tr
                key={c._id}
                className="border-b border-border/60 last:border-0 hover:bg-white/[0.02] cursor-pointer"
                onClick={() => (window.location.href = `/cases/${c._id}`)}
              >
                <td className="px-5 py-3">
                  <Link to={`/cases/${c._id}`} className="font-mono text-accent hover:underline">
                    {c.caseNumber}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink">{c.userId?.name}</td>
                <td className="px-5 py-3">
                  <RiskBadge score={c.transactionId?.riskScore || 0} />
                </td>
                <td className={`px-5 py-3 capitalize text-xs ${PRIORITY_STYLES[c.priority]}`}>{c.priority}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-5 py-3 text-muted">{c.assignedTo?.name || "Unassigned"}</td>
                <td className="px-5 py-3 text-muted font-mono text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

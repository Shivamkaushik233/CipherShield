import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Activity, ShieldAlert, Users, Clock3, Radio } from "lucide-react";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import KpiCard from "../../components/KpiCard.jsx";
import RiskBadge from "../../components/RiskBadge.jsx";

const RISK_COLORS = ["#33D17A", "#F5B942", "#F0473F", "#B91C3C"];

export default function AnalystDashboard() {
  const [kpis, setKpis] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [fraudByHour, setFraudByHour] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);

  const loadAll = async () => {
    const [k, d, h] = await Promise.all([
      api.get("/dashboard/kpis"),
      api.get("/dashboard/risk-distribution"),
      api.get("/dashboard/fraud-by-hour"),
    ]);
    setKpis(k.data);
    setDistribution(d.data.distribution);
    setFraudByHour(h.data.hours);
  };

  useEffect(() => {
    loadAll();
    const socket = getSocket();
    const onAlert = (payload) => {
      setLiveFeed((prev) => [{ ...payload, at: new Date() }, ...prev].slice(0, 12));
      loadAll();
    };
    socket?.on("alert:new", onAlert);
    socket?.on("transaction:new", onAlert);
    return () => {
      socket?.off("alert:new", onAlert);
      socket?.off("transaction:new", onAlert);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!kpis) return <div className="text-muted text-sm">Loading dashboard…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Transactions" value={kpis.totalTransactions} icon={Activity} accent="accent" />
        <KpiCard label="Fraud Today" value={kpis.fraudToday} icon={ShieldAlert} accent="danger" />
        <KpiCard label="High Risk Users" value={kpis.highRiskUsers} icon={Users} accent="warning" />
        <KpiCard label="Pending Reviews" value={kpis.pendingReviews} icon={Clock3} accent="warning" />
        <KpiCard label="Avg Risk Score" value={`${kpis.avgRiskScore}%`} icon={Radio} accent="safe" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distribution} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {distribution.map((_, i) => (
                  <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#171C27", border: "1px solid #1E2430", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {distribution.map((d, i) => (
              <div key={d.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: RISK_COLORS[i % RISK_COLORS.length] }} />
                  {d.label}
                </span>
                <span className="font-mono text-ink">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Blocked Transactions by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={fraudByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2430" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#8A93A3" }} tickLine={false} axisLine={{ stroke: "#1E2430" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8A93A3" }} tickLine={false} axisLine={{ stroke: "#1E2430" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#171C27", border: "1px solid #1E2430", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#F0473F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Recent High-Risk Alerts</h3>
          <div className="flex flex-col divide-y divide-border/60">
            {kpis.recentAlerts.length === 0 && <div className="text-sm text-muted py-4">No high-risk transactions yet.</div>}
            {kpis.recentAlerts.map((t) => (
              <Link
                key={t._id}
                to={`/transactions/${t._id}`}
                className="flex items-center justify-between py-3 hover:bg-white/[0.02] -mx-1 px-1 rounded"
              >
                <div>
                  <div className="text-sm text-ink">{t.userId?.name || "Unknown user"}</div>
                  <div className="text-xs text-muted font-mono">{new Date(t.createdAt).toLocaleString()}</div>
                </div>
                <RiskBadge score={t.riskScore} />
              </Link>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
            Live Alert Feed
          </h3>
          <div className="flex flex-col divide-y divide-border/60 max-h-[280px] overflow-y-auto">
            {liveFeed.length === 0 && <div className="text-sm text-muted py-4">Waiting for live events…</div>}
            {liveFeed.map((f, i) => (
              <div key={i} className="py-2.5 text-sm">
                <div className="text-ink">{f.message || `New transaction: risk ${f.transaction?.riskScore}%`}</div>
                <div className="text-xs text-muted font-mono">{f.at.toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

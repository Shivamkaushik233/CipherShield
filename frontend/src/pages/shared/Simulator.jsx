import React, { useEffect, useState } from "react";
import {
  Plane,
  Globe2,
  Smartphone,
  TrendingUp,
  KeyRound,
  Loader2,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import api from "../../services/api";
import RiskBadge from "../../components/RiskBadge.jsx";
import { StatusBadge } from "../../components/RiskBadge.jsx";

const SCENARIO_META = {
  impossible_travel: { icon: Plane, label: "Impossible Travel", desc: "Login from 8,500km away, 12 minutes after the last transaction" },
  vpn_login: { icon: Globe2, label: "VPN / Proxy Login", desc: "Connection routed through a VPN with a country mismatch" },
  new_device: { icon: Smartphone, label: "Brand New Device", desc: "Untrusted device (15% trust) never seen on this account" },
  large_transaction: { icon: TrendingUp, label: "Abnormally Large Transaction", desc: "Amount far above this user's historical average" },
  multiple_failed_logins: { icon: KeyRound, label: "Multiple Failed Logins", desc: "4 failed login attempts in the past hour, then a transfer" },
};

export default function Simulator() {
  const [scenarios, setScenarios] = useState([]);
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/simulator/scenarios").then(({ data }) => setScenarios(data.scenarios));
  }, []);

  const run = async (key) => {
    setRunning(key);
    setResult(null);
    try {
      const { data } = await api.post(`/simulator/run/${key}`);
      setResult(data);
      setHistory((h) => [{ key, at: new Date(), ...data }, ...h].slice(0, 8));
    } catch (err) {
      setResult({ error: err.response?.data?.message || "Simulation failed" });
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="panel p-5">
        <h3 className="text-sm font-medium text-ink mb-1">Fraud Simulator</h3>
        <p className="text-xs text-muted mb-5">
          Trigger a synthetic attack pattern and watch the AI model, ZK proof layer, and blockchain audit trail respond in real time.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((s) => {
            const meta = SCENARIO_META[s.key] || {};
            const Icon = meta.icon || TrendingUp;
            return (
              <button
                key={s.key}
                onClick={() => run(s.key)}
                disabled={running === s.key}
                className="group text-left rounded-xl border border-border bg-raised/70 backdrop-blur-md p-4 transition-all duration-300 hover:border-accent2/50 hover:-translate-y-1 hover:shadow-glow disabled:opacity-60"
              >
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent/20 to-accent2/20 text-accent2 flex items-center justify-center mb-3 group-hover:from-accent/30 group-hover:to-accent2/30 transition-colors">
                  {running === s.key ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
                </div>
                <div className="text-sm text-ink font-medium">{meta.label || s.label}</div>
                <div className="text-xs text-muted mt-1">{meta.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {result && (
        <div className="panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Result</h3>
          {result.error ? (
            <div className="text-sm text-danger">{result.error}</div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={result.transaction.status} />
                <RiskBadge score={result.transaction.riskScore} />
                <span className="text-xs text-muted">
                  confidence {Math.round(result.transaction.confidence * 100)}%
                </span>
              </div>
              <div>
                <div className="text-xs text-muted mb-1.5">AI explanation</div>
                <ul className="flex flex-col gap-1">
                  {(result.transaction.reasons || []).map((r, i) => (
                    <li key={i} className="text-sm text-ink flex gap-2">
                      <span className="text-accent">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
              {result.fraudCase && (
                <div className="text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
                  Fraud case auto-created: <span className="font-mono">{result.fraudCase.caseNumber}</span> (priority{" "}
                  {result.fraudCase.priority})
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                <div>
                  <div className="text-xs text-muted">Blockchain hash</div>
                  <div className="font-mono text-xs text-accent break-all mt-1">{result.transaction.blockHash}</div>
                </div>
                <div>
                  <div className="text-xs text-muted flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-safe" /> ZK threshold-proof
                  </div>
                  <div className="font-mono text-xs text-ink/70 mt-1">
                    thresholdMet: {String(result.transaction.zkProof?.thresholdMet)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Simulation History (this session)</h3>
          <div className="flex flex-col divide-y divide-border/60">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink">{SCENARIO_META[h.key]?.label || h.key}</span>
                <div className="flex items-center gap-2">
                  <RiskBadge score={h.transaction.riskScore} />
                  <span className="text-xs text-muted font-mono">{h.at.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

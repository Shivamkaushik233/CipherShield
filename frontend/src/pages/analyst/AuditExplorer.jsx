import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldX } from "lucide-react";
import api from "../../services/api";
import HashChainThread from "../../components/HashChainThread.jsx";

export default function AuditExplorer() {
  const [logs, setLogs] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [tab, setTab] = useState("blocks");

  useEffect(() => {
    api.get("/audit/logs").then(({ data }) => setLogs(data.items));
    api.get("/audit/blocks").then(({ data }) => {
      setBlocks(data.items);
      setChainStatus(data.chainStatus);
    });
  }, []);

  const blockItems = blocks.map((b) => ({
    title: `Block #${b.index} — ${b.data?.status?.toUpperCase() || "RECORD"}`,
    subtitle: `Risk ${b.data?.riskScore ?? "—"}% · txn ${String(b.data?.transactionId || "").slice(-8)}`,
    hash: b.hash,
    time: new Date(b.timestamp).toLocaleString(),
    verified: true,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="panel p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-ink">Hash-chain Integrity</h3>
          <p className="text-xs text-muted mt-1">
            Every fraud decision is committed to an append-only hash-chain. Re-verified on every load.
          </p>
        </div>
        {chainStatus && (
          <div
            className={`flex items-center gap-2 text-sm rounded-full px-3 py-1.5 border ${
              chainStatus.valid ? "text-safe border-safe/40 bg-safe/10" : "text-danger border-danger/40 bg-danger/10"
            }`}
          >
            {chainStatus.valid ? <ShieldCheck size={15} /> : <ShieldX size={15} />}
            {chainStatus.valid ? `Chain valid · ${chainStatus.length} blocks` : "Chain tampering detected!"}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {["blocks", "logs"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs rounded-full px-3 py-1.5 border capitalize ${
              tab === t ? "bg-accent/15 text-accent border-accent/40" : "text-muted border-border"
            }`}
          >
            {t === "blocks" ? "Blockchain Explorer" : "Admin Audit Log"}
          </button>
        ))}
      </div>

      {tab === "blocks" ? (
        <div className="panel p-5">
          <HashChainThread items={blockItems} />
        </div>
      ) : (
        <div className="panel-table">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Target</th>
                <th className="px-5 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 text-ink">
                    {l.actorName} <span className="text-muted text-xs capitalize">({l.actorRole})</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-accent">{l.action}</td>
                  <td className="px-5 py-3 text-muted text-xs">{l.targetType}</td>
                  <td className="px-5 py-3 text-muted font-mono text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

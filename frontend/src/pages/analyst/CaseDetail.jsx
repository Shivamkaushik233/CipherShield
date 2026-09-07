import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, FileText, Upload, ShieldCheck, ShieldAlert } from "lucide-react";
import api, { apiFileUrl } from "../../services/api";
import { StatusBadge } from "../../components/RiskBadge.jsx";
import RiskBadge from "../../components/RiskBadge.jsx";
import HashChainThread from "../../components/HashChainThread.jsx";

const TRANSITIONS = {
  open: ["investigating", "closed"],
  investigating: ["resolved", "open"],
  resolved: ["closed", "reopened"],
  closed: ["reopened"],
  reopened: ["investigating", "closed"],
};

export default function CaseDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [note, setNote] = useState("");
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [resolutionSummary, setResolutionSummary] = useState("");

  const load = useCallback(async () => {
    const { data } = await api.get(`/cases/${id}`);
    setData(data.case);
  }, [id]);

  const loadDocs = useCallback(async () => {
    const { data } = await api.get(`/vault/case/${id}`);
    setDocs(data.items);
  }, [id]);

  useEffect(() => {
    load();
    loadDocs();
  }, [load, loadDocs]);

  if (!data) return <div className="text-muted text-sm">Loading case…</div>;

  const txn = data.transactionId;

  const changeStatus = async (status) => {
    await api.patch(`/cases/${id}/status`, { status, resolutionSummary });
    load();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    await api.post(`/cases/${id}/notes`, { text: note });
    setNote("");
    load();
  };

  const setPriority = async (priority) => {
    await api.patch(`/cases/${id}/priority`, { priority });
    load();
  };

  const uploadFile = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("caseId", id);
    await api.post("/vault/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
    setFile(null);
    loadDocs();
  };

  const timelineItems = (data.timeline || [])
    .slice()
    .reverse()
    .map((t) => ({
      title: t.event,
      time: new Date(t.at).toLocaleString(),
      hash: data.evidence?.blockchainHash,
      verified: true,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-mono text-lg text-ink">{data.caseNumber}</div>
              <div className="text-xs text-muted">Opened {new Date(data.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={data.status} />
              {txn && <RiskBadge score={txn.riskScore} />}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {(TRANSITIONS[data.status] || []).map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                className="text-xs rounded-lg border border-border px-3 py-1.5 text-ink hover:border-accent2 hover:text-accent2 hover:shadow-glow-sm transition-all capitalize"
              >
                Move to {s}
              </button>
            ))}
            <select
              value={data.priority}
              onChange={(e) => setPriority(e.target.value)}
              className="text-xs rounded-lg border border-border px-2 py-1.5 bg-raised text-ink capitalize"
            >
              {["low", "medium", "high", "critical"].map((p) => (
                <option key={p} value={p}>
                  Priority: {p}
                </option>
              ))}
            </select>
            <a
              href={apiFileUrl(`/cases/${id}/report`)}
              target="_blank"
              rel="noreferrer"
              className="text-xs rounded-lg border border-border px-3 py-1.5 text-ink hover:border-accent2 hover:text-accent2 hover:shadow-glow-sm transition-all flex items-center gap-1.5"
            >
              <Download size={12} /> Case report (PDF)
            </a>
          </div>

          {data.status === "investigating" && (
            <textarea
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              placeholder="Resolution summary (used when moving to 'resolved')"
              className="mt-3 w-full rounded-lg bg-raised border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              rows={2}
            />
          )}
        </div>

        {/* Evidence viewer */}
        <div className="panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Evidence Viewer</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <EvidenceRow label="Amount" value={txn ? `${txn.currency} ${txn.amount}` : "—"} />
            <EvidenceRow label="Receiver" value={txn?.receiver} />
            <EvidenceRow label="IP address" value={txn?.ip} />
            <EvidenceRow label="Location" value={txn ? `${txn.location?.city}, ${txn.location?.country}` : "—"} />
            <EvidenceRow label="Device" value={data.evidence?.deviceSnapshot?.deviceName || "—"} />
            <EvidenceRow label="Device trust" value={`${data.evidence?.deviceSnapshot?.trustScore ?? "—"}%`} />
            <EvidenceRow label="AI confidence" value={txn ? `${Math.round(txn.confidence * 100)}%` : "—"} />
            <EvidenceRow label="Model source" value={data.evidence?.aiSnapshot?.modelSource || "—"} />
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted mb-2">AI explanation</div>
            <ul className="flex flex-col gap-1.5">
              {(txn?.reasons || []).map((r, i) => (
                <li key={i} className="text-sm text-ink flex gap-2">
                  <span className="text-accent">•</span> {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div>
              <div className="text-xs text-muted">Blockchain audit hash</div>
              <div className="font-mono text-xs text-accent mt-1">{data.evidence?.blockchainHash}</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-safe">
              <ShieldCheck size={14} /> ZK threshold-proof attached
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Investigation Notes</h3>
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-3">
            {(data.notes || []).length === 0 && <div className="text-sm text-muted">No notes yet.</div>}
            {(data.notes || []).map((n) => (
              <div key={n._id} className="text-sm border-l-2 border-accent/40 pl-3">
                <div className="text-ink">{n.text}</div>
                <div className="text-xs text-muted mt-0.5">
                  {n.authorName} · {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an investigation note…"
              className="flex-1 rounded-lg bg-raised border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <button onClick={addNote} className="rounded-lg bg-accent text-white text-sm px-4 hover:bg-accent/90">
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Timeline - signature hash-chain thread */}
        <div className="panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Security Timeline</h3>
          <HashChainThread items={timelineItems} />
        </div>

        {/* Secure document vault */}
        <div className="panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Secure Document Vault</h3>
          <div className="flex flex-col gap-2 mb-3">
            {docs.length === 0 && <div className="text-sm text-muted">No documents uploaded.</div>}
            {docs.map((d) => (
              <a
                key={d._id}
                href={apiFileUrl(`/vault/${d._id}/download`)}
                className="chip-row flex items-center justify-between text-sm px-3 py-2"
              >
                <span className="flex items-center gap-2 text-ink truncate">
                  <FileText size={14} className="text-muted shrink-0" /> {d.fileName}
                </span>
                <span className="text-xs text-muted shrink-0 flex items-center gap-1">
                  <ShieldAlert size={11} /> AES-256
                </span>
              </a>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="flex-1 text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-raised file:px-3 file:py-1.5 file:text-xs file:text-ink"
            />
            <button
              onClick={uploadFile}
              disabled={!file}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink hover:border-accent disabled:opacity-40 flex items-center gap-1.5"
            >
              <Upload size={12} /> Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceRow({ label, value }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="text-ink">{value ?? "—"}</div>
    </div>
  );
}

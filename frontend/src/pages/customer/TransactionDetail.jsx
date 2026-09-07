import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, ShieldX, Download, ArrowLeft } from "lucide-react";
import api, { apiFileUrl } from "../../services/api";
import RiskBadge from "../../components/RiskBadge.jsx";
import { StatusBadge } from "../../components/RiskBadge.jsx";

export default function TransactionDetail() {
  const { id } = useParams();
  const [txn, setTxn] = useState(null);
  const [verify, setVerify] = useState(null);

  useEffect(() => {
    api.get(`/transactions/${id}`).then(({ data }) => setTxn(data.transaction));
    api.get(`/transactions/${id}/verify`).then(({ data }) => setVerify(data));
  }, [id]);

  if (!txn) return <div className="text-muted text-sm">Loading transaction…</div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <Link to="/portal" className="text-xs text-muted hover:text-accent flex items-center gap-1.5 w-fit">
        <ArrowLeft size={13} /> Back
      </Link>

      <div className="panel p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-lg text-ink">
              {txn.currency} {txn.amount} → {txn.receiver}
            </div>
            <div className="text-xs text-muted font-mono">{new Date(txn.createdAt).toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge score={txn.riskScore} />
            <StatusBadge status={txn.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-5">
          <Row label="AI confidence" value={`${Math.round(txn.confidence * 100)}%`} />
          <Row label="Model source" value={txn.zkProof ? "AI microservice + ZK layer" : "—"} />
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted mb-2">AI explanation</div>
          <ul className="flex flex-col gap-1.5">
            {(txn.reasons || []).map((r, i) => (
              <li key={i} className="text-sm text-ink flex gap-2">
                <span className="text-accent">•</span> {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 pt-5 border-t border-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink">Blockchain audit hash</span>
            {verify && (
              <span className={`flex items-center gap-1.5 text-xs ${verify.chainValid ? "text-safe" : "text-danger"}`}>
                {verify.chainValid ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                {verify.chainValid ? "Chain verified" : "Tampering detected"}
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-accent break-all bg-raised rounded-lg p-3">{txn.blockHash}</div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-ink">Zero-knowledge proof</span>
            {verify && (
              <span className={`flex items-center gap-1.5 text-xs ${verify.zkProofValid ? "text-safe" : "text-danger"}`}>
                {verify.zkProofValid ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                {verify.zkProofValid ? "Proof verified" : "Proof invalid"}
              </span>
            )}
          </div>
          <div className="text-xs text-muted">
            Proves the risk score crossed the alert threshold — without revealing the amount, receiver, or device.
          </div>
          <div className="font-mono text-xs text-ink/70 break-all bg-raised rounded-lg p-3">
            Public signals: [{verify?.zkPublicSignals?.join(", ")}]
          </div>
        </div>

        <a
          href={apiFileUrl(`/transactions/${id}/receipt`)}
          className="mt-5 inline-flex items-center gap-2 text-sm rounded-lg border border-border px-4 py-2 text-ink hover:border-accent2 hover:text-accent2 hover:shadow-glow-sm transition-all w-fit"
        >
          <Download size={14} /> Download receipt (PDF)
        </a>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="text-ink">{value}</div>
    </div>
  );
}

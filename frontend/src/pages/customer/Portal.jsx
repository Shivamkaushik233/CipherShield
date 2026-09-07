import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Send, Download, ShieldCheck } from "lucide-react";
import api, { apiFileUrl } from "../../services/api";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSocket } from "../../services/socket";
import RiskBadge from "../../components/RiskBadge.jsx";
import { StatusBadge } from "../../components/RiskBadge.jsx";

export default function CustomerPortal() {
  const { user, setUser } = useAuth();
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const loadTransactions = useCallback(async () => {
    const { data } = await api.get("/transactions", { params: { limit: 15 } });
    setTransactions(data.items);
  }, []);

  useEffect(() => {
    loadTransactions();
    const socket = getSocket();
    const onUpdate = () => loadTransactions();
    socket?.on("transaction:update", onUpdate);
    return () => socket?.off("transaction:update", onUpdate);
  }, [loadTransactions]);

  const send = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLastResult(null);
    try {
      const { data } = await api.post("/transactions", { receiver, amount: Number(amount) });
      setLastResult(data);
      setReceiver("");
      setAmount("");
      loadTransactions();
      const { data: me } = await api.get("/auth/me");
      setUser(me.user);
      localStorage.setItem("ciphershield_user", JSON.stringify(me.user));
    } catch (err) {
      setLastResult({ error: err.response?.data?.message || "Transaction failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-1 flex flex-col gap-5">
        {/* User Risk Profile */}
        <div className="panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Your Risk Profile</h3>
          <div className="flex flex-col gap-3 text-sm">
            <ProfileRow label="Trust score" value={`${Math.round(user?.trustScore || 0)}%`} />
            <ProfileRow label="Total transactions" value={user?.totalTransactions ?? 0} />
            <ProfileRow label="Successful payments" value={user?.successfulPayments ?? 0} />
            <ProfileRow label="Previous flagged frauds" value={user?.previousFrauds ?? 0} />
            <ProfileRow label="Average amount" value={`₹${Math.round(user?.avgAmount || 0)}`} />
          </div>
        </div>

        {/* Send money */}
        <div className="panel p-5">
          <h3 className="text-sm font-medium text-ink mb-4">Send Money</h3>
          <form onSubmit={send} className="flex flex-col gap-3">
            <input
              required
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="Receiver (name / account)"
              className="rounded-lg bg-raised border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
            <input
              required
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (INR)"
              className="rounded-lg bg-raised border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
            <button
              disabled={submitting}
              className="rounded-lg bg-accent text-white text-sm font-medium py-2.5 flex items-center justify-center gap-2 hover:bg-accent/90 disabled:opacity-60"
            >
              <Send size={14} /> {submitting ? "Processing…" : "Send"}
            </button>
          </form>

          {lastResult && (
            <div className="mt-4 pt-4 border-t border-border">
              {lastResult.error ? (
                <div className="text-sm text-danger">{lastResult.error}</div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={lastResult.transaction.status} />
                    <RiskBadge score={lastResult.transaction.riskScore} />
                  </div>
                  <div className="text-xs text-muted">{(lastResult.transaction.reasons || []).join(" · ")}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transaction history */}
      <div className="lg:col-span-2 panel-table">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-ink">Transaction History</h3>
        </div>
        <div className="divide-y divide-border/60">
          {transactions.length === 0 && <div className="p-5 text-sm text-muted">No transactions yet — send your first payment.</div>}
          {transactions.map((t) => (
            <div key={t._id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="text-sm text-ink">
                  To <span className="font-medium">{t.receiver}</span>
                </div>
                <div className="text-xs text-muted font-mono">{new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-mono text-ink">
                  {t.currency} {t.amount}
                </div>
                <RiskBadge score={t.riskScore} showScore={false} />
                <StatusBadge status={t.status} />
                <div className="flex items-center gap-1.5">
                  <Link to={`/transactions/${t._id}`} className="text-muted hover:text-accent" title="View + verify">
                    <ShieldCheck size={15} />
                  </Link>
                  <a href={apiFileUrl(`/transactions/${t._id}/receipt`)} className="text-muted hover:text-accent" title="Download receipt">
                    <Download size={15} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-mono text-ink">{value}</span>
    </div>
  );
}

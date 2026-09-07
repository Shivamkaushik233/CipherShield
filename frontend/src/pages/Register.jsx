import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await register(form);
      navigate(user.role === "customer" ? "/portal" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <Logo size={34} />
          <span className="font-display font-bold text-2xl tracking-wide brand-text">CIPHERSHIELD</span>
        </div>

        <div className="panel-lg p-7">
          <h2 className="text-lg font-semibold text-ink mb-1">Create account</h2>
          <p className="text-sm text-muted mb-6">Sign up to start sending secured, AI-monitored payments</p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Full name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg bg-raised border border-border px-3 py-2.5 text-sm text-ink focus:border-accent focus:shadow-glow-sm outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg bg-raised border border-border px-3 py-2.5 text-sm text-ink focus:border-accent focus:shadow-glow-sm outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg bg-raised border border-border px-3 py-2.5 text-sm text-ink focus:border-accent focus:shadow-glow-sm outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Role (demo purposes)</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-lg bg-raised border border-border px-3 py-2.5 text-sm text-ink focus:border-accent outline-none"
              >
                <option value="customer">Customer</option>
                <option value="analyst">Fraud Analyst</option>
                <option value="admin">Security Admin</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>
            {error && <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-lg bg-brand-gradient text-white text-sm font-semibold py-2.5 hover:shadow-glow transition-shadow disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-5">
          Already have an account? <Link to="/login" className="text-accent2 hover:underline">Sign in</Link>
        </p>

        <div className="text-center mt-8 pt-5 border-t border-border/60">
          <p className="text-xs text-muted">&copy; 2026 CipherShield &middot; Portfolio project, not a real financial product</p>
          <Link to="/" className="text-xs text-muted hover:text-ink transition-colors">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

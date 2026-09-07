import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login(email, password);
      navigate(user.role === "customer" ? "/portal" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setEmail(`${role}@ciphershield.dev`);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <Logo size={34} />
          <span className="font-display font-bold text-2xl tracking-wide brand-text">CIPHERSHIELD</span>
        </div>

        <div className="panel-lg p-7">
          <h2 className="text-lg font-semibold text-ink mb-1">Sign in</h2>
          <p className="text-sm text-muted mb-6">AI fraud detection &amp; fair decision verification</p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-raised border border-border px-3 py-2.5 text-sm text-ink focus:border-accent focus:shadow-glow-sm outline-none transition-shadow"
                placeholder="you@ciphershield.dev"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-raised border border-border px-3 py-2.5 text-sm text-ink focus:border-accent focus:shadow-glow-sm outline-none transition-shadow"
                placeholder="••••••••"
              />
            </div>
            {error && <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-lg bg-brand-gradient text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-2 hover:shadow-glow transition-shadow disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            <div className="text-xs text-muted mb-2">Quick demo login (after running the seed script):</div>
            <div className="flex flex-wrap gap-2">
              {["customer", "analyst", "admin", "auditor"].map((r) => (
                <button
                  key={r}
                  onClick={() => fillDemo(r)}
                  className="text-xs rounded-full border border-border px-2.5 py-1 text-muted hover:text-accent2 hover:border-accent2/50 hover:shadow-glow-sm transition-all capitalize"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-5">
          No account? <Link to="/register" className="text-accent2 hover:underline">Create one</Link>
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

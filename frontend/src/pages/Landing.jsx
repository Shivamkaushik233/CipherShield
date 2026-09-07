import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, KeyRound, Cpu, Blocks, Check, Activity, ShieldAlert, Users, Clock3 } from "lucide-react";
import PublicNavbar from "../components/PublicNavbar.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { StatusBadge } from "../components/RiskBadge.jsx";
import KpiCard from "../components/KpiCard.jsx";
import GlossyShape from "../components/GlossyShape.jsx";

const COMPANIES = [
  "Meridian Bank", "Northline Pay", "Verity Financial", "Anchor Trust",
  "Solace Capital", "Ledgerly", "Brightwater Bank", "Paxion",
];

const FEATURES = [
  {
    shape: "orb",
    title: "AI fraud detection",
    desc: "A trained risk model scores every transaction in real time and explains the top reasons behind each score — not a black box.",
  },
  {
    shape: "ring",
    title: "Blockchain audit trail",
    desc: "Every decision is committed to an append-only hash-chain. Tampering with history is mathematically detectable, not just logged.",
  },
  {
    shape: "gem",
    title: "Zero-knowledge proofs",
    desc: "Prove a transaction crossed the risk threshold without exposing the amount, sender, or device behind it.",
  },
  {
    shape: "pulse",
    title: "Real-time monitoring",
    desc: "Analysts see new alerts, case updates, and live transactions the instant they happen — no refreshing, no polling.",
  },
];

const STEPS = [
  { n: "01", title: "A transaction happens", desc: "A customer sends money, or you trigger a scenario from the fraud simulator." },
  { n: "02", title: "AI scores it instantly", desc: "A risk model returns a 0-100 score with plain-English reasons in under a second." },
  { n: "03", title: "Proof and audit logged", desc: "A zero-knowledge proof and a blockchain entry are generated automatically." },
  { n: "04", title: "Analysts take it from there", desc: "High-risk cases open live on the dashboard, ready to investigate and resolve." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs rounded-full border border-border px-3 py-1.5 text-muted mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-safe" /> AI · Blockchain · Zero-knowledge proofs
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight mb-5">
            Catch fraud before it settles.
            <br />
            <span className="brand-text">Prove why, every time.</span>
          </h1>
          <p className="text-muted text-lg mb-8 max-w-lg">
            CipherShield scores every transaction with an explainable AI model, logs the decision to a
            tamper-evident audit trail, and lets analysts investigate live — all in one platform.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient text-white text-sm font-semibold px-5 py-3 hover:shadow-glow transition-shadow"
            >
              Get started free <ArrowRight size={16} />
            </Link>
            <a
              href="#preview"
              className="inline-flex items-center gap-2 rounded-lg border border-border text-sm font-medium px-5 py-3 text-ink hover:border-accent2/50 hover:text-accent2 transition-colors"
            >
              See it live
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
            <span className="flex items-center gap-1.5"><Check size={13} className="text-safe" /> 4 role-based dashboards</span>
            <span className="flex items-center gap-1.5"><Check size={13} className="text-safe" /> Real-time alerts</span>
            <span className="flex items-center gap-1.5"><Check size={13} className="text-safe" /> Full audit trail</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 bg-brand-gradient opacity-[0.15] blur-3xl rounded-full pointer-events-none" aria-hidden="true" />

          <div className="relative panel-lg p-6 overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-accent/15 to-transparent animate-scan pointer-events-none" />

            <div className="flex items-center justify-between mb-5">
              <span className="flex items-center gap-1.5 text-xs text-safe">
                <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" /> Live risk scan
              </span>
              <span className="text-xs text-muted font-mono">ZKF-2026-00042</span>
            </div>

            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs text-muted mb-1">Transaction</div>
                <div className="text-base font-mono text-ink">INR 85,000 &rarr; merchant-8821</div>
              </div>
              <RiskBadge score={92} />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-ink">
                <ShieldCheck size={14} className="text-safe shrink-0" /> Blockchain verified
              </div>
              <div className="flex items-center gap-2 text-xs text-ink">
                <KeyRound size={14} className="text-accent2 shrink-0" /> ZK proof attached
              </div>
            </div>
          </div>

          <div className="hidden sm:flex absolute -top-5 -right-6 items-center gap-2 panel px-3 py-2 animate-float">
            <Cpu size={14} className="text-accent shrink-0" />
            <span className="text-xs text-ink whitespace-nowrap">AI risk score: 92%</span>
          </div>
          <div className="hidden sm:flex absolute -bottom-5 -left-6 items-center gap-2 panel px-3 py-2 animate-float-delayed">
            <Blocks size={14} className="text-accent3 shrink-0" />
            <span className="text-xs text-ink whitespace-nowrap">Block #1,204 appended</span>
          </div>
        </div>
      </section>

      {/* Trusted by marquee */}
      <section className="border-y border-border bg-surface/40 py-10">
        <p className="text-center text-xs uppercase tracking-wide text-muted mb-6 px-6">
          Designed for security teams at organizations like
        </p>
        <div className="marquee-mask overflow-hidden">
          <div className="flex gap-16 marquee-track w-max">
            {[...COMPANIES, ...COMPANIES].map((name, i) => (
              <span key={i} className="font-display text-lg text-muted/70 tracking-wide whitespace-nowrap">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-xl mx-auto text-center mb-14">
          <h2 className="font-display font-bold text-3xl mb-4">Four layers, one decision</h2>
          <p className="text-muted">
            Every transaction passes through the same pipeline — explainable, provable, and visible to your
            security team the instant it happens.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ shape, title, desc }) => (
            <div key={title} className="panel p-6 flex flex-col overflow-hidden">
              <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
              <p className="text-xs text-muted leading-relaxed">{desc}</p>
              <GlossyShape variant={shape} />
            </div>
          ))}
        </div>
      </section>

      {/* Product preview */}
      <section id="preview" className="max-w-6xl mx-auto px-6 py-10 pb-24">
        <div className="max-w-xl mx-auto text-center mb-12">
          <h2 className="font-display font-bold text-3xl mb-4">This is the actual dashboard</h2>
          <p className="text-muted">Not a mockup — sign up and this is what your analyst team sees, live.</p>
        </div>

        <div className="panel-lg p-3 sm:p-5">
          <div className="flex items-center gap-1.5 px-2 py-2 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-safe/50" />
            <span className="ml-3 text-xs text-muted font-mono">ciphershield.app/dashboard</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <KpiCard label="Total Transactions" value="1,284" icon={Activity} accent="accent" />
            <KpiCard label="Fraud Today" value="7" icon={ShieldAlert} accent="danger" />
            <KpiCard label="High Risk Users" value="12" icon={Users} accent="warning" />
            <KpiCard label="Pending Reviews" value="4" icon={Clock3} accent="warning" />
          </div>

          <div className="rounded-xl border border-border bg-surface/70 p-5">
            <h3 className="text-sm font-medium text-ink mb-4">Recent high-risk alerts</h3>
            <div className="flex flex-col divide-y divide-border/60">
              {[
                { name: "Aditi Sharma", score: 92, status: "blocked" },
                { name: "Rahul Mehta", score: 76, status: "pending_review" },
                { name: "Neha Kapoor", score: 61, status: "approved" },
              ].map((row) => (
                <div key={row.name} className="flex items-center justify-between py-3">
                  <span className="text-sm text-ink">{row.name}</span>
                  <div className="flex items-center gap-2">
                    <RiskBadge score={row.score} />
                    <StatusBadge status={row.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border bg-surface/40 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mx-auto text-center mb-14">
            <h2 className="font-display font-bold text-3xl mb-4">From transaction to verdict</h2>
            <p className="text-muted">The whole pipeline runs in under a second, every time.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="font-display text-2xl brand-text mb-3">{s.n}</div>
                <h3 className="text-sm font-semibold text-ink mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="panel-lg p-12">
          <h2 className="font-display font-bold text-3xl mb-4">See it catch fraud yourself</h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            Create a free account and run the fraud simulator, or sign in with a seeded demo account to explore
            first.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient text-white text-sm font-semibold px-5 py-3 hover:shadow-glow transition-shadow"
            >
              Create free account <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border text-sm font-medium px-5 py-3 text-ink hover:border-accent2/50 hover:text-accent2 transition-colors"
            >
              Sign in with a demo account
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

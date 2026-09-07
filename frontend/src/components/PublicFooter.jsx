import React from "react";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import Logo from "./Logo.jsx";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Analyst dashboard", href: "#features" },
      { label: "Case management", href: "#features" },
      { label: "Fraud simulator", href: "#preview" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    title: "Security",
    links: [
      { label: "AI risk model", href: "#features" },
      { label: "Blockchain audit trail", href: "#features" },
      { label: "Zero-knowledge proofs", href: "#features" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <Logo size={24} />
              <span className="font-display font-bold tracking-wide text-sm brand-text">CIPHERSHIELD</span>
            </div>
            <p className="text-sm text-muted max-w-xs">
              AI fraud detection with a fair-decision audit trail — every risk score is logged, provable, and
              reviewable.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-xs uppercase tracking-wide text-muted mb-3">{col.title}</div>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("#") ? (
                      <a href={l.href} className="text-sm text-muted hover:text-ink transition-colors">
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.href} className="text-sm text-muted hover:text-ink transition-colors">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-muted max-w-xl">
            CipherShield is a portfolio/demo project — not a real financial product. It isn't affiliated with any
            company named or implied on this page; all "trusted by" names are fictional, used to illustrate the
            design.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors shrink-0"
          >
            <Github size={14} /> View source
          </a>
        </div>
      </div>
    </footer>
  );
}

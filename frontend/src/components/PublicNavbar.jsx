import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#preview", label: "Product" },
];

export default function PublicNavbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const homePath = user?.role === "customer" ? "/portal" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="font-display font-bold tracking-wide text-[15px] brand-text">CIPHERSHIELD</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted hover:text-ink transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              to={homePath}
              className="text-sm font-medium rounded-lg bg-brand-gradient text-white px-4 py-2 hover:shadow-glow transition-shadow"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted hover:text-ink transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium rounded-lg bg-brand-gradient text-white px-4 py-2 hover:shadow-glow transition-shadow"
              >
                Get started free
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-ink" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {user ? (
              <Link to={homePath} className="text-sm font-medium rounded-lg bg-brand-gradient text-white px-4 py-2 text-center">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-muted text-center py-2">
                  Sign in
                </Link>
                <Link to="/register" className="text-sm font-medium rounded-lg bg-brand-gradient text-white px-4 py-2 text-center">
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const TITLES = {
  "/dashboard": "Fraud Analyst Dashboard",
  "/portal": "Transaction Portal",
  "/cases": "Fraud Case Management",
  "/security": "Login Security Center",
  "/simulator": "Fraud Simulator",
  "/audit": "Audit Trail & Blockchain Explorer",
};

export default function Layout() {
  const { pathname } = useLocation();
  const matched = Object.keys(TITLES).find((p) => pathname.startsWith(p));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg text-ink overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={TITLES[matched] || "CipherShield"} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import React from "react";

// CSS-approximated glossy 3D shapes (radial-gradient highlight + shadow to
// fake sphere/gem lighting, conic-gradient for the ring). Not a real 3D
// render, but gives the same "glossy floating object" feel without
// pulling in external image assets, and stays theme-consistent with the
// rest of the brand gradient.
const GLOW = {
  orb: "rgba(168,85,247,0.35)",
  ring: "rgba(236,72,153,0.3)",
  gem: "rgba(34,211,238,0.35)",
  pulse: "rgba(236,72,153,0.4)",
};

function Orb() {
  return (
    <div
      className="h-20 w-20 rounded-full"
      style={{
        background:
          "radial-gradient(circle at 32% 28%, #ffffff 0%, #e9d5ff 10%, #c084fc 28%, #7c3aed 58%, #3b1d78 85%)",
        boxShadow: `0 0 42px 10px ${GLOW.orb}, inset -10px -10px 22px rgba(0,0,0,0.35), inset 4px 4px 10px rgba(255,255,255,0.35)`,
      }}
    />
  );
}

function Ring() {
  return (
    <div
      className="relative h-24 w-24 rounded-full"
      style={{
        background: "conic-gradient(from 210deg, #22D3EE, #A855F7 45%, #EC4899 75%, #22D3EE)",
        boxShadow: `0 0 38px 8px ${GLOW.ring}`,
      }}
    >
      <div className="absolute inset-[11px] rounded-full bg-surface" />
      <div
        className="absolute inset-[11px] rounded-full"
        style={{ boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(255,255,255,0.06)" }}
      />
    </div>
  );
}

function Gem() {
  return (
    <div
      className="h-20 w-20"
      style={{
        clipPath: "polygon(50% 0%, 90% 35%, 76% 100%, 24% 100%, 10% 35%)",
        background: "linear-gradient(140deg, #ffffff 0%, #a5f3fc 14%, #22D3EE 36%, #A855F7 68%, #3b1d78 100%)",
        filter: `drop-shadow(0 0 22px ${GLOW.gem})`,
      }}
    />
  );
}

function Pulse() {
  return (
    <div className="relative h-24 w-24 flex items-center justify-center">
      <span className="absolute h-16 w-16 rounded-full border border-accent2/40 animate-ping-slow" />
      <span className="absolute h-16 w-16 rounded-full border border-accent2/30" style={{ animationDelay: "1.4s" }} />
      <div
        className="relative h-11 w-11 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 28%, #ffffff 0%, #fbcfe8 12%, #EC4899 45%, #831843 85%)",
          boxShadow: `0 0 30px 8px ${GLOW.pulse}`,
        }}
      />
    </div>
  );
}

const VARIANTS = { orb: Orb, ring: Ring, gem: Gem, pulse: Pulse };

export default function GlossyShape({ variant = "orb" }) {
  const Shape = VARIANTS[variant] || Orb;
  return (
    <div className="relative h-32 flex items-center justify-center">
      <div
        className="absolute h-20 w-32 rounded-full blur-2xl opacity-60"
        style={{ background: `radial-gradient(ellipse, ${GLOW[variant]}, transparent 70%)` }}
        aria-hidden="true"
      />
      <Shape />
    </div>
  );
}

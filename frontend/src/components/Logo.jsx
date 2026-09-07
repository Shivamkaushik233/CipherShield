import React from "react";

// Signature mark: a shield (security) built from a hexagonal cipher/keyhole
// cut-out (encryption) — the two halves of "CipherShield" in one glyph.
// Rendered with the brand gradient + soft outer glow to match the
// purple-black futuristic direction.
export default function Logo({ size = 28, glow = true, id = "cs" }) {
  const gradId = `${id}-grad`;
  const glowId = `${id}-glow`;

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="55%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        {glow && (
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      <path
        d="M24 2L44 9V22C44 33.6 36.2 42.6 24 46C11.8 42.6 4 33.6 4 22V9L24 2Z"
        fill={`url(#${gradId})`}
        fillOpacity="0.16"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
        filter={glow ? `url(#${glowId})` : undefined}
      />
      {/* cipher keyhole cut-out */}
      <circle cx="24" cy="20" r="5.2" fill={`url(#${gradId})`} />
      <path d="M24 24.5L28 34H20L24 24.5Z" fill={`url(#${gradId})`} />
    </svg>
  );
}

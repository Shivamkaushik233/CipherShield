/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Deep purple-black base — not plain black, tinted violet throughout
        bg: "#0A0714",
        surface: "#140E24",
        raised: "#1C1433",
        border: "#2E2354",
        muted: "#9C93C4",
        ink: "#F3EEFF",
        // Brand gradient trio: violet -> magenta -> cyan
        accent: "#A855F7",
        accent2: "#EC4899",
        accent3: "#22D3EE",
        "accent-soft": "#241638",
        // Vibrant neon-leaning semantic colors (still legible on dark violet)
        safe: "#2DE8A0",
        warning: "#FFC94A",
        danger: "#FF5470",
        critical: "#FF2D95",
      },
      fontFamily: {
        display: ["Orbitron", "ui-sans-serif", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(168,85,247,0.15), 0 12px 30px -10px rgba(168,85,247,0.45), 0 0 30px -8px rgba(236,72,153,0.3)",
        "glow-sm": "0 0 0 1px rgba(168,85,247,0.15), 0 0 16px -4px rgba(168,85,247,0.5)",
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.2), 0 0 20px -4px rgba(34,211,238,0.5)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #A855F7 0%, #EC4899 55%, #22D3EE 100%)",
        "brand-radial": "radial-gradient(circle at 30% 20%, rgba(168,85,247,0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(236,72,153,0.18), transparent 45%)",
      },
    },
  },
  plugins: [],
};


import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Cairo", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#16211d",
        muted: "#7d8a85",
        "muted-2": "#5b6863",
        surface: "#ffffff",
        "surface-alt": "#f5f8f6",
        line: "#e6eae8",
        "line-input": "#dfe7e3",
        green: {
          700: "#2f6a53",
          900: "#16302a",
        },
        gold: {
          300: "#e6c982",
          500: "#c9a24a",
          600: "#e0bb63",
        },
        mint: {
          100: "#b9cfc4",
          200: "#93b3a4",
        },
        "ok-bg": "#eaf3ee",
        "ok-fg": "#2f6a53",
        "warn-bg": "#fdf6e6",
        "warn-fg": "#b28a35",
        "err-bg": "#fdecec",
        "err-fg": "#b3261e",
        "legal-bg": "#fdf9ef",
        "legal-border": "#ecdcb4",
        "legal-fg": "#8a6a1f",
        // Legacy brand tokens preserved as aliases so pre-redesign pages still compile
        brand: {
          50: "#eaf3ee",
          100: "#eaf3ee",
          200: "#d1e2d8",
          300: "#93b3a4",
          400: "#5b8b76",
          500: "#2f6a53",
          600: "#2f6a53",
          700: "#16302a",
          800: "#16302a",
          900: "#0f231e",
        },
        accent: {
          500: "#c9a24a",
          600: "#e0bb63",
        },
      },
      boxShadow: {
        card: "0 4px 18px rgba(22,48,42,.06)",
        "card-hover": "0 16px 40px rgba(22,48,42,.13)",
        sticky: "0 8px 28px rgba(22,48,42,.07)",
        "hero-search": "0 24px 60px rgba(0,0,0,.28)",
      },
      borderRadius: {
        "card-lg": "22px",
        "panel-lg": "28px",
      },
      maxWidth: {
        page: "1240px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

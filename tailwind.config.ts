import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-arabic)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f7f4",
          100: "#dcece3",
          200: "#bcdac9",
          300: "#8fbfa8",
          400: "#5fa084",
          500: "#3f8368",
          600: "#2f6a53",
          700: "#265444",
          800: "#204438",
          900: "#1c3830",
        },
        accent: {
          500: "#c9a24a",
          600: "#b28a35",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

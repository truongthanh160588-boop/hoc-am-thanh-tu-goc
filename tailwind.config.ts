import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Titan theme colors
        titan: {
          bg: "#0b0f14",
          card: "#111827",
          border: "rgba(148,163,184,0.18)",
          accent: "#22d3ee",
          accentDark: "#14b8a6",
        },
      },
    },
  },
  plugins: [],
};
export default config;

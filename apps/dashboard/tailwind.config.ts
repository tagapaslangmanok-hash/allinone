import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#070812",
        panel: "rgba(16, 18, 34, 0.72)",
        violet: "#8b5cf6",
        cyan: "#22d3ee"
      },
      boxShadow: {
        neon: "0 0 48px rgba(139, 92, 246, 0.34)",
        cyan: "0 0 42px rgba(34, 211, 238, 0.22)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};

export default config;

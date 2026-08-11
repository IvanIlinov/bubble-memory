import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        deep: {
          DEFAULT: "#0D0F0F",
          panel: "#16191A",
          panel2: "#1C2020",
        },
        foam: {
          DEFAULT: "#F5F6F7",
          muted: "#8A9296",
          dim: "#585F63",
        },
        living: {
          DEFAULT: "#3DDCC4",
          soft: "#279E8C",
          glow: "#6EF0DC",
        },
        gold: {
          DEFAULT: "#FFD166",
          soft: "#E0B24E",
        },
        violet: {
          DEFAULT: "#9E8CFF",
          soft: "#C4B8FF",
        },
        pink: {
          DEFAULT: "#FF6FA8",
          soft: "#FF9CC4",
        },
        memory: {
          none: "#2A2E2F",
          blue: "#4FC3F7",
          green: "#3DDCC4",
          yellow: "#FFD166",
          orange: "#FFA35C",
          red: "#FF6B6B",
          black: "#101314",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        bubble: "0 0 32px -10px rgba(61, 220, 196, 0.35)",
        "bubble-lg": "0 0 64px -12px rgba(61, 220, 196, 0.28)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        breathe: "breathe 6s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        deep: {
          DEFAULT: "#04211D",
          panel: "#0A332C",
          panel2: "#0F3F37",
        },
        foam: {
          DEFAULT: "#FFF9F2",
          muted: "#9FC4BC",
          dim: "#5E8880",
        },
        living: {
          DEFAULT: "#2AB0A3",
          soft: "#1C7A70",
          glow: "#5FE0D0",
        },
        gold: {
          DEFAULT: "#FFE458",
          soft: "#E0BC3E",
        },
        coral: {
          DEFAULT: "#FF544C",
          soft: "#FF8079",
        },
        melon: {
          DEFAULT: "#FE9A34",
          soft: "#FFBC72",
        },
        memory: {
          none: "#1B4B44",
          blue: "#2AB0A3",
          green: "#34D399",
          yellow: "#FFE458",
          orange: "#FE9A34",
          red: "#FF544C",
          black: "#0A1512",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        bubble: "0 0 40px -8px rgba(42, 176, 163, 0.5)",
        "bubble-lg": "0 0 90px -10px rgba(42, 176, 163, 0.4)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.035)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(20px, -15px)" },
        },
      },
      animation: {
        breathe: "breathe 5.5s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        drift: "drift 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

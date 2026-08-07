import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Базовая палитра: тёмная "толща воды" — фон, в котором живут пузыри памяти.
        deep: {
          DEFAULT: "#071620",
          panel: "#0E2333",
          panel2: "#122B3E",
        },
        foam: {
          DEFAULT: "#EAF6F6",
          muted: "#7FA0AC",
          dim: "#4F6C78",
        },
        living: {
          DEFAULT: "#52D8E0", // основной "живой" бирюзовый — центральный пузырь
          soft: "#2E7C88",
          glow: "#8CF0F2",
        },
        gold: {
          DEFAULT: "#E7B65C", // акцент эволюции/тиров
          soft: "#B98B3B",
        },
        // Функциональная шкала цвета памяти (см. ТЗ) — намеренно отделена от бренд-палитры,
        // т.к. это статус, а не украшение.
        memory: {
          none: "#3A4A52",
          blue: "#4FA8E0",
          green: "#4CC98A",
          yellow: "#E8D44D",
          orange: "#E8954D",
          red: "#E0554F",
          black: "#17181B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        bubble: "0 0 40px -8px rgba(82, 216, 224, 0.45)",
        "bubble-lg": "0 0 80px -10px rgba(82, 216, 224, 0.35)",
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
      },
      animation: {
        breathe: "breathe 5.5s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

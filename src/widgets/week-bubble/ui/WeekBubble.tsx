"use client";

import { motion } from "framer-motion";

const COLOR_STOPS = [
  { r: 239, g: 68,  b: 68  },
  { r: 247, g: 171, b: 77  },
  { r: 246, g: 247, b: 156 },
  { r: 205, g: 238, b: 106 },
  { r: 134, g: 239, b: 172 },
  { r: 74,  g: 222, b: 128 },
];

function interpolateColor(t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (COLOR_STOPS.length - 1);
  const i = Math.min(Math.floor(scaled), COLOR_STOPS.length - 2);
  const f = scaled - i;
  const a = COLOR_STOPS[i]!;
  const b = COLOR_STOPS[i + 1]!;
  return {
    r: Math.round(a.r + (b.r - a.r) * f),
    g: Math.round(a.g + (b.g - a.g) * f),
    b: Math.round(a.b + (b.b - a.b) * f),
  };
}

function toRgb({ r, g, b }: { r: number; g: number; b: number }) {
  return `rgb(${r},${g},${b})`;
}

export function WeekBubble({ totalReps }: { totalReps: number }) {
  const target = 27;
  const progress = Math.min(totalReps / target, 1);
  const isComplete = progress >= 1;
  const circumference = 2 * Math.PI * 46;
  const offset = circumference * (1 - progress);

  // Начало градиента отстаёт от конца на 40% — плавно зеленеет весь круг
  const startColor = interpolateColor(Math.max(0, progress - 0.4));
  const endColor = interpolateColor(progress);
  const glowRgb = `${endColor.r},${endColor.g},${endColor.b}`;

  return (
    <div className="flex flex-col items-center gap-3 -ml-4">
      <div className="relative">
        <motion.div
          className="absolute rounded-full blur-2xl"
          style={{
            inset: isComplete ? "-20px" : "-16px",
            background: `radial-gradient(circle, rgba(${glowRgb},0.5) 0%, transparent 70%)`,
          }}
          animate={isComplete
            ? { opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }
            : { opacity: 0.4, scale: 1 }
          }
          transition={isComplete
            ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.5 }
          }
        />

        <div
          className="relative h-[11.75rem] w-[11.75rem] sm:h-[13.75rem] sm:w-[13.75rem] lg:h-[16.75rem] lg:w-[16.75rem] rounded-full flex items-center justify-center"
          role="img"
          aria-label={`Пузырь памяти: ${totalReps} повторений`}
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 48px -16px rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
            <defs>
              <linearGradient id="ringGradient" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={toRgb(startColor)} />
                <stop offset="100%" stopColor={toRgb(endColor)} />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="4"
            />
            <motion.circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={false}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
              style={{ filter: `drop-shadow(0 0 6px rgba(${glowRgb},0.8))` }}
            />
          </svg>

          <div className="flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-semibold text-foam">{totalReps}</span>
            <span className="mt-1 text-[11px] uppercase tracking-wide text-foam-muted">повторений</span>
          </div>
        </div>
      </div>

      <div className="w-full mt-1" style={{
        height: "1px",
        background: `linear-gradient(90deg, transparent 0%, rgba(${glowRgb},0.3) 40%, rgba(${glowRgb},0.3) 60%, transparent 100%)`,
        boxShadow: `0 0 8px 0px rgba(${glowRgb},0.2)`,
      }} />
    </div>
  );
}

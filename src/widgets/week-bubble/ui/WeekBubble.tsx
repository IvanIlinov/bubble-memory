"use client";

import { motion } from "framer-motion";

const COLOR_STOPS = [
  { r: 239, g: 68,  b: 68  }, // #EF4444 red
  { r: 247, g: 171, b: 77  }, // #F7AB4D orange
  { r: 246, g: 247, b: 156 }, // #F6F79C amber
  { r: 156, g: 247, b: 168 }, // #9CF7A8 lime
  { r: 134, g: 239, b: 172 }, // #86EFAC mint
  { r: 74,  g: 222, b: 128 }, // #4ADE80 green
];

function interpolateColor(t: number): string {
  const scaled = t * (COLOR_STOPS.length - 1);
  const i = Math.min(Math.floor(scaled), COLOR_STOPS.length - 2);
  const f = scaled - i;
  const a = COLOR_STOPS[i]!;
  const b = COLOR_STOPS[i + 1]!;
  const r = Math.round(a.r + (b.r - a.r) * f);
  const g = Math.round(a.g + (b.g - a.g) * f);
  const bl = Math.round(a.b + (b.b - a.b) * f);
  return `rgb(${r},${g},${bl})`;
}

function buildGradientStops(progress: number): { offset: string; color: string }[] {
  if (progress <= 0) return [
    { offset: "0%", color: "#EF4444" },
    { offset: "100%", color: "#EF4444" },
  ];

  const steps = 6;
  return Array.from({ length: steps }, (_, i) => {
    const t = (i / (steps - 1)) * progress;
    return {
      offset: `${Math.round((i / (steps - 1)) * 100)}%`,
      color: interpolateColor(t),
    };
  });
}

export function WeekBubble({ totalReps }: { totalReps: number }) {
  const target = 27;
  const progress = Math.min(totalReps / target, 1);
  const circumference = 2 * Math.PI * 46;
  const offset = circumference * (1 - progress);

  const stops = buildGradientStops(progress);
  const glowColor = interpolateColor(progress);
  const glowRgb = glowColor.replace("rgb(", "").replace(")", "");

  return (
    <div className="flex flex-col items-center gap-3 -ml-4">
      <div className="relative">
        <div
          className="absolute -inset-4 rounded-full blur-2xl opacity-40"
          style={{
            background: `radial-gradient(circle, rgba(${glowRgb},0.35) 0%, transparent 70%)`,
          }}
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
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                {stops.map((s, i) => (
                  <stop key={i} offset={s.offset} stopColor={s.color} />
                ))}
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
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
              style={{ filter: `drop-shadow(0 0 6px rgba(${glowRgb},0.7))` }}
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

"use client";

import { motion } from "framer-motion";

export function WeekBubble({ totalReps }: { totalReps: number }) {
  const target = 27;
  const progress = Math.min(totalReps / target, 1);
  const circumference = 2 * Math.PI * 46;
  const offset = circumference * (1 - progress);


  return (
    <div className="flex flex-col items-center gap-3 -ml-4">
      <div className="relative">
        <div
          className="absolute -inset-4 rounded-full blur-2xl opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(61,220,196,0.3) 0%, transparent 70%)",
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
              transition={{ duration: 0.6, ease: [0.34, 1.0, 0.64, 1.0] }}
              style={{ filter: "drop-shadow(0 0 6px rgba(61,220,196,0.6))" }}
            />
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3DDCC4" />
                <stop offset="100%" stopColor="#9E8CFF" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-semibold text-foam">{totalReps}</span>
            <span className="mt-1 text-[11px] uppercase tracking-wide text-foam-muted">повторений</span>
          </div>
        </div>
      </div>

      {/* Разделитель */}
      <div className="w-full mt-1" style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent 0%, rgba(61,220,196,0.25) 30%, rgba(158,140,255,0.25) 70%, transparent 100%)",
        boxShadow: "0 0 8px 0px rgba(61,220,196,0.15)",
      }} />
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

export function WeekBubble({ totalReps }: { totalReps: number }) {
  const target = 27;
  const progress = Math.min(totalReps / target, 1);
  const fillPercent = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-3 -ml-4">
      <div
        className="relative h-[11.25rem] w-[11.25rem] sm:h-[13.25rem] sm:w-[13.25rem] lg:h-[16.25rem] lg:w-[16.25rem] overflow-hidden rounded-full ring-1 ring-white/10 bg-deep-panel shadow-bubble-lg animate-breathe"
        role="img"
        aria-label={`Пузырь памяти: ${totalReps} повторений`}
      >
        <motion.div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-living to-living-glow/80"
          initial={false}
          animate={{ height: `${fillPercent}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 16 }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl text-foam drop-shadow">
            {totalReps}
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-wide text-foam-muted">
            повторений
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

export function WeekBubble({
  solvedCount,
  targetCount,
}: {
  solvedCount: number;
  targetCount: number;
}) {
  const progress = targetCount > 0 ? Math.min(solvedCount / targetCount, 1) : 0;
  const fillPercent = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative h-44 w-44 overflow-hidden rounded-full ring-1 ring-white/10 bg-deep-panel shadow-bubble-lg animate-breathe"
        role="img"
        aria-label={`Недельный пузырь памяти: ${solvedCount} из ${targetCount}`}
      >
        {/* "Вода" — заполнение по прогрессу недели */}
        <motion.div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-living to-living-glow/80"
          initial={false}
          animate={{ height: `${fillPercent}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 16 }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl text-foam drop-shadow">
            {solvedCount}
            <span className="text-foam-muted">/{targetCount}</span>
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-wide text-foam-muted">
            эта неделя
          </span>
        </div>
      </div>
    </div>
  );
}

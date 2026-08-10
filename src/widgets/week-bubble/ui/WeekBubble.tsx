"use client";

import { motion } from "framer-motion";

export function WeekBubble({ totalReps }: { totalReps: number }) {
  const target = 27;
  const progress = Math.min(totalReps / target, 1);
  const fillPercent = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-3 -ml-4">
      <div className="relative">
        {/* Внешнее свечение */}
        <div
          className="absolute -inset-6 rounded-full blur-2xl opacity-60 animate-breathe"
          style={{
            background:
              "radial-gradient(circle, rgba(254,154,52,0.35) 0%, rgba(42,176,163,0.25) 55%, transparent 75%)",
          }}
        />

        <div
          className="relative h-[11.75rem] w-[11.75rem] sm:h-[13.75rem] sm:w-[13.75rem] lg:h-[18.25rem] lg:w-[18.25rem] overflow-hidden rounded-full animate-breathe"
          role="img"
          aria-label={`Пузырь памяти: ${totalReps} повторений`}
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 45%, rgba(10,51,44,0.4) 100%)",
            boxShadow:
              "0 0 0 1.5px rgba(255,255,255,0.18), inset 0 2px 24px rgba(255,255,255,0.15), inset 0 -20px 40px rgba(0,0,0,0.35), 0 30px 60px -12px rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
          }}
        >
          {/* Заполнение — тёплый закатный градиент */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            initial={false}
            animate={{ height: `${fillPercent}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 16 }}
            style={{
              background:
                "linear-gradient(180deg, #FFE458 0%, #FE9A34 45%, #FF544C 100%)",
              boxShadow: "0 -4px 30px rgba(254,154,52,0.5)",
            }}
          />

          {/* Блик сверху для объёма */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-2/3 h-1/3 rounded-full opacity-40 blur-md pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)" }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl text-foam drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              {totalReps}
            </span>
            <span className="mt-1 text-[11px] uppercase tracking-wide text-foam/80 drop-shadow">
              повторений
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";

type Period = "week" | "month" | "year";

const LABELS: Record<Period, string> = {
  week: "Недели",
  month: "Месяцы",
  year: "Годы",
};

// Демо-данные — в реальном приложении подтягиваются из WeeklyBubble/MonthlyBubble/YearBubble.
const MOCK_HISTORY: Record<Period, { label: string; value: number }[]> = {
  week: [
    { label: "W29", value: 12 },
    { label: "W30", value: 18 },
    { label: "W31", value: 9 },
    { label: "W32", value: 14 },
  ],
  month: [
    { label: "Май", value: 61 },
    { label: "Июн", value: 74 },
    { label: "Июл", value: 58 },
    { label: "Авг", value: 14 },
  ],
  year: [{ label: "2025", value: 420 }, { label: "2026", value: 207 }],
};

export function GrowthHistory() {
  const [period, setPeriod] = useState<Period>("week");
  const data = MOCK_HISTORY[period];
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <section aria-label="История роста" className="w-full">
      <div className="mb-3 flex justify-center gap-1 rounded-full bg-deep-panel p-1">
        {(Object.keys(LABELS) as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-body transition-colors",
              period === p ? "bg-living text-deep font-semibold" : "text-foam-muted",
            )}
          >
            {LABELS[p]}
          </button>
        ))}
      </div>

      <div className="flex h-24 items-end justify-center gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1">
            <div
              className="w-6 rounded-full bg-gradient-to-t from-living-soft to-living"
              style={{ height: `${(d.value / max) * 80}px` }}
            />
            <span className="text-[10px] text-foam-muted">{d.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

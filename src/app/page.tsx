"use client";

import { useState } from "react";
import { TaskBubblesPanel } from "@/widgets/task-bubbles-panel/ui/TaskBubblesPanel";
import { WeekBubble } from "@/widgets/week-bubble/ui/WeekBubble";
import { GrowthHistory } from "@/widgets/growth-history/ui/GrowthHistory";

// Первый экран — статичная витрина на моках.
// Клик по баблу пока просто двигает локальный счётчик недели;
// реальная логика (ReviewAlgorithm, антиспам "раз в день", запись в БД)
// подключается через API route на entities/task-memory.
export default function HomePage() {
  const [solvedCount, setSolvedCount] = useState(8);
  const targetCount = 14;

  function handleReview() {
    setSolvedCount((v) => Math.min(v + 1, targetCount));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-4 pb-10 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg text-foam">Bubble Memory</p>
          <p className="text-xs text-foam-muted">не выполняй задания — заботься о памяти</p>
        </div>
        <div className="rounded-full bg-deep-panel px-3 py-1 text-xs text-gold ring-1 ring-gold/30">
          Каменный
        </div>
      </header>

      <div className="flex justify-center">
        <WeekBubble solvedCount={solvedCount} targetCount={targetCount} />
      </div>

      <TaskBubblesPanel onReview={handleReview} />

      <GrowthHistory />
    </main>
  );
}

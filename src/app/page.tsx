"use client";

import { useEffect, useState } from "react";
import { TaskBubblesPanel } from "@/widgets/task-bubbles-panel/ui/TaskBubblesPanel";
import { WeekBubble } from "@/widgets/week-bubble/ui/WeekBubble";
import { GrowthHistory } from "@/widgets/growth-history/ui/GrowthHistory";
import {
  getTelegramWebApp,
  getTelegramUser,
  getTelegramInitData,
} from "@/shared/lib/telegram";
import type { MockTaskBubble } from "@/widgets/task-bubbles-panel/model/mockTasks";

export default function HomePage() {
  const [solvedCount, setSolvedCount] = useState(0);
  const [targetCount, setTargetCount] = useState(27);
  const [tasks, setTasks] = useState<MockTaskBubble[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState("Деревянный");

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.ready();
      tg.expand();
    }

    async function loadTasks() {
      try {
        const initData = getTelegramInitData();
        const telegramUser = getTelegramUser();

        if (!initData || !telegramUser) {
          console.warn("No Telegram data");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/tasks", {
          headers: {
            "x-telegram-init-data": initData,
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setUser(data.user);
        
        // Конвертируем в формат MockTaskBubble
        const convertedTasks: MockTaskBubble[] = data.tasks.map((t: any) => ({
          taskTypeId: t.taskTypeId,
          number: t.number,
          title: t.title,
          repetitions: t.repetitions,
          color: "none" as const,
          lastReviewLabel: t.lastReview ? `повторено недавно` : "ещё не начато",
          reviewedToday: false,
        }));
        
        setTasks(convertedTasks);
        setSolvedCount(convertedTasks.filter(t => t.repetitions > 0).length);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  function handleReview(taskTypeId: string) {
    // TODO: вызвать POST /api/review
    setSolvedCount((v) => Math.min(v + 1, targetCount));
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
        <p className="text-foam-muted">Загружаю твои задачи...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-4 pb-10 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg text-foam">Bubble Memory</p>
          <p className="text-xs text-foam-muted">не выполняй задания — заботься о памяти</p>
        </div>
        <div className="rounded-full bg-deep-panel px-3 py-1 text-xs text-gold ring-1 ring-gold/30">
          {tier}
        </div>
      </header>

      {user && (
        <div className="text-center text-sm text-foam">
          Привет, <span className="font-semibold">{user.first_name}</span>!
        </div>
      )}

      <div className="flex justify-center">
        <WeekBubble solvedCount={solvedCount} targetCount={tasks.length} />
      </div>

      {tasks.length > 0 && (
        <TaskBubblesPanel onReview={handleReview} tasks={tasks} />
      )}

      <GrowthHistory />
    </main>
  );
}

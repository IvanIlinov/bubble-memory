"use client";

import { useEffect, useState } from "react";
import { TaskBubblesPanel } from "@/widgets/task-bubbles-panel/ui/TaskBubblesPanel";
import { WeekBubble } from "@/widgets/week-bubble/ui/WeekBubble";
import { GrowthHistory } from "@/widgets/growth-history/ui/GrowthHistory";
import {
  getTelegramUser,
  getTelegramInitData,
} from "@/shared/lib/telegram";
import { getMockTaskBubbles } from "@/widgets/task-bubbles-panel/model/mockTasks";
import type { MockTaskBubble } from "@/widgets/task-bubbles-panel/model/mockTasks";

const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

function convertTasks(data: any[]): MockTaskBubble[] {
  return data.map((t: any) => ({
    taskTypeId: t.taskTypeId,
    number: t.number,
    title: t.title,
    repetitions: t.repetitions,
    color: "none" as const,
    lastReviewLabel: t.lastReview ? "повторено" : "не начато",
    reviewedToday: false,
  }));
}

export default function HomePage() {
  const [tasks, setTasks] = useState<MockTaskBubble[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [totalReps, setTotalReps] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadFromServer(initData: string) {
    const response = await fetch("/api/tasks", {
      headers: { "x-telegram-init-data": initData },
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      setUserId(data.userId);
      const converted = convertTasks(data.tasks || []);
      setTasks(converted);
      const total = (data.tasks || []).reduce(
        (sum: number, t: any) => sum + (t.repetitions || 0),
        0
      );
      setTotalReps(total);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const initData = getTelegramInitData();
        const telegramUser = getTelegramUser();

        if (initData && telegramUser) {
          await loadFromServer(initData);
          setLoading(false);
          return;
        }

        setTasks(getMockTaskBubbles());
        setUser({ first_name: "Guest" });
        setLoading(false);
      } catch (error) {
        console.error("Init error:", error);
        setLoading(false);
      }
    }

    init();
  }, []);

  async function handleReview(taskTypeId: string) {
    setTotalReps((v) => v + 1);
    if (!userId) return;
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, taskTypeId }),
      });
    } catch (error) {
      console.error("Review failed:", error);
    }
  }

  if (loading && tasks.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-living border-t-transparent mx-auto mb-3" />
          <p className="text-foam-muted">Загружаю...</p>
        </div>
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
        <div className="flex items-center gap-2">
          
            href="/journal"
            className="rounded-full bg-deep-panel p-2 ring-1 ring-white/10 text-foam-muted hover:text-foam transition-colors"
            aria-label="Журнал"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </a>
          <div className="rounded-full bg-deep-panel px-3 py-1 text-xs text-gold ring-1 ring-gold/30">
            Деревянный
          </div>
        </div>
      </header>

      {user && (
        <div className="text-center text-sm text-foam">
          Привет, {user.first_name}!
        </div>
      )}

      <div className="flex justify-center">
        <WeekBubble solvedCount={totalReps} targetCount={27} />
      </div>

      {tasks.length > 0 && (
        <TaskBubblesPanel onReview={handleReview} tasks={tasks} />
      )}

      <GrowthHistory />
    </main>
  );
}

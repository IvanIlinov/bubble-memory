"use client";

import { useEffect, useState } from "react";
import { TaskBubblesPanel } from "@/widgets/task-bubbles-panel/ui/TaskBubblesPanel";
import { WeekBubble } from "@/widgets/week-bubble/ui/WeekBubble";
import { GrowthHistory } from "@/widgets/growth-history/ui/GrowthHistory";
import {
  getTelegramUser,
  getTelegramInitData,
} from "@/shared/lib/telegram";
import { getCachedTasks, setCachedTasks } from "@/shared/lib/cache";
import { getMockTaskBubbles } from "@/widgets/task-bubbles-panel/model/mockTasks";
import type { MockTaskBubble } from "@/widgets/task-bubbles-panel/model/mockTasks";

const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export default function HomePage() {
  const [solvedCount, setSolvedCount] = useState(0);
  const [tasks, setTasks] = useState<MockTaskBubble[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const initData = getTelegramInitData();
        const telegramUser = getTelegramUser();

        // Сначала проверяем кеш
        const cached = getCachedTasks();
        if (cached) {
          setUser(cached.user);
          setUserId(cached.userId);
          setTasks(
            cached.tasks.map((t: any) => ({
              taskTypeId: t.taskTypeId,
              number: t.number,
              title: t.title,
              repetitions: t.repetitions,
              color: "none" as const,
              lastReviewLabel: "не начато",
              reviewedToday: false,
            }))
          );
          setSolvedCount(cached.tasks.filter((t: any) => t.repetitions > 0).length);
          setLoading(false);

          // На мобилке не ждём синхронизацию
          if (isMobile()) {
            return;
          }
        }

        // Если нет данных Telegram — используем моки
        if (!initData || !telegramUser) {
          const mocks = getMockTaskBubbles();
          setTasks(mocks);
          setUser({ first_name: "Guest" });
          setLoading(false);
          return;
        }

        // Загружаем из API с timeout
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);

        const response = await fetch("/api/tasks", {
          headers: {
            "x-telegram-init-data": initData,
          },
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          
          setCachedTasks({
            userId: data.userId,
            user: data.user,
            tasks: data.tasks,
            timestamp: Date.now(),
          });

          setUser(data.user);
          setUserId(data.userId);

          const convertedTasks: MockTaskBubble[] = (data.tasks || []).map(
            (t: any) => ({
              taskTypeId: t.taskTypeId,
              number: t.number,
              title: t.title,
              repetitions: t.repetitions,
              color: "none" as const,
              lastReviewLabel: "не начато",
              reviewedToday: false,
            })
          );

          setTasks(convertedTasks);
          setSolvedCount(convertedTasks.filter((t) => t.repetitions > 0).length);
        }
      } catch (error) {
        console.error("Init error:", error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  async function handleReview(taskTypeId: string) {
    setSolvedCount((v) => v + 1);

    if (!userId) return;

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 2000);

      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, taskTypeId }),
        signal: controller.signal,
      });
    } catch (error) {
      console.error("Review error:", error);
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
        <div className="rounded-full bg-deep-panel px-3 py-1 text-xs text-gold ring-1 ring-gold/30">
          Деревянный
        </div>
      </header>

      {user && (
        <div className="text-center text-sm text-foam">
          Привет, {user.first_name}!
        </div>
      )}

      <div className="flex justify-center">
        <WeekBubble solvedCount={solvedCount} targetCount={tasks.length || 27} />
      </div>

      {tasks.length > 0 && (
        <TaskBubblesPanel onReview={handleReview} tasks={tasks} />
      )}

      <GrowthHistory />
    </main>
  );
}

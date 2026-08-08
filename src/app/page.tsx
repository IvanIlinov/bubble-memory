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
  const [status, setStatus] = useState("");

  async function loadTasksFromServer() {
    try {
      const initData = getTelegramInitData();
      if (!initData) return;

      const response = await fetch("/api/tasks", {
        headers: {
          "x-telegram-init-data": initData,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Кешируем свежие данные
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
      console.error("Load error:", error);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const initData = getTelegramInitData();
        const telegramUser = getTelegramUser();
        setStatus(`TG: ${initData.length > 0 ? "✓" : "✗"}`);

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
          setStatus("✓ Cache");

          if (isMobile()) {
            return;
          }
        }

        if (!initData || !telegramUser) {
          const mocks = getMockTaskBubbles();
          setTasks(mocks);
          setUser({ first_name: "Guest" });
          setLoading(false);
          setStatus("⚠️ Mocks");
          return;
        }

        // Загружаем реальные данные
        await loadTasksFromServer();
        setStatus("✓ Loaded");
      } catch (error) {
        setStatus(`✗ ${error}`);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  async function handleReview(taskTypeId: string) {
    setSolvedCount((v) => v + 1);
    setStatus(`📤 saving...`);

    if (!userId) {
      setStatus(`✗ no userId`);
      return;
    }

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, taskTypeId }),
      });

      if (response.ok) {
        setStatus(`✓ saved`);
        // После успешного клика — перезагружаем данные со сервера
        setTimeout(() => loadTasksFromServer(), 500);
      } else {
        setStatus(`✗ ${response.status}`);
      }
    } catch (error) {
      setStatus(`✗ error`);
      console.error("Review failed:", error);
    }
  }

  if (loading && tasks.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-living border-t-transparent mx-auto mb-3" />
          <p className="text-foam-muted">Загружаю...</p>
          <p className="text-[10px] text-foam-muted/60 mt-2">{status}</p>
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
        <div className="text-center">
          <p className="text-sm text-foam">Привет, {user.first_name}!</p>
          <p className="text-[9px] text-foam-muted/50">{status}</p>
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

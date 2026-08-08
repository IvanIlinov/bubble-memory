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
  const [tasks, setTasks] = useState<MockTaskBubble[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState<string>("");

  useEffect(() => {
    const tg = getTelegramWebApp();
    console.log("🔧 TG WebApp:", tg ? "OK" : "NONE");
    
    if (tg) {
      tg.ready();
      tg.expand();
      setDebug(`TG: OK | `);
    }

    async function loadTasks() {
      try {
        const initData = getTelegramInitData();
        const telegramUser = getTelegramUser();

        console.log("📱 initData:", initData?.substring(0, 50));
        console.log("👤 user:", telegramUser);
        
        setDebug(prev => prev + `initData: ${initData?.length || 0} | user: ${telegramUser?.first_name || "?"}`);

        if (!initData || !telegramUser) {
          setDebug(prev => prev + " | NO DATA");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/tasks", {
          headers: {
            "x-telegram-init-data": initData,
          },
        });

        console.log("📡 Response:", response.status);
        setDebug(prev => prev + ` | API: ${response.status}`);

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("✅ Data:", data);
        
        setUser(data.user);
        setUserId(data.userId);
        
        const convertedTasks: MockTaskBubble[] = (data.tasks || []).map((t: any) => ({
          taskTypeId: t.taskTypeId,
          number: t.number,
          title: t.title,
          repetitions: t.repetitions,
          color: "none" as const,
          lastReviewLabel: "не начато",
          reviewedToday: false,
        }));
        
        setTasks(convertedTasks);
        setSolvedCount(convertedTasks.filter(t => t.repetitions > 0).length);
        setDebug(prev => prev + ` | Tasks: ${convertedTasks.length}`);
      } catch (error) {
        console.error("❌ Error:", error);
        setDebug(prev => prev + ` | Error: ${error}`);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  async function handleReview(taskTypeId: string) {
    if (!userId) return;

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          taskTypeId,
        }),
      });

      if (response.ok) {
        setSolvedCount((v) => v + 1);
      }
    } catch (error) {
      console.error("Failed to save review:", error);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foam-muted mb-2">Загружаю...</p>
          <p className="text-[10px] text-foam-muted">{debug}</p>
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

      {/* ДЕБАГ ИНФОРМАЦИЯ */}
      <div className="text-center text-[9px] text-foam-muted bg-deep-panel/50 p-1 rounded">
        {debug}
      </div>

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

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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

interface User {
  first_name: string;
  last_name?: string;
  username?: string;
}

interface ServerTask {
  taskTypeId: string;
  number: number;
  title: string;
  repetitions: number;
  lastReview?: string | null;
}

function convertTasks(data: ServerTask[]): MockTaskBubble[] {
  return data.map((t) => ({
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
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState("");
  const userIdRef = useRef("");
  const [totalReps, setTotalReps] = useState(0);
  const totalRepsRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const initDataRef = useRef("");

  async function loadFromServer(initData: string) {
    try {
      const response = await fetch("/api/tasks", {
        headers: { "x-telegram-init-data": initData },
      });

      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }

      const data = await response.json();

      setUser(data.user);
      const uid = String(data.userId);
      setUserId(uid);
      userIdRef.current = uid;

      const serverTasks: ServerTask[] = data.tasks || [];
      setTasks(convertTasks(serverTasks));
      const reps = serverTasks.reduce((sum, t) => sum + (t.repetitions || 0), 0);
      
      setTotalReps(reps);
      totalRepsRef.current = reps;

      setCachedTasks({
        userId: uid,
        user: data.user,
        tasks: serverTasks,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Load from server error:", error);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const cached = getCachedTasks();
        if (cached) {
          setUser(cached.user);
          setUserId(cached.userId);
          userIdRef.current = cached.userId;
          setTasks(convertTasks(cached.tasks));
          const reps = cached.tasks.reduce((sum, t) => sum + (t.repetitions || 0), 0);
          setTotalReps(reps);
          totalRepsRef.current = reps;
          setLoading(false);
        }

        const initData = getTelegramInitData();
        initDataRef.current = initData;
        const telegramUser = getTelegramUser();

        if (initData && telegramUser) {
          await loadFromServer(initData);
        } else if (!cached) {
          setTasks(getMockTaskBubbles());
          setUser({ first_name: "Guest" });
        }
      } catch (error) {
        console.error("Init error:", error);
        const cached = getCachedTasks();
        if (!cached) {
          setTasks(getMockTaskBubbles());
          setUser({ first_name: "Guest" });
        }
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  async function handleReview(taskTypeId: string): Promise<void> {
    const uid = userIdRef.current;
    if (!uid) return;

    totalRepsRef.current++;
    setTotalReps(totalRepsRef.current);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, taskTypeId }),
      });

      if (!response.ok) throw new Error("Review failed");

      // Успешный ответ — рефрешим кеш через сервер
      if (initDataRef.current) {
        await loadFromServer(initDataRef.current);
      }
    } catch (error) {
      console.error("Review failed:", error);
    }
  }

  if (loading && tasks.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-deep">
        <div className="text-foam-muted">Загружаю...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-deep px-4 py-6 text-foam">
      <div className="mx-auto max-w-md">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Bubble Memory</h1>
              <p className="mt-1 text-xs text-foam-muted">
                не выполняй задания — заботься о памяти
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/journal"
                className="rounded-full bg-deep-panel p-2 text-foam-muted ring-1 ring-white/10 transition-colors hover:text-foam"
                aria-label="Журнал"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </Link>
              <div className="rounded-full bg-deep-panel px-3 py-1 text-xs text-gold ring-1 ring-gold/30">
                Деревянный
              </div>
            </div>
          </div>
        </header>

        {user && (
          <div className="mb-6 text-center text-sm text-foam">
            Привет, {user.first_name}!
          </div>
        )}

        {tasks.length > 0 ? (
          <section className="space-y-6">
            <WeekBubble totalReps={totalReps} />
            <TaskBubblesPanel tasks={tasks} onReview={handleReview} />
            <GrowthHistory />
          </section>
        ) : (
          <div className="rounded-2xl bg-deep-panel p-6 text-center text-foam-muted ring-1 ring-white/10">
            Пока нет заданий
          </div>
        )}
      </div>
    </main>
  );
}

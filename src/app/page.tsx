"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";

import { TaskBubblesPanel } from "@/widgets/task-bubbles-panel/ui/TaskBubblesPanel";
import { WeekBubble } from "@/widgets/week-bubble/ui/WeekBubble";
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
  nickname?: string;
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
        const telegramUser = getTelegramUser();

        if (initData && telegramUser) {
          await loadFromServer(initData);
        } else if (!cached) {
          setTasks(getMockTaskBubbles());
          setUser({ first_name: "Guest" });
          setLoading(false);
        }
      } catch (error) {
        console.error("Init error:", error);
        const cached = getCachedTasks();
        if (!cached) {
          setTasks(getMockTaskBubbles());
          setUser({ first_name: "Guest" });
        }
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

    const cached = getCachedTasks();
    if (cached) {
      setCachedTasks({
        ...cached,
        tasks: cached.tasks.map(t =>
          t.taskTypeId === taskTypeId
            ? { ...t, repetitions: t.repetitions + 1 }
            : t
        ),
      });
    }

    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, taskTypeId }),
      });
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
    <main className="min-h-screen bg-deep px-4 py-6 pb-28 text-foam">
      <div className="mx-auto max-w-md">
        {tasks.length > 0 ? (
          <section className="rounded-3xl backdrop-blur-sm bg-white/5 ring-1 ring-white/10 p-8 space-y-8">
            <WeekBubble totalReps={totalReps} />
            <TaskBubblesPanel tasks={tasks} onReview={handleReview} />
          </section>
        ) : (
          <div className="rounded-2xl bg-deep-panel p-6 text-center text-foam-muted ring-1 ring-white/10">
            Пока нет заданий
          </div>
        )}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-6 left-0 right-0">
          <div className="mx-auto max-w-md px-4">
            <div className="rounded-3xl backdrop-blur-sm bg-white/5 ring-1 ring-white/10 p-4 flex items-center justify-between">
              <Link
                href={"/rating" as Route}
                className="flex flex-col items-center gap-2 p-2 text-foam-muted hover:text-foam transition-colors"
                aria-label="Рейтинг"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26H21.77L17.38 12.46L19.47 18.74L12 14.54L4.53 18.74L6.62 12.46L2.23 8.26H8.91L12 2Z" />
                </svg>
                <span className="text-xs">Рейтинг</span>
              </Link>

              <Link
                href={"/profile" as Route}
                className="flex flex-col items-center gap-2 p-2 text-foam-muted hover:text-foam transition-colors"
                aria-label="Профиль"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="text-xs">Профиль</span>
              </Link>

              <Link
                href={"/journal" as Route}
                className="flex flex-col items-center gap-2 p-2 text-foam-muted hover:text-foam transition-colors"
                aria-label="История"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-xs">История</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </main>
  );
}

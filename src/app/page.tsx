"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const NAV_LINKS = [
  {
    href: "/rating",
    label: "Рейтинг",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26H21.77L17.38 12.46L19.47 18.74L12 14.54L4.53 18.74L6.62 12.46L2.23 8.26H8.91L12 2Z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "История",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
];

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-0 right-0 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-2xl">
        <div
          className="rounded-full px-4 py-2 flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 16px 32px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {NAV_LINKS.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href as Route}
                aria-label={label}
                className="flex flex-col items-center gap-1 px-5 py-2 rounded-full transition-all duration-200"
                style={isActive ? {
                  background: "rgba(61,220,196,0.1)",
                  border: "1px solid rgba(61,220,196,0.5)",
                  boxShadow: "0 0 16px -4px rgba(61,220,196,0.5)",
                  color: "#3DDCC4",
                } : {
                  color: "rgba(255,255,255,0.45)",
                  border: "1px solid transparent",
                }}
              >
                {icon}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
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
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
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
      setCachedTasks({ userId: uid, user: data.user, tasks: serverTasks, timestamp: Date.now() });
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
          t.taskTypeId === taskTypeId ? { ...t, repetitions: t.repetitions + 1 } : t
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
    <main
      className="relative min-h-screen px-4 py-2 pb-24 text-foam sm:px-6 lg:px-8"
      style={{ background: "radial-gradient(ellipse at 50% -10%, #191D1E 0%, #0D0F0F 55%)" }}
    >
      <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-2xl relative">
        {tasks.length > 0 ? (
          <section
            className="rounded-3xl p-6 space-y-4 lg:space-y-8"
            style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px -16px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
            }}
          >
            <WeekBubble totalReps={totalReps} />
            <TaskBubblesPanel tasks={tasks} onReview={handleReview} />
          </section>
        ) : (
          <div className="rounded-2xl p-6 text-center text-foam-muted" style={{ background: "rgba(255,255,255,0.04)" }}>
            Пока нет заданий
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

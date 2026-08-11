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
import { computeM, mToColor } from "@/entities/task-memory/lib/memoryFormula";

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
  intervalDays: number;
  lastReview?: string | null;
}

function convertTasks(data: ServerTask[]): MockTaskBubble[] {
  const now = new Date();
  return data.map((t) => {
    const hasStarted = t.repetitions > 0 && !!t.lastReview && t.intervalDays > 0;
    const m = hasStarted
      ? computeM(new Date(t.lastReview!), t.intervalDays, now)
      : 0;

    return {
      taskTypeId: t.taskTypeId,
      number: t.number,
      title: t.title,
      repetitions: t.repetitions,
      stabilityDays: t.intervalDays,
      memoryPercent: Math.round(m),
      color: hasStarted ? mToColor(m) : ("none" as const),
      lastReviewLabel: t.lastReview
        ? `${Math.round((now.getTime() - new Date(t.lastReview).getTime()) / 86400000)} дн. назад`
        : "ещё не начато",
      reviewedToday: false,
    };
  });
}

const NAV_LINKS = [
  {
    href: "/rating",
    label: "Рейтинг",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="nav-grad-rating" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3DDCC4" />
            <stop offset="100%" stopColor="#9E8CFF" />
          </linearGradient>
        </defs>
        <polygon fill="url(#nav-grad-rating)" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="nav-grad-profile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3DDCC4" />
            <stop offset="100%" stopColor="#9E8CFF" />
          </linearGradient>
        </defs>
        <circle fill="url(#nav-grad-profile)" cx="12" cy="8" r="4" />
        <path fill="url(#nav-grad-profile)" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "История",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="nav-grad-journal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3DDCC4" />
            <stop offset="100%" stopColor="#9E8CFF" />
          </linearGradient>
        </defs>
        <rect fill="url(#nav-grad-journal)" x="4" y="3" width="16" height="18" rx="2" />
        <rect fill="#0D0F0F" x="7" y="7.5" width="10" height="1.5" rx="0.75" />
        <rect fill="#0D0F0F" x="7" y="11" width="10" height="1.5" rx="0.75" />
        <rect fill="#0D0F0F" x="7" y="14.5" width="6" height="1.5" rx="0.75" />
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
                  border: "1px solid rgba(61,220,196,0.4)",
                  boxShadow: "0 0 16px -4px rgba(61,220,196,0.5)",
                } : {
                  opacity: 0.4,
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
                "0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px -16px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px -4px rgba(61,220,196,0.08)",
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

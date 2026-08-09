"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTelegramInitData } from "@/shared/lib/telegram";

interface LogEntry {
  id: string;
  taskType: { number: number; title: string };
  reviewedAt: string;
}

export default function JournalPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Читаем initData напрямую из Telegram WebApp
    // getCachedTasks ненадёжен: кеш мог ещё не записаться если юзер
    // сразу открыл /journal без захода на главную
    const initData = getTelegramInitData();

    if (initData) {
      loadLogs(initData);
    } else {
      // Fallback: пробуем userId из localStorage
      try {
        const raw = localStorage.getItem("bubble-memory-tasks");
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached?.userId) {
            loadLogsByUserId(cached.userId);
            return;
          }
        }
      } catch (_) { }
      setLoading(false);
    }
  }, []);

  async function loadLogs(initData: string) {
    try {
      const response = await fetch("/api/log", {
        headers: { "x-telegram-init-data": initData },
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs ?? []);
      }
    } catch (error) {
      console.error("Load logs error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadLogsByUserId(uid: string) {
    try {
      const response = await fetch(`/api/log?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs ?? []);
      }
    } catch (error) {
      console.error("Load logs error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteLog(id: string) {
    // Убираем мгновенно
    const prev = logs;
    setLogs((l) => l.filter((log) => log.id !== id));

    try {
      const initData = getTelegramInitData();
      const response = await fetch(`/api/log/${id}`, {
        method: "DELETE",
        headers: initData ? { "x-telegram-init-data": initData } : {},
      });
      if (!response.ok) {
        // Запрос упал — возвращаем
        setLogs(prev);
      }
    } catch {
      setLogs(prev);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-living border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-10 pt-8">
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="text-foam-muted hover:text-foam transition-colors"
        >
          назад
        </Link>
        <h1 className="font-display text-lg text-foam">Журнал</h1>
      </header>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-foam-muted">
          <p>Пока нет записей</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between bg-deep-panel rounded-xl px-4 py-3 ring-1 ring-white/5"
            >
              <div>
                <p className="text-xs text-foam-muted">
                  {formatDate(log.reviewedAt)}
                </p>
                <p className="text-sm text-foam mt-0.5">
                  Задание {log.taskType.number}
                  <span className="text-foam-muted text-xs ml-2">
                    {log.taskType.title}
                  </span>
                </p>
              </div>
              <button
                onClick={() => deleteLog(log.id)}
                className="ml-3 text-foam-dim hover:text-memory-red transition-colors p-1"
                aria-label="Удалить"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
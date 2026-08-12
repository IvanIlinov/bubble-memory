"use client";

import { useEffect, useState } from "react";

interface HistoryEntry {
  id: string;
  taskTypeId: number;
  reviewedAt: string;
  previousIntervalDays: number;
}

export function MasteryHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/log", {
          headers: {
            "x-telegram-init-data": window.Telegram?.WebApp?.initData || "",
          },
        });

        if (!response.ok) throw new Error("Failed to load history");

        const data = await response.json();
        setEntries(data.logs || []);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return <div className="text-center text-foam-muted">Загрузка истории...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl backdrop-blur-20 p-6"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px -16px rgba(0,0,0,0.65)",
        }}
      >
        <div className="text-center text-foam-muted text-sm">Истории нет</div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl backdrop-blur-20 p-6 space-y-3"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px -16px rgba(0,0,0,0.65)",
      }}
    >
      {entries.map((entry) => {
        const date = new Date(entry.reviewedAt);
        const dateStr = date.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div key={entry.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
            <div>
              <span className="text-foam-muted">{dateStr}</span>
              <span className="text-foam ml-2">задание {entry.taskTypeId}</span>
            </div>
            <button
              className="text-xs px-2 py-1 rounded text-foam-muted hover:text-coral transition-colors"
              onClick={() => {
                // TODO: implement delete
              }}
            >
              удалить
            </button>
          </div>
        );
      })}
    </div>
  );
}

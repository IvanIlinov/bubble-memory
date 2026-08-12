"use client";

import { useEffect, useState } from "react";

interface TaskData {
  taskTypeId: number;
  repetitions: number;
  intervalDays: number;
  memoryPercent: number;
  tier: string;
}

const TIER_EMOJI = {
  WOODEN: "🪵",
  BRONZE: "🔩",
  GOLD: "🥇",
  DIAMOND: "💎",
};

export function MasteryTasksList() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch("/api/profile", {
          headers: {
            "x-telegram-init-data": window.Telegram?.WebApp?.initData || "",
          },
        });

        if (!response.ok) throw new Error("Failed to load tasks");

        const data = await response.json();
        
        // Преобразуем данные TaskMemory в нужный формат
        const tasksData: TaskData[] = data.taskMemories.map((tm: any, idx: number) => {
          const S = tm.intervalDays;
          const lastReview = tm.lastReview ? new Date(tm.lastReview) : new Date();
          const now = new Date();
          const deltaT = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
          const M = 100 * Math.pow(2, -deltaT / S);
          const memoryPercent = Math.max(0, Math.min(100, M));

          let tier = "WOODEN";
          if (S >= 180) tier = "DIAMOND";
          else if (S >= 60) tier = "GOLD";
          else if (S >= 14) tier = "BRONZE";

          return {
            taskTypeId: tm.taskTypeId || (idx + 1),
            repetitions: tm.repetitions,
            intervalDays: S,
            memoryPercent,
            tier,
          };
        });

        setTasks(tasksData);
      } catch (err) {
        console.error("Failed to load tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading) {
    return <div className="text-center text-foam-muted">Загрузка...</div>;
  }

  return (
    <div className="rounded-3xl backdrop-blur-20 p-6 space-y-4"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px -16px rgba(0,0,0,0.65)",
      }}
    >
      {tasks.map((task, idx) => (
        <div key={task.taskTypeId} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foam">
                Задание {idx + 1}
              </span>
              <span className="text-lg">
                {TIER_EMOJI[task.tier as keyof typeof TIER_EMOJI] || "🪵"}
              </span>
            </div>
            <span className="text-xs font-medium text-foam-muted">
              S: {Math.round(task.intervalDays)} дн.
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foam-muted">память</span>
              <span className="text-foam font-medium">
                {Math.round(task.memoryPercent)}%
              </span>
            </div>
            
            <div className="relative h-2 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10">
              <div
                className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-[#86EFAC] to-[#4ADE80] transition-all duration-500"
                style={{ width: `${task.memoryPercent}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

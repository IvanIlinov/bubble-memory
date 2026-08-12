"use client";

import { useEffect, useState } from "react";
import { WeekBubble } from "@/widgets/week-bubble/ui/WeekBubble";
import { TaskBubblesPanel } from "@/widgets/task-bubbles-panel/ui/TaskBubblesPanel";
import { BottomNav } from "@/shared/ui/BottomNav";

interface Task {
  id: string;
  taskTypeId: number;
  repetitions: number;
  intervalDays: number;
  lastReview: string | null;
  memoryPercent: number;
  color: string;
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch("/api/tasks", {
          headers: {
            "x-telegram-init-data": window.Telegram?.WebApp?.initData || "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }

        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foam-muted">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-coral">{error}</div>
      </div>
    );
  }

  const totalReps = tasks.reduce((sum, task) => sum + task.repetitions, 0);

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <WeekBubble totalReps={totalReps} />
        <TaskBubblesPanel tasks={tasks} onTaskUpdate={() => window.location.reload()} />
        <div className="h-20" />
      </div>

      <BottomNav />
    </div>
  );
}

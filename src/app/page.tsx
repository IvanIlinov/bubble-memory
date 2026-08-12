"use client";

import { useEffect, useState } from "react";
import { WeekBubble } from "@/widgets/week-bubble/ui/WeekBubble";
import { TaskBubblesPanel } from "@/widgets/task-bubbles-panel/ui/TaskBubblesPanel";
import { BottomNav } from "@/shared/ui/BottomNav";
import { mToColor } from "@/entities/task-memory/lib/memoryFormula";
import type { MockTaskBubble } from "@/widgets/task-bubbles-panel/model/mockTasks";

const TITLES = [
  "Анализ диаграмм и таблиц",
  "Преобразование логического выражения",
  "Кодирование и декодирование",
  "Поиск информации в базе данных",
  "Анализ алгоритма для исполнителя",
  "Определение результата работы программы",
  "Кодирование звука и изображения",
  "Файловая система, пути",
  "Стандартные функции и процедуры",
  "Анализ программы с циклом",
  "Электронные таблицы",
  "Логические элементы и схемы",
  "Перевод между системами счисления",
  "Поиск пути в графе",
  "Анализ алгоритма сортировки",
  "Построение регулярного выражения",
  "Числовой анализ",
  "Динамическое программирование",
  "Теория вероятностей",
  "Комбинаторика",
  "Теория графов",
  "Логика и доказательства",
  "Оптимизация алгоритмов",
  "Анализ сложности",
  "Параллельные вычисления",
  "Исправление ошибок",
  "Безопасность данных",
];

export default function HomePage() {
  const [tasks, setTasks] = useState<MockTaskBubble[]>([]);
  const [totalReps, setTotalReps] = useState(0);
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
        const apiTasks = data.tasks || [];

        // Преобразуем в MockTaskBubble
        const mockTasks: MockTaskBubble[] = apiTasks.map((task: any, idx: number) => {
          const lastReview = task.lastReview ? new Date(task.lastReview) : new Date();
          const now = new Date();
          const deltaDays = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
          const S = task.intervalDays || 2;
          const m = task.repetitions === 0 ? 0 : Math.round(100 * Math.pow(2, -deltaDays / S));
          const color = mToColor(m);
          const reviewedToday = deltaDays === 0;

          return {
            taskTypeId: String(task.taskTypeId || idx + 1),
            number: idx + 1,
            title: TITLES[idx] || `Задание ${idx + 1}`,
            color,
            repetitions: task.repetitions,
            stabilityDays: Math.round(S),
            memoryPercent: m,
            lastReviewLabel: reviewedToday ? "сегодня" : `${deltaDays}д назад`,
            reviewedToday,
          };
        });

        setTasks(mockTasks);
        const reps = mockTasks.reduce((sum, task) => sum + task.repetitions, 0);
        setTotalReps(reps);
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

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
  const [userId, setUserId] = useState<string>("");
  const [totalReps, setTotalReps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>("");

  useEffect(() => {
    async function fetchTasks() {
      try {
        setDebug("Parsing auth...");

        // Парсим userId из initData
        const initData = window.Telegram?.WebApp?.initData || "";
        const params = new URLSearchParams(initData);
        const userStr = params.get("user");

        if (!userStr) {
          throw new Error("No user in initData");
        }

        const telegramUser = JSON.parse(decodeURIComponent(userStr));
        const uid = String(telegramUser.id);

        setDebug(`User: ${uid}. Fetching tasks...`);

        const response = await fetch("/api/tasks", {
          headers: {
            "x-telegram-init-data": initData,
          },
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        setUserId(data.userId);
        setDebug(`Got ${data.tasks?.length || 0} tasks`);
        const apiTasks = data.tasks || [];

        const mockTasks: MockTaskBubble[] = apiTasks.map((task: any, idx: number) => {
          const repetitions = task.repetitions || 0;
          const S = task.intervalDays || 2;

          let m = 100;

          if (repetitions > 0 && task.lastReview) {
            const lastReview = new Date(task.lastReview);
            const now = new Date();
            const deltaDays = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
            m = Math.max(0, Math.round(100 * Math.pow(2, -deltaDays / S)));
          }

          const color = mToColor(m);

          return {
            taskTypeId: String(task.taskTypeId),
            number: idx + 1,
            title: TITLES[idx] || `Задание ${idx + 1}`,
            color,
            repetitions,
            stabilityDays: Math.round(S),
            memoryPercent: m,
            lastReviewLabel: repetitions === 0 ? "новое" : "повторено",
            reviewedToday: false,
          };
        });

        setTasks(mockTasks);
        const reps = mockTasks.reduce((sum, task) => sum + task.repetitions, 0);
        setTotalReps(reps);
        setDebug(`Ready! ${reps} reps`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setDebug(`Error: ${msg}`);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foam-muted">Загрузка... {debug}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-2">
          <div className="text-coral">{error}</div>
          <div className="text-foam-muted text-sm bg-white/5 p-3 rounded text-left">
            {debug}
          </div>
        </div>
      </div>
    );
  }

  const handleReview = async (taskTypeId: string) => {
    setDebug(`Reviewing task ${taskTypeId}...`);
    try {
      const payload = { userId, taskTypeId };
      setDebug(`Sending: ${JSON.stringify(payload)}`);

      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setDebug(`Error: ${responseData.error}`);
        return;
      }

      setDebug("OK! Reloading...");
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setDebug(`Failed: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <WeekBubble totalReps={totalReps} />

        {debug && (
          <div className="text-xs bg-white/5 p-2 rounded text-foam-muted font-mono break-words">
            {debug}
          </div>
        )}

        <TaskBubblesPanel tasks={tasks} onReview={handleReview} />
        <div className="h-20" />
      </div>

      <BottomNav />
    </div>
  );
}

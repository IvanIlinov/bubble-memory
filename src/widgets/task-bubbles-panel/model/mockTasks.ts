import type { MemoryColor } from "@/shared/config/memoryColors";
import { mToColor } from "@/entities/task-memory/lib/memoryFormula";

export interface MockTaskBubble {
  taskTypeId: string;
  number: number;
  title: string;
  color: MemoryColor;
  repetitions: number;
  stabilityDays: number;
  memoryPercent: number;
  lastReviewLabel: string;
  reviewedToday: boolean;
}

const TITLES = [
  "Анализ диаграмм и таблиц",
  "Преобразование логического выражения",
  "Кодирование и декодирование",
  "Поиск информации в базе данных",
  "Анализ алгоритма для исполнителя",
  "Определение результата работы программы",
  "Кодирование звука и изображения",
  "Файловая система, пути",
  "Обработка числовой информации в электронных таблицах",
  "Комбинаторика и подсчёт вариантов",
  "Вычисление количества информации",
  "Работа с массивами данных",
  "Построение таблиц истинности",
  "Позиционные системы счисления",
  "Логические выражения с переменными",
  "Рекурсивные алгоритмы",
  "Анализ электронных таблиц: сложные формулы",
  "Робот на клетчатом поле",
  "Комбинаторные алгоритмы обхода",
  "Динамическое программирование: базовый уровень",
  "Обработка массива: количество элементов",
  "Многопроцессорная обработка задач",
  "Поиск пути в графе",
  "Анализ и восстановление алгоритма",
  "Обработка последовательности символов",
  "Игры: анализ выигрышной стратегии",
  "Программирование: полная задача",
];

const COLORS: readonly MemoryColor[] = [
  "none",
  "emerald",
  "green",
  "lime",
  "amber",
  "orange",
  "coral",
  "red",
];

export function getMockTaskBubbles(): MockTaskBubble[] {
  return TITLES.map((title, index) => {
    const number = index + 1;
    const repetitions = index < 3 ? 0 : (index % 8) + 1;
    const stabilityDays = repetitions === 0 ? 2 : [2, 3, 5, 8, 14, 21, 35, 60][index % 8]!;
    const deltaDays = repetitions === 0 ? 0 : (index % 12);
    const m = repetitions === 0 ? 0 : Math.round(100 * Math.pow(2, -deltaDays / stabilityDays));
    const color: MemoryColor = repetitions === 0 ? "none" : mToColor(m);

    return {
      taskTypeId: `task-${number}`,
      number,
      title,
      color,
      repetitions,
      stabilityDays,
      memoryPercent: m,
      lastReviewLabel: repetitions === 0 ? "ещё не начато" : `${deltaDays} дн. назад`,
      reviewedToday: false,
    };
  });
}

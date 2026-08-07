import type { MemoryColor } from "@/shared/config/memoryColors";

export interface MockTaskBubble {
  taskTypeId: string;
  number: number;
  title: string;
  color: MemoryColor;
  repetitions: number;
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
] as const;

const COLORS = ["none", "blue", "green", "yellow", "orange", "red", "black"] as const satisfies readonly MemoryColor[];

export function getMockTaskBubbles(): MockTaskBubble[] {
  return TITLES.map((title, index) => {
    const number = index + 1;
    const color = COLORS[index % COLORS.length];
    const repetitions = color === "none" ? 0 : (index % 6) + 1;
    const reviewedToday = index % 9 === 0 && color !== "none";

    return {
      taskTypeId: `task-${number}`,
      number,
      title,
      color,
      repetitions,
      lastReviewLabel:
        color === "none" ? "ещё не начато" : `повторено ${(index % 6) + 1} дн. назад`,
      reviewedToday,
    };
  });
}

import {
  MEMORY_COLOR_SCALE,
  MEMORY_COLOR_THRESHOLDS,
  type MemoryColor,
} from "@/shared/config/memoryColors";

/**
 * Вычисляет цвет памяти по отношению прошедшего времени к intervalDays.
 * repetitions = 0 -> "не начато", вне общей шкалы (см. ТЗ).
 */
export function computeMemoryColor(memory: {
  repetitions: number;
  intervalDays: number;
  lastReview: Date | null;
  now?: Date;
}): MemoryColor {
  if (memory.repetitions === 0 || !memory.lastReview || memory.intervalDays <= 0) {
    return "none";
  }

  const now = memory.now ?? new Date();
  const elapsedMs = now.getTime() - memory.lastReview.getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  const ratio = elapsedDays / memory.intervalDays;

  for (const threshold of MEMORY_COLOR_THRESHOLDS) {
    if (ratio < threshold.upTo) {
      return threshold.color;
    }
  }

  return "black";
}

/** Глобальное состояние памяти — среднее по числовой шкале среди repetitions > 0. */
export function computeGlobalMemoryScore(
  colors: MemoryColor[],
): number | null {
  const scored = colors.filter((c): c is Exclude<MemoryColor, "none"> => c !== "none");
  if (scored.length === 0) return null;

  const sum = scored.reduce((acc, color) => acc + MEMORY_COLOR_SCALE[color], 0);
  return sum / scored.length;
}

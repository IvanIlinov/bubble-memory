// Пороги цвета памяти (ТЗ: "Цвет памяти", утверждено).
// Отношение прошедшего времени к intervalDays -> цвет.
// Конфиг, легко меняется без редеплоя логики.

export type MemoryColor =
  | "none"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "black";

export interface MemoryColorThreshold {
  color: Exclude<MemoryColor, "none">;
  /** Верхняя граница отношения elapsed/intervalDays (не включая), в долях единицы. */
  upTo: number;
}

// Порядок важен: проверяются по возрастанию до первого подходящего порога.
export const MEMORY_COLOR_THRESHOLDS: MemoryColorThreshold[] = [
  { color: "blue", upTo: 0.4 },
  { color: "green", upTo: 0.7 },
  { color: "yellow", upTo: 1.0 },
  { color: "orange", upTo: 1.5 },
  { color: "red", upTo: 3.0 },
  { color: "black", upTo: Infinity },
];

// Числовая шкала для усреднения "глобального состояния памяти" (см. ТЗ).
export const MEMORY_COLOR_SCALE: Record<Exclude<MemoryColor, "none">, number> = {
  blue: 0,
  green: 1,
  yellow: 2,
  orange: 3,
  red: 4,
  black: 5,
};

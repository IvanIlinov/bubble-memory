type ClassValue = string | number | null | undefined | false;

/** Маленький локальный аналог clsx — без лишней зависимости. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}

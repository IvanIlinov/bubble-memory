import type { MemoryColor } from "@/shared/config/memoryColors";

export type BubbleTier = "wooden" | "metal" | "gold" | "diamond";

/** M = 100 × 2^(-Δt / S) */
export function computeM(lastReview: Date, stabilityDays: number, now = new Date()): number {
    if (stabilityDays <= 0) return 0;
    const deltaMs = now.getTime() - lastReview.getTime();
    const deltaDays = deltaMs / (1000 * 60 * 60 * 24);
    return 100 * Math.pow(2, -deltaDays / stabilityDays);
}

/** M% → MemoryColor по шкале VISION */
export function mToColor(m: number): MemoryColor {
    if (m >= 90) return "green";   // изумрудный — используем green
    if (m >= 75) return "green";   // зелёный
    if (m >= 60) return "yellow";  // лаймовый
    if (m >= 40) return "orange";  // янтарный (зона пульсации)
    if (m >= 25) return "orange";  // оранжевый
    if (m >= 10) return "red";     // коралловый
    return "red";                  // красный
}

/** Пульсация: 40% ≤ M ≤ 60% */
export function isPulsing(m: number): boolean {
    return m >= 40 && m <= 60;
}

/** Интенсивность пульсации: 0→1, максимум у 50% */
export function pulseIntensity(m: number): number {
    if (!isPulsing(m)) return 0;
    return 1 - Math.abs(m - 50) / 10;
}

/** S (stabilityDays) → рамка */
export function stabilityToTier(stabilityDays: number): BubbleTier {
    if (stabilityDays >= 60) return "diamond";
    if (stabilityDays >= 21) return "gold";
    if (stabilityDays >= 8) return "metal";
    return "wooden";
}
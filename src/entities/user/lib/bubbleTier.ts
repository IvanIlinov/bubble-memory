import { BUBBLE_TIERS, type BubbleTier } from "@/shared/config/bubbleTiers";

/** Определяет текущий тир по суммарному числу успешных повторений. Необратимо в MVP. */
export function computeBubbleTier(totalRepetitions: number): BubbleTier {
  let current: BubbleTier = "WOODEN";
  for (const threshold of BUBBLE_TIERS) {
    if (totalRepetitions >= threshold.minTotalRepetitions) {
      current = threshold.tier;
    }
  }
  return current;
}

export function getBubbleTierLabel(tier: BubbleTier): string {
  return BUBBLE_TIERS.find((t) => t.tier === tier)?.label ?? tier;
}

/** Следующий порог, чтобы показать прогресс до него в профиле. */
export function getNextTierThreshold(totalRepetitions: number) {
  return BUBBLE_TIERS.find((t) => t.minTotalRepetitions > totalRepetitions) ?? null;
}

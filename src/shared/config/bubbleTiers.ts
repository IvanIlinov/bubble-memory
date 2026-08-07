// Тиры эволюции пузыря (ТЗ: "Эволюция пузыря", утверждено).
// Необратимо в MVP.

export type BubbleTier =
  | "WOODEN"
  | "STONE"
  | "BRONZE"
  | "IRON"
  | "STEEL"
  | "TITANIUM"
  | "CRYSTAL"
  | "DIAMOND";

export interface BubbleTierThreshold {
  tier: BubbleTier;
  label: string;
  minTotalRepetitions: number;
}

// По возрастанию порога.
export const BUBBLE_TIERS: BubbleTierThreshold[] = [
  { tier: "WOODEN", label: "Деревянный", minTotalRepetitions: 0 },
  { tier: "STONE", label: "Каменный", minTotalRepetitions: 25 },
  { tier: "BRONZE", label: "Бронзовый", minTotalRepetitions: 75 },
  { tier: "IRON", label: "Железный", minTotalRepetitions: 150 },
  { tier: "STEEL", label: "Стальной", minTotalRepetitions: 300 },
  { tier: "TITANIUM", label: "Титановый", minTotalRepetitions: 500 },
  { tier: "CRYSTAL", label: "Кристальный", minTotalRepetitions: 800 },
  { tier: "DIAMOND", label: "Алмазный", minTotalRepetitions: 1200 },
];

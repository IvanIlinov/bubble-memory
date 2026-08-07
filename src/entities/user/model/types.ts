import type { BubbleTier } from "@/shared/config/bubbleTiers";

export interface UserProfileSnapshot {
  id: string;
  nickname: string;
  bubbleTier: BubbleTier;
  totalSolved: number;
  streak: number;
}

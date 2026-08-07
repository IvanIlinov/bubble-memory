import { REVIEW_LADDER_DAYS } from "@/shared/config/reviewLadder";

/**
 * ReviewAlgorithm — изолированный модуль расчёта следующего интервала.
 * ТЗ намеренно фиксирует фиксированную лестницу интервалов для MVP,
 * но интерфейс допускает замену на SM-2/FSRS или возврат градации качества ответа позже.
 */
export interface ReviewAlgorithm {
  computeNext(memory: {
    repetitions: number;
    intervalDays: number;
  }): { intervalDays: number; nextReview: Date; repetitions: number };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const fixedLadderReviewAlgorithm: ReviewAlgorithm = {
  computeNext(memory) {
    const nextRepetitions = memory.repetitions + 1;
    const stepIndex = Math.min(nextRepetitions - 1, REVIEW_LADDER_DAYS.length - 1);
    const nextIntervalDays = REVIEW_LADDER_DAYS[stepIndex];

    return {
      repetitions: nextRepetitions,
      intervalDays: nextIntervalDays,
      nextReview: addDays(new Date(), nextIntervalDays),
    };
  },
};

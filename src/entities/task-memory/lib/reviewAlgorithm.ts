export interface ReviewInput {
  repetitions: number;
  intervalDays: number;
  lastReview?: Date | null;
}

export interface ReviewOutput {
  repetitions: number;
  intervalDays: number;
  nextReview: Date;
}

/** Q по M% в момент повторения */
function computeQ(m: number): number {
  if (m >= 90) return 0.05;
  if (m >= 75) return 0.25;
  if (m >= 60) return 0.60;
  if (m >= 40) return 1.00;
  if (m >= 25) return 0.85;
  if (m >= 10) return 0.55;
  return 0.30;
}

/** M в момент нажатия кнопки */
function computeM(lastReview: Date | null | undefined, stabilityDays: number): number {
  if (!lastReview || stabilityDays <= 0) return 0;
  const deltaDays = (Date.now() - lastReview.getTime()) / 86400000;
  return 100 * Math.pow(2, -deltaDays / stabilityDays);
}

function addDays(days: number): Date {
  return new Date(Date.now() + days * 86400000);
}

export function dynamicReviewAlgorithm(memory: ReviewInput & { lastReview?: Date | null }): ReviewOutput {
  const isFirst = memory.repetitions === 0 || memory.intervalDays <= 0;

  const S_old = isFirst ? 2 : memory.intervalDays;
  const m = isFirst ? 100 : computeM(memory.lastReview, S_old);
  const q = computeQ(m);
  const S_new = isFirst ? 2 : S_old * (1 + 0.7 * q);

  return {
    repetitions: memory.repetitions + 1,
    intervalDays: S_new,
    nextReview: addDays(S_new),
  };
}
export interface TaskMemorySnapshot {
  taskTypeId: string;
  taskNumber: number;
  taskTitle: string;
  repetitions: number;
  intervalDays: number;
  lastReview: Date | null;
  nextReview: Date | null;
}

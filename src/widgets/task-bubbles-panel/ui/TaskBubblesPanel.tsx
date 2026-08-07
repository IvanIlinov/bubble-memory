"use client";

import { Bubble } from "@/shared/ui/Bubble";
import { getMockTaskBubbles } from "../model/mockTasks";

export function TaskBubblesPanel({
  onReview,
}: {
  onReview?: (taskTypeId: string) => void;
}) {
  const tasks = getMockTaskBubbles();

  return (
    <section aria-label="Задания ЕГЭ" className="grid grid-cols-6 gap-3 sm:grid-cols-9">
      {tasks.map((task) => (
        <Bubble
          key={task.taskTypeId}
          number={task.number}
          color={task.color}
          statusText={`Задание ${task.number}: ${task.title}. ${task.lastReviewLabel}.`}
          alreadyReviewedToday={task.reviewedToday}
          onReview={() => onReview?.(task.taskTypeId)}
        />
      ))}
    </section>
  );
}

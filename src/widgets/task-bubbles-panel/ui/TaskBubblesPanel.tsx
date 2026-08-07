"use client";

import { Bubble } from "@/shared/ui/Bubble";
import { getMockTaskBubbles } from "../model/mockTasks";
import type { MockTaskBubble } from "../model/mockTasks";

export function TaskBubblesPanel({
  onReview,
  tasks,
}: {
  onReview?: (taskTypeId: string) => void;
  tasks?: MockTaskBubble[];
}) {
  const tasksToShow = tasks ?? getMockTaskBubbles();

  return (
    <section aria-label="Задания ЕГЭ" className="grid grid-cols-6 gap-3 sm:grid-cols-9">
      {tasksToShow.map((task) => (
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

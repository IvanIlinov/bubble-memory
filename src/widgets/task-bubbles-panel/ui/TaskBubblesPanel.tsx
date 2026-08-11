"use client";

import { Bubble } from "@/shared/ui/Bubble";
import { getMockTaskBubbles } from "../model/mockTasks";
import type { MockTaskBubble } from "../model/mockTasks";

export function TaskBubblesPanel({
  onReview,
  tasks,
}: {
  onReview?: (taskTypeId: string) => void | Promise<void>;
  tasks?: MockTaskBubble[];
}) {
  const tasksToShow = tasks ?? getMockTaskBubbles();

  return (
    <section aria-label="Задания ЕГЭ" className="grid grid-cols-6 gap-2.5 sm:grid-cols-7 lg:grid-cols-9 pt-2">
      {tasksToShow.map((task) => (
        <Bubble
          key={task.taskTypeId}
          number={task.number}
          color={task.color}
          statusText={`Задание ${task.number}: ${task.title}. ${task.lastReviewLabel}.`}
          alreadyReviewedToday={task.reviewedToday}
          onReview={() => Promise.resolve(onReview?.(task.taskTypeId))}
        />
      ))}
    </section>
  );
}

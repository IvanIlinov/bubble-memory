import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/shared/lib/prisma";
import { fixedLadderReviewAlgorithm } from "@/entities/task-memory/lib/reviewAlgorithm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, taskTypeId } = req.body;

    if (!userId || !taskTypeId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const memory = await prisma.taskMemory.findUnique({
      where: {
        userId_taskTypeId: { userId, taskTypeId },
      },
    });

    if (!memory) {
      return res.status(404).json({ error: "Task not found" });
    }

    const nextReview = fixedLadderReviewAlgorithm.computeNext({
      repetitions: memory.repetitions,
      intervalDays: memory.intervalDays,
    });

    // Обновляем TaskMemory и создаём ReviewLog в одной транзакции
    const [updated] = await prisma.$transaction([
      prisma.taskMemory.update({
        where: { id: memory.id },
        data: {
          repetitions: nextReview.repetitions,
          intervalDays: nextReview.intervalDays,
          lastReview: new Date(),
          nextReview: nextReview.nextReview,
        },
      }),
      prisma.reviewLog.create({
        data: {
          userId,
          taskTypeId,
          previousIntervalDays: memory.intervalDays,
          previousNextReview: memory.nextReview,
        },
      }),
    ]);

    res.status(200).json({ success: true, task: updated });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

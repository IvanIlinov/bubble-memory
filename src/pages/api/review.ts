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

  const { userId, taskTypeId } = req.body;

  if (!userId || !taskTypeId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const [updated] = await prisma.$transaction(async (tx) => {
      // Читаем с блокировкой (SELECT ... FOR UPDATE)
      const memory = await tx.$queryRaw<any[]>`
        SELECT * FROM "TaskMemory" 
        WHERE "userId" = ${userId} AND "taskTypeId" = ${taskTypeId}
        FOR UPDATE
      `;

      if (!memory || memory.length === 0) {
        throw new Error("Task not found");
      }

      const m = memory[0];
      const nextReview = fixedLadderReviewAlgorithm.computeNext({
        repetitions: m.intervalDays,
        intervalDays: m.intervalDays,
      });

      const updated = await tx.taskMemory.update({
        where: { id: m.id },
        data: {
          repetitions: { increment: 1 },
          intervalDays: nextReview.intervalDays,
          lastReview: new Date(),
          nextReview: nextReview.nextReview,
        },
      });

      await tx.reviewLog.create({
        data: {
          userId,
          taskTypeId,
          previousIntervalDays: m.intervalDays,
          previousNextReview: m.nextReview,
        },
      });

      return [updated];
    });

    res.status(200).json({ success: true, task: updated });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

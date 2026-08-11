import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/shared/lib/prisma";
import { dynamicReviewAlgorithm } from "@/entities/task-memory/lib/reviewAlgorithm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, taskTypeId } = req.body;
  if (!userId || !taskTypeId) return res.status(400).json({ error: "Missing fields" });

  try {
    const [updated] = await prisma.$transaction(async (tx) => {
      const memory = await tx.$queryRaw<any[]>`
        SELECT * FROM "TaskMemory"
        WHERE "userId" = ${userId} AND "taskTypeId" = ${taskTypeId}
        FOR UPDATE
      `;

      if (!memory?.length) throw new Error("Task not found");

      const m = memory[0];
      const result = dynamicReviewAlgorithm({
        repetitions: m.repetitions,
        intervalDays: Number(m.intervalDays),
        lastReview: m.lastReview ? new Date(m.lastReview) : null,
      });

      const updated = await tx.taskMemory.update({
        where: { id: m.id },
        data: {
          repetitions: result.repetitions,
          intervalDays: result.intervalDays,
          lastReview: new Date(),
          nextReview: result.nextReview,
        },
      });

      await tx.reviewLog.create({
        data: {
          userId: userId as string,
          taskTypeId: taskTypeId as string,
          previousIntervalDays: m.intervalDays,
          previousNextReview: m.nextReview ?? null,
        } as any,
      });

      return [updated];
    });

    res.status(200).json({ success: true, task: updated });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
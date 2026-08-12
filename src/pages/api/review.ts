import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/shared/lib/prisma";
import { dynamicReviewAlgorithm } from "@/entities/task-memory/lib/reviewAlgorithm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, taskTypeId } = req.body;
  console.log("Review request:", { userId, taskTypeId });

  if (!userId || !taskTypeId) {
    console.error("Missing fields:", { userId, taskTypeId });
    return res.status(400).json({ error: "Missing fields: userId and taskTypeId required" });
  }

  try {
    console.log("Looking for task:", { userId, taskTypeId });
    
    const memory = await prisma.taskMemory.findFirst({
      where: {
        userId: userId,
        taskTypeId: Number(taskTypeId),
      },
    });

    if (!memory) {
      console.error("Task not found:", { userId, taskTypeId });
      return res.status(404).json({ error: "Task not found" });
    }

    console.log("Found task memory:", memory);

    const result = dynamicReviewAlgorithm({
      repetitions: memory.repetitions,
      intervalDays: Number(memory.intervalDays),
      lastReview: memory.lastReview,
    });

    console.log("Algorithm result:", result);

    const updated = await prisma.taskMemory.update({
      where: { id: memory.id },
      data: {
        repetitions: result.repetitions,
        intervalDays: result.intervalDays,
        lastReview: new Date(),
        nextReview: result.nextReview,
      },
    });

    await prisma.reviewLog.create({
      data: {
        userId: userId,
        taskTypeId: Number(taskTypeId),
        reviewedAt: new Date(),
        previousIntervalDays: memory.intervalDays,
        previousNextReview: memory.nextReview,
      },
    });

    console.log("Review completed successfully");
    res.status(200).json({ success: true, task: updated });
  } catch (error) {
    console.error("Review error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: `Internal server error: ${errorMsg}` });
  }
}

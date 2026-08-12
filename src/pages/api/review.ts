import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/shared/lib/prisma";
import { dynamicReviewAlgorithm } from "@/entities/task-memory/lib/reviewAlgorithm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, taskTypeId } = req.body;
  console.log("1. Review request received:", { userId, taskTypeId, body: req.body });

  if (!userId || !taskTypeId) {
    console.error("2. Missing fields");
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    console.log("3. Querying TaskMemory with userId:", userId, "taskTypeId:", taskTypeId);
    
    const memory = await prisma.taskMemory.findFirst({
      where: {
        userId: userId,
        taskTypeId: Number(taskTypeId),
      },
    });

    console.log("4. Query result:", memory);

    if (!memory) {
      console.error("5. Task not found for userId:", userId, "taskTypeId:", taskTypeId);
      return res.status(404).json({ error: "Task not found" });
    }

    console.log("6. Running algorithm...");
    const result = dynamicReviewAlgorithm({
      repetitions: memory.repetitions,
      intervalDays: Number(memory.intervalDays),
      lastReview: memory.lastReview,
    });

    console.log("7. Updating TaskMemory:", result);
    const updated = await prisma.taskMemory.update({
      where: { id: memory.id },
      data: {
        repetitions: result.repetitions,
        intervalDays: result.intervalDays,
        lastReview: new Date(),
        nextReview: result.nextReview,
      },
    });

    console.log("8. Creating ReviewLog...");
    await prisma.reviewLog.create({
      data: {
        userId: userId,
        taskTypeId: Number(taskTypeId),
        reviewedAt: new Date(),
        previousIntervalDays: memory.intervalDays,
        previousNextReview: memory.nextReview,
      },
    });

    console.log("9. Success!");
    res.status(200).json({ success: true, task: updated });
  } catch (error) {
    console.error("ERROR:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: `Internal server error: ${errorMsg}` });
  }
}

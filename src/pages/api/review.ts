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

    console.log("📍 /api/review:", { userId, taskTypeId });

    if (!userId || !taskTypeId) {
      console.log("❌ Missing fields");
      return res.status(400).json({ error: "Missing userId or taskTypeId" });
    }

    console.log("🔍 Finding memory...");
    const memory = await prisma.taskMemory.findUnique({
      where: {
        userId_taskTypeId: { userId, taskTypeId },
      },
    });

    console.log("📊 Memory found:", memory?.id);

    if (!memory) {
      console.log("❌ Task not found");
      return res.status(404).json({ error: "Task not found" });
    }

    console.log("🔄 Updating with ReviewAlgorithm...");
    const nextReview = fixedLadderReviewAlgorithm.computeNext({
      repetitions: memory.repetitions,
      intervalDays: memory.intervalDays,
    });

    console.log("📝 Next review:", nextReview);

    const updated = await prisma.taskMemory.update({
      where: { id: memory.id },
      data: {
        repetitions: nextReview.repetitions,
        intervalDays: nextReview.intervalDays,
        lastReview: new Date(),
        nextReview: nextReview.nextReview,
      },
    });

    console.log("✅ Updated:", updated);

    res.status(200).json({
      success: true,
      task: updated,
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

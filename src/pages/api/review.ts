import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/shared/lib/prisma";

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
      return res.status(400).json({ error: "Missing userId or taskTypeId" });
    }

    const memory = await prisma.taskMemory.findUnique({
      where: {
        userId_taskTypeId: { userId, taskTypeId },
      },
    });

    if (!memory) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updated = await prisma.taskMemory.update({
      where: { id: memory.id },
      data: {
        repetitions: memory.repetitions + 1,
        lastReview: new Date(),
      },
    });

    res.status(200).json({ success: true, task: updated });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

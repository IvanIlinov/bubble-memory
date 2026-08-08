import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/shared/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const initData = req.headers["x-telegram-init-data"] as string;
    
    if (!initData) {
      return res.status(401).json({ error: "Missing initData" });
    }

    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    
    if (!userStr) {
      return res.status(401).json({ error: "No user in initData" });
    }

    const telegramUser = JSON.parse(userStr);
    const telegramId = String(telegramUser.id);

    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          username: telegramUser.username || null,
          displayName: telegramUser.first_name,
          nickname: telegramUser.username || `user_${telegramId}`,
        },
      });

      const tasks = await prisma.taskType.findMany();
      await Promise.all(
        tasks.map((task) =>
          prisma.taskMemory.create({
            data: {
              userId: user!.id,
              taskTypeId: task.id,
            },
          })
        )
      );
    }

    // КЛЮЧ: сортируем по номеру задачи
    const memories = await prisma.taskMemory.findMany({
      where: { userId: user.id },
      include: { taskType: true },
      orderBy: { taskType: { number: "asc" } },
    });

    res.status(200).json({
      userId: user.id,
      telegramId,
      user: telegramUser,
      tasks: memories.map((m) => ({
        taskTypeId: m.taskTypeId,
        number: m.taskType.number,
        title: m.taskType.title,
        repetitions: m.repetitions,
        intervalDays: m.intervalDays,
        lastReview: m.lastReview,
        nextReview: m.nextReview,
      })),
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

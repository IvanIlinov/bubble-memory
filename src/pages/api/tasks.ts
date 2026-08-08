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
    console.log("🔍 /api/tasks called");
    
    const initData = req.headers["x-telegram-init-data"] as string;
    console.log("📥 initData length:", initData?.length);
    
    if (!initData) {
      return res.status(401).json({ error: "Missing initData" });
    }

    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    console.log("👤 userStr:", userStr ? "OK" : "MISSING");
    
    if (!userStr) {
      return res.status(401).json({ error: "No user in initData" });
    }

    const telegramUser = JSON.parse(userStr);
    const telegramId = String(telegramUser.id);
    console.log("🔑 telegramId:", telegramId);

    console.log("🔍 Finding user in DB...");
    let user = await prisma.user.findUnique({
      where: { telegramId },
    });
    console.log("✅ User found:", user?.id);

    if (!user) {
      console.log("➕ Creating new user...");
      user = await prisma.user.create({
        data: {
          telegramId,
          username: telegramUser.username || null,
          displayName: telegramUser.first_name,
          nickname: telegramUser.username || `user_${telegramId}`,
        },
      });
      console.log("✅ User created:", user.id);

      console.log("📋 Creating task memories...");
      const tasks = await prisma.taskType.findMany();
      console.log("📊 Found task types:", tasks.length);
      
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
      console.log("✅ Memories created");
    }

    console.log("🔍 Fetching memories...");
    const memories = await prisma.taskMemory.findMany({
      where: { userId: user.id },
      include: { taskType: true },
    });
    console.log("✅ Memories loaded:", memories.length);

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

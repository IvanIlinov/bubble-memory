import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const initData = request.headers.get("x-telegram-init-data");
    if (!initData) {
      return NextResponse.json(
        { error: "Missing initData" },
        { status: 401 }
      );
    }

    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    if (!userStr) {
      return NextResponse.json(
        { error: "No user in initData" },
        { status: 401 }
      );
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

      // После create гарантированно user не null
      const tasks = await prisma.taskType.findMany();
      await Promise.all(
        tasks.map((task) =>
          prisma.taskMemory.create({
            data: {
              userId: user!.id, // ! гарантирует что не null
              taskTypeId: task.id,
            },
          })
        )
      );
    }

    const memories = await prisma.taskMemory.findMany({
      where: { userId: user.id },
      include: { taskType: true },
    });

    return NextResponse.json({
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
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

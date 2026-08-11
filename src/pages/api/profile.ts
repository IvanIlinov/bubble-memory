import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const initData = req.headers.get("x-telegram-init-data");
    console.log("1. initData received:", initData?.substring(0, 50) + "...");
    
    if (!initData) {
      return NextResponse.json(
        { error: "Unauthorized - no initData" },
        { status: 401 }
      );
    }

    console.log("2. Attempting to parse URLSearchParams...");
    let params;
    try {
      params = new URLSearchParams(initData);
    } catch (parseError) {
      console.error("URLSearchParams parse error:", parseError);
      return NextResponse.json(
        { error: `Parse error: ${parseError instanceof Error ? parseError.message : "unknown"}` },
        { status: 400 }
      );
    }

    const userStr = params.get("user");
    console.log("3. userStr:", userStr?.substring(0, 50) + "...");

    if (!userStr) {
      return NextResponse.json(
        { error: "Invalid auth - no user in initData" },
        { status: 401 }
      );
    }

    console.log("4. Attempting to parse user JSON...");
    let telegramUser;
    try {
      telegramUser = JSON.parse(userStr);
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError);
      return NextResponse.json(
        { error: `JSON parse error: ${jsonError instanceof Error ? jsonError.message : "unknown"}` },
        { status: 400 }
      );
    }

    const telegramId = String(telegramUser.id);
    console.log("5. telegramId:", telegramId);

    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const taskMemories = await prisma.taskMemory.findMany({
      where: { userId: user.id },
      include: { taskType: true },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekReviews = await prisma.reviewLog.findMany({
      where: {
        userId: user.id,
        reviewedAt: { gte: sevenDaysAgo },
      },
    });

    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const yearReviews = await prisma.reviewLog.findMany({
      where: {
        userId: user.id,
        reviewedAt: { gte: yearAgo },
      },
    });

    const totalRepetitions = taskMemories.reduce(
      (sum, tm) => sum + tm.repetitions,
      0
    );
    const weekRepetitions = weekReviews.length;

    const masteredTasks = taskMemories.filter((tm) => {
      return tm.repetitions >= 10;
    }).length;

    const now = new Date();
    const daysAlive = Math.floor(
      (now.getTime() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000)
    );
    const monthsAlive = Math.floor(daysAlive / 30);
    const remainingDays = daysAlive % 30;

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: user.displayName || user.nickname || "User",
        bubbleTier: user.bubbleTier,
      },
      stats: {
        totalRepetitions,
        yearRepetitions: yearReviews.length,
        weekRepetitions,
        masteredCount: masteredTasks,
        totalTasks: 27,
        lifetimeDays: daysAlive,
        lifetimeFormatted: 
          monthsAlive > 0 
            ? `${monthsAlive} месяцев ${remainingDays} дней`
            : `${daysAlive} дней`,
      },
      taskMemories: taskMemories.map((tm) => ({
        id: tm.id,
        taskTypeId: tm.taskTypeId,
        repetitions: tm.repetitions,
        intervalDays: tm.intervalDays,
        lastReview: tm.lastReview,
      })),
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: `Internal error: ${error instanceof Error ? error.message : "unknown"}` },
      { status: 500 }
    );
  }
}

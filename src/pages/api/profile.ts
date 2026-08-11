import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const initData = req.headers.get("x-telegram-init-data");
    
    if (!initData) {
      return NextResponse.json(
        { error: "Unauthorized - no initData" },
        { status: 401 }
      );
    }

    const params = new URLSearchParams(initData);
    const userStr = params.get("user");

    if (!userStr) {
      return NextResponse.json(
        { error: "Invalid auth - no user in initData" },
        { status: 401 }
      );
    }

    const decodedUserStr = decodeURIComponent(userStr);
    const telegramUser = JSON.parse(decodedUserStr);
    const telegramId = String(telegramUser.id);

    console.log("Looking for user:", telegramId);

    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      console.log("User not found:", telegramId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("User found:", user.id, "createdAt:", user.createdAt);

    const taskMemories = await prisma.taskMemory.findMany({
      where: { userId: user.id },
      include: { taskType: true },
    });

    console.log("Task memories found:", taskMemories.length);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekReviews = await prisma.reviewLog.findMany({
      where: {
        userId: user.id,
        reviewedAt: { gte: sevenDaysAgo },
      },
    });

    console.log("Week reviews found:", weekReviews.length);

    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const yearReviews = await prisma.reviewLog.findMany({
      where: {
        userId: user.id,
        reviewedAt: { gte: yearAgo },
      },
    });

    console.log("Year reviews found:", yearReviews.length);

    const totalRepetitions = taskMemories.reduce(
      (sum, tm) => sum + tm.repetitions,
      0
    );
    const weekRepetitions = weekReviews.length;

    const masteredTasks = taskMemories.filter((tm) => {
      return tm.repetitions >= 10;
    }).length;

    console.log("Calculating lifetime...");
    const now = new Date();
    console.log("now:", now);
    console.log("createdAt:", user.createdAt);
    
    let daysAlive = 0;
    if (user.createdAt) {
      daysAlive = Math.floor(
        (now.getTime() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000)
      );
    }
    
    const monthsAlive = Math.floor(daysAlive / 30);
    const remainingDays = daysAlive % 30;

    console.log("daysAlive:", daysAlive);

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
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId, taskTypeId } = await request.json();

    if (!userId || !taskTypeId) {
      return NextResponse.json(
        { error: "Missing userId or taskTypeId" },
        { status: 400 }
      );
    }

    const memory = await prisma.taskMemory.findUnique({
      where: {
        userId_taskTypeId: { userId, taskTypeId },
      },
    });

    if (!memory) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.taskMemory.update({
      where: { id: memory.id },
      data: {
        repetitions: memory.repetitions + 1,
        lastReview: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      task: updated,
    });
  } catch (error) {
    console.error("POST /api/review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

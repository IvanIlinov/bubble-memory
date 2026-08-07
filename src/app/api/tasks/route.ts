import { NextRequest, NextResponse } from "next/server";
import { getMockTaskBubbles } from "@/widgets/task-bubbles-panel/model/mockTasks";

export async function GET(request: NextRequest) {
  try {
    // Получаем initData из заголовка
    const initData = request.headers.get("x-telegram-init-data");
    if (!initData) {
      return NextResponse.json(
        { error: "Missing initData" },
        { status: 401 }
      );
    }

    // TODO: валидировать initData (пока пропускаем)
    // const isValid = validateInitData(initData, botToken);
    // if (!isValid) return NextResponse.json({ error: "Invalid" }, { status: 401 });

    // Парсим userData из initData
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    if (!userStr) {
      return NextResponse.json(
        { error: "No user in initData" },
        { status: 401 }
      );
    }

    const user = JSON.parse(userStr);
    const userId = user.id;

    // Возвращаем задачи пользователя (пока моки)
    const tasks = getMockTaskBubbles();

    return NextResponse.json({
      userId,
      user,
      tasks,
    });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

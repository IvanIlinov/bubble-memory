import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/shared/lib/prisma";

async function resolveUserId(req: NextApiRequest): Promise<string | null> {
    // Приоритет 1: initData из заголовка (Telegram WebApp)
    const initData = req.headers["x-telegram-init-data"] as string;
    if (initData) {
        try {
            const params = new URLSearchParams(initData);
            const userStr = params.get("user");
            if (userStr) {
                const telegramUser = JSON.parse(userStr);
                const telegramId = String(telegramUser.id);
                const user = await prisma.user.findUnique({
                    where: { telegramId },
                    select: { id: true },
                });
                return user?.id ?? null;
            }
        } catch (_) { }
    }

    // Приоритет 2: userId напрямую из query (fallback для журнала без initData)
    const { userId } = req.query;
    if (userId && typeof userId === "string") {
        return userId;
    }

    return null;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const userId = await resolveUserId(req);

        if (!userId) {
            return res.status(401).json({ error: "Cannot resolve user" });
        }

        const logs = await prisma.reviewLog.findMany({
            where: { userId },
            include: { taskType: { select: { number: true, title: true } } },
            orderBy: { reviewedAt: "desc" },
            take: 50,
        });

        return res.status(200).json({ logs });
    } catch (error) {
        console.error("Log GET error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
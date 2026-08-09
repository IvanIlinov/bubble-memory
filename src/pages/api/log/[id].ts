import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/shared/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.query;
    if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Missing id" });
    }

    try {
        // Находим лог вместе с сохранёнными предыдущими значениями
        const log = await prisma.reviewLog.findUnique({
            where: { id },
            select: {
                id: true,
                userId: true,
                taskTypeId: true,
                previousIntervalDays: true,
                previousNextReview: true,
            },
        });

        if (!log) {
            return res.status(404).json({ error: "Log not found" });
        }

        // Транзакция: удаляем лог + откатываем TaskMemory + декрементируем totalSolved
        await prisma.$transaction([
            prisma.reviewLog.delete({ where: { id } }),

            // Откат TaskMemory к предыдущим значениям (если они были сохранены)
            ...(log.previousIntervalDays != null && log.previousNextReview != null
                ? [
                    prisma.taskMemory.update({
                        where: {
                            userId_taskTypeId: {
                                userId: log.userId,
                                taskTypeId: log.taskTypeId,
                            },
                        },
                        data: {
                            repetitions: { decrement: 1 },
                            intervalDays: log.previousIntervalDays,
                            nextReview: log.previousNextReview,
                        },
                    }),
                ]
                : [
                    // Если предыдущих значений нет — просто декрементируем repetitions
                    prisma.taskMemory.update({
                        where: {
                            userId_taskTypeId: {
                                userId: log.userId,
                                taskTypeId: log.taskTypeId,
                            },
                        },
                        data: {
                            repetitions: { decrement: 1 },
                        },
                    }),
                ]),

            // Декрементируем totalSolved на пользователе
            prisma.user.update({
                where: { id: log.userId },
                data: { totalSolved: { decrement: 1 } },
            }),
        ]);

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error("Log DELETE error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
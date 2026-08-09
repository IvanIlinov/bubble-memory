import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/shared/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing userId" });
  }

  if (req.method === "GET") {
    const logs = await prisma.reviewLog.findMany({
      where: { userId },
      include: { taskType: true },
      orderBy: { reviewedAt: "desc" },
      take: 50,
    });

    return res.status(200).json({ logs });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

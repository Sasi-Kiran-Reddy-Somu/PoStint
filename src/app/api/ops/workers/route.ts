import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ops") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status");
  const tier = searchParams.get("tier");
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 25;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { redditUsername: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { id: q },
    ];
  }
  if (status) where.status = status;
  if (tier) where.tier = tier;

  const [workers, total] = await Promise.all([
    prisma.worker.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true, redditUsername: true, email: true, tier: true, status: true,
        accountHealthScore: true, createdAt: true, country: true,
        _count: { select: { taskAssignments: true } },
      },
    }),
    prisma.worker.count({ where }),
  ]);

  return NextResponse.json({ workers, total, page, perPage });
}

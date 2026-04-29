import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ops") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "all";
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 25;

  const where = filter === "passed"
    ? { status: "pending_review_passed" as const }
    : filter === "failed"
    ? { status: "pending_review_failed" as const }
    : { status: { in: ["pending_review_passed" as const, "pending_review_failed" as const, "on_hold" as const] } };

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.application.count({ where }),
  ]);

  return NextResponse.json({ applications, total, page, perPage });
}

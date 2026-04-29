import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue";

export async function POST(req: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ops") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;
  const body = await req.json() as { rejectionCategory: string; notes?: string };

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.status === "rejected") return NextResponse.json({ error: "Already rejected" }, { status: 409 });

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "rejected",
      rejectionCategory: body.rejectionCategory,
      reviewerNotes: body.notes,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  });

  await emailQueue.add("email", {
    type: "application-rejected",
    email: application.email,
  });

  return NextResponse.json({ success: true });
}

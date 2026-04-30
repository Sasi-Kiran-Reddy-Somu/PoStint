import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";

export async function GET(req: NextRequest) {
  const workerId = WORKER_ID;
  const { searchParams } = new URL(req.url);
  const sse = searchParams.get("stream") === "true";

  if (sse) {
    const encoder = new TextEncoder();
    let closed = false;

    const stream = new ReadableStream({
      async start(controller) {
        const unread = await prisma.notification.count({ where: { workerId, read: false, channel: "in_app" } });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "init", unread })}\n\n`));

        const interval = setInterval(async () => {
          if (closed) return;
          try {
            const newNotifs = await prisma.notification.findMany({
              where: { workerId, read: false, channel: "in_app" },
              orderBy: { createdAt: "desc" },
              take: 5,
            });
            if (newNotifs.length > 0) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "notifications", notifications: newNotifs })}\n\n`));
            }
          } catch { /* ignore */ }
        }, 10_000);

        req.signal.addEventListener("abort", () => {
          closed = true;
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const notifications = await prisma.notification.findMany({
    where: { workerId, channel: "in_app" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const workerId = WORKER_ID;
  const body = await req.json() as { ids?: string[]; all?: boolean };

  if (body.all) {
    await prisma.notification.updateMany({ where: { workerId }, data: { read: true } });
  } else if (body.ids?.length) {
    await prisma.notification.updateMany({ where: { workerId, id: { in: body.ids } }, data: { read: true } });
  }

  return NextResponse.json({ success: true });
}

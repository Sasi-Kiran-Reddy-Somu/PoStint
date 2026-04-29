import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export function getClientIp(req: NextRequest | Request): string {
  const forwarded = (req.headers as Headers).get?.("x-forwarded-for") ?? "";
  const realIp = (req.headers as Headers).get?.("x-real-ip") ?? "";
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;
  return "unknown";
}

export async function logIpEvent(
  workerId: string,
  ip: string,
  eventType: string,
  userAgent?: string
) {
  // Fire-and-forget (non-blocking)
  prisma.workerIpEvent
    .create({ data: { workerId, ipAddress: ip, eventType, userAgent } })
    .catch(() => {});
}

export async function isBannedIp(ip: string): Promise<boolean> {
  const banned = await prisma.bannedIp.findFirst({
    where: {
      ipAddress: ip,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  return !!banned;
}

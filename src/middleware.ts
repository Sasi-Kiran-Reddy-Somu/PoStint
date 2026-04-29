import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths — always allowed
  if (
    pathname === "/" ||
    pathname.startsWith("/apply") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/apply") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const role = token?.role as string | undefined;

  // Worker routes — require worker role
  if (
    pathname.startsWith("/dashboard") || pathname.startsWith("/tasks") ||
    pathname.startsWith("/earnings") || pathname.startsWith("/withdraw") ||
    pathname.startsWith("/history") || pathname.startsWith("/settings") ||
    pathname.startsWith("/notifications")
  ) {
    if (role !== "worker") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Ops routes — require ops role
  if (pathname.startsWith("/ops")) {
    if (role !== "ops") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Worker API routes
  if (pathname.startsWith("/api/worker")) {
    if (role !== "worker") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Ops API routes
  if (pathname.startsWith("/api/ops")) {
    if (role !== "ops") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

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

  // Worker routes — require worker role
  if (
    pathname.startsWith("/dashboard") || pathname.startsWith("/tasks") ||
    pathname.startsWith("/earnings") || pathname.startsWith("/withdraw") ||
    pathname.startsWith("/history") || pathname.startsWith("/settings") ||
    pathname.startsWith("/notifications")
  ) {
    if (!session || session.user.role !== "worker") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Ops routes — require ops role
  if (pathname.startsWith("/ops")) {
    if (!session || session.user.role !== "ops") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Worker API routes
  if (pathname.startsWith("/api/worker")) {
    if (!session || session.user.role !== "worker") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Ops API routes
  if (pathname.startsWith("/api/ops")) {
    if (!session || session.user.role !== "ops") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

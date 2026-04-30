import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect root and login straight to dashboard
  if (pathname === "/" || pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Ops routes still require auth
  if (pathname.startsWith("/ops") || pathname.startsWith("/api/ops")) {
    // Ops protection handled by the ops layout/session checks
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

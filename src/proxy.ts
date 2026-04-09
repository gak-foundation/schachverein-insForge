import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes (no auth required)
  const publicRoutes = ["/", "/login", "/signup", "/auth/error", "/vereinswebsite"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // PGN viewer is public
  if (pathname.startsWith("/pgnviewer")) {
    return NextResponse.next();
  }

  // API auth routes are public
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protected routes require authentication
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access for dashboard routes
  if (pathname.startsWith("/dashboard/admin")) {
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/dashboard/kassenwart")) {
    const allowedRoles = ["admin", "kassenwart", "vorstand"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
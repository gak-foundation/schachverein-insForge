import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/auth/security-headers";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  let response: NextResponse;

  if (pathname.startsWith("/api/auth")) {
    response = NextResponse.next();
    return response;
  }

  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/auth/error",
    "/auth/verify-request",
    "/auth/verify-email",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/vereinswebsite",
  ];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (session && (pathname === "/login" || pathname === "/signup")) {
      response = NextResponse.redirect(new URL("/dashboard", req.url));
      return applySecurityHeaders(response);
    }
    response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  if (pathname.startsWith("/pgnviewer")) {
    response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    response = NextResponse.redirect(loginUrl);
    return applySecurityHeaders(response);
  }

  if (pathname.startsWith("/dashboard/admin")) {
    if (session.user.role !== "admin") {
      response = NextResponse.redirect(new URL("/dashboard", req.url));
      return applySecurityHeaders(response);
    }
  }

  if (pathname.startsWith("/dashboard/kassenwart")) {
    const allowedRoles = ["admin", "kassenwart", "vorstand"];
    if (!allowedRoles.includes(session.user.role)) {
      response = NextResponse.redirect(new URL("/dashboard", req.url));
      return applySecurityHeaders(response);
    }
  }

  response = NextResponse.next();
  return applySecurityHeaders(response);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/|sitemap.xml|robots.txt).*)",
  ],
};
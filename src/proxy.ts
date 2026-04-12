import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/auth/security-headers";
import { auth } from "@/lib/auth/better-auth";
import { rateLimit, RATE_LIMITS } from "@/lib/auth/rate-limit";

async function getClientIP(request: NextRequest): Promise<string> {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const headers = new Headers(request.headers);

  let response: NextResponse;

  if (pathname.startsWith("/api/auth")) {
    const ip = await getClientIP(request);
    
    if (pathname.includes("/sign-in")) {
      const result = await rateLimit(`ip:${ip}`, RATE_LIMITS.login_ip);
      if (!result.allowed) {
        response = NextResponse.json(
          { error: "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut." },
          { status: 429 }
        );
        return applySecurityHeaders(response);
      }
    }
    
    if (pathname.includes("/sign-up")) {
      const result = await rateLimit(`ip:${ip}`, RATE_LIMITS.register);
      if (!result.allowed) {
        response = NextResponse.json(
          { error: "Zu viele Registrierungsversuche. Bitte versuchen Sie es später erneut." },
          { status: 429 }
        );
        return applySecurityHeaders(response);
      }
    }
    
    if (pathname.includes("/forgot-password")) {
      const result = await rateLimit(`ip:${ip}`, RATE_LIMITS.passwordReset_ip);
      if (!result.allowed) {
        response = NextResponse.json(
          { error: "Zu viele Passwort-Reset-Versuche. Bitte versuchen Sie es später erneut." },
          { status: 429 }
        );
        return applySecurityHeaders(response);
      }
    }
    
    response = NextResponse.next();
    return response;
  }

  const session = await auth.api.getSession({
    headers: headers,
  });

  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/auth/error",
    "/auth/verify-request",
    "/auth/verify-email",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/invite",
    "/vereinswebsite",
  ];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (session && (pathname === "/auth/login" || pathname === "/auth/signup")) {
      response = NextResponse.redirect(new URL("/dashboard", request.url));
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
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    response = NextResponse.redirect(loginUrl);
    return applySecurityHeaders(response);
  }

  const userRole = session.user?.role as string || "mitglied";

  if (pathname.startsWith("/dashboard/admin")) {
    if (userRole !== "admin") {
      response = NextResponse.redirect(new URL("/dashboard", request.url));
      return applySecurityHeaders(response);
    }
  }

  if (pathname.startsWith("/dashboard/kassenwart")) {
    const allowedRoles = ["admin", "kassenwart", "vorstand"];
    if (!allowedRoles.includes(userRole)) {
      response = NextResponse.redirect(new URL("/dashboard", request.url));
      return applySecurityHeaders(response);
    }
  }

  response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const proxyConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/|sitemap.xml|robots.txt).*)",
  ],
};

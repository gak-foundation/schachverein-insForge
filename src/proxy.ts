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
  const url = request.nextUrl;
  const originalPath = url.pathname;

  // 0. Explicitly skip static files and other common excluded paths
  // This ensures that even if the matcher is ignored, we don't rewrite these.
  if (
    originalPath.startsWith("/_next") ||
    originalPath.startsWith("/favicon.ico") ||
    originalPath.startsWith("/sw.js") ||
    originalPath.startsWith("/manifest.json") ||
    originalPath.startsWith("/icons/") ||
    originalPath === "/sitemap.xml" ||
    originalPath === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const host = request.headers.get("host") || "";
  
  // Normalize hostname for easier comparison
  const hostname = host.replace(".localhost:3000", `.${rootDomain}`);

  const searchParams = url.searchParams.toString();
  
  let targetPath = originalPath;
  let isRewrite = false;

  // 1. Subdomain / Multi-tenancy Logic
  if (hostname === `admin.${rootDomain}`) {
    targetPath = `/dashboard${originalPath === "/" ? "" : originalPath}`;
    isRewrite = true;
  } else if (
    hostname !== rootDomain &&
    hostname !== `www.${rootDomain}`
  ) {
    const slug = hostname.split(".")[0];
    if (slug && slug !== "www" && slug !== "admin" && hostname.includes(".")) {
      targetPath = `/clubs/${slug}${originalPath}`;
      isRewrite = true;
    }
  }

  // Use targetPath for Auth checks (effective path)
  const pathname = targetPath;
  const headers = new Headers(request.headers);
  let response: NextResponse;

  // Helper to get either next or rewrite response
  const getNextResponse = () => {
    if (isRewrite) {
      return NextResponse.rewrite(new URL(`${targetPath}${searchParams.length > 0 ? `?${searchParams}` : ""}`, request.url));
    }
    return NextResponse.next();
  };

  // 2. Auth & Security Logic (from old proxy.ts)
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
    
    return getNextResponse();
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
    "/mannschaften",
    "/turniere",
    "/termine",
    "/kontakt",
    "/impressum",
    "/datenschutz",
  ];

  // Also consider club public routes if needed, but for now we follow the existing list
  if (publicRoutes.some((route) => pathname.startsWith(route)) || pathname.startsWith("/clubs/")) {
    if (session && (pathname === "/auth/login" || pathname === "/auth/signup")) {
      response = NextResponse.redirect(new URL("/dashboard", request.url));
      return applySecurityHeaders(response);
    }
    return applySecurityHeaders(getNextResponse());
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

  return applySecurityHeaders(getNextResponse());
}

export const proxyConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/|sitemap.xml|robots.txt).*)",
  ],
};

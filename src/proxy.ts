import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
  "/auth/error",
  "/auth/verify-request",
  "/auth/verify-email",
  "/auth/invite",
  "/vereinswebsite",
  "/mannschaften",
  "/turniere",
  "/termine",
  "/kontakt",
  "/impressum",
  "/datenschutz",
  "/preise",
  "/api/health",
  "/api/webhooks",
];

// Security headers for all responses
const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function getHostname(request: NextRequest): string {
  const host = request.headers.get("host");
  return host?.split(":")[0] ?? "localhost";
}

function isAppHost(hostname: string): boolean {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "app.schach.studio";
  return hostname === appDomain || hostname === "app.localhost";
}

function isMarketingHost(hostname: string): boolean {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "schach.studio";
  return hostname === rootDomain;
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = getHostname(request);

  // Static assets are always public - skip processing
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/manifest.json") ||
    pathname.startsWith("/icons/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Host-based routing (skip for localhost to allow local development)
  if (!isLocalhost(hostname)) {
    if (isAppHost(hostname)) {
      // On app.schach.studio: allow dashboard/*, redirect everything else to auth
      if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/auth")) {
        if (pathname === "/") {
          return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } else if (isMarketingHost(hostname)) {
      // On schach.studio: marketing routes are public, /dashboard redirects to app
      if (pathname.startsWith("/dashboard")) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.schach.studio";
        return NextResponse.redirect(new URL(pathname, appUrl));
      }
    }
  }

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Update session
  const { supabaseResponse, user } = await updateSession(request);

  // If not authenticated and trying to access protected route, redirect to login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (user && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    const next = request.nextUrl.searchParams.get("next") || "/dashboard";
    return NextResponse.redirect(new URL(next, request.url));
  }

  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value);
  });

  // Add CSP header (non-blocking for development)
  const isDev = process.env.NODE_ENV === "development";
  const cspHeader = isDev
    ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://lichess.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://lichess.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";

  supabaseResponse.headers.set("Content-Security-Policy", cspHeader);

  return supabaseResponse;
}

export const proxyConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/|sitemap.xml|robots.txt|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =============================================================================
// Route allow-lists
// =============================================================================

const appRoutes = [
  "/dashboard",
  "/auth",
  "/onboarding",
  "/super-admin",
];

const marketingRoutes = [
  "/",
  "/kontakt",
  "/preise",
  "/termine",
  "/turniere",
  "/mannschaften",
  "/faq",
  "/impressum",
  "/datenschutz",
  "/barrierefreiheit",
  "/bewerbung",
  "/coming-soon",
  "/design-test",
  "/clubs",
];

const sharedRoutes = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/sw.js",
  "/icons",
];

// =============================================================================
// Security headers
// =============================================================================

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// =============================================================================
// Helpers
// =============================================================================

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

function isSharedRoute(pathname: string): boolean {
  if (sharedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return true;
  }
  if (/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|otf|eot)$/.test(pathname)) {
    return true;
  }
  return false;
}

function isAppRoute(pathname: string): boolean {
  return appRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isMarketingRoute(pathname: string): boolean {
  return marketingRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://app.schach.studio";
}

function getMarketingUrl(): string {
  return process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://schach.studio";
}

// =============================================================================
// Middleware
// =============================================================================

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = getHostname(request);

  const isShared = isSharedRoute(pathname);

  // ---------------------------------------------------------------------------
  // Host-based routing (skip for localhost)
  // ---------------------------------------------------------------------------
  if (!isLocalhost(hostname)) {
    if (isAppHost(hostname)) {
      if (isShared) {
        // pass through
      } else if (pathname === "/") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      } else if (isMarketingRoute(pathname)) {
        return NextResponse.redirect(new URL(pathname, getMarketingUrl()));
      } else if (!isAppRoute(pathname)) {
        // Unknown route on app domain → treat as app route (allow + auth check)
      }
    } else if (isMarketingHost(hostname)) {
      if (isShared) {
        // pass through
      } else if (isAppRoute(pathname)) {
        return NextResponse.redirect(new URL(pathname, getAppUrl()));
      } else if (!isMarketingRoute(pathname)) {
        // Unknown route on marketing domain → let it 404 naturally
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Public route check (for auth guard)
  // ---------------------------------------------------------------------------
  const isPublicRoute =
    isShared ||
    isMarketingRoute(pathname) ||
    pathname === "/auth/login" ||
    pathname === "/auth/signup" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/auth/reset-password" ||
    pathname === "/auth/callback" ||
    pathname === "/auth/error" ||
    pathname === "/auth/verify-request" ||
    pathname === "/auth/verify-email" ||
    pathname === "/auth/invite" ||
    pathname === "/api/health" ||
    pathname === "/api/webhooks";

  // ---------------------------------------------------------------------------
  // Update session via Supabase
  // ---------------------------------------------------------------------------
  const { supabaseResponse, user } = await updateSession(request);

  // ---------------------------------------------------------------------------
  // Auth guards
  // ---------------------------------------------------------------------------
  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    const next = request.nextUrl.searchParams.get("next") || "/dashboard";
    return NextResponse.redirect(new URL(next, request.url));
  }

  // ---------------------------------------------------------------------------
  // Security headers & CSP
  // ---------------------------------------------------------------------------
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value);
  });

  const isDev = process.env.NODE_ENV === "development";
  const cspHeader = isDev
    ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://lichess.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    : "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://lichess.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

  supabaseResponse.headers.set("Content-Security-Policy", cspHeader);

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

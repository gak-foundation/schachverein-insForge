import { updateSession } from "@/lib/insforge/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =============================================================================
// Route allow-lists
// =============================================================================

const tenantAppRoutes = [
  "/dashboard",
  "/auth",
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

const adminRoutes = [
  "/admin",
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
// Config constants
// =============================================================================

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "schach.studio";
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "app.schach.studio";

// =============================================================================
// Security headers
// =============================================================================

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security":
    process.env.NODE_ENV === "production"
      ? "max-age=63072000; includeSubDomains; preload"
      : "max-age=0",
};

const SHARED_CSP_DEV =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; connect-src 'self' https://*.insforge.app https://lichess.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";
const SHARED_CSP_PROD =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; connect-src 'self' https://*.insforge.app https://lichess.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

// =============================================================================
// Helpers
// =============================================================================

function getHostname(request: NextRequest): string {
  const host = request.headers.get("host");
  return host?.split(":")[0] ?? "localhost";
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function extractSubdomain(hostname: string): string | null {
  if (isLocalhost(hostname)) return null;
  if (hostname === ROOT_DOMAIN) return null;
  if (hostname === `www.${ROOT_DOMAIN}`) return null;
  if (hostname === APP_DOMAIN) return null;
  if (hostname === `www.${APP_DOMAIN}`) return null;

  // Handle wildcard subdomains: {slug}.root.domain
  const rootParts = ROOT_DOMAIN.split(".");
  const hostParts = hostname.split(".");

  if (hostParts.length <= rootParts.length) return null;

  // Verify the suffix matches ROOT_DOMAIN
  const suffix = hostParts.slice(-rootParts.length).join(".");
  if (suffix !== ROOT_DOMAIN) return null;

  const subdomain = hostParts.slice(0, -rootParts.length).join(".");
  return subdomain || null;
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

function isMarketingRoute(pathname: string): boolean {
  return marketingRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isTenantAppRoute(pathname: string): boolean {
  return tenantAppRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isPublicAuthRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/reset-password") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/error") ||
    pathname.startsWith("/auth/verify") ||
    pathname.startsWith("/auth/invite") ||
    pathname.startsWith("/api/webhooks") ||
    pathname === "/api/health"
  );
}

function sanitizeNext(next: string | null): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";
  if (next.length > 512) return "/dashboard";
  return next;
}

function redirectWithCookies(
  url: string | URL,
  sourceResponse: NextResponse,
  request: NextRequest,
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  sourceResponse.headers.getSetCookie().forEach((cookie) => {
    redirectResponse.headers.append("Set-Cookie", cookie);
  });

  // Redirect loop detection: increment counter cookie from request
  const loopCount = Number(request.cookies.get("_rd_loop")?.value ?? "0") + 1;
  if (loopCount > 5) {
    const fallback = new URL(
      "/auth/error?reason=too_many_redirects",
      typeof url === "string" ? url : url.toString(),
    );
    const fallbackResponse = NextResponse.redirect(fallback);
    fallbackResponse.cookies.set("_rd_loop", "0", { maxAge: 60, path: "/" });
    sourceResponse.headers.getSetCookie().forEach((cookie) => {
      fallbackResponse.headers.append("Set-Cookie", cookie);
    });
    return fallbackResponse;
  }
  redirectResponse.cookies.set("_rd_loop", String(loopCount), { maxAge: 10, path: "/" });

  return redirectResponse;
}

// =============================================================================
// Middleware
// =============================================================================

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = getHostname(request);
  const subdomain = extractSubdomain(hostname);
  const isSubdomain = subdomain !== null;

  const isShared = isSharedRoute(pathname);

  // ---------------------------------------------------------------------------
  // Subdomain routing: inject tenant headers
  // ---------------------------------------------------------------------------
  // We set headers on the request so downstream Server Components / Layouts
  // can resolve the club. Actual club existence/isActive is checked there.
  if (isSubdomain && subdomain) {
    request.headers.set("x-club-slug", subdomain);
    request.headers.set("x-is-subdomain", "true");
  } else {
    request.headers.set("x-is-subdomain", "false");
  }

  // ---------------------------------------------------------------------------
  // Host-based routing rules
  // ---------------------------------------------------------------------------
  if (!isLocalhost(hostname)) {
    if (isSubdomain && subdomain) {
      // Subdomain only serves tenant routes
      if (isShared) {
        // pass through
      } else if (isMarketingRoute(pathname)) {
        // Marketing pages on subdomain not allowed
        return NextResponse.redirect(new URL(pathname, `https://${ROOT_DOMAIN}`));
      } else if (isAdminRoute(pathname)) {
        // Admin on subdomain not allowed
        return NextResponse.redirect(new URL(pathname, `https://${ROOT_DOMAIN}`));
      } else if (!isTenantAppRoute(pathname) && !isPublicAuthRoute(pathname)) {
        // Unknown route on subdomain — treat as dashboard to allow 404s naturally
      }
    } else {
      // Root domain
      if (isShared) {
        // pass through
      } else if (isTenantAppRoute(pathname)) {
        // App routes now served directly on root domain (no subdomain redirect)
      } else if (!isMarketingRoute(pathname) && !isAdminRoute(pathname)) {
        // Unknown route on root — let it 404 naturally
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Public route check (for auth guard)
  // ---------------------------------------------------------------------------
  const isPublicRoute =
    isShared ||
    isMarketingRoute(pathname) ||
    isPublicAuthRoute(pathname) ||
    (isSubdomain && pathname === "/"); // Allow subdomain root if desired

  // ---------------------------------------------------------------------------
  // Update session via InsForge (with subdomain-scoped cookies if on subdomain)
  // ---------------------------------------------------------------------------
  const cookieOptions = isSubdomain ? { domain: hostname } : undefined;

  const { authResponse, user } = await updateSession(request, cookieOptions);

  // ---------------------------------------------------------------------------
  // Auth guards
  // ---------------------------------------------------------------------------
  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirectWithCookies(loginUrl, authResponse, request);
  }

  if (user && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    const next = sanitizeNext(request.nextUrl.searchParams.get("next"));
    return redirectWithCookies(new URL(next, request.url), authResponse, request);
  }

  // ---------------------------------------------------------------------------
  // Security headers & CSP
  // ---------------------------------------------------------------------------
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    authResponse.headers.set(key, value);
  });

  const isDev = process.env.NODE_ENV === "development";
  authResponse.headers.set(
    "Content-Security-Policy",
    isDev ? SHARED_CSP_DEV : SHARED_CSP_PROD,
  );

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
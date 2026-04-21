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
  "/api/health",
  "/api/webhooks",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Update session
  const { supabaseResponse, user } = await updateSession(request);

  // If not authenticated and trying to access protected route, redirect to login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (user && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/|sitemap.xml|robots.txt|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

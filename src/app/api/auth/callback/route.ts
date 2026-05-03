import { NextResponse } from "next/server";

function sanitizeNext(next: string | null): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";
  if (next.length > 512) return "/dashboard";
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const rawNext = searchParams.get("next");
  const next = sanitizeNext(rawNext);
  const action = searchParams.get("action");
  const slug = searchParams.get("slug");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

  const callbackUrl = new URL("/auth/callback", baseUrl);
  callbackUrl.searchParams.set("next", next);
  if (action) callbackUrl.searchParams.set("action", action);
  if (slug) callbackUrl.searchParams.set("slug", slug);

  return NextResponse.redirect(callbackUrl);
}
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/insforge";
import { setAuthCookies } from "@/lib/insforge/server-auth";
import { ensureAuthUser } from "@/lib/db/queries/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const code = searchParams.get("insforge_code");
    const next = searchParams.get("next") || "/onboarding";
    const error = searchParams.get("error");

    if (error || !code) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("error", error || "oauth_failed");
      return NextResponse.redirect(loginUrl);
    }

    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get("insforge_code_verifier")?.value;

    const client = createServerClient();
    const { data, error: exchangeError } = await client.auth.exchangeOAuthCode(code, codeVerifier || "");

    if (exchangeError || !data) {
      console.error("OAuth exchange error:", exchangeError);
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("error", "exchange_failed");
      return NextResponse.redirect(loginUrl);
    }

    if (data.accessToken) {
      await setAuthCookies(data.accessToken, data.refreshToken || "");
    }

    await ensureAuthUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.profile?.name || data.user.email?.split("@")[0],
      avatarUrl: data.user.profile?.avatar_url,
      emailVerified: data.user.emailVerified ?? false,
    });

    cookieStore.delete("insforge_code_verifier");

    const redirectUrl = new URL(sanitizeNext(next), request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("OAuth callback error:", err);
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("error", "callback_failed");
    return NextResponse.redirect(loginUrl);
  }
}

function sanitizeNext(next: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/onboarding";
  if (next.length > 512) return "/onboarding";
  return next;
}

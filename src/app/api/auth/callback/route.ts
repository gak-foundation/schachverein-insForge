import { createServerClient } from "@/lib/insforge";
import { NextResponse } from "next/server";
import { getAuthUserById } from "@/lib/db/queries/auth";
import { bindUserToTenant } from "@/lib/auth/tenant-binding";

function sanitizeNext(next: string | null): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";
  if (next.length > 512) return "/dashboard";
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const next = sanitizeNext(rawNext);
  const action = searchParams.get("action");
  const slug = searchParams.get("slug");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

  if (code) {
    const supabase = createServerClient();
    
    try {
      const { data, error } = await supabase.auth.getCurrentUser();

      if (!error && data?.user) {
        if (action === "signup" && slug) {
          try {
            const existingUser = await getAuthUserById(data.user.id);
            if (!existingUser?.clubId) {
              const name = data.user.profile?.name || data.user.email;
              await bindUserToTenant({
                userId: data.user.id,
                email: data.user.email,
                name,
                slug,
              });
            }
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Tenant binding failed";
            const errorUrl = new URL(`/auth/error?reason=${encodeURIComponent(errMsg)}`, baseUrl);
            return NextResponse.redirect(errorUrl);
          }
        }

        return NextResponse.redirect(new URL(next, baseUrl));
      }
    } catch (err) {
      console.error("OAuth callback error:", err);
    }
  }

  return NextResponse.redirect(new URL("/auth/error", baseUrl));
}
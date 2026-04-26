import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getAuthUserById } from "@/lib/db/queries/auth";

function sanitizeNext(next: string | null): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";
  if (next.length > 512) return "/dashboard";
  return next;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const next = sanitizeNext(rawNext);

  // Use the request URL as base to preserve the correct domain (app.schach.studio)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user needs onboarding
      const authUser = await getAuthUserById(data.user.id);
      const target = (!authUser?.isSuperAdmin && !authUser?.clubId) ? "/onboarding" : next;
      
      return NextResponse.redirect(new URL(target, baseUrl));
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/auth/error", baseUrl));
}

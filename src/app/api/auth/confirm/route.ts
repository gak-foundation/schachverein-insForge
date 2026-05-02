import { createServerClient } from "@/lib/insforge";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const next = searchParams.get("next") ?? "/dashboard";

  if (token && email) {
    const client = createServerClient();
    const { data, error } = await client.auth.verifyEmail({
      email,
      otp: token,
    });

    if (!error && data?.user) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/auth/error?reason=verification_failed", request.url));
}
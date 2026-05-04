import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clubId } = await request.json();
  if (!clubId) {
    return NextResponse.json({ error: "clubId required" }, { status: 400 });
  }

  const payload = JSON.stringify({
    adminId: session.user.id,
    targetClubId: clubId,
    ts: Date.now(),
  });

  const secret = process.env.IMPERSONATION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Impersonation not configured" }, { status: 503 });
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = Array.from(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)))
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("impersonation_payload", payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 3600,
  });
  response.cookies.set("impersonation_sig", sig, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 3600,
  });

  return response;
}

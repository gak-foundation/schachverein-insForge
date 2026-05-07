import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/insforge";
import { getClubById } from "@/lib/clubs/queries";

async function generateToken(): Promise<string> {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const IMPERSONATION_MAX_PER_HOUR = 10;
const IMPERSONATION_DURATION_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clubId } = await request.json();
  if (!clubId) {
    return NextResponse.json({ error: "clubId required" }, { status: 400 });
  }

  const club = await getClubById(clubId);
  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }
  if (!club.is_active) {
    return NextResponse.json({ error: "Club is inactive" }, { status: 400 });
  }

  const secret = process.env.IMPERSONATION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Impersonation not configured" }, { status: 503 });
  }

  const client = createServiceClient();

  // Rate limiting
  const oneHourAgo = new Date(Date.now() - IMPERSONATION_DURATION_MS).toISOString();
  const { count, error: countError } = await client
    .from("impersonation_sessions")
    .select("*", { count: "exact", head: true })
    .eq("admin_id", session.user.id)
    .gte("started_at", oneHourAgo);

  if (countError) {
    return NextResponse.json({ error: "Rate limit check failed" }, { status: 500 });
  }

  if ((count ?? 0) >= IMPERSONATION_MAX_PER_HOUR) {
    return NextResponse.json(
      { error: "Rate limit reached: max 10 impersonations per hour" },
      { status: 429 }
    );
  }

  // Generate token and session
  const token = await generateToken();
  const tokenHash = await sha256Hex(token);
  const sig = await hmacSign(token, secret);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + IMPERSONATION_DURATION_MS);

  const { error: insertError } = await client.from("impersonation_sessions").insert({
    admin_id: session.user.id,
    target_club_id: clubId,
    token_hash: tokenHash,
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    revoked: false,
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("impersonation_token", token, {
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

  // Audit log
  try {
    await client.from("audit_log").insert({
      user_id: session.user.id,
      club_id: clubId,
      action: "IMPERSONATION_STARTED",
      entity: "club",
      entity_id: clubId,
      changes: { clubName: club.name, adminId: session.user.id },
    });
  } catch {
    // Silent fail
  }

  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/insforge";
import { getSession } from "@/lib/auth/session";

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  const token = request.cookies.get("impersonation_token")?.value;
  let targetClubId: string | null = null;

  if (token && session?.user) {
    const tokenHash = await sha256Hex(token);
    const client = createServiceClient();

    const { data: sessionData } = await client
      .from("impersonation_sessions")
      .select("target_club_id")
      .eq("token_hash", tokenHash)
      .eq("admin_id", session.user.id)
      .is("ended_at", null)
      .eq("revoked", false)
      .single();

    if (sessionData) {
      targetClubId = sessionData.target_club_id;
      await client
        .from("impersonation_sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("token_hash", tokenHash);

      try {
        await client.from("audit_log").insert({
          user_id: session.user.id,
          club_id: targetClubId,
          action: "IMPERSONATION_ENDED",
          entity: "club",
          entity_id: targetClubId,
          changes: {},
        });
      } catch {
        // Silent fail for audit
      }
    }
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.delete("impersonation_token");
  response.cookies.delete("impersonation_sig");

  return response;
}

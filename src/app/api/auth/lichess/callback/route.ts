import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeLichessCode, fetchLichessAuthUser } from "@/lib/auth/lichess";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const verifier = cookieStore.get("lichess_oauth_verifier")?.value;
  const savedState = cookieStore.get("lichess_oauth_state")?.value;

  // 1. Validate state and error
  if (error || !code || state !== savedState || !verifier) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?error=lichess_auth_failed`);
  }

  try {
    const session = await getSession();
    if (!session || !session.user.memberId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login`);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/lichess/callback`;

    // 2. Exchange code for token
    const tokenData = await exchangeLichessCode(code, verifier, redirectUri);

    // 3. Fetch Lichess profile
    const lichessUser = await fetchLichessAuthUser(tokenData.access_token);

    // 4. Update member in DB
    await db
      .update(members)
      .set({
        lichessUsername: lichessUser.username,
        lichessId: lichessUser.id,
        isLichessVerified: true,
        lichessAccessToken: encrypt(tokenData.access_token),
        updatedAt: new Date(),
      })
      .where(eq(members.id, session.user.memberId));

    // Cleanup cookies
    cookieStore.delete("lichess_oauth_verifier");
    cookieStore.delete("lichess_oauth_state");

    return NextResponse.redirect(`${appUrl}/dashboard/profile?success=lichess_connected`);
  } catch (err) {
    console.error("Lichess OAuth Callback Error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?error=lichess_callback_error`);
  }
}

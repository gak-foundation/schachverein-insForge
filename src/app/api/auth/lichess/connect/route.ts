import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/auth/lichess";

export async function GET() {
  const clientId = process.env.LICHESS_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/lichess/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "LICHESS_CLIENT_ID not configured" }, { status: 500 });
  }

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  const state = Math.random().toString(36).substring(7);

  const cookieStore = await cookies();
  
  // Store verifier and state in cookies
  cookieStore.set("lichess_oauth_verifier", verifier, { 
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 600, // 10 minutes
    path: "/",
  });
  
  cookieStore.set("lichess_oauth_state", state, { 
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
    scope: "preference:read", // Basic scope
  });

  return NextResponse.redirect(`https://lichess.org/oauth?${params.toString()}`);
}

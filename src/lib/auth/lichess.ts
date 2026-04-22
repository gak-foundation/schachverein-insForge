import { randomBytes, createHash } from "crypto";

export function generateCodeVerifier() {
  return randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export interface LichessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

export async function exchangeLichessCode(code: string, verifier: string, redirectUri: string) {
  const clientId = process.env.LICHESS_CLIENT_ID;
  
  if (!clientId) {
    throw new Error("LICHESS_CLIENT_ID is not configured");
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
    client_id: clientId,
  });

  const response = await fetch("https://lichess.org/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lichess token exchange failed: ${error}`);
  }

  return (await response.json()) as LichessTokenResponse;
}

export async function fetchLichessAuthUser(accessToken: string) {
  const response = await fetch("https://lichess.org/api/account", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Lichess user account");
  }

  return await response.json();
}

import { cookies } from "next/headers";

export async function storeServerSessionToken(refreshToken: string): Promise<void> {
  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-refresh-token"
    : "refresh-token";

  const cookieStore = await cookies();
  cookieStore.set(cookieName, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60,
  });
}
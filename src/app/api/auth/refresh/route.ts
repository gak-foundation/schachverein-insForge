import { NextRequest, NextResponse } from "next/server";
import {
  generateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "@/lib/auth/refresh-tokens";
import { handleError } from "@/lib/errors";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function getRefreshTokenFromCookie(request: NextRequest): string | null {
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-refresh-token"
      : "refresh-token";
  return request.cookies.get(cookieName)?.value ?? null;
}

function setRefreshTokenCookie(response: NextResponse, token: string): void {
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-refresh-token"
      : "refresh-token";

  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60,
  });
}

function clearRefreshTokenCookie(response: NextResponse): void {
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-refresh-token"
      : "refresh-token";

  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 0,
  });
}

export async function POST(request: NextRequest) {
  try {
    const oldToken = getRefreshTokenFromCookie(request);
    if (!oldToken) {
      return NextResponse.json(
        { error: { message: "Kein Refresh-Token vorhanden", code: "TOKEN_MISSING" } },
        { status: 401 },
      );
    }

    const newToken = generateRefreshToken();
    const result = await rotateRefreshToken(oldToken, newToken);

    if (result.compromised && result.userId) {
      const response = NextResponse.json(
        {
          error: {
            message: "Token-Kompromission erkannt — alle Sessions widerrufen",
            code: "REFRESH_TOKEN_COMPROMISED",
          },
        },
        { status: 401 },
      );
      clearRefreshTokenCookie(response);
      return response;
    }

    if (!result.valid || !result.userId) {
      const response = NextResponse.json(
        {
          error: {
            message: "Ungültiger oder abgelaufener Token",
            code: "TOKEN_INVALID",
          },
        },
        { status: 401 },
      );
      clearRefreshTokenCookie(response);
      return response;
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        permissions: users.permissions,
        memberId: users.memberId,
        emailVerified: users.emailVerified,
        lockedUntil: users.lockedUntil,
      })
      .from(users)
      .where(eq(users.id, result.userId));

    if (!user || (user.lockedUntil && new Date() < user.lockedUntil)) {
      const response = NextResponse.json(
        {
          error: {
            message: "Account gesperrt",
            code: "ACCOUNT_LOCKED",
          },
        },
        { status: 423 },
      );
      clearRefreshTokenCookie(response);
      return response;
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions ?? [],
        memberId: user.memberId,
        emailVerified: user.emailVerified,
      },
    });

    setRefreshTokenCookie(response, newToken);
    return response;
  } catch (error) {
    const { message, code, statusCode } = handleError(error);
    return NextResponse.json({ error: { message, code } }, { status: statusCode });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getRefreshTokenFromCookie(request);
    if (token) {
      await revokeRefreshToken(token);
    }

    const response = NextResponse.json({ message: "Erfolgreich abgemeldet" });
    clearRefreshTokenCookie(response);
    return response;
  } catch (error) {
    const { message, code, statusCode } = handleError(error);
    return NextResponse.json({ error: { message, code } }, { status: statusCode });
  }
}
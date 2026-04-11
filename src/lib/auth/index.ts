import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { handleFailedLogin, handleSuccessfulLogin, isAccountLockedByEmail } from "@/lib/auth/account-lockout";
import { checkRateLimit, checkRateLimitByIP } from "@/lib/auth/rate-limit";
import { generateRefreshToken, storeRefreshToken } from "@/lib/auth/refresh-tokens";
import { logAudit } from "@/lib/audit";
import { headers } from "next/headers";
import { CredentialsSignin } from "next-auth";

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

class RateLimitError extends CredentialsSignin {
  code = "rate_limited";
}

class AccountLockedError extends CredentialsSignin {
  code = "account_locked";
}

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

const isProduction = process.env.NODE_ENV === "production";
const cookiePrefix = isProduction ? "__Secure-" : "";
const hostPrefix = isProduction ? "__Host-" : "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db) as never,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          throw new InvalidCredentialsError();
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // IP-based rate limiting (prevents enumeration attacks with different emails)
        const headersList = await headers();
        const forwardedFor = headersList.get("x-forwarded-for");
        const realIP = headersList.get("x-real-ip");
        const clientIP = forwardedFor?.split(",")[0]?.trim() || realIP || "unknown";
        
        try {
          await checkRateLimitByIP(clientIP, "login_ip");
        } catch {
          await logAudit({
            action: "rate_limit_exceeded",
            entity: "user",
            changes: { 
              details: { old: null, new: { ip: clientIP, reason: "login_ip" } } 
            },
          });
          throw new RateLimitError();
        }

        // Email-based rate limiting
        try {
          await checkRateLimit(email, "login");
        } catch {
          await logAudit({
            action: "rate_limit_exceeded",
            entity: "user",
            changes: { 
              details: { old: null, new: { email, reason: "login_email" } } 
            },
          });
          throw new RateLimitError();
        }

        const lockStatus = await isAccountLockedByEmail(email);
        if (lockStatus.locked) {
          throw new AccountLockedError();
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
          throw new InvalidCredentialsError();
        }

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          await handleFailedLogin(user.id);
          throw new InvalidCredentialsError();
        }

        await handleSuccessfulLogin(user.id);

        const refreshToken = generateRefreshToken();
        await storeRefreshToken(user.id, refreshToken);

        await logAudit({
          action: "login",
          entity: "user",
          entityId: user.id,
        });

        return {
          ...user,
          role: user.role ?? "mitglied",
          permissions: user.permissions ?? [],
          memberId: user.memberId,
          emailVerified: user.emailVerified,
          refreshToken,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code-verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as typeof user & { role: string }).role;
        token.permissions = (user as typeof user & { permissions: string[] }).permissions;
        token.memberId = (user as typeof user & { memberId: string | null }).memberId;
        token.emailVerified = (user as typeof user & { emailVerified: Date | null }).emailVerified;
        token.refreshToken = (user as typeof user & { refreshToken?: string }).refreshToken;
      }

      if (account?.provider === "github") {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, token.email as string),
        });
        if (dbUser && !dbUser.emailVerified) {
          await db
            .update(users)
            .set({ emailVerified: new Date(), updatedAt: new Date() })
            .where(eq(users.id, dbUser.id));
          token.emailVerified = new Date();
        }
        if (dbUser) {
          token.role = dbUser.role ?? "mitglied";
          token.permissions = dbUser.permissions ?? [];
          token.memberId = dbUser.memberId;
          token.emailVerified = dbUser.emailVerified ?? new Date();
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
        session.user.memberId = token.memberId as string | null;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        const refreshToken = (user as typeof user & { refreshToken?: string }).refreshToken;
        if (refreshToken) {
          const { storeServerSessionToken } = await import("@/lib/auth/server-cookies");
          await storeServerSessionToken(refreshToken);
        }
      }
      return true;
    },
  },
  events: {
    async signOut(params: Record<string, unknown>) {
      const token = params.token as { id?: string } | undefined;
      if (token?.id) {
        const { revokeAllUserTokens } = await import("@/lib/auth/refresh-tokens");
        await revokeAllUserTokens(token.id);
      }
    },
  },
});
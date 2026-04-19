import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { authUsers, authSessions, authAccounts, authVerifications, authTwoFactors } from "@/lib/db/schema/auth";
import { twoFactor, admin } from "better-auth/plugins";
import { isAccountLockedByEmail, handleSuccessfulLogin, handleFailedLogin } from "./account-lockout";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authUsers,
      session: authSessions,
      account: authAccounts,
      verification: authVerifications,
      twoFactor: authTwoFactors,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  plugins: [
    twoFactor(),
    admin(),
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    sendResetPasswordEmail: async (user: { email: string }, url: string) => {
      console.log("Password reset email:", user.email, url);
    },
  },
  socialProviders: {
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? {
      github: {
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      },
    } : {}),
  },
  user: {
    additionalFields: {
      memberId: {
        type: "string",
        required: false,
      },
      activeClubId: {
        type: "string",
        required: false,
      },
      isSuperAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      role: {
        type: "string",
        required: false,
      },
      permissions: {
        type: "string[]",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  },
  rateLimit: {
    enabled: true,
    window: 15 * 60,
    max: 100,
  },
});

export type AuthSession = typeof auth.$Infer.Session;

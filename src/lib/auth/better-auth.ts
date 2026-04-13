import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { twoFactor, admin } from "better-auth/plugins";
import { isAccountLockedByEmail, handleSuccessfulLogin, handleFailedLogin } from "./account-lockout";
import { eq } from "drizzle-orm";
import { authUsers } from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.authUsers,
      session: schema.authSessions,
      account: schema.authAccounts,
      verification: schema.authVerifications,
      twoFactor: schema.authTwoFactors,
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
  },
  rateLimit: {
    enabled: true,
    window: 15 * 60,
    max: 100,
  },
});

export type AuthSession = typeof auth.$Infer.Session;

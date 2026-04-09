import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use type assertion to resolve adapter type mismatch
  // between @auth/drizzle-adapter and next-auth versions
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
      async authorize(credentials) {
        // TODO: Implement password verification with bcrypt
        // This is a placeholder for local email/password auth
        if (!credentials?.email) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user) return null;

        // In production, verify password hash here
        return {
          ...user,
          role: user.role ?? "mitglied",
          permissions: user.permissions ?? [],
          memberId: user.memberId,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role: string }).role;
        token.permissions = (user as typeof user & { permissions: string[] }).permissions;
        token.memberId = (user as typeof user & { memberId: string | null }).memberId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
        session.user.memberId = token.memberId as string | null;
      }
      return session;
    },
  },
});
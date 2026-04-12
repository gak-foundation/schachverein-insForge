import { headers } from "next/headers";
import { auth } from "@/lib/auth/better-auth";

type MemberRole = "admin" | "vorstand" | "sportwart" | "jugendwart" | "kassenwart" | "trainer" | "mitglied" | "eltern" | "user";

export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  role: MemberRole;
  memberId?: string | null;
  permissions?: string[];
}

export interface SessionWithRole {
  user: UserWithRole;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

export async function getSession(): Promise<SessionWithRole | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session as SessionWithRole | null;
}

export type Session = SessionWithRole;
export type User = UserWithRole;

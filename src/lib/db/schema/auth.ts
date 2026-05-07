import type { MemberRole } from "./enums";

export const authUsers = "auth_user" as const;

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  password: string | null;
  memberId: string | null;
  activeClubId: string | null;
  clubId: string | null;
  role: MemberRole;
  permissions: string[];
  failedLoginAttempts: number;
  lockedUntil: string | null;
  passwordResetAt: string | null;
  twoFactorEnabled: boolean;
  banned: boolean;
  banReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewAuthUser {
  id?: string;
  name?: string | null;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  password?: string | null;
  memberId?: string | null;
  activeClubId?: string | null;
  clubId?: string | null;
  role?: MemberRole;
  permissions?: string[];
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
  passwordResetAt?: string | null;
  twoFactorEnabled?: boolean;
  banned?: boolean;
  banReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

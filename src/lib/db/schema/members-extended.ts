import type { AvailabilityStatus, MembershipStatus } from "./enums";

export const dwzHistory = "dwz_history" as const;

export interface DwzHistory {
  id: string;
  memberId: string;
  dwz: number;
  elo: number | null;
  source: string | null;
  recordedAt: string;
  createdAt: string;
}

export interface NewDwzHistory {
  id?: string;
  memberId: string;
  dwz: number;
  elo?: number | null;
  source?: string | null;
  recordedAt: string;
  createdAt?: string;
}

export const memberStatusHistory = "member_status_history" as const;

export interface MemberStatusHistory {
  id: string;
  memberId: string;
  oldStatus: MembershipStatus | null;
  newStatus: MembershipStatus;
  reason: string | null;
  changedAt: string;
  changedBy: string | null;
}

export interface NewMemberStatusHistory {
  id?: string;
  memberId: string;
  oldStatus?: MembershipStatus | null;
  newStatus: MembershipStatus;
  reason?: string | null;
  changedAt?: string;
  changedBy?: string | null;
}

export const availability = "availability" as const;

export interface Availability {
  id: string;
  memberId: string;
  matchId: string | null;
  date: string;
  status: AvailabilityStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewAvailability {
  id?: string;
  memberId: string;
  matchId?: string | null;
  date: string;
  status?: AvailabilityStatus;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

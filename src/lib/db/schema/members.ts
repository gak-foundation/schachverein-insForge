import type {
  MembershipStatus,
  MemberRole,
  ClubMemberStatus,
} from "./enums";

export const members = "members" as const;

export interface Member {
  id: string;
  clubId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  dwz: number | null;
  elo: number | null;
  dwzId: string | null;
  lichessUsername: string | null;
  lichessId: string | null;
  isLichessVerified: boolean | null;
  lichessAccessToken: string | null;
  chesscomUsername: string | null;
  fideId: string | null;
  status: MembershipStatus;
  role: MemberRole;
  joinedAt: string | null;
  parentId: string | null;
  permissions: string[];
  sepaMandateReference: string | null;
  sepaIban: string | null;
  sepaBic: string | null;
  mandateSignedAt: string | null;
  mandateUrl: string | null;
  contributionRateId: string | null;
  notes: string | null;
  medicalNotes: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  photoConsent: boolean | null;
  newsletterConsent: boolean | null;
  resultPublicationConsent: boolean | null;
  deletionRequestedAt: string | null;
  anonymizedAt: string | null;
  heritageGameId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewMember {
  id?: string;
  clubId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  dwz?: number | null;
  elo?: number | null;
  dwzId?: string | null;
  lichessUsername?: string | null;
  lichessId?: string | null;
  isLichessVerified?: boolean | null;
  lichessAccessToken?: string | null;
  chesscomUsername?: string | null;
  fideId?: string | null;
  status?: MembershipStatus;
  role?: MemberRole;
  joinedAt?: string | null;
  parentId?: string | null;
  permissions?: string[];
  sepaMandateReference?: string | null;
  sepaIban?: string | null;
  sepaBic?: string | null;
  mandateSignedAt?: string | null;
  mandateUrl?: string | null;
  contributionRateId?: string | null;
  notes?: string | null;
  medicalNotes?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  photoConsent?: boolean | null;
  newsletterConsent?: boolean | null;
  resultPublicationConsent?: boolean | null;
  deletionRequestedAt?: string | null;
  anonymizedAt?: string | null;
  heritageGameId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const clubMemberships = "club_memberships" as const;

export interface ClubMembership {
  id: string;
  clubId: string;
  memberId: string;
  role: MemberRole;
  joinedAt: string;
  isPrimary: boolean;
  status: ClubMemberStatus;
  invitedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewClubMembership {
  id?: string;
  clubId: string;
  memberId: string;
  role?: MemberRole;
  joinedAt?: string;
  isPrimary?: boolean;
  status?: ClubMemberStatus;
  invitedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const clubInvitations = "club_invitations" as const;

export interface ClubInvitation {
  id: string;
  clubId: string;
  email: string;
  role: MemberRole;
  invitedBy: string;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface NewClubInvitation {
  id?: string;
  clubId: string;
  email: string;
  role?: MemberRole;
  invitedBy: string;
  token: string;
  expiresAt: string;
  usedAt?: string | null;
  createdAt?: string;
}

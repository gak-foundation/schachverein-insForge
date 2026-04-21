// Core domain types for the Schachverein app

// ─── Club ──────────────────────────────────────────────────────

export interface ClubAddress {
  street: string;
  zipCode: string;
  city: string;
  country: string;
}

export interface TrainingTime {
  day: string;
  time: string;
  label?: string;
}

export interface ClubSettings {
  representatives?: string;
  phone?: string;
  registerCourt?: string;
  registerNumber?: string;
  taxId?: string;
  responsiblePerson?: string;
  lichessTeamId?: string;
  externalWebsite?: string;
  customDomain?: string;
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
  trainingTimes?: TrainingTime[];
  [key: string]: unknown;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  website?: string | null;
  address?: ClubAddress | null;
  contactEmail?: string | null;
  plan: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionExpiresAt?: string | null;
  features: Record<string, boolean>;
  settings: ClubSettings;
  isActive: boolean;
  creditorId?: string | null;
  sepaIban?: string | null;
  sepaBic?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Member ────────────────────────────────────────────────────

export type MemberRole =
  | "admin"
  | "vorstand"
  | "sportwart"
  | "jugendwart"
  | "kassenwart"
  | "trainer"
  | "mitglied"
  | "eltern"
  | "user";

export type MembershipStatus = "active" | "inactive" | "resigned" | "honorary";

export interface Member {
  id: string;
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
  chesscomUsername?: string | null;
  fideId?: string | null;
  status: MembershipStatus;
  role: MemberRole;
  joinedAt?: string | null;
  parentId?: string | null;
  parent?: { id: string; firstName: string; lastName: string } | null;
  children?: Array<{ id: string; firstName: string; lastName: string }>;
  permissions: string[] | null;
  sepaMandateReference?: string | null;
  sepaIban?: string | null;
  sepaBic?: string | null;
  mandateSignedAt?: string | null;
  mandateUrl?: string | null;
  photoConsent: boolean | null;
  newsletterConsent: boolean | null;
  resultPublicationConsent: boolean | null;
  notes?: string | null;
  contributionRateId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ─── Finance ────────────────────────────────────────────────────

export interface ContributionRate {
  id: string;
  name: string;
  amount: number | string;
  frequency: "monthly" | "quarterly" | "yearly";
  description?: string | null;
}


// ─── Calendar ────────────────────────────────────────────────────

export type EventType = "training" | "match" | "tournament" | "meeting";

export interface ClubEvent {
  id: string;
  title: string;
  description?: string;
  eventType: string; // Changed from EventType to string to support more types (match, tournament)
  startDate: string | Date;
  endDate?: string | Date;
  location?: string | null;
  isAllDay: boolean;
  createdBy?: string;
}

export interface CalendarItem {
  id: string;
  originalId?: string;
  title: string;
  type: string;
  start: Date;
  end: Date;
  location?: string | null;
  isAllDay: boolean;
  isRecurring: boolean;
}
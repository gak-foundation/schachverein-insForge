import type { SubscriptionPlan, SubscriptionStatus } from "./enums";

export const clubs = "clubs" as const;

export interface Club {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  address: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
  } | null;
  contactEmail: string | null;
  plan: SubscriptionPlan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeConnectAccountId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionExpiresAt: string | null;
  features: Record<string, boolean>;
  settings: Record<string, unknown>;
  isActive: boolean;
  creditorId: string | null;
  sepaIban: string | null;
  sepaBic: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewClub {
  id?: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  website?: string | null;
  address?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
  } | null;
  contactEmail?: string | null;
  plan?: SubscriptionPlan;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeConnectAccountId?: string | null;
  subscriptionStatus?: SubscriptionStatus | null;
  subscriptionExpiresAt?: string | null;
  features?: Record<string, boolean>;
  settings?: Record<string, unknown>;
  isActive?: boolean;
  creditorId?: string | null;
  sepaIban?: string | null;
  sepaBic?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

import type { AddonId, AddonStatus } from "./enums";

export const clubAddons = "club_addons" as const;

export interface ClubAddon {
  id: string;
  clubId: string;
  addonId: AddonId;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  status: AddonStatus;
  startedAt: string;
  expiresAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewClubAddon {
  id?: string;
  clubId: string;
  addonId: AddonId;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  status?: AddonStatus;
  startedAt?: string;
  expiresAt?: string | null;
  canceledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

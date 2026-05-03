import type { ApplicationStatus, ApplicationType } from "./enums";

export const waitlistApplications = "waitlist_applications" as const;

export interface WaitlistApplication {
  id: string;
  type: ApplicationType;
  clubName: string;
  slug: string | null;
  contactEmail: string;
  contactName: string | null;
  phone: string | null;
  website: string | null;
  address: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
  } | null;
  memberCount: string | null;
  message: string | null;
  notes: string | null;
  source: string | null;
  userAgent: string | null;
  ipHash: string | null;
  status: ApplicationStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewWaitlistApplication {
  id?: string;
  type?: ApplicationType;
  clubName: string;
  slug?: string | null;
  contactEmail: string;
  contactName?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
  } | null;
  memberCount?: string | null;
  message?: string | null;
  notes?: string | null;
  source?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  status?: ApplicationStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

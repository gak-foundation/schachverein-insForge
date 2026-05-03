import type { PaymentStatus, ContributionFrequency } from "./enums";

export const sepaExports = "sepa_exports" as const;

export interface SepaExport {
  id: string;
  clubId: string;
  xmlContent: string;
  filename: string;
  totalAmount: string;
  paymentCount: number;
  createdAt: string;
}

export interface NewSepaExport {
  id?: string;
  clubId: string;
  xmlContent: string;
  filename: string;
  totalAmount: string;
  paymentCount: number;
  createdAt?: string;
}

export const payments = "payments" as const;

export interface Payment {
  id: string;
  clubId: string;
  memberId: string;
  amount: string;
  description: string;
  status: PaymentStatus;
  dueDate: string | null;
  paidAt: string | null;
  sepaMandateReference: string | null;
  sepaExportId: string | null;
  invoiceNumber: string | null;
  year: number;
  dunningLevel: number;
  lastDunningAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewPayment {
  id?: string;
  clubId: string;
  memberId: string;
  amount: string;
  description: string;
  status?: PaymentStatus;
  dueDate?: string | null;
  paidAt?: string | null;
  sepaMandateReference?: string | null;
  sepaExportId?: string | null;
  invoiceNumber?: string | null;
  year: number;
  dunningLevel?: number;
  lastDunningAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const contributionRates = "contribution_rates" as const;

export interface ContributionRate {
  id: string;
  clubId: string;
  name: string;
  amount: string;
  frequency: ContributionFrequency;
  description: string | null;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

export interface NewContributionRate {
  id?: string;
  clubId: string;
  name: string;
  amount: string;
  frequency?: ContributionFrequency;
  description?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  createdAt?: string;
}

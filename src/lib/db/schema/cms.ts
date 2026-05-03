import type { PageStatus, PageLayout, PaymentStatus, ContributionFrequency, DocumentCategory, ApplicationStatus, ApplicationType } from "./enums";

export const mediaAssets = "media_assets" as const;

export interface MediaAsset {
  id: string;
  clubId: string;
  s3Key: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  fileSize: number | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewMediaAsset {
  id?: string;
  clubId: string;
  s3Key: string;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  fileSize?: number | null;
  uploadedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const pages = "pages" as const;

export interface Page {
  id: string;
  clubId: string;
  slug: string;
  title: string;
  status: PageStatus;
  publishAt: string | null;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    noIndex?: boolean;
  } | null;
  layout: PageLayout;
  navigationParent: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface NewPage {
  id?: string;
  clubId: string;
  slug: string;
  title: string;
  status?: PageStatus;
  publishAt?: string | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    noIndex?: boolean;
  } | null;
  layout?: PageLayout;
  navigationParent?: string | null;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export const pageBlocks = "page_blocks" as const;

export interface PageBlock {
  id: string;
  pageId: string;
  blockType: string;
  order: number;
  content: Record<string, unknown>;
  visibility: {
    public?: boolean;
    members?: boolean;
    roles?: string[];
  } | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewPageBlock {
  id?: string;
  pageId: string;
  blockType: string;
  order: number;
  content: Record<string, unknown>;
  visibility?: {
    public?: boolean;
    members?: boolean;
    roles?: string[];
  } | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const pageRevisions = "page_revisions" as const;

export interface PageRevision {
  id: string;
  pageId: string;
  snapshot: Record<string, unknown>;
  authorId: string | null;
  comment: string | null;
  createdAt: string;
}

export interface NewPageRevision {
  id?: string;
  pageId: string;
  snapshot: Record<string, unknown>;
  authorId?: string | null;
  comment?: string | null;
  createdAt?: string;
}

export const mediaConsents = "media_consents" as const;

export interface MediaConsent {
  id: string;
  mediaAssetId: string;
  memberId: string;
  consentType: string;
  grantedAt: string;
  revokedAt: string | null;
  createdAt: string;
}

export interface NewMediaConsent {
  id?: string;
  mediaAssetId: string;
  memberId: string;
  consentType?: string;
  grantedAt?: string;
  revokedAt?: string | null;
  createdAt?: string;
}

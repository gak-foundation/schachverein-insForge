import type { DocumentCategory } from "./enums";

export const documents = "documents" as const;

export interface Document {
  id: string;
  clubId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  category: DocumentCategory;
  mimeType: string | null;
  fileSize: number | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface NewDocument {
  id?: string;
  clubId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  category?: DocumentCategory;
  mimeType?: string | null;
  fileSize?: number | null;
  uploadedBy?: string | null;
  createdAt?: string;
}

export const newsletters = "newsletters" as const;

export interface Newsletter {
  id: string;
  clubId: string;
  subject: string;
  body: string;
  sentAt: string | null;
  sentBy: string | null;
  createdAt: string;
}

export interface NewNewsletter {
  id?: string;
  clubId: string;
  subject: string;
  body: string;
  sentAt?: string | null;
  sentBy?: string | null;
  createdAt?: string;
}

export const meetingProtocols = "meeting_protocols" as const;

export interface MeetingProtocol {
  id: string;
  clubId: string;
  eventId: string;
  title: string;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
  attendeesCount: number;
  isQuorate: boolean;
  agenda: {
    title: string;
    description?: string;
    results?: string;
    resolutions?: { title: string; for: number; against: number; abstained: number; result: string }[];
  }[] | null;
  notes: string | null;
  signedAt: string | null;
  signedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewMeetingProtocol {
  id?: string;
  clubId: string;
  eventId: string;
  title: string;
  location?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  attendeesCount?: number;
  isQuorate?: boolean;
  agenda?: {
    title: string;
    description?: string;
    results?: string;
    resolutions?: { title: string; for: number; against: number; abstained: number; result: string }[];
  }[] | null;
  notes?: string | null;
  signedAt?: string | null;
  signedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

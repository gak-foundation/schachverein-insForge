"use server";

import { requestAccountDeletion as originalRequestAccountDeletion, exportMemberData as originalExportMemberData } from "@/features/auth/gdpr-actions";

export async function requestAccountDeletion() {
  return originalRequestAccountDeletion();
}

export async function exportMemberData(memberId: string) {
  return originalExportMemberData(memberId);
}

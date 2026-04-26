"use server";

import { exportClubDataBundle as originalExportClubDataBundle } from "@/features/clubs/export-actions";

export async function exportClubDataBundle() {
  return originalExportClubDataBundle();
}

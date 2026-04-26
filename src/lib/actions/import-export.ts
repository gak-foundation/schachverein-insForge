"use server";

import { requireClubId } from "@/lib/actions/utils";
import { parseMemberCSV, exportMembersToCSV } from "@/lib/csv/members";
import { createMember, getMembers } from "@/features/members/actions";
import { revalidatePath } from "next/cache";

/**
 * Importiert Mitglieder aus einer CSV-Datei.
 */
export async function importMembersCSV(formData: FormData) {
  await requireClubId();
  
  const file = formData.get("csvFile") as File;
  if (!file) {
    return { success: false, imported: 0, errors: [{ row: 0, message: "Keine Datei ausgewählt" }] };
  }

  const content = await file.text();
  const { data, errors } = parseMemberCSV(content);

  if (data.length === 0) {
    return { success: false, imported: 0, errors: errors.length > 0 ? errors : [{ row: 0, message: "Keine gültigen Daten gefunden" }] };
  }

  let importedCount = 0;
  const importErrors = [...errors];

  for (let i = 0; i < data.length; i++) {
    try {
      await createMember(data[i] as any);
      importedCount++;
    } catch (error: any) {
      importErrors.push({
        row: i + 2, // +1 for header, +1 for 0-index
        message: error.message || "Fehler beim Erstellen des Mitglieds"
      });
    }
  }

  revalidatePath("/dashboard/members");
  
  return {
    success: importErrors.length === 0,
    imported: importedCount,
    errors: importErrors
  };
}

/**
 * Exportiert alle Mitglieder des aktuellen Vereins als CSV-String.
 */
export async function exportMembersToCSVAction() {
  await requireClubId();
  
  // Alle Mitglieder laden (ohne Limit)
  const { members } = await getMembers(undefined, undefined, undefined, "name", "asc", 1, 10000);
  
  return exportMembersToCSV(members as any);
}

"use server";

import { createServiceClient } from "@/lib/insforge";
import { requireClubId } from "@/lib/actions/utils";
import { encrypt, decrypt } from "@/lib/crypto";

export async function getClubBankSettings() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: club, error } = await client
    .from('clubs')
    .select('creditor_id, sepa_iban, sepa_bic')
    .eq('id', clubId)
    .single();

  if (error) throw error;

  return {
    creditorId: club?.creditor_id || "",
    sepaIban: club?.sepa_iban ? decrypt(club.sepa_iban) : "",
    sepaBic: club?.sepa_bic ? decrypt(club.sepa_bic) : "",
  };
}

export async function updateClubBankSettings(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const creditorId = formData.get("creditorId") as string;
  const sepaIban = formData.get("sepaIban") as string;
  const sepaBic = formData.get("sepaBic") as string;

  const { error } = await client
    .from('clubs')
    .update({
      creditor_id: creditorId,
      sepa_iban: sepaIban ? encrypt(sepaIban) : null,
      sepa_bic: sepaBic ? encrypt(sepaBic) : null,
    })
    .eq('id', clubId);

  if (error) throw error;

  // revalidatePath is not needed if we use server actions with useFormStatus or similar
}

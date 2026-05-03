// src/lib/jobs/payment-reminders.ts
"use server";

import { createServiceClient } from "@/lib/insforge";
import { sendEmailDirect } from "@/lib/auth/email";
import { replacePlaceholders } from "@/lib/email/placeholder-replacer";
import { paymentReminderTemplate } from "@/lib/email/templates";

export async function sendPaymentReminders(clubId: string): Promise<{
  sent: number;
  errors: string[];
}> {
  const client = createServiceClient();

  // Find overdue payments without dunning sent
  const { data: overdue, error } = await client
    .from("payments")
    .select("id, member_id, amount, description, member:members!member_id(email, first_name, last_name)")
    .eq("club_id", clubId)
    .eq("status", "overdue")
    .is("dunning_sent_at", null);

  if (error || !overdue) {
    return { sent: 0, errors: [error?.message ?? "Keine Daten"] };
  }

  const template = paymentReminderTemplate();
  let sent = 0;
  const errors: string[] = [];

  for (const payment of overdue) {
    const member = (payment as any).member;
    if (!member?.email) continue;

    try {
      const body = replacePlaceholders(template.html, {
        vorname: member.first_name ?? "",
        nachname: member.last_name ?? "",
      });

      await sendEmailDirect(undefined, template.subject, body, "", [member.email]);

      // Mark as sent
      await client
        .from("payments")
        .update({ dunning_sent_at: new Date().toISOString() })
        .eq("id", (payment as any).id);

      sent++;
    } catch (err: any) {
      errors.push(`${member.email}: ${err.message}`);
    }
  }

  return { sent, errors };
}

"use server";

import { db } from "@/lib/db";
import { waitlistApplications } from "@/lib/db/schema";
import { eq, gte, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { contactFormSchema } from "@/lib/validations/contact";
import { createHash } from "crypto";

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

async function checkRateLimit(ipHash: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentSubmissions = await db
    .select({ count: sql<number>`count(*)` })
    .from(waitlistApplications)
    .where(
      and(
        eq(waitlistApplications.ipHash, ipHash),
        gte(waitlistApplications.createdAt, oneHourAgo)
      )
    );

  const count = Number(recentSubmissions[0]?.count ?? 0);
  return count < 3;
}

async function sendNotificationEmail(data: {
  type: string;
  clubName: string;
  contactName: string;
  email: string;
  phone?: string;
  memberCount?: number;
  message?: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "kontakt@schach.studio";

  if (!resendApiKey || !notificationEmail) {
    console.warn("E-Mail-Konfiguration nicht vollständig, überspringe Versand");
    return { success: true };
  }

  const typeLabels: Record<string, string> = {
    waitlist: "Warteliste",
    contact: "Kontaktanfrage",
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: notificationEmail,
        subject: `Neue ${typeLabels[data.type] ?? "Anfrage"} von ${data.clubName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Neue Anfrage</title>
</head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333;">
  <h2>Neue ${typeLabels[data.type] ?? "Anfrage"}</h2>
  
  <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
    <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Verein:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.clubName}</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Ansprechpartner:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.contactName}</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">E-Mail:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
    ${data.phone ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Telefon:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone}</td></tr>` : ""}
    ${data.memberCount ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Mitglieder:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.memberCount}</td></tr>` : ""}
    ${data.message ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">Nachricht:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.message.replace(/\n/g, "<br>")}</td></tr>` : ""}
  </table>
</body>
</html>
        `,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Fehler beim Senden der Benachrichtigungs-E-Mail:", error);
    return { success: false, error };
  }
}

async function sendConfirmationEmail(data: {
  email: string;
  contactName: string;
  type: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "kontakt@schach.studio";

  if (!resendApiKey) {
    return { success: true };
  }

  const typeLabels: Record<string, string> = {
    waitlist: "Auf die Warteliste",
    contact: "Ihre Anfrage",
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: data.email,
        subject: "Wir haben Ihre Anfrage erhalten",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Anfrage erhalten</title>
</head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333;">
  <h2>Vielen Dank, ${data.contactName}!</h2>
  <p>Wir haben ${typeLabels[data.type] ?? "Ihre Anfrage"} erhalten und werden uns so schnell wie möglich bei Ihnen melden.</p>
  <p>Mit freundlichen Grüßen,<br>Das schach.studio Team</p>
</body>
</html>
        `,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Fehler beim Senden der Bestätigungs-E-Mail:", error);
    return { success: false, error };
  }
}

export type SubmitContactFormResult =
  | { success: true; error?: never; fieldErrors?: never }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitContactForm(
  formData: FormData,
  ipAddress?: string
): Promise<SubmitContactFormResult> {
  const honeypot = formData.get("website") as string | null;
  if (honeypot) {
    return { success: true };
  }

  const rawData = {
    type: formData.get("type") as string,
    clubName: formData.get("clubName") as string,
    contactName: formData.get("contactName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string | null,
    memberCount: formData.get("memberCount") as string | null,
    message: formData.get("message") as string | null,
    turnstileToken: "",
    website: formData.get("website") as string | null,
  };

  const validated = contactFormSchema.safeParse(rawData);

  if (!validated.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of validated.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    }
    return { success: false, error: "Validierungsfehler", fieldErrors };
  }

  const data = validated.data;

  const ipHash = ipAddress ? hashIp(ipAddress) : "unknown";

  const withinRateLimit = await checkRateLimit(ipHash);
  if (!withinRateLimit) {
    return { success: false, error: "Zu viele Anfragen. Bitte versuchen Sie es in einer Stunde erneut." };
  }

  try {
    const memberCountNum = data.memberCount ? Number(data.memberCount) : null;

    await db.insert(waitlistApplications).values({
      type: data.type as "waitlist" | "contact",
      clubName: data.clubName,
      contactEmail: data.email,
      contactName: data.contactName,
      phone: data.phone || null,
      memberCount: memberCountNum?.toString() || null,
      message: data.message || null,
      source: formData.get("source") as string | null,
      userAgent: formData.get("userAgent") as string | null,
      ipHash,
      status: "pending",
      position: 0,
    });

    revalidatePath("/kontakt");

    await sendNotificationEmail({
      type: data.type,
      clubName: data.clubName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone || undefined,
      memberCount: memberCountNum || undefined,
      message: data.message || undefined,
    });

    await sendConfirmationEmail({
      email: data.email,
      contactName: data.contactName,
      type: data.type,
    });

    return { success: true };
  } catch (error) {
    console.error("Fehler beim Speichern der Kontaktanfrage:", error);
    return { success: false, error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." };
  }
}

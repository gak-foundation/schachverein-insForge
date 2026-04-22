"use server";

import { db } from "@/lib/db";
import { waitlistApplications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const waitlistSchema = {
  clubName: {
    minLength: 2,
    maxLength: 200,
  },
  contactEmail: {
    minLength: 5,
    maxLength: 255,
  },
  contactName: {
    maxLength: 255,
  },
  website: {
    maxLength: 300,
  },
  memberCount: {
    maxLength: 50,
  },
  notes: {
    maxLength: 1000,
  },
};

function generateUniqueSlug(baseSlug: string): string {
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
}

export async function submitWaitlistApplication(formData: FormData) {
  try {
    const clubName = formData.get("clubName") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactName = formData.get("contactName") as string | null;
    const website = formData.get("website") as string | null;
    const memberCount = formData.get("memberCount") as string | null;
    const notes = formData.get("notes") as string | null;
    const type = (formData.get("type") as "waitlist" | "pilot") || "waitlist";
    const painPoints = formData.get("painPoints") as string | null;

    if (!clubName || clubName.length < waitlistSchema.clubName.minLength) {
      return { error: "Vereinsname muss mindestens 2 Zeichen haben" };
    }

    if (clubName.length > waitlistSchema.clubName.maxLength) {
      return { error: `Vereinsname darf maximal ${waitlistSchema.clubName.maxLength} Zeichen haben` };
    }

    if (!contactEmail || contactEmail.length < waitlistSchema.contactEmail.minLength) {
      return { error: "Kontakt-E-Mail ist erforderlich" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return { error: "Bitte geben Sie eine gültige E-Mail-Adresse ein" };
    }

    let baseSlug = slugify(clubName);
    if (!baseSlug) {
      baseSlug = "verein";
    }

    let slug = baseSlug;
    let slugExists = true;
    let counter = 0;

    while (slugExists) {
      const existing = await db
        .select({ id: waitlistApplications.id })
        .from(waitlistApplications)
        .where(eq(waitlistApplications.slug, slug))
        .limit(1);

      if (existing.length === 0) {
        slugExists = false;
      } else {
        counter++;
        slug = `${baseSlug}-${counter}`;
      }
    }

    const maxPosition = await db
      .select({ maxPos: waitlistApplications.position })
      .from(waitlistApplications)
      .orderBy(waitlistApplications.position)
      .limit(1);

    const nextPosition = (maxPosition[0]?.maxPos ?? 0) + 1;

    const address = {
      street: (formData.get("street") as string) || "",
      zipCode: (formData.get("zipCode") as string) || "",
      city: (formData.get("city") as string) || "",
      country: (formData.get("country") as string) || "Deutschland",
    };

    const result = await db
      .insert(waitlistApplications)
      .values({
        clubName,
        slug,
        contactEmail,
        contactName: contactName || null,
        type,
        website: website || null,
        address: Object.values(address).some((v) => v) ? address : null,
        memberCount: memberCount || null,
        notes: notes || null,
        message: painPoints || null, // Storing pain points in the message field
        status: "pending",
        position: nextPosition,
      })
      .returning({ id: waitlistApplications.id });

    revalidatePath("/");
    revalidatePath("/dashboard/admin/waitlist");

    return {
      success: true,
      slug,
      message:
        type === "pilot"
          ? "Ihre Bewerbung für das Pilot-Programm wurde erfolgreich eingereicht! Wir melden uns in Kürze für ein persönliches Kennenlernen."
          : "Ihre Bewerbung wurde erfolgreich eingereicht. Sie werden per E-Mail benachrichtigt, sobald wir Ihren Antrag geprüft haben.",
    };
  } catch (error) {
    console.error("Error submitting waitlist application:", error);

    if (error instanceof ZodError) {
      return { error: "Validierungsfehler: " + error.issues.map(e => e.message).join(", ") };
    }

    return { error: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut." };
  }
}

export async function getWaitlistApplications(status?: "pending" | "approved" | "rejected" | "waitlisted") {
  try {
    let query = db.select().from(waitlistApplications);

    if (status) {
      query = query.where(eq(waitlistApplications.status, status)) as typeof query;
    }

    const results = await query.orderBy(waitlistApplications.position, waitlistApplications.createdAt);
    return results;
  } catch (error) {
    console.error("Error fetching waitlist applications:", error);
    return [];
  }
}

export async function updateWaitlistApplicationStatus(
  id: string,
  newStatus: "pending" | "approved" | "rejected" | "waitlisted"
) {
  try {
    const result = await db
      .update(waitlistApplications)
      .set({
        status: newStatus,
        reviewedAt: new Date(),
      })
      .where(eq(waitlistApplications.id, id))
      .returning({ id: waitlistApplications.id });

    if (result.length === 0) {
      return { error: "Bewerbung nicht gefunden" };
    }

    revalidatePath("/admin/waitlist");
    return { success: true };
  } catch (error) {
    console.error("Error updating waitlist application status:", error);
    return { error: "Fehler beim Aktualisieren des Status" };
  }
}
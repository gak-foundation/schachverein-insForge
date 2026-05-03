"use server";

import { createServiceClient } from "@/lib/insforge";
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

export async function submitWaitlistApplication(formData: FormData) {
  try {
    const client = createServiceClient();
    const clubName = formData.get("clubName") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactName = formData.get("contactName") as string | null;
    const website = formData.get("website") as string | null;
    const memberCount = formData.get("memberCount") as string | null;
    const notes = formData.get("notes") as string | null;
    const type = "waitlist";
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
      const { data: existing, error } = await client
        .from('waitlist_applications')
        .select('id')
        .eq('slug', slug)
        .limit(1);

      if (error) throw error;

      if (!existing || existing.length === 0) {
        slugExists = false;
      } else {
        counter++;
        slug = `${baseSlug}-${counter}`;
      }
    }

    const { data: maxPosition, error: mpError } = await client
      .from('waitlist_applications')
      .select('position')
      .order('position', { ascending: true })
      .limit(1);

    if (mpError) throw mpError;

    const nextPosition = (maxPosition?.[0]?.position ?? 0) + 1;

    const address = {
      street: (formData.get("street") as string) || "",
      zipCode: (formData.get("zipCode") as string) || "",
      city: (formData.get("city") as string) || "",
      country: (formData.get("country") as string) || "Deutschland",
    };

    const { error: iError } = await client
      .from('waitlist_applications')
      .insert([{
        club_name: clubName,
        slug,
        contact_email: contactEmail,
        contact_name: contactName || null,
        type,
        website: website || null,
        address: Object.values(address).some((v) => v) ? address : null,
        member_count: memberCount || null,
        notes: notes || null,
        message: painPoints || null, // Storing pain points in the message field
        status: "pending",
        position: nextPosition,
      }]);

    if (iError) throw iError;

    revalidatePath("/");
    revalidatePath("/dashboard/admin/waitlist");

    return {
      success: true,
      slug,
      message: "Ihre Bewerbung wurde erfolgreich eingereicht. Sie werden per E-Mail benachrichtigt, sobald wir Ihren Antrag geprüft haben.",
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
    const client = createServiceClient();
    let query = client.from('waitlist_applications').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
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
    const client = createServiceClient();
    const { data: result, error } = await client
      .from('waitlist_applications')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id')
      .single();

    if (error || !result) {
      return { error: "Bewerbung nicht gefunden" };
    }

    revalidatePath("/admin/waitlist");
    return { success: true };
  } catch (error) {
    console.error("Error updating waitlist application status:", error);
    return { error: "Fehler beim Aktualisieren des Status" };
  }
}

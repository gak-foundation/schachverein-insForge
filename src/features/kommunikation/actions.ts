"use server";

import { db } from "@/lib/db";
import { members, clubMemberships, teams, teamMemberships } from "@/lib/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { sendEmailDirect } from "@/lib/auth/email";
import { requireClubAuth } from "@/lib/auth/session";

export async function getMailingLists() {
    const session = await requireClubAuth();
    const clubId = session.user.clubId!;
    
    const clubTeams = await db.select().from(teams).where(eq(teams.clubId, clubId));
    
    return {
        roles: [
            { id: "mitglied", label: "Alle Mitglieder" },
            { id: "vorstand", label: "Vorstand" },
            { id: "sportwart", label: "Sportwart" },
            { id: "jugendwart", label: "Jugendwart" },
            { id: "kassenwart", label: "Kassenwart" },
            { id: "trainer", label: "Trainer" },
            { id: "eltern", label: "Eltern" }
        ],
        teams: clubTeams.map(t => ({ id: t.id, name: t.name }))
    }
}

export async function sendRundmailAction(formData: FormData) {
    const session = await requireClubAuth();
    const clubId = session.user.clubId!;
    
    const subject = formData.get("subject") as string;
    const bodyHtml = formData.get("bodyHtml") as string;
    const targetType = formData.get("targetType") as string; // 'role', 'team', 'all'
    const targetId = formData.get("targetId") as string;
    
    if (!subject || !bodyHtml) {
        throw new Error("Betreff und Inhalt sind erforderlich.");
    }
    if (!targetType) {
        throw new Error("Bitte wähle einen Empfängerkreis aus.");
    }
    
    let emails: string[] = [];
    
    if (targetType === "all") {
        const rows = await db.select({ email: members.email })
          .from(clubMemberships)
          .innerJoin(members, eq(clubMemberships.memberId, members.id))
          .where(and(eq(clubMemberships.clubId, clubId), eq(members.status, "active")));
        emails = rows.map(r => r.email).filter(Boolean) as string[];
    } else if (targetType === "role") {
        const rows = await db.select({ email: members.email })
          .from(clubMemberships)
          .innerJoin(members, eq(clubMemberships.memberId, members.id))
          .where(and(eq(clubMemberships.clubId, clubId), eq(clubMemberships.role, targetId as any), eq(members.status, "active")));
        emails = rows.map(r => r.email).filter(Boolean) as string[];
    } else if (targetType === "team") {
        const rows = await db.select({ email: members.email })
          .from(teamMemberships)
          .innerJoin(members, eq(teamMemberships.memberId, members.id))
          .where(and(eq(teamMemberships.teamId, targetId), eq(members.status, "active")));
        emails = rows.map(r => r.email).filter(Boolean) as string[];
    }
    
    // Deduplicate emails
    emails = [...new Set(emails)];
    
    if (emails.length === 0) {
        throw new Error("Keine Empfänger gefunden (Möglicherweise haben die ausgewählten Mitglieder keine E-Mail-Adresse hinterlegt).");
    }
    
    try {
        await sendEmailDirect(
            undefined, // no "to"
            subject,
            bodyHtml,
            "Bitte HTML-fähigen Email-Client verwenden.",
            emails // BCC all users
        );
    } catch (err) {
        throw new Error("Fehler beim Senden der E-Mail. Bitte überprüfe die SMTP Einstellungen.");
    }
    
    return { success: true, count: emails.length };
}
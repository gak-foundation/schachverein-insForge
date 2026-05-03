"use server";

import { createServiceClient } from "@/lib/insforge";
import { sendEmailDirect } from "@/lib/auth/email";
import { requireClubAuth } from "@/lib/auth/session";

export async function getMailingLists() {
    const session = await requireClubAuth();
    const clubId = session.user.clubId!;
    const client = createServiceClient();
    
    const { data: clubTeams, error } = await client
      .from('teams')
      .select('id, name')
      .eq('club_id', clubId);
    
    if (error) throw new Error("Fehler beim Laden der Mannschaften");
    
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
        teams: (clubTeams || []).map(t => ({ id: t.id, name: t.name }))
    }
}

export async function sendRundmailAction(formData: FormData) {
    const session = await requireClubAuth();
    const clubId = session.user.clubId!;
    const client = createServiceClient();
    
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
        const { data: rows, error } = await client
          .from('club_memberships')
          .select('members!member_id(email)')
          .eq('club_id', clubId)
          .eq('members.status', "active");
        if (error) throw error;
        emails = (rows || []).map((r: any) => r.members.email).filter(Boolean) as string[];
    } else if (targetType === "role") {
        const { data: rows, error } = await client
          .from('club_memberships')
          .select('members!member_id(email)')
          .eq('club_id', clubId)
          .eq('role', targetId)
          .eq('members.status', "active");
        if (error) throw error;
        emails = (rows || []).map((r: any) => r.members.email).filter(Boolean) as string[];
    } else if (targetType === "team") {
        const { data: rows, error } = await client
          .from('team_memberships')
          .select('members!member_id(email)')
          .eq('team_id', targetId)
          .eq('members.status', "active");
        if (error) throw error;
        emails = (rows || []).map((r: any) => r.members.email).filter(Boolean) as string[];
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

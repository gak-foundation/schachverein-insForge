"use server";

import { createServiceClient } from "@/lib/insforge";
import { requireClubId } from "@/lib/auth/session";

export interface AttentionItem {
  id: string;
  label: string;
  count: number;
  href: string;
  urgency: 'critical' | 'warning' | 'ok';
  icon: string;
  actionLabel: string;
}

export async function getAuditLogs(limit = 100) {
  try {
    const clubId = await requireClubId();
    const client = createServiceClient();

    const { data, error } = await client
      .from("audit_log")
      .select("id, user_id, action, entity, entity_id, changes, ip_address, created_at")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }

    return (data || []).map((log: any) => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      entity: log.entity,
      entityId: log.entity_id,
      changes: log.changes,
      ipAddress: log.ip_address,
      createdAt: log.created_at,
    }));
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}

export async function getDocuments() {
  try {
    const clubId = await requireClubId();
    const client = createServiceClient();

    const { data, error } = await client
      .from("documents")
      .select("id, title, file_name, category, mime_type, file_size, created_at")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      return [];
    }

    return (data || []).map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      fileName: doc.file_name,
      category: doc.category,
      mimeType: doc.mime_type,
      fileSize: doc.file_size,
      createdAt: doc.created_at,
    }));
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export async function getDashboardStats() {
  const clubId = await requireClubId();
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const todayStr = now.toISOString().split("T")[0];

  try {
    const client = createServiceClient();

    // Active members count
    const { count: memberCount, error: memberError } = await client
      .from("club_memberships")
      .select("id", { count: "exact" })
      .eq("club_id", clubId)
      .eq("status", "active");

    if (memberError) console.error("memberCount error:", memberError);

    // Incomplete tournaments count
    const { count: tournamentCount, error: tournamentError } = await client
      .from("tournaments")
      .select("id", { count: "exact" })
      .eq("club_id", clubId)
      .eq("is_completed", false);

    if (tournamentError) console.error("tournamentCount error:", tournamentError);

    // Teams count
    const { count: teamCount, error: teamError } = await client
      .from("teams")
      .select("id", { count: "exact" })
      .eq("club_id", clubId);

    if (teamError) console.error("teamCount error:", teamError);

    // Pending/overdue payments count
    const { count: pendingPaymentsCount, error: paymentsError } = await client
      .from("payments")
      .select("id", { count: "exact" })
      .eq("club_id", clubId)
      .in("status", ["pending", "overdue"]);

    if (paymentsError) console.error("pendingPayments error:", paymentsError);

    // Average DWZ of active members
    const { data: dwzData, error: avgError } = await client
      .from("members")
      .select("dwz")
      .eq("club_id", clubId)
      .eq("status", "active")
      .gt("dwz", 0);

    if (avgError) console.error("avgDwz error:", avgError);

    const avgDwz =
      dwzData && dwzData.length > 0
        ? Math.round(
            dwzData.reduce((sum, m) => sum + (m.dwz || 0), 0) / dwzData.length
          )
        : null;

    // Games this month
    const { count: gamesCount, error: gamesError } = await client
      .from("games")
      .select("id, tournaments!inner(club_id)", { count: "exact" })
      .eq("tournaments.club_id", clubId)
      .gte("played_at", firstDayOfMonth.toISOString())
      .lt("played_at", nextMonth.toISOString());

    if (gamesError) console.error("gamesThisMonth error:", gamesError);

    // Upcoming matches
    const { data: matchesData, error: matchesError } = await client
      .from("matches")
      .select("id, match_date, location, status, home_team_id, teams!matches_home_team_id_teams_id_fk(name, club_id)")
      .eq("teams.club_id", clubId)
      .gte("match_date", todayStr)
      .eq("status", "scheduled")
      .order("match_date", { ascending: true })
      .limit(5);

    if (matchesError) console.error("upcomingMatches error:", matchesError);

    // Upcoming events
    const { data: eventsData, error: eventsError } = await client
      .from("events")
      .select("id, title, start_date")
      .eq("club_id", clubId)
      .gte("start_date", now.toISOString())
      .order("start_date", { ascending: true })
      .limit(5);

    if (eventsError) console.error("upcomingEvents error:", eventsError);

    return {
      memberCount: Number(memberCount ?? 0),
      teamCount: Number(teamCount ?? 0),
      activeTournaments: Number(tournamentCount ?? 0),
      pendingPayments: Number(pendingPaymentsCount ?? 0),
      avgDwz,
      gamesThisMonth: Number(gamesCount ?? 0),
      upcomingMatches: (matchesData || []).map((m: any) => ({
        id: m.id,
        matchDate: m.match_date ? new Date(m.match_date) : null,
        homeTeamName: m.teams?.name,
        location: m.location,
      })),
      upcomingEvents: (eventsData || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        startDate: new Date(e.start_date),
      })),
      children: [],
    };
  } catch (error: any) {
    console.error(
      "Error fetching dashboard stats (RLS/Pooler?):",
      error.message
    );

    // Return empty stats as fallback to prevent dashboard crash
    return {
      memberCount: 0,
      teamCount: 0,
      activeTournaments: 0,
      pendingPayments: 0,
      avgDwz: null,
      gamesThisMonth: 0,
      upcomingMatches: [],
      upcomingEvents: [],
      children: [],
    };
  }
}

export async function getKassenwartAttentionItems(clubId: string): Promise<AttentionItem[]> {
  try {
    const client = createServiceClient();
    const items: AttentionItem[] = [];

    const { count: overdueCount } = await client
      .from('payments')
      .select('id', { count: 'exact' })
      .eq('club_id', clubId)
      .eq('status', 'overdue');

    if (overdueCount && overdueCount > 0) {
      items.push({
        id: 'overdue-payments',
        label: 'Ueberfaellige Zahlungen',
        count: Number(overdueCount),
        href: '/dashboard/finance',
        urgency: 'critical',
        icon: 'AlertCircle',
        actionLabel: 'Jetzt pruefen',
      });
    }

    const { count: pendingCount } = await client
      .from('payments')
      .select('id', { count: 'exact' })
      .eq('club_id', clubId)
      .eq('status', 'pending');

    if (pendingCount && pendingCount > 0) {
      items.push({
        id: 'pending-payments',
        label: 'Ausstehende Zahlungen',
        count: Number(pendingCount),
        href: '/dashboard/finance',
        urgency: 'warning',
        icon: 'Wallet',
        actionLabel: 'Anzeigen',
      });
    }

    return items;
  } catch (error) {
    console.error("Error fetching kassenwart attention items:", error);
    return [];
  }
}

export async function getSpielleiterAttentionItems(clubId: string): Promise<AttentionItem[]> {
  try {
    const client = createServiceClient();
    const items: AttentionItem[] = [];

    const { data: activeTournaments } = await client
      .from('tournaments')
      .select('id, name, current_round')
      .eq('club_id', clubId)
      .eq('is_completed', false);

    let missingResultsCount = 0;
    for (const tournament of activeTournaments || []) {
      const { count } = await client
        .from('games')
        .select('id', { count: 'exact' })
        .eq('tournament_id', tournament.id)
        .eq('round', tournament.current_round || 1)
        .is('result', null);
      missingResultsCount += Number(count || 0);
    }

    if (missingResultsCount > 0) {
      items.push({
        id: 'missing-results',
        label: 'Fehlende Ergebnisse',
        count: missingResultsCount,
        href: '/dashboard/tournaments',
        urgency: 'critical',
        icon: 'Trophy',
        actionLabel: 'Ergebnisse eintragen',
      });
    }

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const { count: upcomingTournamentCount } = await client
      .from('tournaments')
      .select('id', { count: 'exact' })
      .eq('club_id', clubId)
      .eq('is_completed', false)
      .lte('start_date', nextWeek.toISOString());

    if (upcomingTournamentCount && upcomingTournamentCount > 0) {
      items.push({
        id: 'upcoming-tournaments',
        label: 'Bald startende Turniere',
        count: Number(upcomingTournamentCount),
        href: '/dashboard/tournaments',
        urgency: 'warning',
        icon: 'Calendar',
        actionLabel: 'Vorbereiten',
      });
    }

    return items;
  } catch (error) {
    console.error("Error fetching spielleiter attention items:", error);
    return [];
  }
}

export async function getVorstandAttentionItems(clubId: string): Promise<AttentionItem[]> {
  try {
    const client = createServiceClient();
    const items: AttentionItem[] = [];

    const { count: pendingInvitations } = await client
      .from('invitations')
      .select('id', { count: 'exact' })
      .eq('club_id', clubId)
      .eq('status', 'pending');

    if (pendingInvitations && pendingInvitations > 0) {
      items.push({
        id: 'pending-invitations',
        label: 'Offene Einladungen',
        count: Number(pendingInvitations),
        href: '/dashboard/einladungen',
        urgency: 'warning',
        icon: 'Mail',
        actionLabel: 'Einladungen verwalten',
      });
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Find members with recent successful payments
    const { data: recentPayments } = await client
      .from('payments')
      .select('member_id')
      .eq('club_id', clubId)
      .eq('status', 'paid')
      .gte('paid_at', ninetyDaysAgo.toISOString());

    const paidMemberIds = new Set((recentPayments || []).map((p: any) => p.member_id));

    // Get all active members
    const { data: allMembers } = await client
      .from('club_memberships')
      .select('member_id')
      .eq('club_id', clubId)
      .eq('status', 'active');

    const membersWithoutPayment = (allMembers || []).filter((m: any) => !paidMemberIds.has(m.member_id));

    if (membersWithoutPayment.length > 0) {
      items.push({
        id: 'members-without-payment',
        label: 'Mitglieder ohne Zahlung > 90 Tage',
        count: membersWithoutPayment.length,
        href: '/dashboard/finance',
        urgency: 'critical',
        icon: 'Users',
        actionLabel: 'Anmahnen',
      });
    }

    return items;
  } catch (error) {
    console.error("Error fetching vorstand attention items:", error);
    return [];
  }
}

export async function getDashboardDataWithAttention(role: string, clubId: string) {
  const stats = await getDashboardStats();
  let attentionItems: AttentionItem[] = [];

  switch (role) {
    case 'kassenwart':
      attentionItems = await getKassenwartAttentionItems(clubId);
      break;
    case 'spielleiter':
      attentionItems = await getSpielleiterAttentionItems(clubId);
      break;
    case 'admin':
    case 'vorstand':
      attentionItems = await getVorstandAttentionItems(clubId);
      break;
  }

  return { stats, attentionItems };
}

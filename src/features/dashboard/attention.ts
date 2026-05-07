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

type DashboardRole = 'kassenwart' | 'spielleiter' | 'admin' | 'vorstand' | 'jugendwart' | 'trainer' | 'mitglied' | 'eltern';

async function fetchAttentionItems<T>(
  fetcher: (client: any, clubId: string) => Promise<T[]>,
  label: string
): Promise<T[]> {
  try {
    const clubId = await requireClubId();
    const client = createServiceClient();
    return await fetcher(client, clubId);
  } catch (error) {
    console.error(`Error fetching ${label}:`, error);
    return [];
  }
}

export async function getKassenwartAttentionItems(): Promise<AttentionItem[]> {
  return fetchAttentionItems(async (client, clubId) => {
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
  }, 'kassenwart attention items');
}

export async function getSpielleiterAttentionItems(): Promise<AttentionItem[]> {
  return fetchAttentionItems(async (client, clubId) => {
    const items: AttentionItem[] = [];

    const { data: activeTournaments } = await client
      .from('tournaments')
      .select('id, name, current_round')
      .eq('club_id', clubId)
      .eq('is_completed', false);

    const activeTournamentIds = (activeTournaments || []).map((t: any) => t.id);

    let missingResultsCount = 0;
    if (activeTournamentIds.length > 0) {
      const { count } = await client
        .from('games')
        .select('id', { count: 'exact' })
        .in('tournament_id', activeTournamentIds)
        .is('result', null);
      missingResultsCount = Number(count || 0);
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
  }, 'spielleiter attention items');
}

export async function getVorstandAttentionItems(): Promise<AttentionItem[]> {
  return fetchAttentionItems(async (client, clubId) => {
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
  }, 'vorstand attention items');
}

export async function getDashboardDataWithAttention(role: DashboardRole) {
  const { getDashboardStats } = await import('@/features/audit/actions');
  const stats = await getDashboardStats();
  let attentionItems: AttentionItem[] = [];

  switch (role) {
    case 'kassenwart':
      attentionItems = await getKassenwartAttentionItems();
      break;
    case 'spielleiter':
      attentionItems = await getSpielleiterAttentionItems();
      break;
    case 'admin':
    case 'vorstand':
      attentionItems = await getVorstandAttentionItems();
      break;
  }

  return { stats, attentionItems };
}

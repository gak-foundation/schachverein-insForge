"use server";

import { createServiceClient } from "@/lib/insforge";
import { revalidatePath } from "next/cache";
import { requireClubId } from "@/lib/actions/utils";
import { generateSepaXML, SepaConfig, SepaPayment, generateEndToEndId } from "@/lib/sepa/generator";
import { enqueueEmail } from "@/lib/auth/email";
import { dunningEmailTemplate, invoiceEmailTemplate } from "@/lib/email/templates";
import { decrypt, encrypt } from "@/lib/crypto";

export async function getPayments() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from('payments')
    .select('id, member_id, amount, description, status, due_date, year, sepa_mandate_reference, invoice_number, dunning_level')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((p: any) => ({
    id: p.id,
    memberId: p.member_id,
    amount: p.amount,
    description: p.description,
    status: p.status,
    dueDate: p.due_date,
    year: p.year,
    sepaMandateReference: p.sepa_mandate_reference,
    invoiceNumber: p.invoice_number,
    dunningLevel: p.dunning_level,
  }));
}

export async function getPaymentWithMemberDetails() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: results, error } = await client
    .from('payments')
    .select('*, members!member_id(*)')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (results || []).map((p: any) => ({
    id: p.id,
    memberId: p.member_id,
    amount: p.amount,
    description: p.description,
    status: p.status,
    dueDate: p.due_date,
    year: p.year,
    sepaMandateReference: p.sepa_mandate_reference,
    invoiceNumber: p.invoice_number,
    memberFirstName: p.members.first_name,
    memberLastName: p.members.last_name,
    memberIban: p.members.sepa_iban ? decrypt(p.members.sepa_iban) : null,
    memberBic: p.members.sepa_bic ? decrypt(p.members.sepa_bic) : null,
    memberMandateRef: p.members.sepa_mandate_reference,
    mandateSignedAt: p.members.mandate_signed_at,
  }));
}

export async function createPayment(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const memberId = formData.get("memberId") as string;
  const amount = Number(formData.get("amount"));
  const description = formData.get("description") as string;
  const year = Number(formData.get("year"));
  const dueDate = (formData.get("dueDate") as string) || null;

  const { data: membership, error: mError } = await client
    .from('club_memberships')
    .select('*')
    .eq('member_id', memberId)
    .eq('club_id', clubId)
    .single();

  if (mError || !membership) {
    throw new Error("Mitglied ist nicht im Verein");
  }

  // Generate a simple invoice number
  const invoiceNumber = `RE-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

  const { data: newPayment, error: pError } = await client
    .from('payments')
    .insert([{
      club_id: clubId,
      member_id: memberId,
      amount: amount.toString(),
      description,
      year,
      due_date: dueDate,
      invoice_number: invoiceNumber,
    }])
    .select()
    .single();

  if (pError) throw pError;

  // Send invoice email
  const { data: member, error: memError } = await client
    .from('members')
    .select('*')
    .eq('id', memberId)
    .single();

  const { data: club, error: clubError } = await client
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single();

  if (member?.email && club) {
    const { subject, html, text } = invoiceEmailTemplate({
      memberName: `${member.first_name} ${member.last_name}`,
      clubName: club.name,
      amount: amount.toString(),
      description,
      dueDate: dueDate || "sofort",
      invoiceNumber,
    });
    await enqueueEmail({ to: member.email, subject, html, text });
  }

  revalidatePath("/dashboard/finance");
  return newPayment;
}

export async function getPaymentStats() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: allPayments, error } = await client
    .from('payments')
    .select('amount, status')
    .eq('club_id', clubId);

  if (error) throw error;

  const paymentsArr = allPayments || [];

  const totalCount = paymentsArr.length;
  const totalSum = paymentsArr.reduce((sum, p) => sum + Number(p.amount), 0).toString();

  const pendingArr = paymentsArr.filter(p => p.status === "pending");
  const pendingCount = pendingArr.length;
  const pendingSum = pendingArr.reduce((sum, p) => sum + Number(p.amount), 0).toString();

  const paidArr = paymentsArr.filter(p => p.status === "paid");
  const paidCount = paidArr.length;
  const paidSum = paidArr.reduce((sum, p) => sum + Number(p.amount), 0).toString();

  const overdueArr = paymentsArr.filter(p => p.status === "overdue");
  const overdueCount = overdueArr.length;
  const overdueSum = overdueArr.reduce((sum, p) => sum + Number(p.amount), 0).toString();

  return {
    total: { count: totalCount, total: totalSum },
    pending: { count: pendingCount, total: pendingSum },
    paid: { count: paidCount, total: paidSum },
    overdue: { count: overdueCount, total: overdueSum },
  };
}

export async function updatePaymentStatus(paymentId: string, status: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: payment, error } = await client
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .eq('club_id', clubId)
    .single();

  if (error || !payment) {
    throw new Error("Zahlung nicht gefunden");
  }

  const { error: uError } = await client
    .from('payments')
    .update({ 
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
    })
    .eq('id', paymentId);

  if (uError) throw uError;

  revalidatePath("/dashboard/finance");
}

export async function getContributionRates() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from('contribution_rates')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function upsertContributionRate(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const amount = formData.get("amount") as string;
  const frequency = (formData.get("frequency") as string) || "yearly";
  const description = (formData.get("description") as string) || null;
  const validFrom = (formData.get("validFrom") as string) || null;
  const validUntil = (formData.get("validUntil") as string) || null;

  const values = {
    club_id: clubId,
    name,
    amount,
    frequency: frequency as "yearly" | "quarterly" | "monthly",
    description,
    valid_from: validFrom,
    valid_until: validUntil,
  };

  if (id) {
    const { data: existing, error } = await client
      .from('contribution_rates')
      .select('*')
      .eq('id', id)
      .eq('club_id', clubId)
      .single();

    if (error || !existing) {
      throw new Error("Beitragssatz nicht gefunden");
    }

    const { error: uError } = await client
      .from('contribution_rates')
      .update(values)
      .eq('id', id);
    if (uError) throw uError;
  } else {
    const { error } = await client.from('contribution_rates').insert([values]);
    if (error) throw error;
  }

  revalidatePath("/dashboard/finance");
}

export async function deleteContributionRate(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: existing, error } = await client
    .from('contribution_rates')
    .select('*')
    .eq('id', id)
    .eq('club_id', clubId)
    .single();

  if (error || !existing) {
    throw new Error("Beitragssatz nicht gefunden");
  }

  const { error: dError } = await client
    .from('contribution_rates')
    .delete()
    .eq('id', id);
  if (dError) throw dError;

  revalidatePath("/dashboard/finance");
}

export async function generateDuePayments(year: number) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: activeMembersWithRate, error: amError } = await client
    .from('members')
    .select('id, contribution_rate_id, sepa_mandate_reference, club_memberships!club_memberships_member_id_members_id_fk!inner(*)')
    .eq('club_memberships.club_id', clubId)
    .eq('club_memberships.status', "active")
    .eq('status', "active")
    .not('contribution_rate_id', 'is', null);

  if (amError) throw amError;

  const { data: existingPayments, error: epError } = await client
    .from('payments')
    .select('member_id')
    .eq('club_id', clubId)
    .eq('year', year);

  if (epError) throw epError;

  const existingMemberIds = new Set((existingPayments || []).map(p => p.member_id));

  const activeMembersMapped = (activeMembersWithRate || []).map(m => ({
    memberId: m.id,
    contributionRateId: m.contribution_rate_id,
    sepaMandateReference: m.sepa_mandate_reference,
  }));

  const rateIds = [...new Set(activeMembersMapped.map(m => m.contributionRateId).filter(Boolean))];

  const { data: rates, error: rError } = rateIds.length > 0
    ? await client
        .from('contribution_rates')
        .select('*')
        .eq('club_id', clubId)
        .in('id', rateIds as string[])
    : { data: [], error: null };

  if (rError) throw rError;

  const rateMap = new Map((rates || []).map(r => [r.id, r]));

  const paymentsToCreate = [];
  for (const member of activeMembersMapped) {
    if (existingMemberIds.has(member.memberId)) continue;

    const rate = rateMap.get(member.contributionRateId!);
    if (!rate) continue;

    const invoiceNumber = `RE-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    paymentsToCreate.push({
      club_id: clubId,
      member_id: member.memberId,
      amount: rate.amount,
      description: `${rate.name} ${year}`,
      year,
      sepa_mandate_reference: member.sepaMandateReference,
      invoice_number: invoiceNumber,
    });
  }

  if (paymentsToCreate.length > 0) {
    const { error } = await client.from('payments').insert(paymentsToCreate);
    if (error) throw error;
  }

  revalidatePath("/dashboard/finance");
  return { created: paymentsToCreate.length };
}

export async function exportSepaXml(paymentIds: string[]) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  if (paymentIds.length === 0) {
    throw new Error("Keine Zahlungen ausgewaehlt");
  }

  const { data: club, error: clubError } = await client
    .from('clubs')
    .select('creditor_id, sepa_iban, sepa_bic, name')
    .eq('id', clubId)
    .single();

  if (clubError || !club) {
    throw new Error("Verein nicht gefunden");
  }

  if (!club.creditor_id || !club.sepa_iban) {
    throw new Error("Vereinsdaten unvollstaendig. Bitte Creditor ID und IBAN in den Einstellungen hinterlegen.");
  }

  const { data: paymentsData, error: pError } = await client
    .from('payments')
    .select('*, members!member_id(first_name, last_name, sepa_iban, sepa_bic, sepa_mandate_reference, mandate_signed_at)')
    .eq('club_id', clubId)
    .in('id', paymentIds);

  if (pError) throw pError;

  const validPayments = (paymentsData || []).filter((p: any) => 
    p.members.sepa_iban && 
    (p.sepa_mandate_reference || p.members.sepa_mandate_reference) &&
    p.members.mandate_signed_at
  );

  if (validPayments.length === 0) {
    throw new Error("Keine gueltigen Zahlungen fuer SEPA-Export gefunden");
  }

  const sepaPayments: SepaPayment[] = validPayments.map((p: any) => ({
    mandateId: (p.sepa_mandate_reference || p.members.sepa_mandate_reference)!,
    mandateDateOfSignature: p.members.mandate_signed_at!,
    amount: Number(p.amount),
    debtorName: `${p.members.first_name} ${p.members.last_name}`,
    debtorIban: p.members.sepa_iban ? decrypt(p.members.sepa_iban) : "",
    debtorBic: p.members.sepa_bic ? decrypt(p.members.sepa_bic) : undefined,
    purpose: p.description,
    endToEndId: generateEndToEndId("CLUB", p.id, new Date()),
  }));

  const config: SepaConfig = {
    creditorName: club.name,
    creditorIban: club.sepa_iban ? decrypt(club.sepa_iban) : "",
    creditorBic: (club.sepa_bic ? decrypt(club.sepa_bic) : "") || "",
    creditorId: club.creditor_id,
    requestedCollectionDate: new Date().toISOString().slice(0, 10),
    sequenceType: "RCUR",
    localInstrumentCode: "CORE",
  };

  const xml = generateSepaXML(sepaPayments, config);
  const filename = `sepa-export-${new Date().toISOString().slice(0, 10)}.xml`;
  const totalAmount = validPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Save to history
  const { data: exportRecord, error: exError } = await client
    .from('sepa_exports')
    .insert([{
      club_id: clubId,
      xml_content: xml,
      filename,
      total_amount: totalAmount.toString(),
      payment_count: validPayments.length,
    }])
    .select()
    .single();

  if (exError) throw exError;

  const { error: uError } = await client
    .from('payments')
    .update({ 
      status: "collected",
      sepa_export_id: exportRecord.id,
    })
    .eq('club_id', clubId)
    .in('id', validPayments.map((p: any) => p.id));

  if (uError) throw uError;

  revalidatePath("/dashboard/finance");

  return { xml, filename };
}

export async function getSepaExports() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from('sepa_exports')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function generateAnnualPayments(year: number) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  // 1. Get all active members with an assigned contribution rate
  const { data: activeMembers, error: amError } = await client
    .from('members')
    .select('id, first_name, last_name, contribution_rate_id, sepa_mandate_reference, club_memberships!club_memberships_member_id_members_id_fk!inner(*)')
    .eq('club_memberships.club_id', clubId)
    .eq('club_memberships.status', "active")
    .eq('status', "active")
    .not('contribution_rate_id', 'is', null);

  if (amError) throw amError;

  // 2. Check for existing payments for this year to avoid duplicates
  const { data: existingPayments, error: epError } = await client
    .from('payments')
    .select('member_id')
    .eq('club_id', clubId)
    .eq('year', year);

  if (epError) throw epError;

  const existingMemberIds = new Set((existingPayments || []).map(p => p.member_id));

  // 3. Get rate details
  const { data: rates, error: rError } = await client
    .from('contribution_rates')
    .select('*')
    .eq('club_id', clubId);

  if (rError) throw rError;

  const rateMap = new Map((rates || []).map(r => [r.id, r]));

  const activeMembersMapped = (activeMembers || []).map(m => ({
    id: m.id,
    firstName: m.first_name,
    lastName: m.last_name,
    contributionRateId: m.contribution_rate_id,
    sepaMandateReference: m.sepa_mandate_reference,
  }));

  // 4. Create missing payments
  const newPayments = [];
  for (const member of activeMembersMapped) {
    if (existingMemberIds.has(member.id)) continue;
    
    const rate = rateMap.get(member.contributionRateId!);
    if (!rate) continue;

    const invoiceNumber = `RE-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    newPayments.push({
      club_id: clubId,
      member_id: member.id,
      amount: rate.amount,
      description: `Mitgliedsbeitrag ${year} (${rate.name})`,
      year,
      status: "pending" as const,
      sepa_mandate_reference: member.sepaMandateReference || null,
      due_date: `${year}-03-01`, // Default due date
      invoice_number: invoiceNumber,
    });
  }

  if (newPayments.length > 0) {
    const { error } = await client.from('payments').insert(newPayments);
    if (error) throw error;
  }

  revalidatePath("/dashboard/finance");
  return { success: true, created: newPayments.length };
}

export async function getPaymentInvoiceData(paymentId: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: payment, error } = await client
    .from('payments')
    .select('*, members!member_id(first_name, last_name, email), clubs!club_id(*)')
    .eq('id', paymentId)
    .eq('club_id', clubId)
    .single();

  if (error) throw error;
  if (!payment) return null;

  return {
    id: payment.id,
    amount: payment.amount,
    description: payment.description,
    year: payment.year,
    dueDate: payment.due_date,
    createdAt: payment.created_at,
    invoiceNumber: payment.invoice_number,
    member: {
      firstName: payment.members.first_name,
      lastName: payment.members.last_name,
      email: payment.members.email,
    },
    club: {
      name: payment.clubs.name,
      sepaIban: payment.clubs.sepa_iban ? decrypt(payment.clubs.sepa_iban) : null,
      sepaBic: payment.clubs.sepa_bic ? decrypt(payment.clubs.sepa_bic) : null,
      creditorId: payment.clubs.creditor_id,
    }
  };
}

/**
 * Triggers a dunning run for the current club.
 * Increments dunningLevel for all overdue payments and updates lastDunningAt.
 */
export async function triggerDunningRun() {
  const clubId = await requireClubId();
  const client = createServiceClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: overduePayments, error } = await client
    .from('payments')
    .select('*, members!member_id(first_name, last_name, email)')
    .eq('club_id', clubId)
    .eq('status', "pending")
    .lt('due_date', today);

  if (error) throw error;

  if ((overduePayments || []).length === 0) {
    return { success: true, processed: 0 };
  }

  const { data: club, error: cError } = await client
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single();

  if (cError) throw cError;

  for (const p of (overduePayments || [])) {
    const newLevel = (p.dunning_level || 0) + 1;
    const { error: uError } = await client
      .from('payments')
      .update({
        dunning_level: newLevel,
        last_dunning_at: new Date().toISOString(),
        status: "overdue",
      })
      .eq('id', p.id);
    if (uError) throw uError;
    
    if (p.members.email) {
      const { subject, html, text } = dunningEmailTemplate({
        memberName: `${p.members.first_name} ${p.members.last_name}`,
        clubName: club?.name || "",
        amount: p.amount,
        description: p.description,
        dueDate: p.due_date || "",
        dunningLevel: newLevel,
        invoiceNumber: p.invoice_number || "",
      });
      await enqueueEmail({ to: p.members.email, subject, html, text });
    }
  }

  revalidatePath("/dashboard/finance");
  return { success: true, processed: (overduePayments || []).length };
}

export async function getDunningStats() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: overduePayments, error } = await client
    .from('payments')
    .select('*')
    .eq('club_id', clubId)
    .eq('status', "overdue");

  if (error) throw error;

  const grouped = (overduePayments || []).reduce((acc, p) => {
    const level = p.dunning_level;
    if (!acc[level]) acc[level] = { level, count: 0, amount: "0" };
    acc[level].count++;
    acc[level].amount = (Number(acc[level].amount) + Number(p.amount)).toString();
    return acc;
  }, {} as Record<number, { level: number; count: number; amount: string }>);

  return Object.values(grouped) as { level: number; count: number; amount: string }[];
}

export async function getClubBankSettings() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: club, error } = await client
    .from('clubs')
    .select('creditor_id, sepa_iban, sepa_bic')
    .eq('id', clubId)
    .single();

  if (error) throw error;
  if (!club) return undefined;

  return {
    creditorId: club.creditor_id,
    sepaIban: club.sepa_iban ? decrypt(club.sepa_iban) : null,
    sepaBic: club.sepa_bic ? decrypt(club.sepa_bic) : null,
  };
}

export async function updateClubBankSettings(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const creditorId = (formData.get("creditorId") as string) || null;
  const sepaIban = (formData.get("sepaIban") as string) || null;
  const sepaBic = (formData.get("sepaBic") as string) || null;

  const { error } = await client
    .from('clubs')
    .update({
      creditor_id: creditorId,
      sepa_iban: sepaIban ? encrypt(sepaIban) : null,
      sepa_bic: sepaBic ? encrypt(sepaBic) : null,
    })
    .eq('id', clubId);

  if (error) throw error;

  revalidatePath("/dashboard/finance");
}

export async function getMembersForFinance() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from('members')
    .select('id, first_name, last_name, email, club_memberships!club_memberships_member_id_members_id_fk!inner(*)')
    .eq('club_memberships.club_id', clubId)
    .eq('club_memberships.status', "active")
    .eq('status', "active")
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  if (error) throw error;

  return (data || []).map((m: any) => ({
    id: m.id,
    firstName: m.first_name,
    lastName: m.last_name,
    email: m.email,
  }));
}

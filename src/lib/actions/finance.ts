"use server";

import { db } from "@/lib/db";
import { payments, clubMemberships, contributionRates, members, clubs, sepaExports } from "@/lib/db/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireClubId } from "./utils";
import { generateSepaXML, SepaConfig, SepaPayment, generateEndToEndId } from "@/lib/sepa/generator";
import { enqueueEmail } from "@/lib/auth/email";
import { dunningEmailTemplate, invoiceEmailTemplate } from "@/lib/email/templates";
import { decrypt, encrypt } from "@/lib/crypto";

export async function getPayments() {
  const clubId = await requireClubId();

  return db
    .select({
      id: payments.id,
      memberId: payments.memberId,
      amount: payments.amount,
      description: payments.description,
      status: payments.status,
      dueDate: payments.dueDate,
      year: payments.year,
      sepaMandateReference: payments.sepaMandateReference,
      invoiceNumber: payments.invoiceNumber,
      dunningLevel: payments.dunningLevel,
    })
    .from(payments)
    .where(eq(payments.clubId, clubId))
    .orderBy(desc(payments.createdAt));
}

export async function getPaymentWithMemberDetails() {
  const clubId = await requireClubId();

  const results = await db
    .select({
      id: payments.id,
      memberId: payments.memberId,
      amount: payments.amount,
      description: payments.description,
      status: payments.status,
      dueDate: payments.dueDate,
      year: payments.year,
      sepaMandateReference: payments.sepaMandateReference,
      invoiceNumber: payments.invoiceNumber,
      memberFirstName: members.firstName,
      memberLastName: members.lastName,
      memberIban: members.sepaIban,
      memberBic: members.sepaBic,
      memberMandateRef: members.sepaMandateReference,
      mandateSignedAt: members.mandateSignedAt,
    })
    .from(payments)
    .innerJoin(members, eq(payments.memberId, members.id))
    .where(eq(payments.clubId, clubId))
    .orderBy(desc(payments.createdAt));

  return results.map(p => ({
    ...p,
    memberIban: p.memberIban ? decrypt(p.memberIban) : null,
    memberBic: p.memberBic ? decrypt(p.memberBic) : null,
  }));
}

export async function createPayment(formData: FormData) {
  const clubId = await requireClubId();

  const memberId = formData.get("memberId") as string;
  const amount = Number(formData.get("amount"));
  const description = formData.get("description") as string;
  const year = Number(formData.get("year"));
  const dueDate = (formData.get("dueDate") as string) || null;

  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(and(
      eq(clubMemberships.memberId, memberId),
      eq(clubMemberships.clubId, clubId)
    ));

  if (!membership) {
    throw new Error("Mitglied ist nicht im Verein");
  }

  // Generate a simple invoice number
  const invoiceNumber = `RE-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

  const [newPayment] = await db.insert(payments).values({
    clubId,
    memberId,
    amount: amount.toString(),
    description,
    year,
    dueDate,
    invoiceNumber,
  }).returning();

  // Send invoice email
  const [member] = await db.select().from(members).where(eq(members.id, memberId));
  const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
  
  if (member?.email) {
    const { subject, html, text } = invoiceEmailTemplate({
      memberName: `${member.firstName} ${member.lastName}`,
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

  const total = await db
    .select({ count: sql<number>`COUNT(*)`, total: sql<string>`SUM(${payments.amount})` })
    .from(payments)
    .where(eq(payments.clubId, clubId));

  const pending = await db
    .select({ count: sql<number>`COUNT(*)`, total: sql<string>`SUM(${payments.amount})` })
    .from(payments)
    .where(and(
      eq(payments.clubId, clubId),
      eq(payments.status, "pending")
    ));

  const paid = await db
    .select({ count: sql<number>`COUNT(*)`, total: sql<string>`SUM(${payments.amount})` })
    .from(payments)
    .where(and(
      eq(payments.clubId, clubId),
      eq(payments.status, "paid")
    ));

  const overdue = await db
    .select({ count: sql<number>`COUNT(*)`, total: sql<string>`SUM(${payments.amount})` })
    .from(payments)
    .where(and(
      eq(payments.clubId, clubId),
      eq(payments.status, "overdue")
    ));

  return {
    total: { count: Number(total[0]?.count ?? 0), total: total[0]?.total ?? "0" },
    pending: { count: Number(pending[0]?.count ?? 0), total: pending[0]?.total ?? "0" },
    paid: { count: Number(paid[0]?.count ?? 0), total: paid[0]?.total ?? "0" },
    overdue: { count: Number(overdue[0]?.count ?? 0), total: overdue[0]?.total ?? "0" },
  };
}

export async function updatePaymentStatus(paymentId: string, status: string) {
  const clubId = await requireClubId();

  const [payment] = await db
    .select()
    .from(payments)
    .where(and(
      eq(payments.id, paymentId),
      eq(payments.clubId, clubId)
    ));

  if (!payment) {
    throw new Error("Zahlung nicht gefunden");
  }

  await db
    .update(payments)
    .set({ 
      status: status as typeof payments.$inferInsert.status,
      paidAt: status === "paid" ? new Date() : null,
    })
    .where(eq(payments.id, paymentId));

  revalidatePath("/dashboard/finance");
}

export async function getContributionRates() {
  const clubId = await requireClubId();

  return db
    .select()
    .from(contributionRates)
    .where(eq(contributionRates.clubId, clubId))
    .orderBy(desc(contributionRates.createdAt));
}

export async function upsertContributionRate(formData: FormData) {
  const clubId = await requireClubId();

  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const amount = formData.get("amount") as string;
  const frequency = (formData.get("frequency") as string) || "yearly";
  const description = (formData.get("description") as string) || null;
  const validFrom = (formData.get("validFrom") as string) || null;
  const validUntil = (formData.get("validUntil") as string) || null;

  const values = {
    clubId,
    name,
    amount,
    frequency: frequency as "yearly" | "quarterly" | "monthly",
    description,
    validFrom,
    validUntil,
  };

  if (id) {
    const [existing] = await db
      .select()
      .from(contributionRates)
      .where(and(
        eq(contributionRates.id, id),
        eq(contributionRates.clubId, clubId)
      ));

    if (!existing) {
      throw new Error("Beitragssatz nicht gefunden");
    }

    await db
      .update(contributionRates)
      .set(values)
      .where(eq(contributionRates.id, id));
  } else {
    await db.insert(contributionRates).values(values);
  }

  revalidatePath("/dashboard/finance");
}

export async function deleteContributionRate(id: string) {
  const clubId = await requireClubId();

  const [existing] = await db
    .select()
    .from(contributionRates)
    .where(and(
      eq(contributionRates.id, id),
      eq(contributionRates.clubId, clubId)
    ));

  if (!existing) {
    throw new Error("Beitragssatz nicht gefunden");
  }

  await db
    .delete(contributionRates)
    .where(eq(contributionRates.id, id));

  revalidatePath("/dashboard/finance");
}

export async function generateDuePayments(year: number) {
  const clubId = await requireClubId();

  const activeMembersWithRate = await db
    .select({
      memberId: members.id,
      contributionRateId: members.contributionRateId,
      sepaMandateReference: members.sepaMandateReference,
    })
    .from(members)
    .innerJoin(clubMemberships, eq(members.id, clubMemberships.memberId))
    .where(and(
      eq(clubMemberships.clubId, clubId),
      eq(clubMemberships.status, "active"),
      eq(members.status, "active"),
      sql`${members.contributionRateId} IS NOT NULL`
    ));

  const existingPayments = await db
    .select({ memberId: payments.memberId })
    .from(payments)
    .where(and(
      eq(payments.clubId, clubId),
      eq(payments.year, year)
    ));

  const existingMemberIds = new Set(existingPayments.map(p => p.memberId));

  const rateIds = [...new Set(activeMembersWithRate.map(m => m.contributionRateId).filter(Boolean))];
  
  const rates = rateIds.length > 0
    ? await db
        .select()
        .from(contributionRates)
        .where(and(
          eq(contributionRates.clubId, clubId),
          inArray(contributionRates.id, rateIds as string[]),
        ))
    : [];

  const rateMap = new Map(rates.map(r => [r.id, r]));

  const paymentsToCreate = [];
  for (const member of activeMembersWithRate) {
    if (existingMemberIds.has(member.memberId)) continue;

    const rate = rateMap.get(member.contributionRateId!);
    if (!rate) continue;

    const invoiceNumber = `RE-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    paymentsToCreate.push({
      clubId,
      memberId: member.memberId,
      amount: rate.amount,
      description: `${rate.name} ${year}`,
      year,
      sepaMandateReference: member.sepaMandateReference,
      invoiceNumber,
    });
  }

  if (paymentsToCreate.length > 0) {
    await db.insert(payments).values(paymentsToCreate);
  }

  revalidatePath("/dashboard/finance");
  return { created: paymentsToCreate.length };
}

export async function exportSepaXml(paymentIds: string[]) {
  const clubId = await requireClubId();

  if (paymentIds.length === 0) {
    throw new Error("Keine Zahlungen ausgewaehlt");
  }

  const [club] = await db
    .select({
      creditorId: clubs.creditorId,
      sepaIban: clubs.sepaIban,
      sepaBic: clubs.sepaBic,
      name: clubs.name,
    })
    .from(clubs)
    .where(eq(clubs.id, clubId));

  if (!club?.creditorId || !club?.sepaIban) {
    throw new Error("Vereinsdaten unvollstaendig. Bitte Creditor ID und IBAN in den Einstellungen hinterlegen.");
  }

  const paymentsData = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      description: payments.description,
      sepaMandateReference: payments.sepaMandateReference,
      memberFirstName: members.firstName,
      memberLastName: members.lastName,
      memberIban: members.sepaIban,
      memberBic: members.sepaBic,
      memberMandateRef: members.sepaMandateReference,
      mandateSignedAt: members.mandateSignedAt,
    })
    .from(payments)
    .innerJoin(members, eq(payments.memberId, members.id))
    .where(and(
      eq(payments.clubId, clubId),
      inArray(payments.id, paymentIds),
    ));

  const validPayments = paymentsData.filter(p => 
    p.memberIban && 
    (p.sepaMandateReference || p.memberMandateRef) &&
    p.mandateSignedAt
  );

  if (validPayments.length === 0) {
    throw new Error("Keine gueltigen Zahlungen fuer SEPA-Export gefunden");
  }

  const sepaPayments: SepaPayment[] = validPayments.map(p => ({
    mandateId: (p.sepaMandateReference || p.memberMandateRef)!,
    mandateDateOfSignature: p.mandateSignedAt!,
    amount: Number(p.amount),
    debtorName: `${p.memberFirstName} ${p.memberLastName}`,
    debtorIban: p.memberIban ? decrypt(p.memberIban) : "",
    debtorBic: p.memberBic ? decrypt(p.memberBic) : undefined,
    purpose: p.description,
    endToEndId: generateEndToEndId("CLUB", p.id, new Date()),
  }));

  const config: SepaConfig = {
    creditorName: club.name,
    creditorIban: club.sepaIban ? decrypt(club.sepaIban) : "",
    creditorBic: (club.sepaBic ? decrypt(club.sepaBic) : "") || "",
    creditorId: club.creditorId,
    requestedCollectionDate: new Date().toISOString().slice(0, 10),
    sequenceType: "RCUR",
    localInstrumentCode: "CORE",
  };

  const xml = generateSepaXML(sepaPayments, config);
  const filename = `sepa-export-${new Date().toISOString().slice(0, 10)}.xml`;
  const totalAmount = validPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Save to history
  const [exportRecord] = await db.insert(sepaExports).values({
    clubId,
    xmlContent: xml,
    filename,
    totalAmount: totalAmount.toString(),
    paymentCount: validPayments.length,
  }).returning();

  await db
    .update(payments)
    .set({ 
      status: "collected",
      sepaExportId: exportRecord.id,
    })
    .where(and(
      eq(payments.clubId, clubId),
      inArray(
        payments.id,
        validPayments.map((p) => p.id),
      ),
    ));

  revalidatePath("/dashboard/finance");

  return { xml, filename };
}

export async function getSepaExports() {
  const clubId = await requireClubId();

  return db
    .select()
    .from(sepaExports)
    .where(eq(sepaExports.clubId, clubId))
    .orderBy(desc(sepaExports.createdAt));
}

export async function generateAnnualPayments(year: number) {
  const clubId = await requireClubId();

  // 1. Get all active members with an assigned contribution rate
  const activeMembers = await db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      contributionRateId: members.contributionRateId,
      sepaMandateReference: members.sepaMandateReference,
    })
    .from(members)
    .innerJoin(clubMemberships, eq(members.id, clubMemberships.memberId))
    .where(and(
      eq(clubMemberships.clubId, clubId),
      eq(clubMemberships.status, "active"),
      eq(members.status, "active"),
      sql`${members.contributionRateId} IS NOT NULL`
    ));

  // 2. Check for existing payments for this year to avoid duplicates
  const existingPayments = await db
    .select({ memberId: payments.memberId })
    .from(payments)
    .where(and(
      eq(payments.clubId, clubId),
      eq(payments.year, year)
    ));

  const existingMemberIds = new Set(existingPayments.map(p => p.memberId));

  // 3. Get rate details
  const rates = await db
    .select()
    .from(contributionRates)
    .where(eq(contributionRates.clubId, clubId));

  const rateMap = new Map(rates.map(r => [r.id, r]));

  // 4. Create missing payments
  const newPayments = [];
  for (const member of activeMembers) {
    if (existingMemberIds.has(member.id)) continue;
    
    const rate = rateMap.get(member.contributionRateId!);
    if (!rate) continue;

    const invoiceNumber = `RE-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    newPayments.push({
      clubId,
      memberId: member.id,
      amount: rate.amount,
      description: `Mitgliedsbeitrag ${year} (${rate.name})`,
      year,
      status: "pending" as const,
      sepaMandateReference: member.sepaMandateReference || null,
      dueDate: `${year}-03-01`, // Default due date
      invoiceNumber,
    });
  }

  if (newPayments.length > 0) {
    await db.insert(payments).values(newPayments);
  }

  revalidatePath("/dashboard/finance");
  return { success: true, created: newPayments.length };
}

export async function getPaymentInvoiceData(paymentId: string) {
  const clubId = await requireClubId();

  const [payment] = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      description: payments.description,
      year: payments.year,
      dueDate: payments.dueDate,
      createdAt: payments.createdAt,
      invoiceNumber: payments.invoiceNumber,
      member: {
        firstName: members.firstName,
        lastName: members.lastName,
        email: members.email,
      },
      club: {
        name: clubs.name,
        sepaIban: clubs.sepaIban,
        sepaBic: clubs.sepaBic,
        creditorId: clubs.creditorId,
      }
    })
    .from(payments)
    .innerJoin(members, eq(payments.memberId, members.id))
    .innerJoin(clubs, eq(payments.clubId, clubs.id))
    .where(and(
      eq(payments.id, paymentId),
      eq(payments.clubId, clubId)
    ));

  if (payment) {
    if (payment.club.sepaIban) payment.club.sepaIban = decrypt(payment.club.sepaIban);
    if (payment.club.sepaBic) payment.club.sepaBic = decrypt(payment.club.sepaBic);
  }

  return payment || null;
}

/**
 * Triggers a dunning run for the current club.
 * Increments dunningLevel for all overdue payments and updates lastDunningAt.
 */
export async function triggerDunningRun() {
  const clubId = await requireClubId();
  const today = new Date().toISOString().split("T")[0];

  const overduePayments = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      description: payments.description,
      dueDate: payments.dueDate,
      dunningLevel: payments.dunningLevel,
      invoiceNumber: payments.invoiceNumber,
      memberEmail: members.email,
      memberFirstName: members.firstName,
      memberLastName: members.lastName,
    })
    .from(payments)
    .innerJoin(members, eq(payments.memberId, members.id))
    .where(and(
      eq(payments.clubId, clubId),
      eq(payments.status, "pending"),
      sql`${payments.dueDate} < ${today}`
    ));

  if (overduePayments.length === 0) {
    return { success: true, processed: 0 };
  }

  const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));

  for (const p of overduePayments) {
    const newLevel = p.dunningLevel + 1;
    await db
      .update(payments)
      .set({
        dunningLevel: newLevel,
        lastDunningAt: new Date(),
        status: "overdue",
      })
      .where(eq(payments.id, p.id));
    
    if (p.memberEmail) {
      const { subject, html, text } = dunningEmailTemplate({
        memberName: `${p.memberFirstName} ${p.memberLastName}`,
        clubName: club.name,
        amount: p.amount,
        description: p.description,
        dueDate: p.dueDate || "",
        dunningLevel: newLevel,
        invoiceNumber: p.invoiceNumber || "",
      });
      await enqueueEmail({ to: p.memberEmail, subject, html, text });
    }
  }

  revalidatePath("/dashboard/finance");
  return { success: true, processed: overduePayments.length };
}

export async function getDunningStats() {
  const clubId = await requireClubId();

  const result = await db
    .select({
      level: payments.dunningLevel,
      count: sql<number>`COUNT(*)`,
      amount: sql<string>`SUM(${payments.amount}::numeric)`,
    })
    .from(payments)
    .where(and(
      eq(payments.clubId, clubId),
      eq(payments.status, "overdue")
    ))
    .groupBy(payments.dunningLevel);

  return result;
}

export async function getClubBankSettings() {
  const clubId = await requireClubId();

  const [club] = await db
    .select({
      creditorId: clubs.creditorId,
      sepaIban: clubs.sepaIban,
      sepaBic: clubs.sepaBic,
    })
    .from(clubs)
    .where(eq(clubs.id, clubId));

  if (club) {
    if (club.sepaIban) club.sepaIban = decrypt(club.sepaIban);
    if (club.sepaBic) club.sepaBic = decrypt(club.sepaBic);
  }

  return club || null;
}

export async function updateClubBankSettings(formData: FormData) {
  const clubId = await requireClubId();

  const creditorId = (formData.get("creditorId") as string) || null;
  const sepaIban = (formData.get("sepaIban") as string) || null;
  const sepaBic = (formData.get("sepaBic") as string) || null;

  await db
    .update(clubs)
    .set({
      creditorId,
      sepaIban: sepaIban ? encrypt(sepaIban) : null,
      sepaBic: sepaBic ? encrypt(sepaBic) : null,
    })
    .where(eq(clubs.id, clubId));

  revalidatePath("/dashboard/finance");
}

export async function getMembersForFinance() {
  const clubId = await requireClubId();

  return db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
    })
    .from(members)
    .innerJoin(clubMemberships, eq(members.id, clubMemberships.memberId))
    .where(and(
      eq(clubMemberships.clubId, clubId),
      eq(clubMemberships.status, "active"),
      eq(members.status, "active")
    ))
    .orderBy(members.lastName, members.firstName);
}

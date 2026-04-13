"use server";

import { db } from "@/lib/db";
import { payments, clubMemberships } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireClubId } from "./utils";

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
    })
    .from(payments)
    .where(eq(payments.clubId, clubId))
    .orderBy(desc(payments.createdAt));
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

  await db.insert(payments).values({
    clubId,
    memberId,
    amount: amount.toString(),
    description,
    year,
    dueDate,
  });

  revalidatePath("/dashboard/finance");
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
    .set({ status: status as any })
    .where(eq(payments.id, paymentId));

  revalidatePath("/dashboard/finance");
}

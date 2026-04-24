"use server";

import { db } from "@/lib/db";
import { pages, pageBlocks } from "@/lib/db/schema";
import { eq, desc, asc, and, or, sql, SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { PERMISSIONS, hasPermission } from "@/lib/auth/permissions";
import { requireClubId } from "./utils";
import { pageSchema } from "@/lib/validations/cms";
import { sanitizeHtml } from "@/lib/sanitize-html";

import { z } from "zod";

export type PageSortField = "title" | "slug" | "status" | "createdAt" | "updatedAt";
export type SortOrder = "asc" | "desc";

export async function getPages(
  search?: string,
  status?: string,
  sortBy: PageSortField = "updatedAt",
  sortOrder: SortOrder = "desc",
  page: number = 1,
  pageSize: number = 25
) {
  const clubId = await requireClubId();
  const offset = (page - 1) * pageSize;

  const conditions: (SQL<unknown> | undefined)[] = [
    eq(pages.clubId, clubId),
  ];

  if (search) {
    conditions.push(
      or(
        sql`${pages.title} ILIKE ${`%${search}%`}`,
        sql`${pages.slug} ILIKE ${`%${search}%`}`
      )
    );
  }

  if (status) {
    conditions.push(eq(pages.status, status as any));
  }

  const orderFn = sortOrder === "desc" ? desc : asc;
  let orderBy: SQL<unknown>;

  switch (sortBy) {
    case "title":
      orderBy = orderFn(pages.title);
      break;
    case "slug":
      orderBy = orderFn(pages.slug);
      break;
    case "status":
      orderBy = orderFn(pages.status);
      break;
    case "createdAt":
      orderBy = orderFn(pages.createdAt);
      break;
    case "updatedAt":
      orderBy = orderFn(pages.updatedAt);
      break;
    default:
      orderBy = desc(pages.updatedAt);
  }

  const result = await db
    .select()
    .from(pages)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset);

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(pages)
    .where(and(...conditions));

  const totalCount = Number(totalCountResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    pages: result,
    totalCount,
    totalPages,
  };
}

export async function getPageById(id: string) {
  const clubId = await requireClubId();
  
  const page = await db.query.pages.findFirst({
    where: and(eq(pages.id, id), eq(pages.clubId, clubId)),
    with: {
      blocks: {
        orderBy: asc(pageBlocks.order),
      },
    },
  });

  return page;
}

export async function createPage(data: z.infer<typeof pageSchema>) {
  const clubId = await requireClubId();
  const session = await getSession();
  
  if (!session || !hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.PAGES_WRITE, session.user.isSuperAdmin)) {
    throw new Error("Keine Berechtigung");
  }

  const validated = pageSchema.parse(data);

  const [newPage] = await db
    .insert(pages)
    .values({
      ...validated,
      clubId,
      status: validated.status as any, // Cast for drizzle enum
    })
    .returning();

  revalidatePath("/dashboard/pages");
  return newPage;
}

export async function updatePage(id: string, data: Partial<z.infer<typeof pageSchema>>) {
  const clubId = await requireClubId();
  const session = await getSession();
  
  if (!session || !hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.PAGES_WRITE, session.user.isSuperAdmin)) {
    throw new Error("Keine Berechtigung");
  }

  const validated = pageSchema.partial().parse(data);

  const [updatedPage] = await db
    .update(pages)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(and(eq(pages.id, id), eq(pages.clubId, clubId)))
    .returning();

  revalidatePath("/dashboard/pages");
  revalidatePath(`/dashboard/pages/${id}`);
  return updatedPage;
}

export async function deletePage(id: string) {
  const clubId = await requireClubId();
  const session = await getSession();
  
  if (!session || !hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.PAGES_WRITE, session.user.isSuperAdmin)) {
    throw new Error("Keine Berechtigung");
  }

  await db
    .delete(pages)
    .where(and(eq(pages.id, id), eq(pages.clubId, clubId)));

  revalidatePath("/dashboard/pages");
}

function sanitizeBlockData(block: any): any {
  if (!block || typeof block !== "object") return block;

  const sanitized = { ...block };

  // HTML-Inhalt in Textblöcken sanitisisieren
  if (sanitized.contentHtml && typeof sanitized.contentHtml === "string") {
    sanitized.contentHtml = sanitizeHtml(sanitized.contentHtml);
  }

  // Auch content-String sanitisisieren falls es HTML enthält
  if (sanitized.content && typeof sanitized.content === "string" && sanitized.content.includes("<")) {
    sanitized.content = sanitizeHtml(sanitized.content);
  }

  return sanitized;
}

export async function savePageBlocks(pageId: string, blocksData: any[]) {
  const clubId = await requireClubId();
  const session = await getSession();

  if (!session || !hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.PAGES_WRITE, session.user.isSuperAdmin)) {
    throw new Error("Keine Berechtigung");
  }

  // Blöcke vor dem Speichern sanitisisieren
  const sanitizedBlocks = blocksData.map((b) => sanitizeBlockData(b));

  // In einer Transaktion: alte Blöcke löschen, neue einfügen
  await db.transaction(async (tx) => {
    // Sicherheit: Prüfen ob Seite zum Club gehört
    const page = await tx.query.pages.findFirst({
      where: and(eq(pages.id, pageId), eq(pages.clubId, clubId)),
    });

    if (!page) throw new Error("Seite nicht gefunden");

    // Alte Blöcke löschen
    await tx.delete(pageBlocks).where(eq(pageBlocks.pageId, pageId));

    // Neue Blöcke einfügen
    if (sanitizedBlocks.length > 0) {
      await tx.insert(pageBlocks).values(
        sanitizedBlocks.map((b, index) => ({
          pageId,
          blockType: b.type,
          order: index * 10,
          content: b.data,
          createdBy: session.user.memberId ?? null,
        }))
      );
    }

    // Seite updatedAt aktualisieren
    await tx.update(pages).set({ updatedAt: new Date() }).where(eq(pages.id, pageId));
  });

  revalidatePath("/dashboard/pages");
  revalidatePath(`/dashboard/pages/${pageId}`);
}


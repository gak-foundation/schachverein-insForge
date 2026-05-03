"use server";

import { createServiceClient } from "@/lib/insforge";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { PERMISSIONS, hasPermission } from "@/lib/auth/permissions";
import { requireClubId } from "@/lib/actions/utils";
import { pageSchema } from "@/lib/validations/cms";
import { sanitizeHtml } from "@/lib/sanitize-html";

import { z } from "zod";

export type PageSortField = "title" | "slug" | "status" | "createdAt" | "updatedAt";
export type SortOrder = "asc" | "desc";

function mapPage(page: any) {
  return {
    id: page.id,
    clubId: page.club_id,
    slug: page.slug,
    title: page.title,
    status: page.status,
    publishAt: page.publish_at,
    seo: page.seo,
    layout: page.layout,
    navigationParent: page.navigation_parent,
    order: page.order,
    createdAt: page.created_at,
    updatedAt: page.updated_at,
    deletedAt: page.deleted_at,
  };
}

function mapPageBlock(block: any) {
  return {
    id: block.id,
    pageId: block.page_id,
    blockType: block.block_type,
    order: block.order,
    content: block.content,
    visibility: block.visibility,
    createdBy: block.created_by,
    createdAt: block.created_at,
    updatedAt: block.updated_at,
  };
}

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
  const client = createServiceClient();

  let query = client
    .from("pages")
    .select("*", { count: "exact" })
    .eq("club_id", clubId);

  if (search) {
    query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const sortColumn =
    sortBy === "createdAt"
      ? "created_at"
      : sortBy === "updatedAt"
        ? "updated_at"
        : sortBy;

  const { data, error, count } = await query
    .order(sortColumn, { ascending: sortOrder === "asc" })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching pages:", error);
    throw new Error("Fehler beim Laden der Seiten");
  }

  const totalCount = Number(count || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    pages: (data || []).map(mapPage),
    totalCount,
    totalPages,
  };
}

export async function getPageById(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: page, error } = await client
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("club_id", clubId)
    .single();

  if (error || !page) {
    return null;
  }

  const { data: blocks, error: blocksError } = await client
    .from("page_blocks")
    .select("*")
    .eq("page_id", id)
    .order("order", { ascending: true });

  if (blocksError) {
    console.error("Error fetching page blocks:", blocksError);
  }

  return {
    ...mapPage(page),
    blocks: (blocks || []).map(mapPageBlock),
  };
}

export async function createPage(data: z.infer<typeof pageSchema>) {
  const clubId = await requireClubId();
  const session = await getSession();

  if (
    !session ||
    !hasPermission(
      session.user.role ?? "mitglied",
      session.user.permissions ?? [],
      PERMISSIONS.PAGES_WRITE,
      session.user.isSuperAdmin
    )
  ) {
    throw new Error("Keine Berechtigung");
  }

  const validated = pageSchema.parse(data);
  const client = createServiceClient();

  const { data: newPage, error } = await client
    .from("pages")
    .insert([
      {
        title: validated.title,
        slug: validated.slug,
        status: validated.status,
        publish_at: validated.publishAt
          ? validated.publishAt.toISOString()
          : null,
        layout: validated.layout,
        seo: validated.seo ?? null,
        club_id: clubId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating page:", error);
    throw new Error("Fehler beim Erstellen der Seite");
  }

  revalidatePath("/dashboard/pages");
  return mapPage(newPage);
}

export async function updatePage(
  id: string,
  data: Partial<z.infer<typeof pageSchema>>
) {
  const clubId = await requireClubId();
  const session = await getSession();

  if (
    !session ||
    !hasPermission(
      session.user.role ?? "mitglied",
      session.user.permissions ?? [],
      PERMISSIONS.PAGES_WRITE,
      session.user.isSuperAdmin
    )
  ) {
    throw new Error("Keine Berechtigung");
  }

  const validated = pageSchema.partial().parse(data);
  const client = createServiceClient();

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (validated.title !== undefined) updateData.title = validated.title;
  if (validated.slug !== undefined) updateData.slug = validated.slug;
  if (validated.status !== undefined) updateData.status = validated.status;
  if (validated.publishAt !== undefined)
    updateData.publish_at = validated.publishAt
      ? validated.publishAt.toISOString()
      : null;
  if (validated.layout !== undefined) updateData.layout = validated.layout;
  if (validated.seo !== undefined) updateData.seo = validated.seo;

  const { data: updatedPage, error } = await client
    .from("pages")
    .update(updateData)
    .eq("id", id)
    .eq("club_id", clubId)
    .select()
    .single();

  if (error) {
    console.error("Error updating page:", error);
    throw new Error("Fehler beim Aktualisieren der Seite");
  }

  revalidatePath("/dashboard/pages");
  revalidatePath(`/dashboard/pages/${id}`);
  return mapPage(updatedPage);
}

export async function deletePage(id: string) {
  const clubId = await requireClubId();
  const session = await getSession();

  if (
    !session ||
    !hasPermission(
      session.user.role ?? "mitglied",
      session.user.permissions ?? [],
      PERMISSIONS.PAGES_WRITE,
      session.user.isSuperAdmin
    )
  ) {
    throw new Error("Keine Berechtigung");
  }

  const client = createServiceClient();

  const { error } = await client
    .from("pages")
    .delete()
    .eq("id", id)
    .eq("club_id", clubId);

  if (error) {
    console.error("Error deleting page:", error);
    throw new Error("Fehler beim Löschen der Seite");
  }

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
  if (
    sanitized.content &&
    typeof sanitized.content === "string" &&
    sanitized.content.includes("<")
  ) {
    sanitized.content = sanitizeHtml(sanitized.content);
  }

  return sanitized;
}

export async function savePageBlocks(pageId: string, blocksData: any[]) {
  const clubId = await requireClubId();
  const session = await getSession();

  if (
    !session ||
    !hasPermission(
      session.user.role ?? "mitglied",
      session.user.permissions ?? [],
      PERMISSIONS.PAGES_WRITE,
      session.user.isSuperAdmin
    )
  ) {
    throw new Error("Keine Berechtigung");
  }

  // Blöcke vor dem Speichern sanitisisieren
  const sanitizedBlocks = blocksData.map((b) => sanitizeBlockData(b));
  const client = createServiceClient();

  // Sicherheit: Prüfen ob Seite zum Club gehört
  const { data: page, error: pageError } = await client
    .from("pages")
    .select("id")
    .eq("id", pageId)
    .eq("club_id", clubId)
    .single();

  if (pageError || !page) throw new Error("Seite nicht gefunden");

  // Alte Blöcke löschen
  const { error: deleteError } = await client
    .from("page_blocks")
    .delete()
    .eq("page_id", pageId);

  if (deleteError) {
    console.error("Error deleting old blocks:", deleteError);
    throw new Error("Fehler beim Löschen der alten Blöcke");
  }

  // Neue Blöcke einfügen
  if (sanitizedBlocks.length > 0) {
    const blocksToInsert = sanitizedBlocks.map((b, index) => ({
      page_id: pageId,
      block_type: b.type,
      order: index * 10,
      content: b.data,
      created_by: session.user.memberId ?? null,
    }));

    const { error: insertError } = await client
      .from("page_blocks")
      .insert(blocksToInsert);

    if (insertError) {
      console.error("Error inserting blocks:", insertError);
      throw new Error("Fehler beim Speichern der Blöcke");
    }
  }

  // Seite updatedAt aktualisieren
  const { error: updateError } = await client
    .from("pages")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", pageId);

  if (updateError) {
    console.error("Error updating page timestamp:", updateError);
  }

  revalidatePath("/dashboard/pages");
  revalidatePath(`/dashboard/pages/${pageId}`);
}

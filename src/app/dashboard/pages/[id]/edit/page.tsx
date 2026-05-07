import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getPageById } from "@/lib/actions/cms";
import { EditorShell } from "@/features/cms/components/editor/editor-shell";

export const metadata = {
  title: "Seite bearbeiten",
};

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.PAGES_WRITE)) {
    redirect("/dashboard/pages");
  }

  const page = await getPageById(id);

  if (!page) {
    notFound();
  }

  // Map database blocks to store format
  const initialBlocks = (page.blocks || []).map((b: Record<string, unknown>) => ({
    id: b.id as string,
    type: b.blockType as any,
    data: b.content,
    order: b.order as number,
  }));

  return (
    <div className="h-full">
      <EditorShell page={page} initialBlocks={initialBlocks} />
    </div>
  );
}

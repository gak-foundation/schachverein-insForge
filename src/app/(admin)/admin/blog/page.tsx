import { getSessionWithClub } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getBlogPosts } from "@/lib/db/queries/blog";
import { deleteBlogPost } from "@/features/blog/actions";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default async function AdminBlogPage() {
  const session = await getSessionWithClub();

  if (!session?.user.isSuperAdmin) {
    redirect("/dashboard");
  }

  const { posts } = await getBlogPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Verwalten Sie Blogartikel für die Marketing-Seite.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-9 px-4 hover:bg-primary/80 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neuer Artikel
        </Link>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p>Noch keine Blogartikel vorhanden.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="p-4">Titel</th>
                <th className="p-4">Status</th>
                <th className="p-4">Datum</th>
                <th className="p-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/50">
                  <td className="p-4 font-medium">{post.title}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {post.status === "published" ? "Veröffentlicht" : "Entwurf"}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {post.publishedAt
                      ? format(new Date(post.publishedAt), "dd.MM.yyyy", { locale: de })
                      : "-"}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Bearbeiten</span>
                      </Link>
                      <form action={deleteBlogPost.bind(null, post.id)}>
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive transition-colors h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Löschen</span>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

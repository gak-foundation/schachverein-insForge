"use client";

import { useState } from "react";
import { blogPostSchema, type BlogPostFormData } from "@/lib/validations/blog";
import { BlogEditor } from "./blog-editor";
import { ImageUploader } from "./image-uploader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BlogFormProps {
  initialData?: BlogPostFormData;
  onSubmit: (data: BlogPostFormData) => Promise<void>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function BlogForm({ initialData, onSubmit }: BlogFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BlogPostFormData>(
    initialData ?? {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      authorName: "schach.studio",
      status: "draft",
      publishedAt: null,
    }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = blogPostSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.issues.map((e) => e.message).join(", "));
      return;
    }

    try {
      await onSubmit(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {initialData ? "Artikel bearbeiten" : "Neuer Artikel"}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Titel</label>
          <input
            value={data.title}
            onChange={(e) => {
              const title = e.target.value;
              setData((d) => ({
                ...d,
                title,
                slug: initialData ? d.slug : slugify(title),
              }));
            }}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <input
            value={data.slug}
            onChange={(e) => setData((d) => ({ ...d, slug: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Kurzbeschreibung (Excerpt)</label>
        <textarea
          value={data.excerpt ?? ""}
          onChange={(e) => setData((d) => ({ ...d, excerpt: e.target.value }))}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <ImageUploader
            value={data.coverImage ?? ""}
            onChange={(url) => setData((d) => ({ ...d, coverImage: url }))}
            label="Cover-Bild"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Autor</label>
          <input
            value={data.authorName}
            onChange={(e) => setData((d) => ({ ...d, authorName: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Inhalt (Markdown)</label>
        <BlogEditor
          value={data.content ?? ""}
          onChange={(content) => setData((d) => ({ ...d, content }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select
            value={data.status}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                status: e.target.value as "draft" | "published",
              }))
            }
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="draft">Entwurf</option>
            <option value="published">Veröffentlicht</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-10 px-6 hover:bg-primary/80 transition-colors"
        >
          {initialData ? "Speichern" : "Erstellen"}
        </button>
        <Link
          href="/admin/blog"
          className="inline-flex items-center justify-center rounded-lg border text-sm font-medium h-10 px-6 hover:bg-muted transition-colors"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}

# Blog-Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Platform-weite Blog-Funktion mit Superadmin-CRUD und öffentlicher Ansicht auf Startseite, `/blog` und `/blog/[slug]`.

**Architecture:** Neue DB-Tabelle `blog_posts`, Server Actions im Feature-Modul `features/blog/`, öffentliche Seiten in `(marketing)/blog/*`, Admin CRUD in `(admin)/admin/blog/*`. Markdown wird mit `react-markdown` gerendert.

**Tech Stack:** Next.js 16, InsForge SDK, react-markdown, remark-gfm, rehype-sanitize, Zod, Tailwind CSS 4

---

### Task 1: DB-Tabelle `blog_posts` erstellen

**Files:**
- SQL via `insforge_run-raw-sql` Tool

- [ ] **Step 1: Tabelle via SQL erstellen**

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author_name TEXT NOT NULL DEFAULT 'schach.studio',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public kann nur veröffentlichte Posts lesen
CREATE POLICY "blog_posts_public_select" ON blog_posts
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Service Role kann alles (für Server Actions)
CREATE POLICY "blog_posts_service_all" ON blog_posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

---

### Task 2: TypeScript-Typen & Schema

**Files:**
- Create: `src/lib/db/schema/blog.ts`

- [ ] **Step 1: Typen definieren**

```typescript
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  authorName: string;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  authorName: string;
  status: "draft" | "published";
  publishedAt?: string | null;
};

export type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author_name: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
```

- [ ] **Step 2: In schema/index.ts exportieren**

Lese `src/lib/db/schema/index.ts`, füge Export `export * from "./blog";` hinzu.

---

### Task 3: Zod-Validierung

**Files:**
- Create: `src/lib/validations/blog.ts`

- [ ] **Step 1: Zod-Schemas definieren**

```typescript
import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200),
  slug: z.string().min(1, "Slug ist erforderlich").max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  excerpt: z.string().max(500).nullable().optional(),
  content: z.string().nullable().optional(),
  coverImage: z.string().url("Ungültige URL").nullable().optional().or(z.literal("")),
  authorName: z.string().min(1, "Autorenname ist erforderlich").max(100),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().nullable().optional(),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;
```

---

### Task 4: Query-Helper für Blog

**Files:**
- Create: `src/lib/db/queries/blog.ts`

- [ ] **Step 1: Query-Funktionen**

```typescript
import { createServiceClient } from "@/lib/insforge";
import type { BlogPost, BlogPostRow, BlogPostInput } from "@/lib/db/schema/blog";

function mapBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.cover_image,
    authorName: row.author_name,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBlogPosts(options?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const client = createServiceClient();
  const status = options?.status;
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let query = client.from("blog_posts").select("*", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw new Error(error.message);
  return {
    posts: (data as BlogPostRow[] ?? []).map(mapBlogPost),
    total: count ?? 0,
  };
}

export async function getPublishedBlogPosts(limit = 3) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as BlogPostRow[] ?? []).map(mapBlogPost);
}

export async function getBlogPostBySlug(slug: string) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return mapBlogPost(data as BlogPostRow);
}

export async function getBlogPostById(id: string) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return mapBlogPost(data as BlogPostRow);
}
```

---

### Task 5: Server Actions

**Files:**
- Create: `src/features/blog/actions.ts`

- [ ] **Step 1: Server Actions**

```typescript
"use server";

import { createServiceClient } from "@/lib/insforge";
import { blogPostSchema, type BlogPostFormData } from "@/lib/validations/blog";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

function requireSuperAdmin(user: { isSuperAdmin?: boolean } | null) {
  if (!user?.isSuperAdmin) {
    throw new Error("Nicht autorisiert");
  }
}

export async function createBlogPost(data: BlogPostFormData) {
  const session = await getSession();
  requireSuperAdmin(session?.user ?? null);

  const parsed = blogPostSchema.parse(data);

  const client = createServiceClient();
  const { error } = await client.from("blog_posts").insert([
    {
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt || null,
      content: parsed.content || null,
      cover_image: parsed.coverImage || null,
      author_name: parsed.authorName,
      status: parsed.status,
      published_at: parsed.status === "published" ? (parsed.publishedAt || new Date().toISOString()) : null,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/");
  redirect("/admin/blog");
}

export async function updateBlogPost(id: string, data: BlogPostFormData) {
  const session = await getSession();
  requireSuperAdmin(session?.user ?? null);

  const parsed = blogPostSchema.parse(data);

  const client = createServiceClient();
  const { error } = await client.from("blog_posts").update({
    title: parsed.title,
    slug: parsed.slug,
    excerpt: parsed.excerpt || null,
    content: parsed.content || null,
    cover_image: parsed.coverImage || null,
    author_name: parsed.authorName,
    status: parsed.status,
    published_at: parsed.status === "published" ? (parsed.publishedAt || new Date().toISOString()) : null,
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/");
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  const session = await getSession();
  requireSuperAdmin(session?.user ?? null);

  const client = createServiceClient();
  const { error } = await client.from("blog_posts").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/");
}
```

---

### Task 6: Dependencies installieren

**Files:**
- Modify: `package.json`

- [ ] **Step 1: react-markdown und Plugins installieren**

```bash
npm install react-markdown remark-gfm rehype-sanitize
```

---

### Task 7: BlogCard-Komponente

**Files:**
- Create: `src/features/blog/components/blog-card.tsx`

- [ ] **Step 1: BlogCard-Komponente**

```typescript
import Link from "next/link";
import type { BlogPost } from "@/lib/db/schema/blog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      {post.coverImage ? (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-muted flex items-center justify-center">
          <span className="text-4xl">♟</span>
        </div>
      )}
      <div className="flex flex-col gap-2 p-5 flex-1">
        <time className="text-xs text-muted-foreground">
          {post.publishedAt ? format(new Date(post.publishedAt), "dd. MMMM yyyy", { locale: de }) : ""}
        </time>
        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-2">
          <span className="text-xs text-muted-foreground">{post.authorName}</span>
        </div>
      </div>
    </Link>
  );
}
```

---

### Task 8: BlogSection für Startseite

**Files:**
- Create: `src/features/blog/components/blog-section.tsx`

- [ ] **Step 1: BlogSection-Komponente**

```typescript
import { getPublishedBlogPosts } from "@/lib/db/queries/blog";
import { BlogCard } from "./blog-card";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";

export async function BlogSection() {
  const posts = await getPublishedBlogPosts(3);

  if (posts.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
            <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Blog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4 text-foreground tracking-tight">
            Neuestes aus dem Blog
          </h2>
          <p className="text-muted-foreground">
            Tipps, Neuigkeiten und Updates rund um die Schachvereins-Verwaltung.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Alle Beiträge anzeigen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

---

### Task 9: BlogSection in Startseite einfügen

**Files:**
- Modify: `src/app/(marketing)/page.tsx`

- [ ] **Step 1: BlogSection importieren und zwischen FAQ und finalem CTA einfügen**

Füge nach `import { MiniManager } from "@/components/marketing/mini-manager";`:
```typescript
import { BlogSection } from "@/features/blog/components/blog-section";
```

Füge nach `<FAQAccordion />`-Abschnitt und vor dem finalen CTA:
```typescript
<BlogSection />
```

---

### Task 10: Blog-Archivseite `/blog`

**Files:**
- Create: `src/app/(marketing)/blog/page.tsx`

- [ ] **Step 1: Blog-Archivseite**

```typescript
import { getBlogPosts } from "@/lib/db/queries/blog";
import { BlogCard } from "@/features/blog/components/blog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Newspaper } from "lucide-react";

export const metadata = {
  title: "Blog | schach.studio",
  description: "Neuigkeiten, Tipps und Updates rund um die Schachvereins-Verwaltung mit schach.studio.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const { posts, total } = await getBlogPosts({
    status: "published",
    page: currentPage,
    pageSize: 12,
  });

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-4 text-foreground tracking-tight">
            Blog
          </h1>
          <p className="text-muted-foreground">
            Neuigkeiten, Tipps und Updates rund um die Schachvereins-Verwaltung.
          </p>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Noch keine Blogartikel"
            description="Wir arbeiten daran. Schau bald wieder vorbei!"
          />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <a
                    key={page}
                    href={page === 1 ? "/blog" : `/blog?page=${page}`}
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-accent"
                    }`}
                  >
                    {page}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

---

### Task 11: Blog-Artikelseite `/blog/[slug]`

**Files:**
- Create: `src/app/(marketing)/blog/[slug]/page.tsx`

- [ ] **Step 1: Artikelseite mit Markdown-Rendering**

```typescript
import { getBlogPostBySlug } from "@/lib/db/queries/blog";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Blog
        </Link>

        {post.coverImage && (
          <div className="aspect-[2/1] rounded-xl overflow-hidden mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{post.authorName}</span>
            <span aria-hidden="true">·</span>
            <time>
              {post.publishedAt
                ? format(new Date(post.publishedAt), "dd. MMMM yyyy", { locale: de })
                : ""}
            </time>
          </div>
        </header>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {post.content ?? ""}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Metadata generieren**

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) return { title: "Blog | schach.studio" };

  return {
    title: `${post.title} | schach.studio Blog`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}
```

---

### Task 12: Admin Blog-Liste

**Files:**
- Create: `src/app/(admin)/admin/blog/page.tsx`

- [ ] **Step 1: Admin List Page**

```typescript
import { getSessionWithClub } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getBlogPosts } from "@/lib/db/queries/blog";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteBlogPost } from "@/features/blog/actions";
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
                          onClick={(e) => {
                            if (!confirm("Wirklich löschen?")) e.preventDefault();
                          }}
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
```

Note: The delete form uses `confirm()` which is client-side. Since this is a server component, we need to handle this differently. Let me reconsider - the form action with `deleteBlogPost.bind(null, post.id)` works with a confirmation dialog. But `confirm()` won't work in a server component. I need to make the delete button a client component or use a separate approach.

Actually, looking at the existing codebase patterns, most forms use server actions directly. For delete with confirmation, I could use a simple form with a submit button that the user clicks, and the confirmation could be done with `confirm()` in a client component. Let me keep it simple and just use a form without confirmation, or use `useActionState`.

Actually, for simplicity, let's just use a form with server action. The user can always implement confirmation later. Or I can use `onSubmit` with a client component. Let me keep it as-is for now but note that the `confirm()` won't work in a server component. The actual way to handle this would be a small client component wrapper.

Let me update this approach. Actually I think the simplest approach is just a form with a submit button - no confirmation dialog. The user clicks delete and it's gone. Or I could make it a client component. Let me look at how other parts of the codebase handle delete...

Actually, looking at the page more carefully, the form with `onClick` handler would work because `onClick` is a client-side event. But since this is a server component, `onClick` won't fire. Let me refactor to use a simple form without JS confirmation, or create a small client wrapper.

Actually the simplest approach: just use the form without onClick. The delete action is a server action. We can add a simple DeleteButton client component later. For now, let's just keep it as a form with no special client interaction.

Let me revise:

```tsx
<form action={deleteBlogPost.bind(null, post.id)}>
  <button
    type="submit"
    className="inline-flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive transition-colors h-8 w-8"
  >
    <Trash2 className="h-4 w-4" />
    <span className="sr-only">Löschen</span>
  </button>
</form>
```

This works fine as a server component with server actions. The form submission triggers the server action directly.

---

### Task 13: Admin Blog Create-Formular

**Files:**
- Create: `src/app/(admin)/admin/blog/new/page.tsx`
- Create: `src/features/blog/components/blog-editor.tsx`

- [ ] **Step 1: Markdown-Editor Komponente**

```typescript
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function BlogEditor({ value, onChange }: BlogEditorProps) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
            !preview ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
          }`}
        >
          Bearbeiten
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
            preview ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
          }`}
        >
          Vorschau
        </button>
      </div>
      {preview ? (
        <div className="min-h-[300px] rounded-lg border bg-card p-4 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {value || "*Vorschau wird hier angezeigt*"}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[300px] rounded-lg border bg-background p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          placeholder="Schreibe deinen Blogartikel in Markdown..."
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: BlogForm Komponente (wiederverwendbar für Create/Edit)**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { blogPostSchema, type BlogPostFormData } from "@/lib/validations/blog";
import { BlogEditor } from "./blog-editor";
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
  const router = useRouter();
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
      setError(result.error.errors.map((e) => e.message).join(", "));
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
          <label className="text-sm font-medium">Cover-Bild URL</label>
          <input
            value={data.coverImage ?? ""}
            onChange={(e) => setData((d) => ({ ...d, coverImage: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="https://..."
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
```

- [ ] **Step 3: Admin Create Page**

```typescript
import { getSessionWithClub } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createBlogPost } from "@/features/blog/actions";
import { BlogForm } from "@/features/blog/components/blog-form";

export default async function NewBlogPostPage() {
  const session = await getSessionWithClub();

  if (!session?.user.isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <BlogForm onSubmit={createBlogPost} />
    </div>
  );
}
```

---

### Task 14: Admin Blog Edit-Formular

**Files:**
- Create: `src/app/(admin)/admin/blog/[id]/edit/page.tsx`

- [ ] **Step 1: Admin Edit Page**

```typescript
import { getSessionWithClub } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/db/queries/blog";
import { updateBlogPost } from "@/features/blog/actions";
import { BlogForm } from "@/features/blog/components/blog-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionWithClub();

  if (!session?.user.isSuperAdmin) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  const updateAction = updateBlogPost.bind(null, id);

  return (
    <div className="space-y-6">
      <BlogForm
        initialData={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          authorName: post.authorName,
          status: post.status,
          publishedAt: post.publishedAt,
        }}
        onSubmit={updateAction}
      />
    </div>
  );
}
```

---

### Task 15: Navigation aktualisieren

**Files:**
- Modify: `src/app/(admin)/layout.tsx`

- [ ] **Step 1: "Blog" in Admin-Navigation hinzufügen**

Füge `{ href: "/admin/blog", label: "Blog" }` ins `adminNavItems`-Array ein, z.B. zwischen Einladungen und Billing.

---

### Task 16: SEO - Sitemap & Robots

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/robots.ts`

- [ ] **Step 1: Blog-Posts in Sitemap aufnehmen**

Lese `src/app/sitemap.ts` und füge Blog-Post-URLs hinzu.

- [ ] **Step 2: `/blog` zu robots.ts hinzufügen** (falls nötig)

---

### Task 17: Beispiel-Blogartikel erstellen

- [ ] **Step 1: Drei Beispielartikel via SQL einfügen**

```sql
INSERT INTO blog_posts (title, slug, excerpt, content, author_name, status, published_at) VALUES
(
  'Schachverein digitalisieren: So gelingt der Umstieg',
  'schachverein-digitalisieren',
  'Moderne Verwaltung muss nicht komplex sein. Erfahre, wie dein Schachverein von digitalen Workflows profitiert.',
  E'# Schachverein digitalisieren\n\nDie Verwaltung eines Schachvereins kann zeitaufwändig sein: Mitgliederlisten, Turnierplanung, Finanzen und Kommunikation – alles muss organisiert werden. Mit **schach.studio** wird daraus ein Kinderspiel.\n\n## Warum digitalisieren?\n\n- **Zeitersparnis**: Automatisierte Mitgliederverwaltung und turnierplanung\n- **Transparenz**: Alle Daten an einem zentralen Ort\n- **Professionalität**: Moderne Website inklusive\n\n## Unser Tipp\n\nStarte mit einem Bereich: Zum Beispiel der Mitgliederverwaltung. Danach kommen Turniere und Finanzen dazu. Schritt für Schritt, ohne Überforderung.',
  'schach.studio',
  'published',
  NOW() - INTERVAL '7 days'
),
(
  'BFSG 2025: Was bedeutet das Barrierefreiheitsstärkungsgesetz für Schachvereine?',
  'bfsg-2025-schachvereine',
  'Ab Juni 2025 müssen viele digitale Angebote barrierefrei sein. Wir erklären, was auf Schachvereine zukommt.',
  E'# BFSG 2025 und Schachvereine\n\nDas **Barrierefreiheitsstärkungsgesetz (BFSG)** tritt am 28. Juni 2025 in Kraft und betrifft auch viele Schachvereine.\n\n## Wen betrifft es?\n\nVereine, die regelmäßiggeschäftsmäßig Dienstleistungen anbieten (z.B. Mitgliederverwaltung, Turnierorganisation) und keinen Kleinstunternehmen-Status haben, müssen ihre digitalen Angebote barrierefrei gestalten.\n\n## Was bedeutet das konkret?\n\n- **Website** muss WCAG 2.2 AA konform sein\n- **Mitgliederportal** muss barrierefrei bedienbar sein\n- **Formulare** müssen mit Screenreadern nutzbar sein\n\n## So sind wir vorbereitet\n\nschach.studio ist bereits vollständig BFSG-konform. Das bedeutet für deinen Verein: Kein Stress, keine Nachbesserungen – einfach lossstarten.',
  'schach.studio',
  'published',
  NOW() - INTERVAL '3 days'
),
(
  '5 Gründe, warum dein Schachverein eine eigene Website braucht',
  '5-grunde-eigene-website',
  'Eine eigene Website ist die Visitenkarte deines Vereins. Wir zeigen fünf überzeugende Gründe für den Schritt.',
  E'# 5 Gründe für eine Vereins-Website\n\nEine moderne Website ist heute das Aushängeschild jedes Schachvereins. Hier sind fünf Gründe, warum du jetzt handeln solltest:\n\n## 1. Neumitglieder gewinnen\n\nDie erste Recherche findet online statt. Ohne Website bleibst du unsichtbar.\n\n## 2. Aktuelle Informationen teilen\n\nSpieltermine, Turniere, Mannschaftsmeldungen – alles zentral und immer aktuell.\n\n## 3. Professionalität ausstrahlen\n\nEin moderner Auftritt signalisiert: Hier wird Schach ernst genommen.\n\n## 4. Verwaltung entlasten\n\nMitglieder finden Infos selbstständig – weniger Rückfragen für den Vorstand.\n\n## 5. DSGVO-konform\n\nMit schach.studio bekommst du eine rechtskonforme Website ohne Aufwand.',
  'schach.studio',
  'published',
  NOW() - INTERVAL '1 day'
);
```

---

### Task 18: Globale Styles für Markdown-Rendering

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Prüfen ob Tailwind Typography installiert ist**

```bash
npm list @tailwindcss/typography
```

Wenn nicht installiert:
```bash
npm install -D @tailwindcss/typography
```

- [ ] **Step 2: Typography Plugin in PostCSS-Konfiguration aktivieren**

Prüfe ob `@tailwindcss/typography` als Plugin registriert ist. Falls nicht, füge es hinzu.

---

### Task 19: Build & Test

- [ ] **Step 1: Build ausführen**

```bash
npm run build
```

- [ ] **Step 2: Eventuelle Fehler beheben**

import { createServiceClient } from "@/lib/insforge";
import type { BlogPost, BlogPostRow } from "@/lib/db/schema/blog";

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

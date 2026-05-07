"use server";

import { createServiceClient } from "@/lib/insforge";
import { blogPostSchema, type BlogPostFormData } from "@/lib/validations/blog";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

function requireSuperAdmin(user: { role?: string } | null) {
  if (user?.role !== "admin") {
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

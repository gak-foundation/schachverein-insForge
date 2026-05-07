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

  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

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
        onSubmit={updateBlogPost.bind(null, id)}
      />
    </div>
  );
}

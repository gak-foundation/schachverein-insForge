import { getSessionWithClub } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createBlogPost } from "@/features/blog/actions";
import { BlogForm } from "@/features/blog/components/blog-form";

export default async function NewBlogPostPage() {
  const session = await getSessionWithClub();

  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <BlogForm onSubmit={createBlogPost} />
    </div>
  );
}

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

import { getBlogPosts } from "@/lib/db/queries/blog";
import { BlogCard } from "@/features/blog/components/blog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Newspaper } from "lucide-react";
import Link from "next/link";

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
                  <Link
                    key={page}
                    href={page === 1 ? "/blog" : `/blog?page=${page}`}
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-accent"
                    }`}
                  >
                    {page}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

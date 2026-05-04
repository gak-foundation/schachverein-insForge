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

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

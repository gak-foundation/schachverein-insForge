import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { clubs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://schach.studio";

  // Static marketing routes
  const routes = [
    "",
    "/preise",
    "/demo",
    "/kontakt",
    "/impressum",
    "/datenschutz",
    "/barrierefreiheit",
  ];

  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic club routes
  try {
    const activeClubs = await db.query.clubs.findMany({
      where: eq(clubs.isActive, true),
      columns: {
        slug: true,
        updatedAt: true,
      },
    });

    const clubRoutes = activeClubs.map((club) => ({
      url: `${baseUrl}/clubs/${club.slug}`,
      lastModified: club.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...clubRoutes];
  } catch (error) {
    console.error("Error generating sitemap for clubs:", error);
    return staticRoutes;
  }
}

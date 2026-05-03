import { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/insforge";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://schach.studio";

  // Static marketing routes
  const routes = [
    "",
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
    const client = createServiceClient();
    const { data: activeClubs, error } = await client
      .from("clubs")
      .select("slug, updated_at")
      .eq("is_active", true);

    if (error) {
      throw error;
    }

    const clubRoutes = (activeClubs || []).map((club) => ({
      url: `${baseUrl}/clubs/${club.slug}`,
      lastModified: club.updated_at ? new Date(club.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...clubRoutes];
  } catch (error) {
    // Suppress DB connection errors during static generation (e.g., build/ci)
    // Sitemap gracefully falls back to static routes only
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      console.error("Error generating sitemap for clubs:", error);
    }
    return staticRoutes;
  }
}

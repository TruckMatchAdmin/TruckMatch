import { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/constants/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://truckmatch.fr";
  const now = new Date();

  const staticPages = [
    "",
    "/chauffeurs",
    "/chauffeurs/spl",
    "/chauffeurs/pl",
    "/chauffeurs/porteur",
    "/chauffeurs/vul",
    "/entreprises",
    "/offres-emploi",
    "/carte-chauffeurs",
    "/conseils",
    "/contact",
    "/a-propos",
    "/mentions-legales",
    "/politique-confidentialite",
    "/cgu",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route === ""
        ? ("daily" as const)
        : route === "/offres-emploi" || route === "/carte-chauffeurs"
        ? ("daily" as const)
        : ("weekly" as const),
    priority:
      route === ""
        ? 1.0
        : route === "/offres-emploi" ||
          route === "/carte-chauffeurs" ||
          route === "/entreprises" ||
          route === "/chauffeurs"
        ? 0.9
        : route.startsWith("/chauffeurs/")
        ? 0.85
        : route === "/conseils"
        ? 0.8
        : 0.5,
  }));

  const articlePages = ARTICLES.map((art) => ({
    url: `${baseUrl}/conseils/${art.slug}`,
    lastModified: new Date(art.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...articlePages];
}

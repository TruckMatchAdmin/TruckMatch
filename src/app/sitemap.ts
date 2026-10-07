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
    "/conseils",
    "/contact",
    "/a-propos",
    "/mentions-legales",
    "/politique-confidentialite",
    "/cgu",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : route.startsWith("/chauffeurs") || route === "/entreprises" ? 0.9 : 0.7,
  }));

  const articlePages = ARTICLES.map((art) => ({
    url: `${baseUrl}/conseils/${art.slug}`,
    lastModified: new Date(art.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...articlePages];
}

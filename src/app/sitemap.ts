import type { MetadataRoute } from "next";
import config from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "../../generated/prisma/enums";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (config.app_url ?? "http://localhost:3000").replace(/\/+$/, "");

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/listing/add`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const [categories, listings] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true, delatedAt: null },
        select: { slug: true, updatedAt: true },
        take: 100,
      }),
      prisma.listing.findMany({
        where: { verificationStatus: ListingStatus.APPROVED },
        select: { slug: true, updatedAt: true },
        take: 1000,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    for (const cat of categories) {
      routes.push({
        url: `${baseUrl}/search?category=${encodeURIComponent(cat.slug)}`,
        lastModified: cat.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const listing of listings) {
      routes.push({
        url: `${baseUrl}/listing/${encodeURIComponent(listing.slug)}`,
        lastModified: listing.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return routes;
}

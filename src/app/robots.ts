import type { MetadataRoute } from "next";
import config from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (config.app_url ?? "http://localhost:3000").replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/dashboard",
          "/dashboard/*",
          "/subscription/checkout*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

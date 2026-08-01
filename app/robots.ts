import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/properties/*", "/legal/*", "/about", "/contact", "/faq"],
        disallow: ["/api/", "/dashboard", "/admin", "/auth/", "/uploads/"],
      },
    ],
    sitemap: `${env.NEXTAUTH_URL}/sitemap.xml`,
    host: env.NEXTAUTH_URL,
  };
}

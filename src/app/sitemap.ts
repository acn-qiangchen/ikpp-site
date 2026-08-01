import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";

export const dynamic = "force-static";


export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/timeline", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/facts", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/evidence", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/voices", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/updates", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/action", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/dashboard",
          "/writer-dashboard",
          "/api/",
        ],
      },
    ],
    sitemap: "https://writeprof.com/sitemap.xml",
  };
}

import { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/*/landing", "/agendar", "/comprar"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/login",
          "/register",
          "/recuperar",
          "/actualizar-password",
          "/test-db/",
        ],
      },
    ],
    sitemap: "https://khora.cl/sitemap.xml",
  }
}

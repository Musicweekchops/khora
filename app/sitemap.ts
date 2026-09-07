import { createClient } from "@supabase/supabase-js"
import { MetadataRoute } from "next"

export const dynamic = "force-static"
export const revalidate = 3600 // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing. Generating basic sitemap.")
    return [
      {
        url: "https://khora.cl",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ]
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Obtener todos los profesores activos con slug
  const { data: teachers } = await supabase
    .from("TeacherProfile")
    .select("slug, updated_at")
    .not("slug", "is", null)

  const teacherUrls: MetadataRoute.Sitemap = (teachers ?? []).map((t) => ({
    url: `https://khora.cl/${t.slug}/landing`,
    lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))

  return [
    {
      url: "https://khora.cl",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...teacherUrls,
  ]
}

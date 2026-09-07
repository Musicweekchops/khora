import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import HeroSection from "@/components/landing/HeroSection"
import ScheduleSection from "@/components/landing/ScheduleSection"
import PricingSection from "@/components/landing/PricingSection"
import TeacherBioSection from "@/components/landing/TeacherBioSection"
import MethodologySection from "@/components/landing/MethodologySection"
import GallerySection from "@/components/landing/GallerySection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import ContactSection from "@/components/landing/ContactSection"
import WhatsAppFAB from "@/components/landing/WhatsAppFAB"

// Public Supabase client (anon key — RLS handles security)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getLandingData(slug: string) {
  // 1. Resolve teacher by slug (or UUID fallback)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
  let teacherQuery = supabase
    .from("TeacherProfile")
    .select(
      `id, slug, instrumento, business_name, created_at,
       User:user_id(name, email)`
    )

  if (isUuid) {
    teacherQuery = teacherQuery.or(`slug.eq.${slug},id.eq.${slug}`)
  } else {
    teacherQuery = teacherQuery.eq("slug", slug)
  }

  const { data: teacher } = await teacherQuery.maybeSingle()

  if (!teacher) return null

  const teacherId = teacher.id

  // 2. Fetch all data in parallel
  const [settingsRes, bioRes, galleryRes, testimonialsRes, productsRes] =
    await Promise.all([
      supabase
        .from("LandingSetting")
        .select("key, value")
        .or(`teacher_id.eq.${teacherId},teacher_id.is.null`),
      supabase
        .from("LandingBio")
        .select("*")
        .eq("teacher_id", teacherId)
        .maybeSingle(),
      supabase
        .from("LandingGalleryItem")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("order"),
      supabase
        .from("LandingTestimonial")
        .select("*")
        .or(`teacher_id.eq.${teacherId},teacher_id.is.null`)
        .order("order"),
      supabase
        .from("Product")
        .select("id, title, description, price, type, duration_months")
        .eq("teacher_id", teacherId)
        .eq("is_active", true),
    ])

  // 3. Parse LandingSetting KV store
  const settings: Record<string, any> = {}
  for (const row of settingsRes.data ?? []) {
    // Teacher-specific overrides global
    if (!settings[row.key] || row.value !== null) {
      settings[row.key] = row.value
    }
  }

  return {
    teacher,
    settings,
    bio: bioRes.data,
    gallery: galleryRes.data ?? [],
    testimonials: testimonialsRes.data ?? [],
    products: productsRes.data ?? [],
  }
}

// ─── generateMetadata ────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const data = await getLandingData(params.slug)
  if (!data) return { title: "Profesor no encontrado" }

  const { teacher, settings, bio } = data
  const userName = (teacher.User as any)?.name ?? teacher.business_name ?? params.slug
  const instrumento = teacher.instrumento ?? "Música"
  const seoSettings = settings["seo"] ?? {}

  const title =
    seoSettings.title ??
    `Clases de ${instrumento} con ${userName} | Khora`
  const description =
    seoSettings.description ??
    bio?.bio_text?.slice(0, 155) ??
    `Reserva tu clase de prueba de ${instrumento} con ${userName}. Ver horarios disponibles y precios.`

  const heroImage = settings["hero_image"]?.url ?? null

  return {
    title,
    description,
    keywords: seoSettings.keywords ?? [instrumento, "clases", "batería", "música", "Chile"],
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://khora.cl/${params.slug}/landing`,
      siteName: "Khora",
      images: heroImage
        ? [{ url: heroImage, width: 1200, height: 630, alt: `${userName} — ${instrumento}` }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: heroImage ? [heroImage] : [],
    },
    alternates: {
      canonical: `https://khora.cl/${params.slug}/landing`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function LandingPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getLandingData(params.slug)
  if (!data) notFound()

  const { teacher, settings, bio, gallery, testimonials, products } = data
  const userName = (teacher.User as any)?.name ?? teacher.business_name ?? params.slug
  const slug = params.slug

  // ─ Extract CMS settings with fallbacks ─
  const hero = settings["hero"] ?? {}
  const methodology = settings["methodology"] ?? {}
  const contact = settings["contact"] ?? {}

  const heroImageUrl = settings["hero_image"]?.url ?? null
  const heroTitle = hero.title ?? `Aprende ${teacher.instrumento ?? "Música"} con el Método Correcto`
  const heroSubtitle =
    hero.subtitle ??
    "Un enfoque práctico y progresivo para que avances desde el primer día."
  const heroCtaText = hero.cta_text ?? "Reserva tu Clase de Prueba"

  const whatsapp = contact.whatsapp ?? "+56944291538"
  const email = contact.email ?? (teacher.User as any)?.email ?? ""

  const bioText = bio?.bio_text ?? ""
  const bioHeadline = bio?.headline ?? `Músico Profesional · ${teacher.instrumento ?? "Música"}`
  const bioPhoto = bio?.photo_url ?? null
  const bioTags = bio?.tags ?? []

  const methTitle = methodology.title ?? "Nuestra Metodología"
  const methText = methodology.text ?? ""
  const methItems = methodology.items ?? []

  // ─ JSON-LD Structured Data ─
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: userName,
    description: bioText || `Clases de ${teacher.instrumento ?? "música"} con ${userName}`,
    url: `https://khora.cl/${slug}/landing`,
    telephone: whatsapp,
    priceRange: products.length > 0
      ? `CLP ${Math.min(...products.map((p: any) => p.price)).toLocaleString("es-CL")}`
      : "$$",
    image: heroImageUrl,
    ...(testimonials.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: String(testimonials.length),
        bestRating: "5",
        worstRating: "1",
      },
    }),
    review: testimonials.slice(0, 3).map((t: any) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewBody: t.comment,
      reviewRating: { "@type": "Rating", ratingValue: String(t.rating ?? 5) },
    })),
  }

  return (
    <>
      {/* JSON-LD for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        style={{
          minHeight: "100vh",
          background: "#0a0a0c",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* 1. Hero */}
        <HeroSection
          teacherName={userName}
          heroImageUrl={heroImageUrl}
          heroTitle={heroTitle}
          heroSubtitle={heroSubtitle}
          heroCtaText={heroCtaText}
          slug={slug}
          studentCount={testimonials.length * 10}
        />

        {/* 2. Horarios en tiempo real (Client Component) */}
        <ScheduleSection slug={slug} />

        {/* 3. Precios */}
        <PricingSection products={products as any} slug={slug} />

        {/* 4. Bio del profesor */}
        <TeacherBioSection
          name={userName}
          headline={bioHeadline}
          bioText={bioText}
          photoUrl={bioPhoto}
          tags={bioTags}
          instrumento={teacher.instrumento}
        />

        {/* 5. Metodología */}
        <MethodologySection
          title={methTitle}
          text={methText}
          items={methItems}
        />

        {/* 6. Galería */}
        <GallerySection items={gallery as any} />

        {/* 7. Testimonios */}
        <TestimonialsSection testimonials={testimonials as any} />

        {/* 8. Contacto / CTA Final */}
        <ContactSection
          whatsapp={whatsapp}
          email={email}
          teacherName={userName}
          slug={slug}
        />

        {/* Footer mínimo */}
        <footer
          className="py-8 px-6 text-center"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            background: "#0a0a0c",
          }}
        >
          <p className="text-neutral-600 text-xs font-medium">
            © {new Date().getFullYear()} {userName} · Potenciado por{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #a855f7, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Khora
            </span>
          </p>
        </footer>

        {/* WhatsApp Floating Button */}
        <WhatsAppFAB whatsapp={whatsapp} teacherName={userName} />
      </main>
    </>
  )
}

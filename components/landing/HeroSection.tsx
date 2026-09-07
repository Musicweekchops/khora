"use client"

import { useEffect, useRef } from "react"

interface HeroProps {
  teacherName: string
  heroImageUrl: string | null
  heroTitle: string
  heroSubtitle: string
  heroCtaText: string
  slug: string
  rating?: number
  studentCount?: number
}

export default function HeroSection({
  teacherName,
  heroImageUrl,
  heroTitle,
  heroSubtitle,
  heroCtaText,
  slug,
  rating = 4.9,
  studentCount = 0,
}: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null)

  // Parallax suave en scroll
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const handleScroll = () => {
      const y = window.scrollY
      el.style.transform = `translateY(${y * 0.3}px)`
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSchedule = () => {
    document.getElementById("horarios")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden"
      style={{ background: "#0a0a0c" }}
    >
      {/* Background image with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <div ref={heroRef} className="absolute inset-0 will-change-transform">
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt={`${teacherName} — Academia de Batería`}
              className="w-full h-full object-cover object-center"
              fetchPriority="high"
              loading="eager"
              style={{ filter: "brightness(0.45)" }}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background:
                  "radial-gradient(ellipse at 70% 50%, rgba(124,58,237,0.25) 0%, transparent 60%), #0a0a0c",
              }}
            />
          )}
        </div>
        {/* Purple-to-transparent overlay desde la izquierda */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,12,0.97) 0%, rgba(10,10,12,0.85) 40%, rgba(10,10,12,0.4) 70%, rgba(10,10,12,0.1) 100%)",
          }}
        />
        {/* Purple glow bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48"
          style={{
            background: "linear-gradient(to top, #0a0a0c, transparent)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(249,115,22,0.2))",
              border: "1px solid rgba(249,115,22,0.35)",
              color: "#fb923c",
            }}
          >
            🥁 Academia de Batería
          </div>

          {/* Heading */}
          <h1
            className="text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {heroTitle.split(" ").map((word, i, arr) =>
              i >= arr.length - 2 ? (
                <span
                  key={i}
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {word}{i < arr.length - 1 ? " " : ""}
                </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg text-neutral-300 mb-10 leading-relaxed max-w-xl"
            style={{ fontWeight: 400 }}
          >
            {heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <a
              href={`/agendar?teacher=${slug}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white transition-all hover:scale-105 hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #f97316)",
                boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
              }}
            >
              {heroCtaText}
              <span>→</span>
            </a>
            <button
              onClick={scrollToSchedule}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-white/10"
              style={{
                border: "1.5px solid rgba(249,115,22,0.6)",
                background: "transparent",
              }}
            >
              Ver Horarios ↓
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #f97316)",
                boxShadow: "0 0 0 3px rgba(249,115,22,0.4)",
              }}
            >
              {teacherName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{teacherName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-yellow-400 text-xs">
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-neutral-400 text-xs font-semibold">
                  {rating} · {studentCount > 0 ? `${studentCount} alumnos` : "Profesor certificado"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce"
        aria-hidden="true"
      >
        <div
          className="w-0.5 h-12"
          style={{
            background: "linear-gradient(to bottom, rgba(249,115,22,0.8), transparent)",
          }}
        />
      </div>
    </section>
  )
}

"use client"

import { useRef, useState } from "react"

interface Testimonial {
  id: string
  name: string
  role: string
  comment: string
  avatar_url: string | null
  rating: number
  order: number
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (testimonials.length === 0) return null

  const sorted = [...testimonials].sort((a, b) => a.order - b.order)

  const scroll = (dir: "left" | "right") => {
    const next =
      dir === "right"
        ? Math.min(activeIdx + 1, sorted.length - 1)
        : Math.max(activeIdx - 1, 0)
    setActiveIdx(next)
    const cards = scrollRef.current?.querySelectorAll("[data-card]")
    if (cards?.[next]) {
      cards[next].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }

  return (
    <section
      id="testimonios"
      className="py-20 px-6"
      style={{ background: "#0a0a0c" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-xs font-black uppercase tracking-widest mb-3"
              style={{ color: "#f97316" }}
            >
              Testimonios
            </p>
            <h2
              className="text-4xl font-black text-white"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Lo que Dicen Nuestros Alumnos
            </h2>
          </div>
          {/* Navigation arrows */}
          <div className="hidden sm:flex gap-2">
            {["←", "→"].map((arrow, i) => (
              <button
                key={arrow}
                onClick={() => scroll(i === 0 ? "left" : "right")}
                disabled={(i === 0 && activeIdx === 0) || (i === 1 && activeIdx === sorted.length - 1)}
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg transition-all disabled:opacity-30"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
              >
                {arrow}
              </button>
            ))}
          </div>
        </div>

        {/* Cards carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {sorted.map((t, idx) => (
            <div
              key={t.id}
              data-card
              className="flex-shrink-0 snap-start rounded-3xl p-7 flex flex-col"
              style={{
                width: "clamp(280px, 85vw, 360px)",
                background: "#141418",
                border: `1px solid ${idx === activeIdx ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.06)"}`,
                boxShadow: idx === activeIdx
                  ? "0 8px 40px rgba(124,58,237,0.15)"
                  : "none",
              }}
              onClick={() => setActiveIdx(idx)}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span
                    key={s}
                    className="text-lg"
                    style={{ color: s < t.rating ? "#f97316" : "#374151" }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Comment */}
              <p className="text-neutral-200 text-base leading-relaxed flex-1 mb-6">
                &ldquo;{t.comment}&rdquo;
              </p>

              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                {t.avatar_url ? (
                  <img
                    src={t.avatar_url}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover"
                    loading="lazy"
                    width={44}
                    height={44}
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-base font-black text-white flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #f97316)",
                    }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white font-black text-sm">{t.name}</p>
                  <p className="text-neutral-500 text-xs font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {sorted.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className="rounded-full transition-all"
              style={{
                width: idx === activeIdx ? 24 : 6,
                height: 6,
                background:
                  idx === activeIdx
                    ? "linear-gradient(135deg, #7c3aed, #f97316)"
                    : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

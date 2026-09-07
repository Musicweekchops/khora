interface GalleryItem {
  id: string
  url: string
  type: "image" | "video"
  caption: string | null
  order: number
}

interface GallerySectionProps {
  items: GalleryItem[]
}

export default function GallerySection({ items }: GallerySectionProps) {
  if (items.length === 0) return null

  const sorted = [...items].sort((a, b) => a.order - b.order)

  return (
    <section
      id="galeria"
      className="py-20 px-6"
      style={{ background: "#0c0c10" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: "#f97316" }}
          >
            Galería
          </p>
          <h2
            className="text-4xl font-black text-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Nuestro Estudio
          </h2>
        </div>

        {/* Masonry grid */}
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gridAutoRows: "240px",
          }}
        >
          {sorted.map((item, idx) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-2xl group"
              style={{
                // Make first item span 2 columns on wider screens if it's a featured photo
                gridColumn: idx === 0 && sorted.length > 3 ? "span 2" : "span 1",
                gridRow: idx === 0 && sorted.length > 3 ? "span 2" : "span 1",
              }}
            >
              {item.type === "video" ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  muted
                  loop
                  playsInline
                  poster=""
                  preload="none"
                  onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.caption || "Foto del estudio"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  width={560}
                  height={480}
                />
              )}

              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(to top, rgba(124,58,237,0.7) 0%, rgba(249,115,22,0.2) 50%, transparent 100%)",
                }}
              />

              {/* Caption */}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-sm font-bold">{item.caption}</p>
                </div>
              )}

              {/* Video indicator */}
              {item.type === "video" && (
                <div className="absolute top-3 right-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    ▶
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
